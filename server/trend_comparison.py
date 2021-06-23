import os

import pandas as pd
from scipy import stats

from server.app import app, files
from server.clustering import cluster
from server.data_quality_assurance import equal_number_of_columns
from server.enums import ComparisonType
from server.preprocess_files import preprocess_file
from server.ptcf import combine_to_ptcf, add_additional_columns, get_intersecting_ptcf_from_ptcf, \
    get_non_intersecting_ptcf_from_ptcf, ptcf_to_json
from server.variance_filter import filter_variance


def remove_dataset_id(df, ds1_trend_column, ds2_trend_column):
    """deletes the data set id from a given ptcf

    :param df: PTCF data frame
    :ds1_trend_column: column name ds 1
    :ds2_trend_column: column name ds 2

    :return: ds without data set information
    """

    df[ds1_trend_column] = df[ds1_trend_column].str.split('_').str[1]
    df[ds2_trend_column] = df[ds2_trend_column].str.split('_').str[1]

    return df


def concordant_discordant(df, ds1_trend_column, ds2_trend_column):
    """extracts the number of concordant and discordant genes

    :param df: PTCF data frame
    :ds1_trend_column: column name ds 1
    :ds2_trend_column: column name ds 2

    :return: dict of concordant and discordant genes
    """

    modified = remove_dataset_id(df, ds1_trend_column, ds2_trend_column)
    concordant = modified[modified[ds1_trend_column] == modified[ds2_trend_column]]
    discordant = modified[modified[ds1_trend_column] != modified[ds2_trend_column]]

    return {
        'concordant': len(concordant.index),
        'discordant': len(discordant.index)
    }


def get_info(file1, file2, filename1, filename2, i_ptcf, ni_ptcf):
    """extracts basic information required for the client-side

    :param file1: saved file1
    :param file2: saved file1
    :param filename1: filename of data set 1
    :param filename2: filename of data set 2
    :param i_ptcf: i_ptcf data frame
    :param ni_ptcf: ni_ptcf data frame

    :return: dict of information
    """

    info = {}

    conc_disc = concordant_discordant(i_ptcf, "ds1_cluster", "ds2_cluster")

    genes_in_comparison = len(i_ptcf.index) + len(ni_ptcf.index)

    path_file1, filename_file1 = os.path.split(filename1)
    path_file2, filename_file2 = os.path.split(filename2)

    info['file_1'] = {'filename': filename_file1}
    info['file_2'] = {'filename': filename_file2}
    info['file_1']['genes'] = list(ni_ptcf[~ni_ptcf['ds1_cluster'].isna()].index) + list(i_ptcf.index)
    info['file_2']['genes'] = list(ni_ptcf[~ni_ptcf['ds2_cluster'].isna()].index) + list(i_ptcf.index)
    info['file_1_only'] = {'genes': list(ni_ptcf[~ni_ptcf['ds1_cluster'].isna()].index)}
    info['file_2_only'] = {'genes': list(ni_ptcf[~ni_ptcf['ds2_cluster'].isna()].index)}
    info['intersecting_genes'] = {'genes': len(i_ptcf.index)}
    info['barChart'] = {
        'allGenesInComparison': genes_in_comparison,
        'absolute': {
            'concordant_count': conc_disc['concordant'],
            'discordant_count': conc_disc['discordant'],
            'intersecting_genes_count': len(i_ptcf.index),
            'non_intersecting_genes_count': len(ni_ptcf.index),
            'first_non_intersecting_genes_count': len(ni_ptcf[~ni_ptcf['ds1_cluster'].isna()].index),
            'second_non_intersecting_genes_count': len(ni_ptcf[~ni_ptcf['ds2_cluster'].isna()].index)
        }
    }

    return info


def pairwise_trendcomparison(tmp_file1, tmp_file2, lower_variance_percentile,
                             upper_variance_percentile, k, test_data):
    """
    wrapper function to conduct pairwise trend comparison for intersecting and non-intersecting genes

    :param tmp_file1: file1
    :param tmp_file2: file2
    :param comparison_count: comparison Id
    :param lower_variance_percentile: left handle of variance percentile filter
    :param upper_variance_percentile: right handle of variance percentile filter
    :param k: number of k to be determined
    :param test_data: bool telling whether test data should be used or not

    dict of pairwise trend comparisons and related info
    """

    if test_data:
        ds1_file = preprocess_file(tmp_file1)
        ds2_file = preprocess_file(tmp_file2)

    else:
        ds1_file = preprocess_file(os.path.join(app.config['UPLOAD_FOLDER'], files[tmp_file1]))
        ds2_file = preprocess_file(os.path.join(app.config['UPLOAD_FOLDER'], files[tmp_file2]))

    # validity check
    equal_number_of_columns(ds1_file, ds2_file)

    # variance information
    ds1_file_var = ds1_file["var"]
    ds2_file_var = ds2_file["var"]

    ds1_file_median = ds1_file["median"]
    ds2_file_median = ds2_file["median"]

    ds1_file.drop(columns=["var"], axis=1, inplace=True)
    ds2_file.drop(columns=["var"], axis=1, inplace=True)
    ds1_file.drop(columns=["median"], axis=1, inplace=True)
    ds2_file.drop(columns=["median"], axis=1, inplace=True)

    # init colnames
    ds1_colnames = list(ds1_file)
    ds2_colnames = list(ds2_file)

    # tmp colnames
    tmp_colnames = list(range(1, len(ds1_colnames) + 1))

    ds1_file.columns = tmp_colnames
    ds2_file.columns = tmp_colnames

    ds1_file = filter_variance(ds1_file, lower_variance_percentile, upper_variance_percentile)
    ds2_file = filter_variance(ds2_file, lower_variance_percentile, upper_variance_percentile)

    # zscore
    ds1_file_np = ds1_file.to_numpy()
    ds2_file_np = ds2_file.to_numpy()

    # ds1_file_np = stats.zscore(ds1_file_np, axis=1)
    # ds2_file_np = stats.zscore(ds2_file_np, axis=1)

    ds1_file = pd.DataFrame(data=ds1_file_np, index=ds1_file.index, columns=list(tmp_colnames))
    ds2_file = pd.DataFrame(data=ds2_file_np, index=ds2_file.index, columns=list(tmp_colnames))

    ds1_file = ds1_file.T.apply(stats.zscore).T
    ds2_file = ds2_file.T.apply(stats.zscore).T

    clustering_intersecting = cluster(ds1_file, ds2_file, k, ComparisonType.INTERSECTING)
    clustering_non_intersecting = cluster(ds1_file, ds2_file, k, ComparisonType.NON_INTERSECTING)

    ptcf = combine_to_ptcf(clustering_intersecting, clustering_non_intersecting, ds1_colnames, ds2_colnames)

    ptcf = add_additional_columns(ptcf)

    ptcf['ds1_var'] = ds1_file_var
    ptcf['ds2_var'] = ds2_file_var
    ptcf['ds1_median'] = ds1_file_median
    ptcf['ds2_median'] = ds2_file_median

    i_ptcf = get_intersecting_ptcf_from_ptcf(ptcf)
    ni_ptcf = get_non_intersecting_ptcf_from_ptcf(ptcf)

    intersecting_genes = ptcf_to_json(i_ptcf, True, ds1_colnames)

    non_intersecting_genes = ptcf_to_json(ni_ptcf, False, ds1_colnames)

    if test_data:
        info = get_info(tmp_file1, tmp_file2, tmp_file1, tmp_file2, i_ptcf, ni_ptcf)

    else:
        info = get_info(tmp_file1, tmp_file2, files[tmp_file1], files[tmp_file2], i_ptcf, ni_ptcf)

    # data["Comparison" + str(comparison_count)] = {
    # 	'intersecting' : intersecting_genes,
    # 	'nonIntersecting' : non_intersecting_genes,
    # 	'info' : info,
    # 	'k' : k,
    # 	'lower_variance_percentile' : lower_variance_percentile,
    # 	'upper_variance_percentile' : upper_variance_percentile
    # }

    intersecting_genes['info'] = info
    intersecting_genes['k'] = k
    intersecting_genes['lower_variance_percentile'] = lower_variance_percentile
    intersecting_genes['upper_variance_percentile'] = upper_variance_percentile

    non_intersecting_genes['info'] = info
    non_intersecting_genes['k'] = k
    non_intersecting_genes['lower_variance_percentile'] = lower_variance_percentile
    non_intersecting_genes['upper_variance_percentile'] = upper_variance_percentile
    return {
        'intersecting': intersecting_genes,
        'nonIntersecting': non_intersecting_genes,
        'info': info,
        'k': k,
        'conditions': ds1_colnames,
        'lower_variance_percentile': lower_variance_percentile,
        'upper_variance_percentile': upper_variance_percentile
    }
