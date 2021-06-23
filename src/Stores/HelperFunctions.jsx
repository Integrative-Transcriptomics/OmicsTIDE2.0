export function geneCentricMapping(clusters, genes, conditions) {
    let clusterMap = {};
    Object.keys(clusters).forEach((cluster) => {
        let data = {};
        clusters[cluster].forEach(gene => data[gene] = genes[gene].values.map((d, i) => {
            return ({cond: conditions[i], value: d})
        }))
        clusterMap[cluster] = data;
    })
    return clusterMap
}

export function conditionMapping(clusters, genes, conditions) {
    let clusterMap = {};
    Object.keys(clusters).forEach((cluster) => {
        clusterMap[cluster] = clusters[cluster].map(gene => {
            let conds = {}
            genes[gene].values.forEach((d, i) => {
                conds[conditions[i]] = d;
            })
            return conds
        })
    })
    return clusterMap
}

export function clusterSizes(clusters) {
    let clusterSizes = {}
    Object.keys(clusters)
        .forEach(cluster => clusterSizes[cluster] = clusters[cluster].length)
    return clusterSizes;
}

/**
 * sorts clusters by length and returns their names
 * @returns {*[]}
 */
export function sortClusters(clusters) {
    const clusterList = Object.keys(clusters).map(cluster => {
        return ({name: cluster, len: clusters[cluster].length})
    });
    clusterList.sort((a, b) => (a.len < b.len) ? 1 : -1)
    return clusterList.map(d => d.name);
}