import {extendObservable} from "mobx";
import {FilterStore} from "./FilterStore";
import {clusterSizes, conditionMapping, geneCentricMapping} from "./HelperFunctions";

export class IntersectionDataset {
    constructor(intersecting, data, index) {
        extendObservable(this, {
            clusters: {},
            get hoverClusters() {
                //filter clusters when hovering
                if (this.highlightedClusters.length > 0) {
                    let clusters = {}
                    Object.keys(this.clusters).forEach(cluster => {
                        if (this.highlightedClusters.includes(cluster.toString())) {
                            const genes = [];
                            Object.keys(this.parent.hoveredGenes).forEach(intersection => {
                                if (intersection.split(",")[this.index] === cluster) {
                                    genes.push(...this.parent.hoveredGenes[intersection])
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
                return this.parent.highlightedIntersections.map(intersection => intersection[this.index]);
            },

            get conditionMapping() {
                return conditionMapping(this.hoverClusters, this.genes, this.parent.dataStore.conditions);
            },
            get geneCentricMapping() {
                return geneCentricMapping(this.hoverClusters, this.genes, this.parent.dataStore.conditions)
            },
            get clusterSizes() {
                return clusterSizes(this.clusters);
            },
            updateClusters() {
                let clusters = {}
                Object.keys(this.parent.filteredIntersections).forEach(intersection => {
                    const key = intersection.split(',')[this.index];
                    if (!(key in clusters)) {
                        clusters[key] = []
                    }
                    clusters[key] = clusters[key]
                        .concat(this.parent.filteredIntersections[intersection])
                })
                this.clusters = clusters;
            },

            setHighlightedCluster(cluster) {
                this.parent.setHighlightedIntersection(Object.keys(this.parent.filteredIntersections)
                    .map(intersection => intersection.split(","))
                    .filter(intersection =>
                        intersection[this.index] === cluster
                    ).filter(intersection => this.parent.filteredIntersections[intersection].length > 0)
                )
            },
            setSelectedCluster(cluster) {
                this.parent.handleMultipleIntersectionSelection(Object.keys(this.parent.filteredIntersections)
                    .map(intersection => intersection.split(","))
                    .filter(intersection =>
                        intersection[this.index] === cluster
                    ).filter(intersection => this.parent.filteredIntersections[intersection].length > 0));
            }
        })
        this.parent = intersecting;
        this.index = index;
        this.genes = data;
        this.filterStore = new FilterStore(this)
    }


}