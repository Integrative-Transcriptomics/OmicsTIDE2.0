import numpy as np
from flask import jsonify

from server.ptcf import get_time_points


def valid_cluster_header(ds, file):
    """
    checks if colnames are comaptible with provided list

    :param ds: ds header name
    :param file: lsit of allowed header names

    :return: bool showing whether given colname is compatible with list
    """

    return str(ds) in list(file)


def valid_cluster_values(ds, file):
    """
    checks if cluster/trend values are compatbile with provided list

    :param ds: ds header name
    :param file: lsit of allowed header names

    :return: bool showing whether given cluster/trend names are compatible with list
    """

    cluster_values = set(file[str(ds)].unique())
    valid_values = {}
    if ds == "ds1_cluster":
        valid_values = {'ds1_1', 'ds1_2', 'ds1_3', 'ds1_4', 'ds1_5', 'ds1_6', 'nan', np.nan}

    if ds == "ds2_cluster":
        valid_values = {'ds2_1', 'ds2_2', 'ds2_3', 'ds2_4', 'ds2_5', 'ds2_6', 'nan', np.nan}

    diff = list(cluster_values.difference(valid_values))

    return len(diff) == 0


def invalid_cluster_value_pos(ds, file):
    """
    extracts the gene that contains an invalid cluster/trend

    :param ds: ds header name
    :param file: ptcf data frame

    :return: gene at which invalid values appear
     """

    if ds == "ds1_cluster":
        valid_values = ['ds1_1', 'ds1_2', 'ds1_3', 'ds1_4', 'ds1_5', 'ds1_6', 'nan', np.nan]

    if ds == "ds2_cluster":
        valid_values = ['ds2_1', 'ds2_2', 'ds2_3', 'ds2_4', 'ds2_5', 'ds2_6', 'nan', np.nan]

    return file.index[~file[str(ds)].isin(valid_values)].tolist()


def has_equal_number_of_timepoints(data):
    """
    checks if number of colnames of ds1 is equal to number of colnames of ds2

    :param data: PTCF data frame

    :return: bool showing whether equal number is given or not
    """

    return get_time_points(data, "ds1") == get_time_points(data, "ds2")


def equal_number_of_columns(f1, f2):
    """
    checks if number of columns, thus x values, are equal across the two PTCF files

    :param f1: PTCF data frame 1
    :param f2: PTCF data frame 2

    :return: bool showing whether equal number is given or not
    """

    if len(list(f1)) == len(list(f2)):
        return True

    else:
        return jsonify(message="Number of columns/conditions has to be identical across all loaded files!"), 500
