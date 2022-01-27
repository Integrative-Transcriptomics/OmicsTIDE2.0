import time

import pandas as pd
from scipy import stats

from server.clustering import cluster
from server.data_quality_assurance import equal_number_of_columns
from server.enums import ComparisonType
from server.ptcf import combine_to_ptcf, add_additional_columns, get_intersecting_ptcf_from_ptcf, \
    get_non_intersecting_ptcf_from_ptcf, ptcf_to_json
from server.variance_filter import filter_variance


def pairwise_trendcomparison(ds1, ds2, lower_variance_percentile,
                             upper_variance_percentile, k):
    """
    wrapper function to conduct pairwise trend comparison for intersecting and non-intersecting genes

    :param tmp_file1: file1
    :param tmp_file2: file2
    :param lower_variance_percentile: left handle of variance percentile filter
    :param upper_variance_percentile: right handle of variance percentile filter
    :param k: number of k to be determined
    :param test_data: bool telling whether test data should be used or not

    dict of pairwise trend comparisons and related info
    """
    preprocess_start = time.time();
    ds1_file = ds1.copy()
    ds2_file = ds2.copy()

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

    preprocess_end = time.time()
    print("preprocessing: ", preprocess_end - preprocess_start)
    clustering_start = time.time()
    clustering_intersecting = cluster(ds1_file, ds2_file, k, ComparisonType.INTERSECTING)
    clustering_non_intersecting = cluster(ds1_file, ds2_file, k, ComparisonType.NON_INTERSECTING)
    clustering_end = time.time()
    print("clustering: ", clustering_end - clustering_start)

    postprocess_start = time.time()
    ptcf = combine_to_ptcf(clustering_intersecting, clustering_non_intersecting, ds1_colnames, ds2_colnames)

    ptcf = add_additional_columns(ptcf)

    ptcf.loc[:, 'ds1_var'] = ds1_file_var
    ptcf.loc[:, 'ds2_var'] = ds2_file_var
    ptcf.loc[:, 'ds1_median'] = ds1_file_median
    ptcf.loc[:, 'ds2_median'] = ds2_file_median

    i_ptcf = get_intersecting_ptcf_from_ptcf(ptcf)
    ni_ptcf = get_non_intersecting_ptcf_from_ptcf(ptcf)

    intersecting_genes = ptcf_to_json(i_ptcf, True, ds1_colnames)

    non_intersecting_genes = ptcf_to_json(ni_ptcf, False, ds1_colnames)
    postprocess_end = time.time()
    print("Postprocessing: ", postprocess_end - postprocess_start)
    return {
        'intersecting': intersecting_genes,
        'nonIntersecting': non_intersecting_genes,
        'conditions': ds1_colnames,
    }
