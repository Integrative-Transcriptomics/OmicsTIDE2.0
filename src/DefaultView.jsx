import axios from 'axios';
import {useStore} from "./Stores/RootStore";
import Button from "@material-ui/core/Button";
import React, {useCallback, useState} from "react";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import makeStyles from "@material-ui/core/styles/makeStyles";


function DefaultView(props) {
    const useStyles = makeStyles((theme) => ({
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
    }));
    const classes = useStyles();

    const store = useStore();
    const [varFilter, setVarFilter] = useState([0, 100])
    const [k, setK] = useState(3)
    const [testData, selectTestData] = useState("")
    const [files, setFiles] = useState([]);
    const launch = useCallback(
        () => {
            const formData = new FormData();
            formData.append("k", k);
            formData.append("lowerVariancePercentage", varFilter[0]);
            formData.append("upperVariancePercentage", varFilter[1]);
            if (testData === "bc") {
                axios.post("/load_test_data_bloodcell", formData)
                    .then((response) => {
                        store.init(response.data);
                        props.setDataLoaded(true);
                    })
            } else if (testData === "s") {
                axios.post("/load_test_data_streptomyces", formData)
                    .then((response) => {
                        store.init(response.data);
                        props.setDataLoaded(true);
                    })
            } else {
                files.forEach(file => formData.append("files[]", file));
                axios.post("/load_data", formData)
                    .then((response) => {
                        store.init(response.data);
                        props.setDataLoaded(true);
                    })
            }
        },
        [varFilter, k, testData, files],
    );
    return (
        <div className="App">
            <Typography id="discrete-slider" gutterBottom>
                K for k-means
            </Typography>
            <Slider
                value={k}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                onChange={(e, v) => setK(v)}
                max={10}
            />
            <Typography id="range-slider" gutterBottom>
                Variance Filter DS1
            </Typography>
            <Slider
                value={varFilter}
                onChange={(e, v) => setVarFilter(v)}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
            />
            <Button variant="contained"
                    component="label">Select Files
                <input type="file"
                       multiple
                       onChange={(e) => setFiles([...e.target.files])
                       }
                       hidden/>
            </Button> or
            <FormControl className={classes.formControl}>
                <InputLabel id="demo-simple-select-label">Test Data</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={testData}
                    onChange={(e) => selectTestData(e.target.value)}
                >
                    <MenuItem value={"bc"}>Blood Cell Study</MenuItem>
                    <MenuItem value={"s"}>Streptomyces Study</MenuItem>
                </Select>
            </FormControl>
            <Button onClick={launch}>Launch</Button>

        </div>
    );
}

export default DefaultView;
