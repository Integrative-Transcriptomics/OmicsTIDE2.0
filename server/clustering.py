import pandas as pd
from sklearn.cluster import KMeans

from server.enums import ComparisonType


def run_k_means(data, k):
    """
    runs k-means on data with given k

    :param data: PTCF data frame
    :param k: init k

    :return: data frame with assigned clusters
    """
    #print(len(data.index))
    try:
        if len(data.index) >= k:
            km = KMeans(n_clusters=k, n_init='auto')
            km.fit_predict(data.loc[:, data.columns != 'dataset'])
        # if k > num genes change k to num genes
        else:
            km = KMeans(n_clusters=len(data.index), n_init='auto')
            km.fit_predict(data.loc[:, data.columns != 'dataset'])
        data['cluster'] = km.labels_
        return data
    except ValueError as e:
        print(e)


def get_genes_subset(file1, file2, comparison_type):
    """
    extracts intersecting or non-intersecting genes from two data sets

    :param file1: PTCF data set 1
    :param file2: PTCF data set 2
    :param comparison_type: intersecting or non-intersecting

    :return: subset of genes as PTCF data frame

    """

    if not isinstance(comparison_type, ComparisonType):
        raise TypeError('comparison_tye must either be INTERSECTING or NON_INTERSECTING')

    file1_index = list(file1.index)
    file2_index = list(file2.index)

    if comparison_type == ComparisonType.INTERSECTING:
        genes_in_both_ds = [x for x in file1_index if x in file2_index]
        file1 = file1[file1.index.isin(genes_in_both_ds)]
        file2 = file2[file2.index.isin(genes_in_both_ds)]

    if comparison_type == ComparisonType.NON_INTERSECTING:
        file1_only = [x for x in file1_index if x not in file2_index]
        file2_only = [x for x in file2_index if x not in file1_index]

        file1 = file1[file1.index.isin(file1_only)]
        file2 = file2[file2.index.isin(file2_only)]

    file1['dataset'] = 1
    file2['dataset'] = 2
    combined = pd.concat([file1,file2])
    combined.dropna(inplace=True)
    return combined
