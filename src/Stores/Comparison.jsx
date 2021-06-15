import {Intersecting} from "./Intersecting";
import {NonIntersecting} from "./NonIntersecting";

export class Comparison {
    constructor(dataStore, data) {
        this.dataStore=dataStore;
        this.intersecting = new Intersecting(this.dataStore,data.intersecting)
        this.nonIntersecting = new NonIntersecting();
    }
}