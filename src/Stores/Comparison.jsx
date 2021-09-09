import {Intersecting} from "./Intersecting";
import {NonIntersecting} from "./NonIntersecting";

/**
 * store holding a single comparison including intersecting and non intersecting genes
 */
export class Comparison {
    constructor(dataStore, data, index) {
        this.dataStore = dataStore;
        this.file1 = data.files[0].slice(0, -4);
        this.file2 = data.files[1].slice(0, -4);
        this.index = index;
        this.intersecting = new Intersecting(this, this.dataStore, data.intersecting)
        if ("data" in data.nonIntersecting) {
            this.nonIntersecting = new NonIntersecting(this, this.dataStore, data.nonIntersecting);
        } else {
            this.nonIntersecting = null
        }
    }
}