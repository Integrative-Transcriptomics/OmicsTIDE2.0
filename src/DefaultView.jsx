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
import {makeStyles} from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import Alert from "@material-ui/core/Alert";
import CircularProgress from "@material-ui/core/CircularProgress";
import {observer} from "mobx-react";
import Papa from 'papaparse';


const DefaultView = observer((props) => {
    const useStyles = makeStyles((theme) => ({
        formControl: {
            minWidth: 150,
        },
        centerText: {
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            flexDirection: "column"
        }
    }));
    const classes = useStyles();
    const store = useStore();
    const [varFilter, setVarFilter] = useState([0, 100])
    const [k, setK] = useState(3)
    const [testData, setTestData] = useState("")
    const [files, setFiles] = useState([]);
    const [idMappingFile, setIDMappingFile] = useState(null);
    const [selectionType, setSelectionType] = useState("none");
    const [dataLoading, setDataLoading] = useState(false);
    const selectTestData = useCallback((data) => {
        setTestData(data);
        setSelectionType("test");
    }, [])
    const selectFiles = useCallback((files) => {
        setFiles(files)
        setSelectionType("files");
    }, [])
    const launch = useCallback(
        () => {
            const readFile = (file) => {
                return new Promise((resolve, reject) => {
                    Papa.parse(idMappingFile, {
                        complete: (results) => {
                            resolve(results.data)
                        }
                    });
                });
            }
            const getData = (url, formData) => {
                return new Promise((resolve, reject) => {
                    axios.post(url, formData)
                        .then((response) => {
                            resolve(response.data);
                        })
                })

            }
            setDataLoading(true);
            let mappingPromise = null;
            if (idMappingFile !== null) {
                mappingPromise = readFile(idMappingFile);
            }
            const formData = new FormData();
            let url = "";
            formData.append("k", k);
            formData.append("lowerVariancePercentage", varFilter[0]);
            formData.append("upperVariancePercentage", varFilter[1]);
            if (testData === "bc") {
                url = "/load_test_data_bloodcell";
            } else if (testData === "s") {
                url = "/load_test_data_streptomyces";
            } else {
                files.forEach(file => formData.append("files[]", file));
                url = "/load_data";
            }
            let dataPromise = getData(url, formData);
            Promise.all([mappingPromise, dataPromise]).then(values => {
                store.init(values[1], values[0], varFilter);
                props.setDataLoaded(true);
                setDataLoading(false)

            })
        },
        [varFilter, k, testData, files, store, props, idMappingFile],
    );
    let selectionText = null;
    if (selectionType === "files") {
        selectionText = files.length + " files selected";
    } else if (selectionType === "test")
        if (testData === "bc") {
            selectionText = "Neutrophil differentiation study selected"
        } else {
            selectionText = "Streptomyces study selected"
        }
    return (
        <div style={{padding: 10}}>
            <Alert severity="info">
                OmicsTIDE integrates proteomics and transcriptomics data by concatenating two tables with expression
                labels and clustering them with k-means. As a result, each gene is associated with a cluster in both
                data sets. The result is visualized in OmicsTIDE.
                <br/>
                How it works:
                <ul>
                    <li>Select two or more files or load test files. First column: Gene IDs, header "gene", Other
                        columns conditions, e.g. timepoint 1, timepoint 2, timepoint 3. Cells: expression values
                    </li>
                    <li>Select k for k-means: K determines how many trends will be created, feel free to play with
                        different K for your data.
                    </li>
                    <li>Variance filter: Filters data by variance. Sometimes results are improved by only considering
                        highly variant genes.
                    </li>
                </ul></Alert>
            <Grid container spacing={10}>
                <Grid item xs={6}>
                    <Grid container spacing={10}>
                        <Grid item xs={9}>
                            <form style={{display: 'flex'}}>
                                <Button component="label">Select Files
                                    <input type="file"
                                           multiple
                                           onChange={(e) => selectFiles([...e.target.files])}
                                           hidden/>
                                </Button>
                                <div className={classes.centerText}>
                                    or
                                </div>
                                <FormControl className={classes.formControl} variant="standard">
                                    <InputLabel id="demo-simple-select-label">Select Test Data</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={testData}
                                        onChange={(e) => selectTestData(e.target.value)}
                                    >
                                        <MenuItem value={"bc"}>Neutrophil differentiation study (Hoogendijk et al.,
                                            2019)</MenuItem>
                                        <MenuItem value={"s"}>Streptomyces study (Sulheim et al., 2020)</MenuItem>
                                    </Select>
                                </FormControl>

                            </form>
                        </Grid>
                        <Grid item xs={3} className={classes.centerText}>
                            {selectionText}
                        </Grid>
                    </Grid>
                    <Grid container spacing={10}>
                        <Grid item xs={9}>
                            <form style={{display: 'flex'}}>
                                <Button component="label">Select ID mapping file
                                    <input type="file"
                                           onChange={(e) => setIDMappingFile([...e.target.files][0])}
                                           hidden/>
                                </Button>
                            </form>
                        </Grid>
                        <Grid item xs={3} className={classes.centerText}>
                            {idMappingFile !== null ? idMappingFile.name : null}
                        </Grid>
                    </Grid>
                    <Typography id="discrete-slider" gutterBottom>
                        K for k-means
                    </Typography>
                    <Grid container spacing={10}>
                        <Grid item xs={9}>
                            <Slider
                                value={k}
                                aria-labelledby="discrete-slider"
                                valueLabelDisplay="auto"
                                disabled={dataLoading}
                                step={1}
                                marks
                                onChange={(e, v) => setK(v)}
                                max={10}
                            />
                        </Grid>
                        <Grid item xs={3} className={classes.centerText}>
                            {"k=" + k}
                        </Grid>
                    </Grid>
                    <Typography id="range-slider" gutterBottom>
                        Variance Filter
                    </Typography>
                    <Grid container spacing={10}>
                        <Grid item xs={9}>
                            <Slider
                                value={varFilter}
                                onChange={(e, v) => setVarFilter(v)}
                                disabled={dataLoading}
                                valueLabelDisplay="auto"
                                aria-labelledby="range-slider"
                            />
                        </Grid>
                        <Grid item xs={3} className={classes.centerText}>
                            {varFilter[0] + "< var <" + varFilter[1]}
                        </Grid>
                    </Grid>
                    <Button onClick={launch} disabled={dataLoading || (files.length === 0 && testData === "")}
                            variant="contained">Launch</Button>

                </Grid>
                {dataLoading ?
                    <Grid item xs={12}>
                        <CircularProgress/>
                    </Grid> : null}
            </Grid>
        </div>

    );
});

export default DefaultView;
