import {observer} from "mobx-react";
import React, {useState} from "react";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Slider from "@material-ui/core/Slider";
import {useStore} from "./Stores/RootStore";

const Controls = observer((props) => {
    const store = useStore();

    // local states for sliders
    const [var1, setVar1] = useState([store.ds1.filterStore.varianceMinFilter, store.ds1.filterStore.varianceMaxFilter])
    const [var2, setVar2] = useState([store.ds2.filterStore.varianceMinFilter, store.ds2.filterStore.varianceMaxFilter])
    const [abu1, setAbu1] = useState([store.ds1.filterStore.abundanceMinFilter, store.ds1.filterStore.abundanceMaxFilter])
    const [abu2, setAbu2] = useState([store.ds2.filterStore.abundanceMinFilter, store.ds2.filterStore.abundanceMaxFilter])

    return (
        <div>
            <FormControl component="fieldset">
                <FormLabel component="legend">Plot type</FormLabel>
                <RadioGroup aria-label="gender" name="gender1" value={store.plotType}
                            onChange={(e) => store.setPlotType(e.target.value)}>
                    <FormControlLabel value="centroid" control={<Radio/>} label="Centroid Profile Plots"/>
                    <FormControlLabel value="profile" control={<Radio/>} label="Profile Plots"/>
                </RadioGroup>
                <FormLabel component="legend">
                    {"Variance Filter " + store.comparison.file1}
                </FormLabel>
                <Slider
                    value={var1}
                    onChange={(e, v) => {
                        if (v[0] >= store.comparison.dataStore.initialVarFilter[0] && v[1] <= store.comparison.dataStore.initialVarFilter[1]) {
                            setVar1(v)
                        }
                    }}
                    onChangeCommitted={() => {
                        store.ds1.filterStore.setVarMin(var1[0]);
                        store.ds1.filterStore.setVarMax(var1[1])
                    }}
                    valueLabelDisplay="auto"
                    aria-labelledby="range-slider"
                />
                <FormLabel component="legend">
                    {"Variance Filter " + store.comparison.file2}
                </FormLabel>
                <Slider
                    value={var2}
                    onChange={(e, v) => {
                        if (v[0] >= store.comparison.dataStore.initialVarFilter[0] && v[1] <= store.comparison.dataStore.initialVarFilter[1]) {
                            setVar2(v)
                        }
                    }}
                    onChangeCommitted={() => {
                        store.ds2.filterStore.setVarMin(var2[0]);
                        store.ds2.filterStore.setVarMax(var2[1])
                    }}
                    valueLabelDisplay="auto"
                    aria-labelledby="range-slider"
                />
                <FormLabel component="legend">
                    {"Abundance Filter " + store.comparison.file1}
                </FormLabel>
                <Slider
                    value={abu1}
                    onChange={(e, v) => setAbu1(v)}
                    onChangeCommitted={() => {
                        store.ds1.filterStore.setAbMin(abu1[0]);
                        store.ds1.filterStore.setAbMax(abu1[1])
                    }}
                    valueLabelDisplay="auto"
                    aria-labelledby="range-slider"
                />
                <FormLabel component="legend">
                    {"Abundance Filter " + store.comparison.file2}
                </FormLabel>
                <Slider
                    value={abu2}
                    onChange={(e, v) => setAbu2(v)}
                    onChangeCommitted={(e, newValue) => {
                        store.ds2.filterStore.setAbMin(abu2[0]);
                        store.ds2.filterStore.setAbMax(abu2[1])
                    }}
                    valueLabelDisplay="auto"
                    aria-labelledby="range-slider"
                />
                {props.children}
            </FormControl>
        </div>
    );
});

export default Controls;