import {extendObservable} from "mobx";
import * as d3 from "d3";
import {NIDataset} from "./NIDataset";
import {sortClusters} from "./HelperFunctions";
import {UIStore} from "./UIStore";

/**
 * store with information on intersecting genes
 */
export class NonIntersecting {
    constructor(comparison, dataStore, data) {
        this.uiStore = new UIStore(this)
        this.type = "nonintersecting"
        extendObservable(this, {
            // highlighted genes (by hovering over lines in profile plots)
            highlightedGenes: [],
            searchGenes: [],
            plotType: "centroid",
            setHighlightedGenes(genes) {
                this.highlightedGenes = genes;
            },
            setSearchGenes(genes) {
                this.searchGenes = genes;
            },
            setPlotType(newPlotType) {
                this.plotType = newPlotType
            },
            clearSelection() {
                this.ds1.clearSelection();
                this.ds2.clearSelection();
            },
            updateSidebar(current, previous, index) {
                let others=this.ds2.selectedClusters;
                if(index ===1){
                    others=this.ds1.selectedClusters;
                }
                if (previous.length === 0 && others.length === 0) {
                    this.uiStore.expandSelectOnly()
                } else if (current.length === 0 && others.length === 0) {
                    this.uiStore.expandOthersButSelect()
                }
            },
            get selectedGenes() {
                return (this.ds1.selectedGenes.concat(this.ds2.selectedGenes))
            },
            get genes() {
                return Object.keys(this.ds1.genes).concat(Object.keys(this.ds2.genes));
            },
            get filteredGenes() {
                return this.ds1.filteredGenes.concat(this.ds2.filteredGenes);
            }
        })

        this.dataStore = dataStore;
        this.comparison = comparison;
        // both data sets
        this.ds1 = this.initDataSet(data[0], 0);
        this.ds2 = this.initDataSet(data[1], 1);
        let values = Object.values(this.ds1.genes)
            .map(d => d.values).concat(Object.values(this.ds2.genes)
                .map(d => d.values)).flat();
        // minimum value obsereved
        this.minValue = d3.min(values);
        // maximum value obsereved
        this.maxValue = d3.max(values);

        // sort clusterNames by cluster size of first data set to ensure
        // reproducibility when loading the same data multiple times
        this.clusterNames = sortClusters(this.ds1.clusters);
        this.clusterOrder = sortClusters(this.ds1.clusters);
        Object.keys(this.ds2.clusters).forEach(cluster=>{
            if(!(this.clusterNames.includes(cluster))){
                this.clusterOrder.push(cluster);
            }
        })
        this.colorScale = d3.scaleOrdinal().domain(this.clusterOrder).range(d3.schemeCategory10);
    }


    /**
     * create new dataset based on data
     * @param {Object} data
     * @param {(0|1)} index: index of dataset (0 or 1)
     * @returns {NIDataset}
     */
    initDataSet(data, index) {
        return new NIDataset(this, data, index)
    }


}