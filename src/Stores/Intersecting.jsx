import {extendObservable, reaction} from "mobx";
import * as d3 from "d3";
import {IntersectionDataset} from "./IntersectionDataset";
import {sortClusters} from "./HelperFunctions";
import {UIStore} from "./UIStore";

/**
 * store with information on intersecting genes
 */
export class Intersecting {
    constructor(comparison, dataStore, data) {
        this.uiStore = new UIStore(this)
        this.type = "intersecting"
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
        // complete intersections (unfiltered)
        this.intersections = this.calculateIntersections()
        this.initialConcordantDiscordant = this.calculateConcordantDiscordantCounts(this.intersections);
        // sort clusterNames by cluster size of first data set to ensure
        // reproducibility when loading the same data multiple times
        this.clusterNames = sortClusters(this.ds1.clusters);
        this.clusterOrder = sortClusters(this.ds1.clusters);
        Object.keys(this.ds2.clusters).forEach(cluster => {
            if (!(this.clusterNames.includes(cluster))) {
                this.clusterOrder.push(cluster);
            }
        })
        this.colorScale = d3.scaleOrdinal().domain(this.clusterOrder).range(d3.schemeCategory10);

        extendObservable(this, {
            // highlighted intersections (by hovering over intersections or nodes)
            highlightedIntersections: [],
            // select intersections (by clicking on intersections or nodes)
            selectedIntersections: [],
            // highlighted genes (by hovering over lines in profile plots)
            highlightedGenes: [],
            concordantHighlighted: false,
            discordantHighlighted: false,
            isHighlightedPermanent: false,
            searchGenes: [],
            plotType: "centroid",
            sizeIntersectionFilter: 0,
            get concordantDiscordant() {
                return (this.calculateConcordantDiscordantCounts(this.filteredIntersections));
            },
            /**
             * calculates intersections filtered by abundance and variance
             * @returns {{}}
             */
            get filteredIntersections() {
                let intersections = {}
                let deleteKeys = [];
                Object.keys(this.intersections).forEach(intersection => {
                    intersections[intersection] = this.intersections[intersection]
                        .filter(gene => this.ds1.filterStore.isinRange(gene) && this.ds2.filterStore.isinRange(gene))
                    if (intersections[intersection].length < this.sizeIntersectionFilter) {
                        deleteKeys.push(intersection)
                    }
                })
                deleteKeys.forEach(key => delete intersections[key]);
                return intersections
            },
            /**
             * calculates sizes of intersections
             * @returns {{}}
             */
            get intersectionSizes() {
                let intersections = {};
                Object.keys(this.filteredIntersections).forEach(intersection =>
                    intersections[intersection] = this.filteredIntersections[intersection].length
                )
                return intersections;
            },
            get nextToMaxIntersection() {
                const sizes = Object.values(this.intersections).map(d => d.length);
                sizes.sort((a, b) => a - b);
                return sizes[sizes.length - 2];
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
            get filteredGenes() {
                return Object.values(this.filteredIntersections).flat()
            },
            /**
             * gets genes that are in the currently highlighted intersections
             * @returns {{}}
             */
            get hoveredGenes() {
                let genes = {};
                this.highlightedIntersections.forEach(intersection => {
                    genes[intersection] = this.filteredIntersections[intersection];
                })
                return genes
            },
            /**
             * gets intersections with selected genes
             * @returns {{}}
             */
            get selectedGenesIntersections() {
                let intersections = {}
                this.selectedIntersections.forEach(intersection => {
                    intersections[intersection] = this.filteredIntersections[intersection];
                })
                return intersections;
            },
            /**
             * get genes in selected intersections
             * @returns {FlatArray<string[], 1>[]}
             */
            get selectedGenes() {
                return Object.values(this.selectedGenesIntersections).flat();
            },
            get intersectionsGrouping() {
                return this.calculateConcordantDiscordant(this.filteredIntersections);
            },
            /**
             * sets highlighted genes
             * @param genes
             */
            setHighlightedGenes(genes) {
                this.highlightedGenes = genes;
            },
            setSearchGenes(genes) {
                this.searchGenes = genes;
            },
            setIsHighlightedPermanent(bool){
                this.isHighlightedPermanent=bool
            },
            /**
             * highlights multiple intersections
             * @param {string[]} intersections
             */
            highlightIntersections(intersections) {
                intersections.filter(intersection => this.getHighlightedIntersectionIndex(intersection) === -1)
                    .forEach(intersection => this.highlightedIntersections.push(intersection))
            },
            /**
             * unhighlights multiple intersections
             * @param {string[]} intersections
             */
            unHighlightIntersections(intersections) {
                let exclude;
                if (this.concordantHighlighted) {
                    exclude = Object.keys(this.intersectionsGrouping.concordant)
                } else if (this.discordantHighlighted) {
                    exclude = Object.keys(this.intersectionsGrouping.discordant)
                } else {
                    exclude = []
                }
                const indices = intersections.filter((intersection) => !exclude.includes(intersection.toString()))
                    .map(currInt => this.getHighlightedIntersectionIndex(currInt))
                    .filter(index => index !== -1);
                indices.sort((a, b) => b - a);
                indices.forEach(index => this.highlightedIntersections.splice(index, 1));
            },
            /**
             * highlights concordant/discordant intersections
             * @param type {string} concordant/discordant/none
             */
            highlightConcDiscIntersections(type) {
                if (type === "concordant") {
                    this.concordantHighlighted = true;
                    this.discordantHighlighted = false;
                    this.highlightedIntersections.replace(Object.keys(this.intersectionsGrouping.concordant)
                        .map(d => d.split(",")));
                } else if (type === "discordant") {
                    this.discordantHighlighted = true;
                    this.concordantHighlighted = false;
                    this.highlightedIntersections.replace(Object.keys(this.intersectionsGrouping.discordant)
                        .map(d => d.split(",")));
                } else {
                    this.concordantHighlighted = false;
                    this.discordantHighlighted = false;
                    this.highlightedIntersections.clear();
                }
            },
            /**
             * selects an intersection
             * @param {string} intersection
             */
            handleIntersectionSelection(intersection) {
                // intersection is already contained
                if (this.selectedIntersections.length === 0) {
                    this.uiStore.expandSelectOnly();
                }
                const index = this.getSelectedIntersectionIndex(intersection)
                if (index !== -1) {
                    this.selectedIntersections.splice(index, 1)
                } else {
                    this.selectedIntersections.push(intersection)
                }
            },
            /**
             * selects multiple intersections
             * @param {string[]} intersections
             */
            handleMultipleIntersectionSelection(intersections) {
                if (this.selectedIntersections.length === 0) {
                    this.uiStore.expandSelectOnly();
                }
                const indices = intersections.map(currInt => this.getSelectedIntersectionIndex(currInt));
                if (indices.every(index => index !== -1)) {
                    indices.sort().reverse().forEach(index => this.selectedIntersections.splice(index, 1));
                } else {
                    intersections.filter((currInt, i) => indices[i] === -1)
                        .forEach(currInd => this.selectedIntersections.push(currInd))
                }
            },
            /**
             * clears selection completely
             */
            clearSelection() {
                this.selectedIntersections = []
                this.uiStore.expandOthersButSelect();
            },
            /**
             * sets current plot type
             * @param {string} newPlotType
             */
            setPlotType(newPlotType) {
                this.plotType = newPlotType
            },
            setSizeIntersectionFilter(filter) {
                this.sizeIntersectionFilter = filter;
            }
        })
        // reaction that updates clusters when intersections are filterd
        reaction(
            () => this.filteredIntersections,
            () => {
                this.ds1.updateClusters();
                this.ds2.updateClusters();
            });
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

    /**
     * calculates number of concordant and discordant genes for intersections
     * @param {Object} intersections
     * @returns {{discordant: {}, concordant: {}}}
     */
    calculateConcordantDiscordant(intersections) {
        let concordant = {};
        let discordant = {};
        Object.keys(intersections).forEach(intersection => {
            const clusters = intersection.split(",");
            if (clusters[0] === clusters[1]) {
                if (!Object.keys(concordant).includes(intersection)) {
                    concordant[intersection] = 0
                }
                concordant[intersection] += intersections[intersection].length
            } else {
                if (!Object.keys(discordant).includes(intersection)) {
                    discordant[intersection] = 0
                }
                discordant[intersection] += intersections[intersection].length
            }
        })
        return ({concordant: concordant, discordant: discordant})
    }

    calculateConcordantDiscordantCounts(intersections) {
        const concordantDiscordant = this.calculateConcordantDiscordant(intersections);
        return {
            concordant: d3.sum(Object.values(concordantDiscordant.concordant)),
            discordant: d3.sum(Object.values(concordantDiscordant.discordant))
        }
    }

    calculateIntersections() {
        let intersections = {};
        Object.entries(this.ds1.initialClusters).forEach(([key1, value1]) => {
            Object.entries(this.ds2.initialClusters).forEach(([key2, value2]) => {
                intersections[key1 + "," + key2] = value1.filter(value => value2.includes(value));
            })
        })
        return intersections;
    }

    /**
     * gets index of intersection in selected intersections
     * @param {[number,number]} intersection
     * @returns {number}
     */
    getSelectedIntersectionIndex(intersection) {
        return this.selectedIntersections.map(currInt => JSON.stringify(currInt)).indexOf(JSON.stringify(intersection))
    }

    /**
     * gets index of intersection in selected intersections
     * @param {[number,number]} intersection
     * @returns {number}
     */
    getHighlightedIntersectionIndex(intersection) {
        return this.highlightedIntersections.map(currInt => JSON.stringify(currInt)).indexOf(JSON.stringify(intersection))
    }


}