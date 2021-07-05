import {RootStore, StoreProvider} from "./Stores/RootStore";
import VisTabs from "./VisTabs";
import DefaultView from "./DefaultView";
import React, {useState} from "react";

const rootStore = new RootStore();

function App() {
    const [dataLoaded, setDataLoaded]=useState(false);
    return (
        <div className="App">
            {dataLoaded ?
                <StoreProvider store={rootStore.dataStore}>
                    <VisTabs/>
                </StoreProvider> :
                <StoreProvider store={rootStore}>
                    <DefaultView setDataLoaded={setDataLoaded}/>
                </StoreProvider>
            }

        </div>
    );
}

export default App;
