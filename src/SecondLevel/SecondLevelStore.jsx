import {extendObservable, toJS} from "mobx";
import * as d3 from "d3";

/**
 * Extra store holding data for a second level analysis tab
 */
export class SecondLevelStore {
    constructor(pantherAPI, parent, ds1selection, ds2selection) {
        this.pantherAPI = pantherAPI;
        // intersecting/nonintersecting store
        this.parent = parent;
        // gene selection in both data sets (same genes in intersecting, different genes in non-intersecting)
        this.ds1selection = ds1selection;
        this.ds2selection = ds2selection;
        // all genes
        this.genes = [...new Set(Object.values(ds1selection).map(d => Object.keys(d)).flat()
            .concat(Object.values(ds2selection).map(d => Object.keys(d)).flat()))]
        extendObservable(this, {
            // calculated goData
            goData: [],

            //loading status
            isLoading: false,
            isLoaded: false,

            searchGenes: [],

            setGoData(data){
                this.goData = data;
            },
            setIsLoading(loading){
                this.isLoading = loading;
            },
            setIsLoaded(loaded){
                this.isLoaded = loaded
            },

            setSearchGenes(genes) {
                this.searchGenes = genes;
            },

            // calculates overrepresentation and sets loading status
            calcOverrepresentation(organism, wholeGenomeRef) {
                this.isLoading = true;
                this.isLoaded = false;
                this.pantherAPI.calcOverrepresentation(this.genes, parent.genes ,organism, wholeGenomeRef, (response) => {
                    this.setGoData(response);
                    this.setIsLoading(false);
                    this.setIsLoaded(true);
                })
            },

            // get total max value of -log(FDR) for axes
            get totalMax() {
                return d3.max(this.goData.map(annoSet => {
                    if (annoSet !== null) {
                        return (d3.max(annoSet.map(d => d.negLogFDR)));
                    } else return (0);
                }));
            },
            createDownload(filter) {
                let csv;
                if (filter === null) {
                    csv = convertToCSV(toJS(this.goData).flat());
                } else if (filter === "GO:0003674") {
                    csv = convertToCSV(toJS(this.goData[0]));
                } else if (filter === "GO:0008150") {
                    csv = convertToCSV(toJS(this.goData[1]));
                } else {
                    csv = convertToCSV(toJS(this.goData[2]));
                }
                const downloadLink = document.createElement("a");
                const blob = new Blob(["\ufeff", csv]);
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = "goData.tsv";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
        })

        function convertToCSV(array) {
            const header = Object.keys(array[0])
            let str = '';
            str += header.reduce((line, key, i) => {
                if (line !== '') line += '\t'
                line += key;
                return line;
            }) + '\r\n'
            for (let i = 0; i < array.length; i++) {
                let line = '';
                for (let index in array[i]) {
                    if (line !== '') line += '\t'
                    line += array[i][index];
                }
                str += line + '\r\n';
            }
            return str;
        }


    }


}

