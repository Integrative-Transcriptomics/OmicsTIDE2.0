import axios from 'axios';
import {RootStore, StoreProvider} from "./Stores/RootStore";
import {useState} from "react";
import VisTabs from "./VisTabs";

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
                axios.post("/load_test_data_streptomyces", formData)
                    .then((response) => {
                        rootStore.init(JSON.parse(response.data.replace(/\bNaN\b/g, "null")));
                        setDataLoaded(true)
                    })
            }}>Load Example Data
            </button>
            <p>{rootStore.dataLoaded.toString()}</p>
            {dataLoaded ?
                <StoreProvider store={rootStore.dataStore}>
                    <VisTabs/>
                </StoreProvider> : null
            }

        </div>
    );
}

export default App;
