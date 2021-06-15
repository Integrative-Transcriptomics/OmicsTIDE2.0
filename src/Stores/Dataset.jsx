import {extendObservable} from "mobx";
import React from "react";

export class Dataset {
    constructor(intersecting, data, index) {
        extendObservable(this, {
            varianceMinFilter: 0,
            varianceMaxFilter: 100,
            abundanceMinFilter: 0,
            abundanceMaxFilter: 100,
            clusters: {},
            get hoverClusters() {
                //filter clusters when hovering
                if (this.highlightedClusters.length > 0) {
                    let clusters = {}
                    Object.keys(this.clusters).forEach(cluster => {
                        if (this.highlightedClusters.includes(cluster.toString())) {
                            const genes = [];
                            Object.keys(this.intersecting.hoveredGenes).forEach(intersection => {
                                if (intersection.split(",")[this.index] === cluster) {
                                    genes.push(...this.intersecting.hoveredGenes[intersection])
                                }
                            })
                            clusters[cluster] = genes;

                        } else {
                            clusters[cluster] = this.clusters[cluster].slice()
                        }
                    })
                    return clusters
                } else return this.clusters;
            },
            get highlightedClusters() {
                return this.intersecting.highlightedIntersections.map(intersection => intersection[this.index]);
            },

            get conditionMapping() {
                let clusterMap = {};
                this.intersecting.clusterNames.forEach((cluster) => {
                    clusterMap[cluster] = this.hoverClusters[cluster].map(gene => {
                        let conds = {}
                        this.genes[gene].values.forEach((d, i) => {
                            conds[this.intersecting.dataStore.conditions[i]] = d;
                        })
                        return conds
                    })
                })
                return clusterMap
            },
            get geneCentricMapping() {
                let clusterMap = {};
                this.intersecting.clusterNames.forEach((cluster) => {
                    let data = {};
                    this.hoverClusters[cluster].forEach(gene => data[gene] = this.genes[gene].values.map((d, i) => {
                        return ({cond: this.intersecting.dataStore.conditions[i], value: d})
                    }))
                    clusterMap[cluster] = data;
                })
                return clusterMap
            },
            get clusterSizes() {
                let clusters = {}
                Object.keys(this.clusters)
                    .forEach(cluster => clusters[cluster] = this.clusters[cluster].length)
                return clusters;
            },
            setVarMin(variance) {
                this.varianceMinFilter = variance;
            },

            setVarMax(variance) {
                this.varianceMaxFilter = variance;
            },

            setAbMin(abundance) {
                this.abundanceMinFilter = abundance;
            },

            setAbMax(abundance) {
                this.abundanceMaxFilter = abundance;
            },

            updateClusters() {
                let clusters = {}
                Object.keys(this.intersecting.filteredIntersections).forEach(intersection => {
                    const key = intersection.split(',')[this.index];
                    if (!(key in clusters)) {
                        clusters[key] = []
                    }
                    clusters[key] = clusters[key]
                        .concat(this.intersecting.filteredIntersections[intersection])
                })
                this.clusters = clusters;
            },

            setHighlightedCluster(cluster) {
                this.intersecting.setHighlightedIntersection(Object.keys(this.intersecting.filteredIntersections)
                    .map(intersection => intersection.split(","))
                    .filter(intersection =>
                        intersection[this.index] === cluster
                    ).filter(intersection => this.intersecting.filteredIntersections[intersection].length > 0)
                )
            }
        })
        this.intersecting = intersecting;
        this.index = index;
        this.genes = data;
    }


    isinRange(gene) {
        return (this.varianceMinFilter < this.genes[gene].variance && this.varianceMaxFilter > this.genes[gene].variance
            && this.abundanceMinFilter < this.genes[gene].median && this.abundanceMaxFilter > this.genes[gene].median);
    }


}