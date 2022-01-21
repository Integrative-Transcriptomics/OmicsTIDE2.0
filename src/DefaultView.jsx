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
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import PropTypes from "prop-types";
import Tooltip from "@material-ui/core/Tooltip";
import InfoIcon from '@material-ui/icons/Info';
import Backdrop from "@material-ui/core/Backdrop";
import ComparisonTable from "./ComparisonTable";
import Autocomplete from "@material-ui/core/Autocomplete";
import TextField from "@material-ui/core/TextField";


function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 3, backgroundColor: "#e6e6e6"}}>
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

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
    const [dataLoading, setDataLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0)
    const [comparisons, setComparisons] = useState([])
    const selectTestData = useCallback((data) => {
        setTestData(data);
    }, [])
    const selectFiles = useCallback((files) => {
        setFiles(files)
        setComparisons(files.flatMap((file1, i) =>
            files.slice(i + 1).map(file2 => {
                return ({files: [file1.name, file2.name], selected: true})
            })));
    }, [])
    const launch = useCallback(
        () => {
            setDataLoading(true);
            props.setDataLoaded(false);
            const formData = new FormData();
            let url = "";
            formData.append("k", k);
            formData.append("lowerVariancePercentage", varFilter[0]);
            formData.append("upperVariancePercentage", varFilter[1]);
            if (selectedTab === 1) {
                if (testData === "bc") {
                    url = "/load_test_data_bloodcell";
                } else if (testData === "s") {
                    url = "/load_test_data_streptomyces";
                }
            } else {
                url = "/load_data";
                files.forEach(file => formData.append("files[]", file));
                formData.append("comparisons", JSON.stringify(comparisons.filter(d => d.selected).map(d => d.files)))
                formData.append("mappingFile", idMappingFile);
            }
            axios.post(url, formData)
                .then((response) => {
                    setDataLoading(false)
                    store.init(response.data.data, response.data.mapping, varFilter);
                    props.setDataLoaded(true);
                })
        },
        [varFilter, k, testData, files, store, props, idMappingFile, selectedTab, comparisons],
    );
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
                    <Grid container>
                        <Grid item xs={12}>
                            <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)}
                                  aria-label="basic tabs example">
                                <Tab label="Upload"/>
                                <Tab label="Test data"/>
                            </Tabs>
                        </Grid>
                        <Grid item xs={10}>
                            <TabPanel value={selectedTab} index={0}>
                                <Grid container spacing={1}>
                                    <Grid item xs={8}>
                                        <Button component="label" variant="contained">Select Files
                                            <input type="file"
                                                   multiple
                                                   onChange={(e) => selectFiles([...e.target.files])}
                                                   hidden/>
                                        </Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography align="center">
                                            {files.length !== 0 ? files.length + " files selected" : null}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Button component="label" variant="contained">Select ID mapping file
                                            <input type="file"
                                                   onChange={(e) => setIDMappingFile([...e.target.files][0])}
                                                   hidden/>
                                        </Button>
                                        <Tooltip
                                            title="Upload gene mapping file to be able to search for specific genes (optional).">
                                            <InfoIcon/>
                                        </Tooltip>
                                        <Typography>
                                            (optional)
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography align="center">
                                            {idMappingFile !== null ? idMappingFile.name : null}
                                        </Typography>
                                    </Grid>
                                    {files.length > 2 ?
                                        <Grid item xs={12}>
                                            <Typography>
                                                Select comparisons of interest
                                            </Typography>
                                            <ComparisonTable comparisons={comparisons}
                                                             setComparisons={(newComparisons) => setComparisons(newComparisons)}/>
                                        </Grid> : null}
                                </Grid>
                            </TabPanel>
                            <TabPanel value={selectedTab} index={1}>
                                <FormControl className={classes.formControl} variant="standard">
                                    <InputLabel id="demo-simple-select-label">Select Test Data</InputLabel>
                                    <Select autoWidth={true}
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
                                {testData === "bc" ?
                                    <Alert severity="info">
                                        <Typography>This dataset originates from a study about the regulation of the
                                            neutrophil differentiation in humans examining granulopoiesis in vivo. The
                                            experimental design uses both transcriptome and proteome data from five
                                            differentiation stages: (pro)myelocytes (<b>PM</b>s), metamyelocytes
                                            (<b>MM</b>s), immature neutrophils with band-shaped nucleus (<b>BN</b>),
                                            mature neutrophils with segmented nucleus (<b>SN</b>s) and peripheral mature
                                            neutrophils derived from the blood stream (<b>PMN</b>s). The data was taken
                                            from the supplementary material of the publication that contained quantified
                                            transcripts and proteins in the form of FPKM and imputed log2 LFQ measures.
                                            For the analysis using OmicsTIDE the mean values of all biological
                                            replicates for each of the five conditions is used. <a
                                                href="https://doi.org/10.1016/j.celrep.2019.10.082"
                                                rel="noreferrer"
                                                target="_blank">https://doi.org/10.1016/j.celrep.2019.10.082</a></Typography>
                                    </Alert> : testData === "s" ? <Alert severity="info">
                                        <Typography>
                                            This data set originates from a study exploring
                                            two <i>Streptomyces coelicolor</i> strains with respect to changes in their
                                            metabolisms under phosphate-starving growth conditions in a time-course
                                            experiment. The strains <b>M145</b> and <b>M1152</b> were used to study the
                                            role of <i>biosynthetic gene clusters</i> (BGCs) for the production of
                                            antibiotics. M1152 is a genetically-engineered derivate of the
                                            M145 wild-type strain that was subject to the deletion of different BGCs.
                                            For both strains samples were taken at several timepoints. Phosphate was
                                            depleted between timepoint 3 and timepoint 4. Transcriptomics as well as
                                            proteomics data were produced across eight corresponding time points and for
                                            both strains. Both, transcriptome and proteome data was initially quantified
                                            and log2-transformed. For OmicsTIDE the data was normalized by an
                                            intra-strain and intra-omics quantile-normalization across all replicates.
                                            The mean of the three replicates was calculated for each strain, time point
                                            and omics layer separately. <a
                                            href="https://doi.org/10.1016/j.isci.2020.101525"
                                            rel="noreferrer"
                                            target="_blank">https://doi.org/10.1016/j.isci.2020.101525</a>
                                        </Typography></Alert> : null}
                            </TabPanel>
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
                                step={1}
                                marks
                                onChange={(e, v) => setK(v)}
                                min={2}
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
                                valueLabelDisplay="auto"
                                aria-labelledby="range-slider"
                            />
                        </Grid>
                        <Grid item xs={3} className={classes.centerText}>
                            {varFilter[0] + " ≤ var ≤ " + varFilter[1]}
                        </Grid>
                    </Grid>
                    <Grid item xs={9}>
                        {store.pantherAPI.genomesLoaded ?
                            [<Typography key="task">Select species: (optional, required for functional analysis)</Typography>,
                                <Typography key="powerdBy">Powerd by <b>PANTHER</b> (<a
                                    href="http://pantherdb.org/">http://pantherdb.org/</a>)</Typography>,
                                <Autocomplete
                                    key="select"
                                    disableClearable
                                    getOptionLabel={(option) => option.label}
                                    options={store.pantherAPI.genomes}
                                    onChange={(e, v) => {
                                        store.pantherAPI.setSelectedSpecies(v.value);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Genome Reference"
                                            margin="normal"
                                            variant="outlined"
                                            InputProps={{...params.InputProps, type: 'search'}}
                                        />
                                    )}
                                />]
                            : <Alert severity="warning">Sorry, it seems like we're unable to connect to <a
                                href="http://pantherdb.org/">http://pantherdb.org/</a> Please
                                adapt
                                your
                                browser settings to allow mixed content and check if their website is down.</Alert>}
                    </Grid>
                    <Button onClick={launch}
                            variant="contained"
                            disabled={(selectedTab === 0 && files.length === 0) || (selectedTab === 1 && testData === "")}>Launch</Button>
                </Grid>
            </Grid>
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={dataLoading}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>
        </div>

    );
});

export default DefaultView;
