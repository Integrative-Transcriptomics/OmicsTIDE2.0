import {observer} from "mobx-react";
import React, {useCallback, useState} from "react";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import {useStore} from "./Stores/RootStore";
import Autocomplete from "@material-ui/core/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const GeneSearch = observer((props) => {
    const store = useStore();

    const [searchName, setSearchName] = useState(store.dataStore.mappingLoaded);
    const [selectedGenes, setSelectedGenes] = useState([]);
    const {setSearchGenes} = props;
    const parseGeneList = useCallback((file) => {
        const reader = new FileReader();
        reader.onload = function () {
            let genes = reader.result.split("\n").filter(d => d !== "");
            if (searchName) {
                genes = genes.map(d => store.dataStore.nameToID[d])
                setSelectedGenes(genes.map(d => {
                    return ({id: d, label: store.dataStore.idToName[d]})
                }));
            }else{
                setSelectedGenes(genes.map(d => {
                    return ({id: d, label: d})
                }));
            }
            setSearchGenes(genes);
        };
        reader.readAsText(file);

    }, [searchName, setSearchGenes, store.dataStore.idToName, store.dataStore.nameToID])
    let options = [];
    if (searchName) {
        props.filteredGenes.sort().forEach(id => {
            if (store.dataStore.idToName[id] !== undefined)
                options.push({label: store.dataStore.idToName[id], id: id.toString()})
        });
    } else {
        options = props.filteredGenes.sort().map(id => {
            return ({label: id, id: id})
        });
    }
    return (
        <div>
            {store.dataStore.mappingLoaded ?
                <FormControl component="fieldset">
                    <RadioGroup row aria-label="gender" name="row-radio-buttons-group"
                                value={searchName ? "name" : "id"}
                                onChange={(event) => {
                                    setSelectedGenes([])
                                    props.setSearchGenes([]);
                                    setSearchName(event.target.value === "name")
                                }}>
                        <FormControlLabel value="name" control={<Radio/>} label="Gene names"/>
                        <FormControlLabel value="id" control={<Radio/>} label="Gene ids"/>
                    </RadioGroup>
                </FormControl> : null
            }
            <div>
                <Autocomplete
                    multiple
                    disableCloseOnSelect
                    filterSelectedOptions
                    freeSolo
                    fullWidth
                    getOptionLabel={(option) => option.label}
                    options={options}
                    value={selectedGenes}
                    onChange={(e, v) => {
                        setSelectedGenes(v)
                        console.log(v)
                        props.setSearchGenes(v.map(d => d.id));
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search input"
                            margin="normal"
                            variant="outlined"
                            InputProps={{...params.InputProps, type: 'search'}}
                        />
                    )}
                />
            </div>
            <Button component="label" variant="contained">Upload List
                <input type="file"
                       onChange={(e) => parseGeneList([...e.target.files][0])}
                       hidden/>
            </Button>
        </div>
    );
});

export default GeneSearch;