import json
import os
import tempfile
from datetime import datetime
from itertools import combinations
# import cairosvg
from zipfile import ZipFile

import pandas as pd
from flask import jsonify, request, send_from_directory, send_file, Flask

from server.data_quality_assurance import valid_cluster_header, valid_cluster_values, invalid_cluster_value_pos, \
    has_equal_number_of_timepoints
from server.preprocess_files import preprocess_file
from server.preprocess_files import remove_invalid_genes
from server.ptcf import get_non_intersecting_ptcf_from_ptcf, get_intersecting_ptcf_from_ptcf, add_additional_columns, \
    ptcf_to_json
# import svgutils
from server.trend_comparison import pairwise_trendcomparison

# if not os.path.exists(os.path.join('.', 'tmp_files_OmicsTIDE')):

# MAY HAVE TO BE CHANGED ON TUEVIS DUE TO PERMISSIONS (-> "tempfile.TemporaryDirectory(dir="/tmp")
# MAKE SURE tempfile PACKAGE IS INSTALLED ON
app = Flask(__name__, static_folder='../build', static_url_path='/')
here = os.path.dirname(__file__)
app.config['FILES_BLOODCELLS'] = os.path.join(here, 'data', 'BloodCell')
app.config['FILES_STREPTOMYCES'] = os.path.join(here, 'data', 'caseStudy_colnames')


def get_k_from_ptcf(data):
    """extracts k parameter from the data

    :param data: data frame

    :return: number of trends/clusters determined
    """

    ds1_cluster = data['ds1_cluster'].dropna().unique()
    ds2_cluster = data['ds2_cluster'].dropna().unique()

    ds1_cluster_number_only = [x.split("_")[1] for x in ds1_cluster]
    ds2_cluster_number_only = [x.split("_")[1] for x in ds2_cluster]

    return len(list(set(ds1_cluster_number_only + ds2_cluster_number_only)))


def load_and_modify(file, filename):
    """wrapper function to read and modify PTCF file for transfer to client

    :param file: ptcf file
    :param filename: file name of load ptcf file

    :return: modified data used to transfer form server to client
    """

    init = None

    try:
        init = pd.read_csv(file, index_col='gene', sep=",")

    except ValueError as ve:
        if (str(ve) == "Index gene invalid"):

            try:
                init = pd.read_csv(file, index_col='gene', sep="\t")

            except:
                return jsonify(message="Error: Values in " + file + " neither comma- nor tab-separated!"), 500

        else:
            return jsonify(message="Error: Values in " + file + " neither comma- nor tab-separated!"), 500

    if not valid_cluster_header("ds1_cluster", init):
        return jsonify(message="column named 'ds1_cluster' not found"), 500

    if not valid_cluster_header("ds2_cluster", init):
        return jsonify(message="column named 'ds2_cluster' not found"), 500

    if not valid_cluster_values("ds1_cluster", init):
        return jsonify(
            message="Values in ds1_cluster column should be one of:\n ds1_1, ds1_2, ds1_3, ds1_4, ds1_5, ds1_6 at\n" +
                    str(invalid_cluster_value_pos("ds1_cluster", init))), 500

    if not valid_cluster_values("ds2_cluster", init):
        return jsonify(
            message="Values in ds1_cluster column should be one of:\n ds2_1, ds2_2, ds2_3, ds2_4, ds2_5, ds2_6 at\n" +
                    str(invalid_cluster_value_pos("ds2_cluster", init))), 500

    if not has_equal_number_of_timepoints(init):
        # raise Exception("number of conditions/time points in ds1 and ds2 has to be identical")
        return jsonify(message="number of conditions/time points in data set 1 and data set 2 has to be identical"), 500

    k = get_k_from_ptcf(init)

    init = remove_invalid_genes(init)

    ptcf = add_additional_columns(init)

    i_ptcf = get_intersecting_ptcf_from_ptcf(ptcf)
    ni_ptcf = get_non_intersecting_ptcf_from_ptcf(ptcf)

    intersecting_genes = ptcf_to_json(i_ptcf, True)
    non_intersecting_genes = ptcf_to_json(ni_ptcf, False)

    data = {}

    data['Comparison1'] = {
        'intersecting': intersecting_genes,
        'nonIntersecting': non_intersecting_genes,
        'k': k,
    }

    return data


def get_median_values(data, ds):
    """extracts median abundance values

    :param data: PTCF
    :param ds: data set identifier (ds1 or ds1)

    :return: median values of given data set
    """

    values = data[
        [x for x in list(data) if x.startswith(ds) & (x != "ds1_cluster") & (x != "ds2_cluster") & (x != "gene")]]

    return values.median(axis=1)


def get_var_values(data, ds):
    """extracts gene variance values

    :param data: PTCF
    :param ds: data set identifier (ds1 or ds1)

    :return: gene variance values of given data set
    """

    values = data[
        [x for x in list(data) if x.startswith(ds) & (x != "ds1_cluster") & (x != "ds2_cluster") & (x != "gene")]]

    return values.var(axis=1)


##############
### ROUTES ###
##############


@app.route('/load_data', methods=['POST'])
def load_data():
    data = []
    files = request.files.getlist("files[]")
    k = int(request.form.to_dict()['k'])
    lower_variance_percentile = int(request.form.to_dict()['lowerVariancePercentage'])
    upper_variance_percentile = int(request.form.to_dict()['upperVariancePercentage'])
    ds = []
    for file in files:
        ds.append({"filename": file.filename, "data": preprocess_file(file)})
    for combination in combinations(ds, 2):
        try:
            comparison = pairwise_trendcomparison(combination[0]["data"], combination[1]["data"],
                                                  lower_variance_percentile,
                                                  upper_variance_percentile, k)
            comparison["files"] = [combination[0]["filename"], combination[1]["filename"]]
            data.append(comparison)
        except TypeError as te:
            if str(te) == "object of type 'builtin_function_or_method' has no len()":
                return jsonify(message='ID column has to be named "gene"'), 500

        except ValueError as ve:
            if str(ve).startswith("Length mismatch: Expected axis has"):
                return jsonify(message='Number of columns/conditions for the loaded files not identical!'), 500

    return jsonify(data)


@app.route('/load_test_data_bloodcell', methods=['GET', 'POST'])
def load_test_data_bloodcell():
    data = []
    k = int(request.form.to_dict()['k'])
    lower_variance_percentile = int(request.form.to_dict()['lowerVariancePercentage'])
    upper_variance_percentile = int(request.form.to_dict()['upperVariancePercentage'])

    transcriptome_data = os.path.join(app.config['FILES_BLOODCELLS'], "Transcriptome.csv")
    proteome_data = os.path.join(app.config['FILES_BLOODCELLS'], "Proteome.csv")

    try:
        comparison = pairwise_trendcomparison(preprocess_file(transcriptome_data), preprocess_file(proteome_data),
                                              lower_variance_percentile,
                                              upper_variance_percentile, k)
        comparison["files"] = ["Transcriptome.csv", "Proteome.csv"]
        data.append(comparison)

    except TypeError as te:
        if str(te) == "object of type 'builtin_function_or_method' has no len()":
            return jsonify(message='ID column has to be named "gene"'), 500

    except ValueError as ve:
        if str(ve).startswith("Length mismatch: Expected axis has"):
            return jsonify(message='Number of columns/conditions for the loaded files not identical!'), 500

    return jsonify(data)


@app.route('/load_test_data_streptomyces', methods=['GET', 'POST'])
def load_test_data_streptomyces():
    data = []
    k = int(request.form.to_dict()['k'])
    lower_variance_percentile = int(request.form.to_dict()['lowerVariancePercentage'])
    upper_variance_percentile = int(request.form.to_dict()['upperVariancePercentage'])

    trans_m145 = os.path.join(app.config['FILES_STREPTOMYCES'], "Transcriptome_M145.csv")
    trans_m1152 = os.path.join(app.config['FILES_STREPTOMYCES'], "Transcriptome_M1152.csv")
    prot_m1152 = os.path.join(app.config['FILES_STREPTOMYCES'], "Proteome_M1152.csv")

    try:
        comparison1 = pairwise_trendcomparison(preprocess_file(trans_m1152), preprocess_file(trans_m145),
                                               lower_variance_percentile,
                                               upper_variance_percentile, k)
        comparison1["files"] = ["Transcriptome_M1152.csv", "Transcriptome_M145.csv"]
        data.append(comparison1)
        comparison2 = pairwise_trendcomparison(preprocess_file(trans_m1152), preprocess_file(prot_m1152),
                                                           lower_variance_percentile,
                                                           upper_variance_percentile, k)
        comparison2["files"] = ["Transcriptome_M1152.csv", "Proteome_M1152.csv"]
        data.append(comparison2)

    except TypeError as te:
        if str(te) == "object of type 'builtin_function_or_method' has no len()":
            return jsonify(message='ID column has to be named "gene"'), 500

    except ValueError as ve:
        if str(ve).startswith("Length mismatch: Expected axis has"):
            return jsonify(message='Number of columns/conditions for the loaded files not identical!'), 500
    return jsonify(data)


@app.route('/download_session', methods=['GET', 'POST'])
def download_session():
    if request.method == 'POST':
        path_session = os.path.join(app.config['UPLOAD_FOLDER'], 'download_session.csv')

        ptcf_session = pd.read_json(request.form.to_dict()['ptcf'], orient='records')
        ptcf_session.set_index('gene', inplace=True)
        ptcf_session.to_csv(path_session)

        time_id = str(datetime.now())
        time_id = time_id.replace(" ", "_")
        time_id = time_id.replace(":", "_")
        time_id = time_id.split(".")[0]
        time_id = time_id.replace("_", "")

        timestamp_name = "OmicsTIDE_" + time_id

        return send_file(path_session,
                         mimetype='text/csv',
                         attachment_filename=timestamp_name + ".csv",
                         as_attachment=True)


@app.route('/send_svg', methods=['GET', 'POST'])
def send_svg():
    if request.method == 'POST':

        path1 = os.path.join(app.config['UPLOAD_FOLDER'], 'dataset1.svg')
        path2 = os.path.join(app.config['UPLOAD_FOLDER'], 'dataset2.svg')
        path_selection = os.path.join(app.config['UPLOAD_FOLDER'], 'selection.csv')
        path_go = os.path.join(app.config['UPLOAD_FOLDER'], 'go.csv')

        dataset1 = json.loads(request.form.to_dict()['dataset1_plot'])
        dataset2 = json.loads(request.form.to_dict()['dataset2_plot'])
        selection = pd.read_json(request.form.to_dict()['selection'], orient='records')
        selection.set_index('gene', inplace=True)

        try:

            mol_func = pd.read_json(request.form.to_dict()['molecularFunction'], orient='records')
            bio_proc = pd.read_json(request.form.to_dict()['biologicalProcess'], orient='records')
            cell_comp = pd.read_json(request.form.to_dict()['cellularComponent'], orient='records')

            mol_func['main_category'] = ['molecularFunction'] * len(mol_func.index)
            bio_proc['main_category'] = ['biologicalProcess'] * len(bio_proc.index)
            cell_comp['main_category'] = ['cellularComponent'] * len(cell_comp.index)

            mol_func = mol_func[pd.notnull(mol_func['id'])]
            bio_proc = bio_proc[pd.notnull(bio_proc['id'])]
            cell_comp = cell_comp[pd.notnull(cell_comp['id'])]

            mol_func.sort_values(by='FDR', inplace=True)
            bio_proc.sort_values(by='FDR', inplace=True)
            cell_comp.sort_values(by='FDR', inplace=True)

            go = pd.concat([mol_func, bio_proc])
            go = pd.concat([go, cell_comp])
            go.drop(columns=['term'], inplace=True)

        except:
            print("no go found")

        selection.drop(columns=['highlighted', 'profile_selected', 'ds1_median', 'ds2_median'], inplace=True)

        svg_1 = open(path1, "a")
        svg_1.write(dataset1)
        svg_1.close()

        svg_2 = open(path2, "a")
        svg_2.write(dataset2)
        svg_2.close()

        selection.to_csv(path_selection)

        try:
            go.to_csv(path_go)

        except:
            print("no go found")

        time_id = str(datetime.now())
        time_id = time_id.replace(" ", "_")
        time_id = time_id.replace(":", "_")
        time_id = time_id.split(".")[0]

        zipObj = ZipFile(os.path.join(app.config['UPLOAD_FOLDER'], "OmicsTIDE_" + str(time_id)), 'w')

        zipObj.write(path1)
        zipObj.write(path2)
        zipObj.write(path_selection)

        try:
            zipObj.write(path_go)

        except:
            print("no go found")

        zipObj.close()

        timestamp_name = "OmicsTIDE_" + time_id

        return send_from_directory(app.config['UPLOAD_FOLDER'], timestamp_name, as_attachment=True)


@app.route('/')
def index():
    return app.send_static_file('index.html')


if __name__ == '__main__':
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    app.run(host=os.getenv('IP', '0.0.0.0'),
            port=int(os.getenv('PORT', 4444)))



