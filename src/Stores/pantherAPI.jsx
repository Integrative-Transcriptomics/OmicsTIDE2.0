import axios from "axios";
import {extendObservable} from "mobx";

export class PantherAPI {
    constructor() {
        extendObservable(this, {
            genomesLoaded: false,
        })
        this.genomes = [];
        this.annoSets = [{label: "Molecular Function", id: "GO:0003674"},
            {label: "Biological Process", id: "GO:0008150"},
            {label: "Cellular Component", id: "GO:0005575"}];
        this.getSupportedGenomes(genomes => {
            this.genomes = genomes;
            this.genomesLoaded = true;
        })
    }

    getSupportedGenomes(callback) {
        axios.get("http://pantherdb.org/services/oai/pantherdb/supportedgenomes",)
            .then((response) => {
                callback(response.data.search.output.genomes.genome.map(genome => {
                    return ({label: genome.long_name, value: genome.taxon_id});
                }))
            });
    }

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
        const overrepresented = [];
        const underrepresented = [];
        const filteredData = data.filter(result => result.fdr < 0.05)
        filteredData.forEach(result => {
            if (result.plus_minus === "+") {
                overrepresented.push({
                    termID: result.term.id,
                    termName: result.term.label,
                    padj: result.fdr,
                    negLogFDR: -Math.log2(result.fdr),
                    plus_minus: "+",
                });
            } else {
                underrepresented.push({
                    termID: result.term.id,
                    termName: result.term.label,
                    padj: result.fdr,
                    negLogFDR: -Math.log2(result.fdr),
                    plus_minus: "-"
                });
            }
        })
        overrepresented.sort(compare);
        underrepresented.sort(compare);
        return (overrepresented.concat(underrepresented));
    }

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

