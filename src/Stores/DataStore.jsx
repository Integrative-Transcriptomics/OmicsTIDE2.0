import {Comparison} from "./Comparison";

export class DataStore {
    constructor(data) {
        this.conditions = data[0].conditions;
        this.comparisons = this.initComparisons(data);
    }

    initComparisons(data) {
        return data.map(comparison => new Comparison(this, comparison));
    }
}