import os
import tempfile
import zipfile

import numpy as np
import pandas as pd
from pathlib import Path

pd.options.mode.chained_assignment = None  # default='warn'
import simplejson as json
from flask import make_response, jsonify, request, Flask, send_from_directory, send_file

from server.data_quality_assurance import valid_cluster_header, valid_cluster_values, invalid_cluster_value_pos, \
    has_equal_number_of_timepoints
from server.preprocess_files import preprocess_file
from server.preprocess_files import remove_invalid_genes
from server.ptcf import read_comment_lines, read_clustering_file
# import svgutils
from server.trend_comparison import pairwise_trendcomparison, create_normalized_data

# if not os.path.exists(os.path.join('.', 'tmp_files_OmicsTIDE')):

# MAY HAVE TO BE CHANGED ON TUEVIS DUE TO PERMISSIONS (-> "tempfile.TemporaryDirectory(dir="/tmp")
# MAKE SURE tempfile PACKAGE IS INSTALLED ON
app = Flask(__name__, static_folder='../build', static_url_path='/')
here = os.path.dirname(__file__)
app.config['EXAMPLE_DATA'] = os.path.join(here, 'data')
app.config['FILES_BLOODCELLS'] = os.path.join(here, 'data', 'BloodCell')
app.config['FILES_STREPTOMYCES'] = os.path.join(here, 'data', 'caseStudy_colnames')


##############
### ROUTES ###
##############


@app.route('/load_custom_clustering', methods=['POST'])
def load_clustering():
    clustering_file = request.files.get("clusteringFile")
    mapping_file = request.files.get("mappingFile")
    comparison = read_clustering_file(clustering_file)
    try:
        if mapping_file is not None:
            mapping = pd.read_csv(mapping_file, sep=",").to_numpy().tolist()
        else:
            mapping = None
    except TypeError as te:
        if str(te) == "object of type 'builtin_function_or_method' has no len()":
            return jsonify(message='ID column has to be named "gene"'), 500
    return json.dumps({"data": [comparison], "mapping": mapping}, ignore_nan=True)


@app.route('/download_normalized', methods=['POST'])
def download_normalized():
    files = request.files.getlist("files[]")
    comparisons = np.array(json.loads(request.form.getlist('comparisons')[0]))
    lower_variance_percentile = int(request.form.to_dict()['lowerVariancePercentage'])
    upper_variance_percentile = int(request.form.to_dict()['upperVariancePercentage'])
    tmpdir_zip = tempfile.TemporaryDirectory()
    zip_fn = os.path.join(tmpdir_zip.name, 'normalized_data.zip')
    zip_obj = zipfile.ZipFile(zip_fn, 'w')
    for file in files:
        if file.filename in comparisons.flatten():
            preprocessed_data = preprocess_file(file)
            normalized_data = create_normalized_data(preprocessed_data,
                                                     lower_variance_percentile,
                                                     upper_variance_percentile)
            tmp = tempfile.NamedTemporaryFile()
            fp = open(tmp.name, "a")
            fp.write("# dataset: " + file.filename + "\n")
            normalized_data.to_csv(path_or_buf=fp, index=False)
            fp.close()
            zip_obj.write(tmp.name, file.filename)
    zip_obj.close()
    return send_file(zip_fn)


@app.route('/load_data', methods=['POST'])
def load_data():
    data = []
    files = request.files.getlist("files[]")
    comparisons = np.array(json.loads(request.form.getlist('comparisons')[0]))
    mapping_file = request.files.get("mappingFile")
    k = int(request.form.to_dict()['k'])
    lower_variance_percentile = int(request.form.to_dict()['lowerVariancePercentage'])
    upper_variance_percentile = int(request.form.to_dict()['upperVariancePercentage'])
    ds = dict()
    for file in files:
        if file.filename in comparisons.flatten():
            preprocessed_data = preprocess_file(file)
            ds[file.filename] = create_normalized_data(preprocessed_data,
                                                       lower_variance_percentile,
                                                       upper_variance_percentile)
    for combination in comparisons:
        try:
            comparison = pairwise_trendcomparison(ds[combination[0]], ds[combination[1]], k)
            comparison["files"] = [Path(combination[0]).stem, Path(combination[1]).stem]
            data.append(comparison)
        except TypeError as te:
            if str(te) == "object of type 'builtin_function_or_method' has no len()":
                return jsonify(message='ID column has to be named "gene"'), 500

        except ValueError as ve:
            if str(ve).startswith("Length mismatch: Expected axis has"):
                return jsonify(message='Number of columns/conditions for the loaded files not identical!'), 500
    try:
        if mapping_file is not None:
            mapping = pd.read_csv(mapping_file, sep=",").to_numpy().tolist()
        else:
            mapping = None
    except TypeError as te:
        if str(te) == "object of type 'builtin_function_or_method' has no len()":
            return jsonify(message='ID column has to be named "gene"'), 500

    return json.dumps({"data": data, "mapping": mapping}, ignore_nan=True)


@app.route('/download_example_data', methods=['GET', 'POST'])
def download_example_data():
    return send_from_directory(app.config['EXAMPLE_DATA'], "example_data.zip", as_attachment=True)


@app.route('/download_example_custom_clustering', methods=['GET', 'POST'])
def download_example_clustering():
    return send_from_directory(app.config['EXAMPLE_DATA'], "custom_clustering_example.csv", as_attachment=True)


@app.route('/load_test_data_bloodcell', methods=['GET', 'POST'])
def load_test_data_bloodcell():
    data = []
    mapping = []
    k = int(request.form.to_dict()['k'])
    lower_variance_percentile = int(request.form.to_dict()['lowerVariancePercentage'])
    upper_variance_percentile = int(request.form.to_dict()['upperVariancePercentage'])

    transcriptome_data = os.path.join(app.config['FILES_BLOODCELLS'], "Transcriptome.csv")
    proteome_data = os.path.join(app.config['FILES_BLOODCELLS'], "Proteome.csv")
    mapping_file = os.path.join(app.config['FILES_BLOODCELLS'], "id_mapping.csv")

    try:
        comparison = pairwise_trendcomparison(
            create_normalized_data(preprocess_file(transcriptome_data), lower_variance_percentile,
                                   upper_variance_percentile)
            , create_normalized_data(preprocess_file(proteome_data), lower_variance_percentile,
                                     upper_variance_percentile),
            k)
        comparison["files"] = ["Transcriptome", "Proteome"]
        data.append(comparison)
        mapping = pd.read_csv(mapping_file, sep=",").to_numpy().tolist()

    except TypeError as te:
        if str(te) == "object of type 'builtin_function_or_method' has no len()":
            return jsonify(message='ID column has to be named "gene"'), 500

    except ValueError as ve:
        if str(ve).startswith("Length mismatch: Expected axis has"):
            return jsonify(message='Number of columns/conditions for the loaded files not identical!'), 500
    return json.dumps({"data": data, "mapping": mapping}, ignore_nan=True)


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
        normalized_trans_m1152 = create_normalized_data(preprocess_file(trans_m1152), lower_variance_percentile,
                                                        upper_variance_percentile)
        normalized_trans_m145 = create_normalized_data(preprocess_file(trans_m145), lower_variance_percentile,
                                                       upper_variance_percentile)
        normalized_prot_m1152 = create_normalized_data(preprocess_file(prot_m1152), lower_variance_percentile,
                                                       upper_variance_percentile)

        comparison1 = pairwise_trendcomparison(normalized_trans_m1152, normalized_trans_m145, k)
        comparison1["files"] = ["Transcriptome_M1152", "Transcriptome_M145"]
        data.append(comparison1)
        comparison2 = pairwise_trendcomparison(normalized_trans_m1152, normalized_prot_m1152, k)
        comparison2["files"] = ["Transcriptome_M1152", "Proteome_M1152"]
        data.append(comparison2)


    except TypeError as te:
        if str(te) == "object of type 'builtin_function_or_method' has no len()":
            return jsonify(message='ID column has to be named "gene"'), 500

    except ValueError as ve:
        if str(ve).startswith("Length mismatch: Expected axis has"):
            return jsonify(message='Number of columns/conditions for the loaded files not identical!'), 500
    return json.dumps({"data": data, "mapping": None}, ignore_nan=True)


def fill_columns(ds_name, conditions, variance, median, cluster, values):
    row_dict = dict()
    row_dict[ds_name + "_VAR"] = variance
    row_dict[ds_name + "_MEDIAN"] = median
    row_dict[ds_name + "_CLUSTER"] = cluster
    for i, cond in enumerate(conditions):
        if values != "NA":
            row_dict[ds_name + ":" + cond + "_VALUE"] = values[i]
        else:
            row_dict[ds_name + ":" + cond + "_VALUE"] = "NA"
    return row_dict


@app.route('/download_session', methods=['GET', 'POST'])
def download_session():
    if request.method == 'POST':
        session_data = request.json
        rows = []
        for gene in session_data["ds1"]:
            row_dict = dict()
            row_dict["GENE"] = gene
            if not (gene in session_data["filtered"]):
                row_dict["FILTERED"] = "TRUE"
            else:
                row_dict["FILTERED"] = "FALSE"
            row_dict.update(
                fill_columns(session_data["file1"], session_data["conditions"], session_data["ds1"][gene]["variance"],
                             session_data["ds1"][gene]["median"], session_data["ds1"][gene]["cluster"],
                             session_data["ds1"][gene]["values"]))
            if session_data["type"] == "intersecting":
                row_dict.update(
                    fill_columns(session_data["file2"], session_data["conditions"],
                                 session_data["ds2"][gene]["variance"],
                                 session_data["ds2"][gene]["median"], session_data["ds2"][gene]["cluster"],
                                 session_data["ds2"][gene]["values"]))
            else:
                row_dict.update(
                    fill_columns(session_data["file2"], session_data["conditions"], "NA", "NA", "NA", "NA"))
            rows.append(row_dict)
        if session_data["type"] == "nonIntersecting":
            for gene in session_data["ds2"]:
                row_dict = dict()
                row_dict["Gene"] = gene
                if gene in session_data["filtered"]:
                    row_dict["filtered"] = "TRUE"
                else:
                    row_dict["filtered"] = "FALSE"
                row_dict.update(
                    fill_columns(session_data["file2"], session_data["conditions"],
                                 session_data["ds2"][gene]["variance"],
                                 session_data["ds2"][gene]["median"], session_data["ds2"][gene]["cluster"],
                                 session_data["ds2"][gene]["values"]))
                rows.append(row_dict)
        df = pd.DataFrame(rows)
        tmp = tempfile.NamedTemporaryFile()
        fp = open(tmp.name, "a")
        fp.write("# datasets: " + session_data["file1"] + "," + session_data["file2"] + "\n")
        fp.write("# conditions: " + ','.join(session_data["conditions"]) + "\n")
        df.to_csv(path_or_buf=fp, index=False)
        fp.close()
        fp = open(tmp.name, "r")
        response = make_response(fp.read())
        fp.close()
        response.headers.set("Content-Disposition", "attachment", filename="file.csv")
        response.mimetype = 'text/csv'
        return response


@app.route('/')
def index():
    return app.send_static_file('index.html')


if __name__ == '__main__':
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    app.run(host=os.getenv('IP', '0.0.0.0'),
            port=int(os.getenv('PORT', 4444)))
