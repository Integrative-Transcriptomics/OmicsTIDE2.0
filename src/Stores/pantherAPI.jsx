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

            })
            .catch((error) => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }
                console.log(error.config);
            });
    }

    /**
     * thransforms go enrichment data to a form ideal for this application
     * @param {Object[]} data
     * @returns {Object[]}
     */
    transformData(data, ontologyId) {
        let ontology;
        if (ontologyId === "GO:0008150") {
            ontology = "BP";
        } else if (ontologyId === "GO:0003674") {
            ontology = "MF";
        } else {
            ontology = "CC";
        }
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
            const entry = {
                termID: result.term.id,
                termName: result.term.label,
                ontology: ontology,
                expected: result.expected,
                foundGenes: result.number_in_list,
                foldEnrichment: result.fold_enrichment,
                padj: result.fdr,
                negLogFDR: -Math.log2(result.fdr),
                plus_minus: "+",
            }
            if (result.plus_minus === "+") {
                entry.plus_minus = "+";
            } else {
                entry.plus_minus = "-";
            }
            returnData.push(entry);
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
            callback(responses.map((response, i) => this.transformData(response.data.results.result, this.annoSets[i].id)));
            // use/access the results
        })).catch(errors => {
            // react on errors.
        })
    }
}

