import {Comparison} from "./Comparison";

/**
 * store responsible for holding the data
 */
export class DataStore {
    constructor(data) {
        this.conditions = data[0].conditions;
        this.comparisons = this.initComparisons(data);
    }

    /**
     * initialize all comparisons contained in the data
     * @param {Object} data
     * @returns {Comparison[]}
     */
    initComparisons(data) {
        return data.map(comparison => new Comparison(this, comparison));
    }
}