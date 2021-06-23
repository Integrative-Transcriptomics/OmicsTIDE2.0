import {Intersecting} from "./Intersecting";
import {NonIntersecting} from "./NonIntersecting";

export class Comparison {
    constructor(dataStore, data) {
        this.dataStore=dataStore;
        this.file1=data.intersecting.info.file_1.filename;
        this.file2=data.intersecting.info.file_2.filename;
        this.intersecting = new Intersecting(this, this.dataStore,data.intersecting)
        if("data" in data.nonIntersecting){
            this.nonIntersecting = new NonIntersecting(this, this.dataStore, data.nonIntersecting);
        } else{
            this.nonIntersecting = null
        }
    }
}