import {extendObservable} from "mobx";

/**
 * store holding everything related to filtering for the intersecting/non-intersecting tabs
 */
export class FilterStore {
    constructor(parent) {
        this.parent = parent;
        extendObservable(this, {
            varianceMinFilter: this.parent.parent.comparison.dataStore.initialVarFilter[0],
            varianceMaxFilter: this.parent.parent.comparison.dataStore.initialVarFilter[1],
            abundanceMinFilter: 0,
            abundanceMaxFilter: 100,
            setVarMin(variance) {
                if (variance >= this.parent.parent.comparison.dataStore.initialVarFilter[0]) {
                    this.varianceMinFilter = variance;
                }
            },
            setVarMax(variance) {
                if (variance <= this.parent.parent.comparison.dataStore.initialVarFilter[1]) {
                    this.varianceMaxFilter = variance;
                }
            },
            setAbMin(abundance) {
                this.abundanceMinFilter = abundance;
            },
            setAbMax(abundance) {
                this.abundanceMaxFilter = abundance;
            }
        });
    }

    /**
     * check if the variance and abundance of a gene are in current filter range
     * @param {string} gene
     * @returns {boolean}
     */
    isinRange(gene) {
        return (this.varianceMinFilter < this.parent.genes[gene].variance && this.varianceMaxFilter > this.parent.genes[gene].variance
            && this.abundanceMinFilter < this.parent.genes[gene].median && this.abundanceMaxFilter > this.parent.genes[gene].median);
    }


}