import {extendObservable} from "mobx";
import {FilterStore} from "./FilterStore";
import {clusterSizes, conditionMapping, geneCentricMapping} from "./HelperFunctions";
import * as d3 from 'd3';

export class NIDataset {
    constructor(nonIntersecting, data, index) {
        this.parent = nonIntersecting;
        this.index = index;
        this.genes = data;
        this.filterStore = new FilterStore(this)
        extendObservable(this, {
            highlightedClusters: [],
            selectedClusters: [],
            get conditionMapping() {
                return conditionMapping(this.clusters, this.genes, this.parent.dataStore.conditions)
            },
            get geneCentricMapping() {
                return geneCentricMapping(this.clusters, this.genes, this.parent.dataStore.conditions)
            },
            get clusterSizes() {
                return clusterSizes(this.clusters);
            },
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
            get numFilteredGenes(){
                return(d3.sum(Object.keys(this.clusters).map(cluster=>this.clusters[cluster].length)))
            },
             get geneSelection() {
                let clusters={}
                this.selectedClusters.forEach(cluster=>{
                    clusters[cluster]=this.clusters[cluster];
                })
                return geneCentricMapping(clusters, this.genes, this.parent.dataStore.conditions)
            },
            setHighlightedCluster(cluster) {
                this.highlightedCluster = cluster
            },
            setSelectedCluster(cluster) {
                const index = this.selectedClusters.indexOf(cluster);
                if (index !== -1) {
                    this.selectedClusters.splice(index, 1);
                } else {
                    this.selectedClusters.push(cluster)
                }

            },
        })

    }



}