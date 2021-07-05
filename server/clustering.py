from sklearn.cluster import KMeans
from sklearn.cluster import DBSCAN


from server.enums import ComparisonType


def run_k_means(data, k):
    """
    runs k-means on data with given k

    :param data: PTCF data frame
    :param k: init k

    :return: data frame with assigned clusters
    """

    try:
        km = KMeans(n_clusters=k)
        y_km = km.fit_predict(data)

        data.loc[:, 'cluster'] = km.labels_

        return data

    except ValueError:
        print("Empty Input!!!")


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

    file1.loc[:, 'dataset'] = 1
    file2.loc[:, 'dataset'] = 2

    # general col list while clustering
    tmp_col_list = list(range(1, len(list(file1))))
    tmp_col_list.append("dataset")

    file1.columns = tmp_col_list
    file2.columns = tmp_col_list

    combined = file1.append(file2)

    return combined


def cluster(file1, file2, cluster, comparison_type):
    """
    wrapper function for clustering to extract either intersecting or non-intersecting genes and then conduct pairwise comparison

    :param file1: data set 1
    :param file2: data set 2
    :param cluster: k parameter
    :param comparison_type: enum intersecting or non_intersecting

    :return: PTCF file
    """

    if not isinstance(comparison_type, ComparisonType):
        raise TypeError('comparison_tye must either be INTERSECTING or NON_INTERSECTING')

    # get intersecting or non-intersecting genes only - depending on comparison_type parameter
    combined = get_genes_subset(file1, file2, comparison_type)

    # run kmeans
    combined = run_k_means(combined, cluster)

    return combined
