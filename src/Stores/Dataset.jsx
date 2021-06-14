import {extendObservable} from "mobx";
import React from "react";

export class Dataset {
    constructor(intersecting, data, index) {
        extendObservable(this, {
            varianceMinFilter: -Infinity,
            varianceMaxFilter: Infinity,
            abundanceMinFilter: -Infinity,
            abundanceMaxFilter: Infinity,
        })
        this.intersecting = intersecting;
        this.index = index;
        this.genes = data;
        this.clusters = {}
    }


    get hoverClusters() {
        //filter clusters when hovering
        if (this.intersecting.highlightedIntersection.length === 2) {
            let clusters = {}
            Object.keys(this.clusters).forEach(cluster => {
                if (cluster === this.intersecting.highlightedIntersection[this.index]) {
                    clusters[cluster] = this.intersecting.hoveredGenes
                } else {
                    clusters[cluster] = this.clusters[cluster].slice()
                }
            })
            return clusters
        } else return this.clusters;
    }

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
    }

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
    }

    isinRange(gene) {
        return (this.varianceMinFilter < this.genes[gene].variance < this.varianceMaxFilter &&
            this.abundanceMinFilter < this.genes[gene].median < this.abundanceMaxFilter)
    }

    setVarMin(variance) {
        this.varianceMinFilter = variance;
    }

    setVarMax(variance) {
        this.varianceMaxFilter = variance;
    }

    setAbMin(abundance) {
        this.abundanceMinFilter = abundance;
    }

    setAbMax(abundance) {
        this.abundanceMaxFilter = abundance;
    }

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
    }


}