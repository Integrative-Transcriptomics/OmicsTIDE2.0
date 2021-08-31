import axios from "axios";
import {extendObservable} from "mobx";

/**
 * API for contacting PANTHER services
 */
export class PantherAPI {
    constructor() {
        extendObservable(this, {
            genomesLoaded: false,
        })
        this.genomes = [];
        // the three GO onthologies with their IDs
        this.annoSets = [{label: "Molecular Function", id: "GO:0003674"},
            {label: "Biological Process", id: "GO:0008150"},
            {label: "Cellular Component", id: "GO:0005575"}];
        /**
         * get supported genomes only once in the beginning when application is launched
         */
        this.getSupportedGenomes(genomes => {
            this.genomes = genomes;
            this.genomesLoaded = true;
        })
    }

    /**
     * gets supported geneoms and returns them in a callback function
     * @param {function} callback
     */
    getSupportedGenomes(callback) {
        axios.get("http://pantherdb.org/services/oai/pantherdb/supportedgenomes",)
            .then((response) => {
                callback(response.data.search.output.genomes.genome.map(genome => {
                    return ({label: genome.long_name, value: genome.taxon_id});
                }))
            });
    }

    /**
     * thransforms go enrichment data to a form ideal for this application
     * @param {Object[]} data
     * @returns {Object[]}
     */
    transformData(data) {
        const compare = function (a, b) {
            if (a.negLogFDR < b.negLogFDR) {
                return 1;
            }
            if (a.negLogFDR > b.negLogFDR) {
                return -1;
            }
            return 0;
        }
        const returnData = [];
        const filteredData = data.filter(result => result.fdr < 0.05)
        filteredData.forEach(result => {
            returnData.push()
            if (result.plus_minus === "+") {
                returnData.push({
                    termID: result.term.id,
                    termName: result.term.label,
                    padj: result.fdr,
                    negLogFDR: -Math.log2(result.fdr),
                    plus_minus: "+",
                });
            } else {
                returnData.push({
                    termID: result.term.id,
                    termName: result.term.label,
                    padj: result.fdr,
                    negLogFDR: -Math.log2(result.fdr),
                    plus_minus: "-"
                });
            }
        })
        returnData.sort(compare);
        return (returnData);
    }

    /**
     * calls PANTHER overrepresentation and returns response in a callback
     * @param {string[]} geneList
     * @param {string} organsim
     * @param {function} callback
     */
    calcOverrepresentation(geneList, organsim, callback) {
        const requests = this.annoSets.map(annoSet => {
            return (axios.get("http://pantherdb.org/services/oai/pantherdb/enrich/overrep?geneInputList=" + geneList + "&organism=" + organsim + "&annotDataSet=" + annoSet.id + "&enrichmentTestType=FISHER&correction=FDR"))
        })
        axios.all(requests).then(axios.spread((...responses) => {
            callback(responses.map(response => this.transformData(response.data.results.result)));
            // use/access the results
        })).catch(errors => {
            // react on errors.
        })
    }
}

