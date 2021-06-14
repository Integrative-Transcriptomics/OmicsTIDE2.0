import React from "react";
import {DataStore} from "./DataStore";
import {UIStore} from "./UIStore";
import {extendObservable} from "mobx";

export class RootStore {
    constructor() {
        this.dataStore = null
        this.uiStore = new UIStore(this)
        extendObservable(this,{
            dataLoaded: false,
        })
    }

    init(data) {
        this.dataStore = new DataStore(data)
        this.dataLoaded = true;
    }
}
const StoreContext = React.createContext();

export const StoreProvider = ({ children, store }) => {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

/* Hook to use store in any functional component */
export const useStore = () => React.useContext(StoreContext);

/* HOC to inject store to any functional or class component */
export const withStore = (Component) => (props) => {
  return <Component {...props} store={useStore()} />;
};