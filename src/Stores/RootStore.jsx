import React from "react";
import {DataStore} from "./DataStore";
import {extendObservable} from "mobx";
import {PantherAPI} from "./pantherAPI";

/**
 * basic store holding all other stores
 */
export class RootStore {
    constructor() {
        this.dataStore = null
        this.pantherAPI=new PantherAPI();
        extendObservable(this, {
            dataLoaded: false,
        })
    }

    /**
     * initialized data when data is loaded
     * @param {Object} data
     * @param mapping
     * @param {number[]} initialVarFilter
     */
    init(data, mapping, initialVarFilter) {
        this.dataStore = new DataStore(data, mapping, initialVarFilter,this.pantherAPI)
        this.dataLoaded = true;
    }
}

const StoreContext = React.createContext();

export const StoreProvider = ({children, store}) => {
    return (
        <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
};

/* Hook to use store in any functional component */
export const useStore = () => React.useContext(StoreContext);

/* HOC to inject store to any functional or class component */
export const withStore = (Component) => (props) => {
    return <Component {...props} store={useStore()}/>;
};