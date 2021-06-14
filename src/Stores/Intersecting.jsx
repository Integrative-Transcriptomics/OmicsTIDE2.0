import {extendObservable, makeAutoObservable, reaction} from "mobx";
import * as d3 from "d3";
import {Dataset} from "./Dataset";

export class Intersecting {
    constructor(dataStore, data) {
        extendObservable(this, {
            selectedGenes: [],
            highlightedIntersection: [],
            highlightedGenes: [],
        })
        this.dataStore = dataStore;
        this.ds1 = this.initDataSet(data.data[0], 0);
        this.ds2 = this.initDataSet(data.data[1], 1);
        let values = Object.values(this.ds1.genes)
            .map(d => d.values).concat(Object.values(this.ds2.genes)
                .map(d => d.values)).flat();
        this.minValue = d3.min(values);
        this.maxValue = d3.max(values);
        this.intersections = this.initIntersections(data)
        this.ds1.updateClusters();
        this.ds2.updateClusters();
        reaction(
            () => this.filteredIntersections,
            () => {
                this.ds1.updateClusters();
                this.ds2.updateClusters();
            });
    }

    get filteredIntersections() {
        let intersections = {}
        Object.keys(this.intersections).forEach(intersection => {
            intersections[intersection] = this.intersections[intersection]
                .filter(gene => this.ds1.isinRange(gene) && this.ds2.isinRange(gene))
        })
        return intersections
    }

    get genes() {
        let genes = []
        Object.keys(this.filteredIntersections).forEach(intersection => {
            genes = genes.concat(this.filteredIntersections[intersection])
        })
        return genes
    }

    get clusterNames() {
        const clusterList = Object.keys(this.ds1.clusters).map(cluster => {
            return ({name: cluster, len: this.ds1.clusters[cluster].length})
        });
        clusterList.sort((a, b) => (a.len < b.len) ? 1 : -1)
        return clusterList.map(d => d.name);
    }
    get hoveredGenes(){
        return this.filteredIntersections[this.highlightedIntersection];
    }

    initIntersections(data) {
        let intersections = {}
        Object.keys(data.intersections).forEach(intersection => {
            const key = intersection.split('-').map(ds => ds.split('_')[1])
            intersections[key] = data.intersections[intersection];
        })
        return intersections
    }

    initDataSet(data, index) {
        return new Dataset(this, data, index)
    }

    setHighlightedIntersection(clusters) {
        this.highlightedIntersection = clusters
    }
}