import pandas as pd
from scipy import stats

from server.clustering import get_genes_subset, run_k_means
from server.data_quality_assurance import equal_number_of_columns
from server.enums import ComparisonType
from server.variance_filter import filter_variance


def create_normalized_data(ds, lower_variance_percentile,
                           upper_variance_percentile):
    ds_file = ds.copy()

    ds_file_var = ds_file["var"]
    ds_file_median = ds_file["median"]

    ds_file.drop(columns=["var"], axis=1, inplace=True)
    ds_file.drop(columns=["median"], axis=1, inplace=True)

    ds_file = filter_variance(ds_file, lower_variance_percentile, upper_variance_percentile)

    # zscore
    ds_file_np = ds_file.to_numpy()
    ds_file = pd.DataFrame(data=ds_file_np, index=ds_file.index, columns=list(ds_file))

    ds_file = ds_file.apply(stats.zscore, 1, False, "broadcast")
    ds_file["var"] = ds_file_var
    ds_file["median"] = ds_file_median
    return ds_file


def combine(ds1, ds2):
    ds1_file = ds1.copy()
    ds2_file = ds2.copy()

    ds1_file.drop(columns=["var"], axis=1, inplace=True)
    ds2_file.drop(columns=["var"], axis=1, inplace=True)
    ds1_file.drop(columns=["median"], axis=1, inplace=True)
    ds2_file.drop(columns=["median"], axis=1, inplace=True)

    combined_intersecting = get_genes_subset(ds1_file, ds2_file, ComparisonType.INTERSECTING)
    combined_non_intersecting = get_genes_subset(ds1_file, ds2_file, ComparisonType.NON_INTERSECTING)
    return combined_intersecting, combined_non_intersecting


def pairwise_trendcomparison(ds1, ds2, k):
    ds1_file = ds1.copy()
    ds2_file = ds2.copy()
    # validity check
    equal_number_of_columns(ds1_file, ds2_file)

    # variance information
    ds1_file_var = ds1_file["var"]
    ds2_file_var = ds2_file["var"]

    # median information
    ds1_file_median = ds1_file["median"]
    ds2_file_median = ds2_file["median"]

    # init colnames
    colnames = list(ds1_file)

    colnames.remove("var")
    colnames.remove("median")

    # tmp colnames
    tmp_colnames = list(range(1, len(colnames) + 1))

    combined_intersecting, combined_non_intersecting = combine(ds1_file, ds2_file)

    clustering_intersecting = run_k_means(combined_intersecting, k)
    clustering_non_intersecting = run_k_means(combined_non_intersecting, k)
    return {
        'intersecting': extract_genes(clustering_intersecting, tmp_colnames, ds1_file_var, ds2_file_var,
                                      ds1_file_median, ds2_file_median),
        'nonIntersecting': extract_genes(clustering_non_intersecting, tmp_colnames, ds1_file_var, ds2_file_var,
                                         ds1_file_median, ds2_file_median),
        'conditions': colnames,
    }


def extract_genes(dataset, value_columns, ds1_variance, ds2_variance, ds1_median, ds2_median):
    if dataset is not None:
        ds1 = extract_dataset_genes(dataset[dataset['dataset'] == 1], value_columns, ds1_variance, ds1_median)
        ds2 = extract_dataset_genes(dataset[dataset['dataset'] == 2], value_columns, ds2_variance, ds2_median)
    else:
        ds1 = {}
        ds2 = {}
    return [ds1, ds2]


def extract_dataset_genes(ds, value_columns, variances, medians):
    dataset = {}
    for row in ds.itertuples():
        values = []
        for column in value_columns:
            values.append(row[column])
        dataset[row.Index] = {'gene': row.Index, 'values': values, 'median': medians.loc[row.Index],
                              'variance': variances.loc[row.Index],
                              'cluster': str(getattr(row, 'cluster') + 2)}
    return dataset
