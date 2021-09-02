import {extendObservable} from "mobx";
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

            setSearchGenes(genes) {
                this.searchGenes = genes;
            },

            // calculates overrepresentation and sets loading status
            calcOverrepresentation(organism) {
                this.isLoading = true;
                this.isLoaded = false;
                this.pantherAPI.calcOverrepresentation(this.genes, organism, (response) => {
                    this.goData = response;
                    this.isLoading = false;
                    this.isLoaded = true;
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
        })


    }


}

