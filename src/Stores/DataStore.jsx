import {Comparison} from "./Comparison";

/**
 * store responsible for holding the data
 */
export class DataStore {
    constructor(data, mapping, initialVarFilter,pantherAPI) {
        // array containing min and max variance values that the data was filtered by before clustering.
        this.initialVarFilter = initialVarFilter;
        this.conditions = data[0].conditions;
        this.pantherAPI = pantherAPI;
        this.comparisons = this.initComparisons(data);
        this.mappingLoaded = false;
        this.nameToID = {};
        this.idToName = {}
        if (mapping !== null) {
            this.mappingLoaded = true;
            this.initIdMapping(mapping)
        }
    }

    /**
     * initialize all comparisons contained in the data
     * @param {Object} data
     * @returns {Comparison[]}
     */
    initComparisons(data) {
        return data.map((comparison, i) => new Comparison(this, comparison, i));
    }

    /**
     * maps gene ids to gene names and vice versa
     * @param {string[][]} mapping
     */
    initIdMapping(mapping) {
        mapping.forEach(entry => {
            if (entry[1] !== null) {
                this.idToName[entry[0]] = entry[1]
                // we cannot assume unique gene names, so we need to be prepared that multiple ids map to a gene name
                if (!(entry[1] in this.nameToID)) {
                    this.nameToID[entry[1]] = [entry[0]]
                } else {
                    this.nameToID[entry[1]].push(entry[0]);
                }
            }
        })
    }
}