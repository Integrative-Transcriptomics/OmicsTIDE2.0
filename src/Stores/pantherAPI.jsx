import axios from "axios";
import {extendObservable} from "mobx";

/**
 * API for contacting PANTHER services
 */
export class PantherAPI {
    constructor() {
        extendObservable(this, {
            genomesLoaded: false,
            selectedSpecies: null,
            setSelectedSpecies(newSpecies) {
                this.selectedSpecies = newSpecies;
            },
            setGenomesLoaded() {
                this.genomesLoaded = true
            },
            get speciesName() {
                if (this.selectedSpecies !== null) {
                    return (this.genomes[this.selectedSpecies]);
                } else {
                    return ("")
                }
            }
        })
        this.genomes = {}
        // the three GO onthologies with their IDs
        this.annoSets = [{label: "Molecular Function", id: "GO:0003674"},
            {label: "Biological Process", id: "GO:0008150"},
            {label: "Cellular Component", id: "GO:0005575"}];
        /**
         * get supported genomes only once in the beginning when application is launched
         */
        this.getSupportedGenomes(genomes => {
            this.genomes = genomes
            this.setGenomesLoaded(genomes);
        })
    }

    /**
     * gets supported geneoms and returns them in a callback function
     * @param {function} callback
     */
    getSupportedGenomes(callback) {
        axios.get("http://pantherdb.org/services/oai/pantherdb/supportedgenomes",)
            .then((response) => {
                let dict = {}
                response.data.search.output.genomes.genome.forEach(genome => {
                    dict[genome.taxon_id] = genome.long_name
                })
                callback(dict)
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
     * @param refList
     * @param {string} organism
     * @param {function} callback
     */
    calcOverrepresentation(geneList, refList, organism, isWholeGenomeRef, callback) {
        const requests = this.annoSets.map(annoSet => {
            let requestString = "http://pantherdb.org/services/oai/pantherdb/enrich/overrep";
            let requestObject = {
                geneInputList: geneList, //gave the values directly for testing
                organism: organism,
                annotDataSet: annoSet.id,
                enrichmentTestType: "FISCHER",
                correction: "FDR"
            }
            if (!isWholeGenomeRef) {
                requestObject["refOrganism"] = organism;
                requestObject["refInputList"] = refList;
            }
            return (axios.post(requestString, new URLSearchParams(requestObject)))
        })
        axios.all(requests).then(axios.spread((...responses) => {
            let returnMessage = "success"
            callback({
                data: responses.map((response, i) => {
                    let responseData = []
                    if (response.data.results.input_list.mapped_count === 0) {
                        returnMessage = "No genes ids matching reference"
                    }
                    if(Object.keys(response.data.results).includes("result")){
                        responseData=this.transformData(response.data.results.result, this.annoSets[i].id);
                    }
                    return (responseData)
                }), message: returnMessage
            });
            // use/access the results
        })).catch(errors => {
            // react on errors.
        })
    }
}

