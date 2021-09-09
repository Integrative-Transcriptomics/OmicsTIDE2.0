import {extendObservable, reaction} from "mobx";
import {FilterStore} from "./FilterStore";
import {clusterSizes, conditionMapping, geneCentricMapping} from "./HelperFunctions";
import * as d3 from 'd3';

/**
 * holds data for a dataset of non-intersecting genes
 */
export class NIDataset {
    constructor(nonIntersecting, data, index) {
        this.parent = nonIntersecting;
        this.index = index;
        this.genes = data;
        this.filterStore = new FilterStore(this)
        extendObservable(this, {
            highlightedClusters: [],
            selectedClusters: [],
            /**
             * brings data in a convenient form for centroid profile plots
             * @returns {{Object}}
             */
            get conditionMapping() {
                return conditionMapping(this.clusters, this.genes, this.parent.dataStore.conditions)
            },
            /**
             * brings data in a convenient form for normal profile plots
             * @returns {{Object}}
             */
            get geneCentricMapping() {
                return geneCentricMapping(this.clusters, this.genes, this.parent.dataStore.conditions)
            },
            /**
             * gets sizes of clusters
             * @returns {{Object}}
             */
            get clusterSizes() {
                return clusterSizes(this.clusters);
            },
            /**
             * gets clusters that are in current filter ranges
             * @returns {{}}
             */
            get clusters() {
                let clusters = {}
                Object.keys(this.genes).forEach(gene => {
                    if (this.filterStore.isinRange(gene)) {
                        if (!(this.genes[gene].cluster in clusters)) {
                            clusters[this.genes[gene].cluster] = []
                        }
                        clusters[this.genes[gene].cluster].push(gene)
                    }
                })
                return clusters;
            },
            /**
             * gets the number of genes that are in current filter ranges
             * @returns {*}
             */
            get numFilteredGenes() {
                return (d3.sum(Object.keys(this.clusters).map(cluster => this.clusters[cluster].length)))
            },
            /**
             * gets selected genes in a convinent form for multi profile plots
             * @returns {{Object}}
             */
            get geneSelection() {
                let clusters = {}
                this.selectedClusters.forEach(cluster => {
                    clusters[cluster] = this.clusters[cluster];
                })
                return geneCentricMapping(clusters, this.genes, this.parent.dataStore.conditions)
            },
            /**
             * gets selected genes in clusters
             * @returns {[]}
             */
            get selectedGenes() {
                let genes = []
                this.selectedClusters.forEach(cluster => {
                    genes.push(...this.clusters[cluster])
                })
                return (genes);
            },
            get filteredGenes(){
                return Object.values(this.clusters).flat()
            },
            get filteredClusterNames() {
                return this.parent.clusterNames.filter(cluster => this.clusterSizes[cluster] > 0)
            },
            /**
             * sets highlighted cluster
             * @param {string} cluster
             */
            setHighlightedCluster(cluster) {
                this.highlightedCluster = cluster
            },
            /**
             * sets selected cluster
             * @param {string} cluster
             */
            setSelectedCluster(cluster) {
                const localCopy=this.selectedClusters.slice();
                const index = localCopy.indexOf(cluster);
                if (index !== -1) {
                    localCopy.splice(index, 1);
                } else {
                    localCopy.push(cluster)
                }
                this.selectedClusters=localCopy;
            },
            /**
             * clears selection completely
             */
            clearSelection() {
                this.selectedClusters = [];
            }
        })
         reaction(
            () => this.selectedClusters,
            (current, previous) => {
                this.parent.updateSidebar(current,previous, this.index)
            });

    }


}