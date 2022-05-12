import math
import pandas as pd


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








def read_comment_lines(file):
    datasets = file.readline().decode("utf-8").rstrip()[12::].split(",")
    conditions = file.readline().decode("utf-8").rstrip()[14::].split(",")
    return datasets, conditions


def read_clustering(file, datasets, conditions):
    # print(datasets,conditions)
    clustering = pd.read_csv(file, sep=',', comment='#', index_col="GENE").to_dict(orient="index")
    intersecting = [{}, {}]
    non_intersecting = [{}, {}]
    for gene in clustering:
        if not(math.isnan(clustering[gene][datasets[0] + "_CLUSTER"]) or math.isnan(
                clustering[gene][datasets[0] + "_CLUSTER"])):
            curr_dict = intersecting
        else:
            curr_dict = non_intersecting
        for index, dataset in enumerate(datasets):
            if not math.isnan(clustering[gene][dataset + "_CLUSTER"]):
                curr_dict[index][gene] = {}
                curr_dict[index][gene]["gene"] = gene
                curr_dict[index][gene]["cluster"] = str(clustering[gene][dataset + "_CLUSTER"])
                curr_dict[index][gene]["median"] = clustering[gene][dataset + "_MEDIAN"]
                curr_dict[index][gene]["variance"] = clustering[gene][dataset + "_VAR"]
                curr_dict[index][gene]["values"] = [clustering[gene][dataset + ":" + condition + "_VALUE"] for condition
                                                    in
                                                    conditions]
    return intersecting, non_intersecting


def read_clustering_file(file):
    datasets, conditions = read_comment_lines(file)
    intersecting, non_intersecting = read_clustering(file, datasets, conditions)
    return {"files": datasets, "conditions": conditions, "intersecting": intersecting,
            "nonIntersecting": non_intersecting}
