def filter_variance(data, lower, upper):
    """
    :param data: abundance data frame
    :param lower: lower percentile filter
    :param upper: upper percentile filter

    :return: filtered abundance data frame
    """

    data.loc[:, 'row_variance'] = data.var(axis=1)

    lower_quantile = data['row_variance'].quantile(round(lower / 100, 1))
    upper_quantile = data['row_variance'].quantile(round(upper / 100, 1))

    quantile_filtered = data[data['row_variance'].gt(lower_quantile) & data['row_variance'].lt(upper_quantile)]

    quantile_filtered.drop(columns=['row_variance'], inplace=True)

    return quantile_filtered
