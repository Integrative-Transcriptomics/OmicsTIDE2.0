import {extendObservable} from "mobx";
import * as d3 from "d3";


export class SecondLevelStore {
    constructor(pantherAPI, parent, ds1selection, ds2selection) {
        this.pantherAPI = pantherAPI;
        this.parent = parent;
        this.ds1selection = ds1selection;
        this.ds2selection = ds2selection;
        this.genes = [...new Set(Object.values(ds1selection).map(d => Object.keys(d)).flat()
            .concat(Object.values(ds2selection).map(d => Object.keys(d)).flat()))]
        extendObservable(this, {
            goData: [],
            isLoading: false,
            calcOverrepresentation(organism, callback) {
                this.isLoading = true;
                this.pantherAPI.calcOverrepresentation(this.genes, organism, (response) => {
                    this.goData = response;
                    this.isLoading = false;
                    callback(true);
                })
            },
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

