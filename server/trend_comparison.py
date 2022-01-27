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

    ds1_file = ds1_file.apply(stats.zscore, 1, False, "broadcast")
    ds2_file = ds2_file.apply(stats.zscore, 1, False, "broadcast")

    clustering_intersecting = cluster(ds1_file, ds2_file, k, ComparisonType.INTERSECTING)
    clustering_non_intersecting = cluster(ds1_file, ds2_file, k, ComparisonType.NON_INTERSECTING)
    return {
        'intersecting': extract_genes(clustering_intersecting, tmp_colnames, ds1_file_var, ds2_file_var,
                                      ds2_file_median, ds2_file_median),
        'nonIntersecting': extract_genes(clustering_non_intersecting, tmp_colnames, ds1_file_var, ds2_file_var,
                                         ds2_file_median, ds2_file_median),
        'conditions': ds1_colnames,
    }


def extract_genes(dataset, value_columns, ds1_variance, ds2_variance, ds1_median, ds2_median):
    ds1 = extract_dataset_genes(dataset[dataset['dataset'] == 1], value_columns, ds1_variance, ds1_median)
    ds2 = extract_dataset_genes(dataset[dataset['dataset'] == 2], value_columns, ds2_variance, ds2_median)
    return [ds1, ds2]


def extract_dataset_genes(ds, value_columns, variances, medians):
    dataset = {}
    for row in ds.itertuples():
        values = []
        for column in value_columns:
            values.append(row[column])
        dataset[row.Index] = {'gene': row.Index, 'values': values, 'median': medians.loc[row.Index],
                                'variance': variances.loc[row.Index],
                                'cluster': getattr(row, 'cluster')}
    return dataset
