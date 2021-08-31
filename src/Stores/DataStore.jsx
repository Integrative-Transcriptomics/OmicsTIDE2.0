import {Comparison} from "./Comparison";
import {PantherAPI} from "./pantherAPI";

/**
 * store responsible for holding the data
 */
export class DataStore {
    constructor(data, initialVarFilter) {
        // array containing min and max variance values that the data was filtered by before clustering.
        this.initialVarFilter = initialVarFilter;
        this.conditions = data[0].conditions;
        this.pantherAPI = new PantherAPI();
        this.comparisons = this.initComparisons(data);
    }

    /**
     * initialize all comparisons contained in the data
     * @param {Object} data
     * @returns {Comparison[]}
     */
    initComparisons(data) {
        return data.map((comparison, i) => new Comparison(this, comparison, i));
    }
}