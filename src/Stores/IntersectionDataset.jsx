import {extendObservable} from "mobx";
import {FilterStore} from "./FilterStore";
import {clusterSizes, conditionMapping, geneCentricMapping} from "./HelperFunctions";

/**
 * holds data for a dataset of intersecting genes
 */
export class IntersectionDataset {
    constructor(intersecting, data, index) {
        this.parent = intersecting;
        this.index = index;
        this.genes = data;
        this.initialClusters=this.calculateClusters(this.genes);
        this.filterStore = new FilterStore(this)
        extendObservable(this, {
            clusters: this.initialClusters,
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
            /**
             * get clusters that are highlighted
             * @returns {*[]}
             */
            get highlightedClusters() {
                return this.parent.highlightedIntersections.map(intersection => intersection[this.index]);
            },
            /**
             * brings data in a convenient form for centroid profile plots
             * @returns {{Object}}
             */
            get conditionMapping() {
                return conditionMapping(this.hoverClusters, this.genes, this.parent.dataStore.conditions);
            },
            /**
             * brings data in a convenient form for normal profile plots
             * @returns {{Object}}
             */
            get geneCentricMapping() {
                return geneCentricMapping(this.hoverClusters, this.genes, this.parent.dataStore.conditions)
            },
            /**
             * gets selected genes in a convinent form for multi profile plots
             * @returns {{Object}}
             */
            get geneSelection() {
                let clusters = {}
                Object.keys(this.parent.selectedGenesIntersections).forEach(intersection => {
                    const key = intersection.split(',')[this.index];
                    if (!(key in clusters)) {
                        clusters[key] = []
                    }
                    clusters[key].push(...this.parent.selectedGenesIntersections[intersection]);
                })
                return geneCentricMapping(clusters, this.genes, this.parent.dataStore.conditions)
            },
            /**
             * gets sizes of clusters
             * @returns {{Object}}
             */
            get clusterSizes() {
                return clusterSizes(this.clusters);
            },
            /**
             * gets selected clusters
             * @returns {[string]}
             */
            get selectedClusters() {
                let selectedClusters = []
                this.parent.selectedIntersections.forEach(intersection => {
                    selectedClusters.push(intersection[this.index])
                })
                return selectedClusters;
            },
            get filteredClusterNames() {
                return this.parent.clusterOrder.filter(cluster => this.clusterSizes[cluster] > 0)
            },
            /**
             * update clusters based on intersections
             */
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
            /**
             * highlight a cluster and the corresponding intersections
             * @param {string} cluster
             */
            setHighlightedCluster(cluster) {
                this.parent.setHighlightedIntersection(Object.keys(this.parent.filteredIntersections)
                    .map(intersection => intersection.split(","))
                    .filter(intersection =>
                        intersection[this.index] === cluster
                    ).filter(intersection => this.parent.filteredIntersections[intersection].length > 0)
                )
            },
            /**
             * sekect a cluster and the corresponding intersections
             * @param {string} cluster
             */
            setSelectedCluster(cluster) {
                this.parent.handleMultipleIntersectionSelection(Object.keys(this.parent.filteredIntersections)
                    .map(intersection => intersection.split(","))
                    .filter(intersection =>
                        intersection[this.index] === cluster
                    ).filter(intersection => this.parent.filteredIntersections[intersection].length > 0));
            }
        })
    }
    calculateClusters(genes){
        let clusters={};
        Object.entries(genes).forEach(([key,value])=>{
            if(!(Object.keys(clusters).includes(value.cluster))){
                clusters[value.cluster]=[key];
            }
            clusters[value.cluster].push(key)
        })
        return(clusters);
    }

}