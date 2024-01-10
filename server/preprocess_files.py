import pandas as pd
from flask import jsonify
from scipy import stats


def remove_invalid_genes(data):
    data.index = data.index.astype('str')

    return data[~data.index.str.contains(r'\.')]


def preprocess_file(input_file):
    """Loads file as pandas DataFrame and removes NA rows
    :param file: filename (str)
    :return modified filename (DataFrame)
    """
    init = None

    try:
        init = pd.read_csv(input_file, index_col='gene', sep=",")

    except ValueError as ve:
        if str(ve) == "Index gene invalid":

            try:
                init = pd.read_csv(input_file, index_col='gene', sep="\t")

            except:
                return jsonify(message="Error: Values neither comma- nor tab-separated!"), 500

        else:
            return jsonify(message="Error: Values neither comma- nor tab-separated!"), 500
    # drop NA
    init.dropna(inplace=True)
    # remove columns with dot
    init = remove_invalid_genes(init)

    # remove duplicated indices
    init = init.loc[~init.index.duplicated(keep='first')]

    variance = init.var(axis=1)
    median = init.median(axis=1)

    init.loc[:, 'var'] = [stats.percentileofscore(variance, a, 'rank') for a in variance]
    init.loc[:, 'median'] = [stats.percentileofscore(median, a, 'rank') for a in median]
    return init
