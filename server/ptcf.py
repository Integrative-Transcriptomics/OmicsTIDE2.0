import numpy as np
import pandas as pd
from flask import jsonify

from server.enums import Ptcf_file


def clustered_to_ptcf(combined, file1_colnames, file2_colnames):
    """
    restructures data frame to PTCF by using pivot reorder

    :param combined: data frame containing combined information of the two data sets
    :param file1_colnames: colnames data set 1
    :param file2_colnames: colnames data set 2 
    :return: restructured data frame 
    """

    combined.reset_index(level=0, inplace=True)
    combined_pivot = combined.pivot(index='gene', columns='dataset')

    # https://stackoverflow.com/questions/24290297/pandas-dataframe-with-multiindex-column-merge-levels
    combined_colnames = ["ds" + str(entry[1]) + "_" + str(entry[0]) for entry in combined_pivot.columns]

    combined_pivot.columns = combined_pivot.columns.droplevel(0)
    combined_pivot.columns = combined_colnames

    cluster_columns = combined_pivot[['ds1_cluster', 'ds2_cluster']]

    combined_pivot.drop(['ds1_cluster', 'ds2_cluster'], axis=1, inplace=True)

    combined_pivot_reorder = combined_pivot.reindex(sorted(combined_pivot.columns), axis=1)
    combined_pivot_reorder = pd.concat([combined_pivot_reorder, cluster_columns], axis=1)

    # cluster as int
    combined_pivot_reorder.ds1_cluster = combined_pivot_reorder.ds1_cluster.astype('Int64') + 1
    combined_pivot_reorder.ds2_cluster = combined_pivot_reorder.ds2_cluster.astype('Int64') + 1

    # add "ds" to cluster id if not NA
    combined_pivot_reorder.ds1_cluster = "ds1_" + combined_pivot_reorder.ds1_cluster.astype(str)
    combined_pivot_reorder.ds2_cluster = "ds2_" + combined_pivot_reorder.ds2_cluster.astype(str)

    # replace
    combined_pivot_reorder = combined_pivot_reorder.replace(to_replace='<NA>', value=np.nan, regex=True)

    # sort
    combined_pivot_reorder = combined_pivot_reorder.sort_values(['ds1_cluster', 'ds2_cluster'])

    # colnames
    colnames_ds1 = ["ds1_" + x for x in file1_colnames]
    colnames_ds2 = ["ds2_" + x for x in file2_colnames]
    colnames_rest = ["ds1_cluster", "ds2_cluster"]

    new_colnames = colnames_ds1 + colnames_ds2 + colnames_rest

    combined_pivot_reorder.columns = new_colnames

    return combined_pivot_reorder


def combine_to_ptcf(i_ptcf, ni_ptcf, file1_colnames, file2_colnames):
    """
    concatenates i_ptcf and ni_ptcf

    :param i_ptcf: i_ptcf data frame
    :param ni_ptcf: ni_ptcf data frame
    :param file1_colnames: colnames data set 1
    :param file2_colnames: colnames data set 2
    :return: combined PTCF data frame
    """

    combined = pd.concat([i_ptcf, ni_ptcf], axis=0)

    return clustered_to_ptcf(combined, file1_colnames, file2_colnames)


def add_additional_columns(data):
    """
    adds "highlighted" and "profile_selected" column 

    :param data: ptcf data frane
    :return: ptcf data frame with additional information
    """

    highlighted = [True] * len(data.index)
    data.loc[:, 'highlighted'] = highlighted

    profile_selected = [False] * len(data.index)
    data.loc[:, 'profile_selected'] = profile_selected

    return data


def get_time_points(data, ds):
    """
    extracts time points / x values in a given PTCF

    :param data: ptcf data frane
    :param ds: data set for which the different time points should be determined
    :return: list of time points
    """
    return len([x for x in list(data) if
                x.startswith(ds) & (x != "ds1_cluster") & (x != "ds2_cluster") & (x != "gene") & (x != "ds1_median") & (
                        x != "ds2_median")])


def get_x_values(data, ds):
    """
    adds "highlighted" and "profile_selected" column 

    :param data: ptcf data frane
    :return: ptcf data frame with additional information
    """
    return [x for x in list(data) if
            x.startswith(ds) & (x != "ds1_cluster") & (x != "ds2_cluster") & (x != "gene") & (x != "ds1_median") & (
                    x != "ds2_median")]


def get_min_max_values(data, col1, col2):
    """
    extracts min and max value of two columns

    :param data: ptcf data frame
    :param col1: column 1
    :param col1: column 2
    :return: dict of min and max values of two columns
    """

    return {
        'ds1_min': data[col1].min(),
        'ds1_max': data[col1].max(),
        'ds2_min': data[col2].min(),
        'ds2_max': data[col2].max()
    }


def get_cluster_count(data):
    """
    extracts the unique determined clusters/trend 

    :param data: ptcf data frame
    :return: list of cluster/trend categories
    """

    ds1_cluster = [x.split("_")[1] for x in data.ds1_cluster.unique() if not pd.isna(x)]
    ds2_cluster = [x.split("_")[1] for x in data.ds2_cluster.unique() if not pd.isna(x)]

    combined_cluster = ds1_cluster + ds2_cluster

    return len(list(set(combined_cluster)))


def extract_additional_information(data):
    """
    extracts cluster/trend information and min/max values from PTCF

    :param data: ptcf data frame
    :return: dict of cluster/trend information and min/max values
    """

    cluster_count = get_cluster_count(data)

    # consider that min and max could be equal if only one gene occurs

    # consider that one experiment could contain NO genes!

    min_max = get_min_max_values(data, "ds1_median", "ds2_median")

    return {
        'mod_data': data,
        'cluster_count': cluster_count,
        'min_max': min_max
    }


def split_by_link(data):
    """
    splits PTCF information by link ids (e.g. "ds1_1-ds2_1") to store the data under a given key for easier access (-> focus-on-hover!)

    :param data: ptcf data frame
    :return: PTCF split by link
    """

    split_data = {}

    data.loc[:, 'cluster_id'] = data['ds1_cluster'] + "-" + data['ds2_cluster']

    grouped = data.groupby('cluster_id')

    for x in grouped.groups:
        split_data[grouped.get_group(x)['cluster_id'][0]] = grouped.get_group(x)['gene'].tolist()
    return split_data


def ptcf_to_json(data, is_intersecting, conditions):
    """
    transforms PTCF to JSON prior to sending it to the client

    :param data: ptcf data frame
    :param is_intersecting: bool stating whether I_PTCF or NI_PTCF
    :return: dict of cluster/trend information and min/max values
    """
    if len(data.index) > 0:

        data.loc[:, 'gene'] = data.index

        additional_information = extract_additional_information(data)

        # split data into links
        datasets = [{}, {}]
        for index, row in data.iterrows():
            values1 = []
            values2 = []
            for condition in conditions:
                column1 = 'ds1_' + condition
                column2 = 'ds2_' + condition
                values1.append(row[column1])
                values2.append(row[column2])
            if is_intersecting:
                datasets[0][row['gene']] = {'gene': row['gene'], 'values': values1, 'median': row['ds1_median'],
                                            'variance': row['ds1_var'],
                                            'cluster': row['ds1_cluster'].split('_')[1]}
                datasets[1][row['gene']] = {'gene': row['gene'], 'values': values2, 'median': row['ds2_median'],
                                            'variance': row['ds2_var'],
                                            'cluster': row['ds2_cluster'].split('_')[1]}
            else:
                if type(row['ds1_cluster']) is float:
                    datasets[1][row['gene']] = {'gene': row['gene'], 'values': values2, 'median': row['ds2_median'],
                                                'variance': row['ds2_var'],
                                                'cluster': row['ds2_cluster'].split('_')[1]}
                else:
                    datasets[0][row['gene']] = {'gene': row['gene'], 'values': values1, 'median': row['ds1_median'],
                                                'variance': row['ds1_var'],
                                                'cluster': row['ds1_cluster'].split('_')[1]}
        if is_intersecting:
            intersections = split_by_link(additional_information['mod_data'])
            return {
                'data': datasets,
                'intersections': intersections,
                'ds1_min': additional_information['min_max']['ds1_min'],
                'ds1_max': additional_information['min_max']['ds1_max'],
                'ds2_min': additional_information['min_max']['ds2_min'],
                'ds2_max': additional_information['min_max']['ds2_max']
            }
        else:
            return {
                'data': datasets,
                'ds1_min': additional_information['min_max']['ds1_min'],
                'ds1_max': additional_information['min_max']['ds1_max'],
                'ds2_min': additional_information['min_max']['ds2_min'],
                'ds2_max': additional_information['min_max']['ds2_max']
            }

    else:
        print("no genes found")
        return {}


def ptcf_to_json_old(data, is_intersecting):
    """
    transforms PTCF to JSON prior to sending it to the client

    :param data: ptcf data frame
    :param is_intersecting: bool stating whether I_PTCF or NI_PTCF
    :return: dict of cluster/trend information and min/max values
    """

    if len(data.index) > 0:

        data.loc[:, 'gene'] = data.index

        additional_information = extract_additional_information(data)

        # split data into links
        if is_intersecting:
            data_split = split_by_link(additional_information['mod_data'])

        else:
            data_split = pd.DataFrame(additional_information['mod_data']).to_dict()
        return {
            'data': data_split,
            'columns': list(additional_information['mod_data']),
            'time_points': get_time_points(additional_information['mod_data'], "ds1"),
            'x_values': get_x_values(additional_information['mod_data'], "ds1"),
            'cluster_count': additional_information['cluster_count'],
            'ds1_min': additional_information['min_max']['ds1_min'],
            'ds1_max': additional_information['min_max']['ds1_max'],
            'ds2_min': additional_information['min_max']['ds2_min'],
            'ds2_max': additional_information['min_max']['ds2_max']
        }

    else:
        print("no genes found")

        return {
            'data': data.to_dict(),
            'columns': [],
            'time_points': 0,
            'x_values': [],
            'cluster_count': 0,
            'ds1_min': 0,
            'ds1_max': 0,
            'ds2_min': 0,
            'ds2_max': 0,
        }


def extract_from_ptcf(ptcf_file, ptcf):
    """
    extracts data from input ptcf and adapts format for either intersecting or non-intersecting genes 

    :param ptcf_file: enumstating whether I_PTCF or NI_PTCF should be extracted
    :param ptcf: ptcf data frame

    :return: I_PTCF or NI_PTCF 
    """

    if not isinstance(ptcf_file, Ptcf_file):
        return jsonify(message='File is neither I-PTCF nor NI-PTCF file!'), 500

    if ptcf_file == Ptcf_file.I_PTCF:
        intersecting_genes = ptcf[~ptcf.isnull().any(1)]
        intersecting_genes = intersecting_genes.sort_values(['ds1_cluster', 'ds2_cluster'])
        return intersecting_genes

    else:
        non_intersecting_genes = ptcf[ptcf.isnull().any(1)]
        non_intersecting_genes = non_intersecting_genes.sort_values(['ds1_cluster', 'ds2_cluster'])
        return non_intersecting_genes


def get_intersecting_ptcf_from_ptcf(ptcf):
    """Intersecting genes subset from PTCF format dataframe

    :param ptcf: data frame

    :return: I-PTCF
    """

    return extract_from_ptcf(Ptcf_file.I_PTCF, ptcf)


def get_non_intersecting_ptcf_from_ptcf(ptcf):
    """Non-Intersecting genes subset from PTCF format dataframe

    :param ptcf: data frame

    :return: NI-PTCF
    """

    return extract_from_ptcf(Ptcf_file.NI_PTCF, ptcf)
