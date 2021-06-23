import {extendObservable, reaction} from "mobx";
import * as d3 from "d3";
import {IntersectionDataset} from "./IntersectionDataset";
import {sortClusters} from "./HelperFunctions";

/**
 * store with information on intersecting genes
 */
export class Intersecting {
    constructor(comparison, dataStore, data) {
        extendObservable(this, {

            // highlighted intersections (by hovering over intersections or nodes)
            highlightedIntersections: [],
            // selecten intersections (by clicking on intersections or nodes)
            selectedIntersections: [],
            // highlighted genes (by hovering over lines in profile plots)
            highlightedGenes: [],
            plotType: "centroid",
            get concordantDiscordant() {
                return this.calculateConcordantDiscordant(this.filteredIntersections)
            },
            /**
             * calculates intersections filtered by abundance and variance
             * @returns {{Object}}
             */
            get filteredIntersections() {
                let intersections = {}
                Object.keys(this.intersections).forEach(intersection => {
                    intersections[intersection] = this.intersections[intersection]
                        .filter(gene => this.ds1.filterStore.isinRange(gene) && this.ds2.filterStore.isinRange(gene))
                })
                return intersections
            },
            get intersectionSizes() {
                let intersections = {};
                Object.keys(this.filteredIntersections).forEach(intersection =>
                    intersections[intersection] = this.filteredIntersections[intersection].length
                )
                return intersections;
            },
            /**
             * gets all genes in filtered intersections
             * @returns {[]}
             */
            get genes() {
                let genes = []
                Object.keys(this.filteredIntersections).forEach(intersection => {
                    genes = genes.concat(this.filteredIntersections[intersection])
                })
                return genes
            },
            /**
             * gets genes that are in the currently highlighted intersections
             * @returns {{Object[]}}
             */
            get hoveredGenes() {
                let genes = {};
                this.highlightedIntersections.forEach(intersection => {
                    genes[intersection] = this.filteredIntersections[intersection];
                })
                return genes
            },
            /**
             * sets highlighted intersections
             * @param {number[][]}intersections
             */
            setHighlightedIntersection(intersections) {
                this.highlightedIntersections = intersections
            },
            setHighlightedGenes(genes) {
                this.highlightedGenes = genes;
            },
            handleIntersectionSelection(intersection) {
                // intersection is already contained
                const index = this.getIntersectionIndex(intersection)
                if (index !== -1) {
                    this.selectedIntersections.splice(index, 1)
                } else {
                    this.selectedIntersections.push(intersection)
                }
            },
            handleMultipleIntersectionSelection(intersections) {
                const indices = intersections.map(currInt => this.getIntersectionIndex(currInt));
                if (indices.every(index => index !== -1)) {
                    indices.sort().reverse().forEach(index => this.selectedIntersections.splice(index, 1));
                } else {
                    intersections.filter((currInt, i) => indices[i] === -1)
                        .forEach(currInd => this.selectedIntersections.push(currInd))
                }
            },
            setPlotType(newPlotType) {
                this.plotType = newPlotType
            }
        })
        this.dataStore = dataStore;
        this.comparison = comparison;
        // both data sets
        this.ds1 = this.initDataSet(data.data[0], 0);
        this.ds2 = this.initDataSet(data.data[1], 1);
        let values = Object.values(this.ds1.genes)
            .map(d => d.values).concat(Object.values(this.ds2.genes)
                .map(d => d.values)).flat();
        // minimum value obsereved
        this.minValue = d3.min(values);
        // maximum value obsereved
        this.maxValue = d3.max(values);
        // complete intersections (unfiltered)
        this.intersections = this.initIntersections(data)
        this.initialConcordantDiscordant = this.calculateConcordantDiscordant(this.intersections);
        // create clusters for each data set based on intersections (quicker than always recomputing intersections from clusters)
        this.ds1.updateClusters();
        this.ds2.updateClusters();

        // sort clusterNames by cluster size of first data set to ensure
        // reproducibility when loading the same data multiple times
        this.clusterNames = sortClusters(this.ds1.clusters);

        // reaction that updates clusters when intersections are filterd
        reaction(
            () => this.filteredIntersections,
            () => {
                this.ds1.updateClusters();
                this.ds2.updateClusters();
            });
    }

    /**
     * initialize intersection from data received
     * @param {Object} data
     * @returns {{Object}}
     */
    initIntersections(data) {
        let intersections = {}
        Object.keys(data.intersections).forEach(intersection => {
            const key = intersection.split('-').map(ds => ds.split('_')[1])
            intersections[key] = data.intersections[intersection];
        })
        return intersections
    }

    /**
     * create new dataset based on data
     * @param {Object} data
     * @param {(0|1)} index: index of dataset (0 or 1)
     * @returns {IntersectionDataset}
     */
    initDataSet(data, index) {
        return new IntersectionDataset(this, data, index)
    }

    calculateConcordantDiscordant(intersections) {
        let concordantCount = 0;
        let discordantCount = 0;
        Object.keys(intersections).forEach(intersection => {
            const clusters = intersection.split(",");
            if (clusters[0] === clusters[1]) {
                concordantCount += intersections[intersection].length
            } else discordantCount += intersections[intersection].length;
        })
        return ({concordant: concordantCount, discordant: discordantCount})
    }


    getIntersectionIndex(intersection) {
        return this.selectedIntersections.map(currInt => JSON.stringify(currInt)).indexOf(JSON.stringify(intersection))
    }
}