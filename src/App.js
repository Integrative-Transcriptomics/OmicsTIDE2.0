import axios from 'axios';
import {RootStore, StoreProvider} from "./Stores/RootStore";
import {useState} from "react";
import InteresectVis from "./IntersectVis";

const rootStore = new RootStore();

function App() {
    const [dataLoaded, setDataLoaded] = useState(false)
    return (
        <div className="App">
            <button onClick={() => {
                const formData = new FormData();
                formData.append("k", 4);
                formData.append("lowerVariancePercentage", 0);
                formData.append("upperVariancePercentage", 100);
                axios.post("/load_test_data_bloodcell", formData)
                    .then((response) => {
                        rootStore.init(JSON.parse(response.data.replace(/\bNaN\b/g, "null")));
                        setDataLoaded(true)
                    })
            }}>Load Example Data
            </button>
            <p>{rootStore.dataLoaded.toString()}</p>
            {dataLoaded ?
                <StoreProvider store={rootStore.dataStore.comparisons[0].intersecting}>
                    <InteresectVis width={1000} height={1000} conditions={rootStore.dataStore.conditions}/>
                </StoreProvider> : null
            }

        </div>
    );
}

export default App;
