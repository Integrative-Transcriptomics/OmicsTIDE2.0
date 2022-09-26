import Typography from "@material-ui/core/Typography";
import Autocomplete from "@material-ui/core/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Alert from "@material-ui/core/Alert";
import React, {useState} from "react";
import {observer} from "mobx-react";
import {useStore} from "./Stores/RootStore";

const SpeciesSelection = observer((props) => {
    const store = useStore();
    const [inputValue, setInputValue] = useState('');
    if (store.pantherAPI.genomesLoaded) {
        const options = Object.keys(store.pantherAPI.genomes).sort();
        return ([<Typography key="task">Select species: (optional, required for functional
                analysis)</Typography>,
                <Typography key="powerdBy">Powerd by <b>PANTHER</b> (<a
                    href="http://pantherdb.org/">http://pantherdb.org/</a>)</Typography>,
                <Autocomplete
                    key="select"
                    value={store.pantherAPI.selectedSpecies}
                    onChange={(e, v) => {
                        store.pantherAPI.setSelectedSpecies(v);
                        setInputValue(store.pantherAPI.speciesName)
                    }}
                    inputValue={inputValue}
                    getOptionLabel={(option)=>store.pantherAPI.genomes[option]}
                    onInputChange={(e, v) => {
                        setInputValue(v);
                    }}
                    options={options}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Select Genome Reference"
                        />
                    )}
                />]
        )
    } else {
        return (<Alert severity="warning">Sorry, it seems like we're unable to connect to <a
            href="http://pantherdb.org/">http://pantherdb.org/</a> Please
            adapt
            your
            browser settings to allow mixed content and check if their website is down.</Alert>)
    }
});
export default SpeciesSelection;