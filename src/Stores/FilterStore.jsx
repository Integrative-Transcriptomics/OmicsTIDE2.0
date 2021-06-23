import {extendObservable} from "mobx";

export class FilterStore {
    constructor(parent) {
        extendObservable(this, {
            varianceMinFilter: 0,
            varianceMaxFilter: 100,
            abundanceMinFilter: 0,
            abundanceMaxFilter: 100,
            setVarMin(variance) {
                this.varianceMinFilter = variance;
            },

            setVarMax(variance) {
                this.varianceMaxFilter = variance;
            },

            setAbMin(abundance) {
                this.abundanceMinFilter = abundance;
            },

            setAbMax(abundance) {
                this.abundanceMaxFilter = abundance;
            }
        });
        this.parent=parent;
    }


    isinRange(gene) {
        return (this.varianceMinFilter < this.parent.genes[gene].variance && this.varianceMaxFilter > this.parent.genes[gene].variance
            && this.abundanceMinFilter < this.parent.genes[gene].median && this.abundanceMaxFilter > this.parent.genes[gene].median);
    }


}