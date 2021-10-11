import React, {createRef, useCallback, useEffect, useState} from "react";
import {StoreProvider, useStore} from "../Stores/RootStore";
import Axis from "../Trends/Axis";
import * as d3 from "d3";
import MultiClusterProfilePlot from "./MultiClusterProfilePlot";
import PropTypes from "prop-types";
import {Button, Grid, Typography} from "@material-ui/core";
import GoChart from "./GoChart";
import CircularProgress from "@material-ui/core/CircularProgress";
import Alert from "@material-ui/core/Alert";
import {observer} from "mobx-react";
import GeneSearch from "../GeneSearch";
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from "@material-ui/core/IconButton";
import RadioGroup from "@material-ui/core/RadioGroup";
import {exportPDF} from "../Stores/HelperFunctions";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import {v4 as uuidv4} from "uuid";
import Autocomplete from "@material-ui/core/Autocomplete";
import TextField from "@material-ui/core/TextField";


const SecondLevelAnalysis = observer((props) => {
    const store = useStore();
    const plot = createRef();
    const margin = {
        left: 50,
        right: 10,
        top: 10,
        bot: 30,
    }
    const [width, setWidth] = useState(500)
    const [calculationText, setCalculationText] = useState(null)
    const [expType, setExptype] = useState("pdf")

    const id = "id" + uuidv4()


    const height = 400;

    const changeWidth = useCallback(() => {
        if (props.isVisible && plot.current !== null) {
            setWidth(plot.current.getBoundingClientRect().width)
        }
    }, [plot, props.isVisible]);
    useEffect(() => {
        changeWidth()
        window.addEventListener("resize", changeWidth);
        return () => {
            window.removeEventListener('resize', changeWidth);
        }
    }, [changeWidth]);
    const calcEnrichment = useCallback((selectedSpecies) => {
        store.calcOverrepresentation(selectedSpecies);
    }, [store]);
    let goVis = null;
    // show progress vis when enrichment is calculated but calculations are not done
    if (store.isLoading) {
        goVis =
            <Grid item xs={12} align="center">
                <Typography>Calculating GO-Term Enrichment...</Typography>
                <Typography>{calculationText}</Typography>
                <CircularProgress/>
            </Grid>;
    } else if (store.isLoaded) {
        const goEnrichment = store.goData.map((d, i) =>
            <Grid item xs={4} key={store.pantherAPI.annoSets[i].id}>
                <Typography variant="h6">{store.pantherAPI.annoSets[i].label}
                    <IconButton
                        onClick={() => store.createDownload(store.pantherAPI.annoSets[i].id)}><DownloadIcon/></IconButton></Typography>
                <GoChart data={d} maxVal={store.totalMax} isVisible={props.isVisible}/>
            </Grid>)
        goVis = [<Grid item xs={12} key={"OP"}>
            <div>
                <svg width={20} height={12}>
                    <rect width={20} height={20} fill="red"/>
                </svg>
                Overrepresented
            </div>
            <div>
                <svg width={20} height={12}>
                    <rect width={20} height={20} fill="blue"/>
                </svg>
                Underrepresented
            </div>
        </Grid>].concat(goEnrichment)
            .concat(<Button variant="outlined" onClick={() => store.createDownload(null)}>Download all</Button>
            )
    }
    const startTimer = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), 30000);
        })
    }

    const yScale = d3.scaleLinear().domain([store.parent.maxValue, store.parent.minValue]).range([0, height - margin.top - margin.bot]);
    const xScale = d3.scalePoint().domain(props.conditions).range([0, width - margin.left - margin.right]);
    const xAxis = d3.axisBottom()
        .scale(xScale)
    const yAxis = d3.axisLeft()
        .scale(yScale)
    const axis1 = <Axis h={height - margin.top - margin.bot} w={width} axis={yAxis} axisType={'y'} label={"z-score"}/>
    const axis2 = <Axis h={height - margin.top - margin.bot} w={width} axis={xAxis} axisType={'x'} label={""}/>

    // create one plot for each data set

    const plot1 =
        <svg key="ds1" width={width} height={height} onMouseLeave={() => store.parent.setHighlightedGenes([])}>
            <g transform={"translate(" + margin.left + ",0)"}>
                <StoreProvider store={store.parent.ds1}>
                    <MultiClusterProfilePlot selection={store.ds1selection} yScale={yScale} xScale={xScale}
                                             colorScale={store.parent.colorScale} searchGenes={store.searchGenes}
                                             highlightedGenes={store.parent.highlightedGenes}/>
                </StoreProvider>
                {axis1}
                {axis2}
            </g>
        </svg>
    const plot2 =
        <svg key="ds2" width={width} height={height}>
            <g transform={"translate(" + margin.left + ",0)"}>
                <StoreProvider store={store.parent.ds2}>
                    <MultiClusterProfilePlot selection={store.ds2selection} yScale={yScale} xScale={xScale}
                                             colorScale={store.parent.colorScale} searchGenes={store.searchGenes}
                                             highlightedGenes={store.parent.highlightedGenes}/>
                </StoreProvider>
                {axis1}
                {axis2}
            </g>
        </svg>

    return (
        <div style={{padding: 10}}>
            <Grid container spacing={3}>
                <Grid item xs={8}>
                    <Grid container id={id}>
                        <Grid item xs={6}>
                            <Typography>{store.parent.comparison.file1}</Typography>
                            <div ref={plot}>
                                {plot1}
                            </div>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography>{store.parent.comparison.file2}</Typography>
                            {plot2}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={4}>
                    <StoreProvider store={store.parent}>
                        <Typography>Search</Typography>
                        <GeneSearch filteredGenes={store.genes}
                                    setSearchGenes={(genes) => store.setSearchGenes(genes)}/>
                    </StoreProvider>
                    <Typography>Export</Typography>
                    <RadioGroup
                        row
                        value={expType}
                        onChange={(e) => setExptype(e.target.value)}
                    >
                        <Button variant="contained" onClick={() => exportPDF(id, expType === "png")}>Export
                            View</Button>
                        <FormControlLabel value="pdf" control={<Radio/>} label="PDF"/>
                        <FormControlLabel value="png" control={<Radio/>} label="PNG"/>
                    </RadioGroup>
                </Grid>
                <Grid item xs={6}>
                    {store.pantherAPI.genomesLoaded ?
                        [<Typography key="title" variant="h5">GO-enrichment</Typography>,
                            <Typography key="powerdBy">Powerd by <b>PANTHER</b> (<a
                                href="http://pantherdb.org/">http://pantherdb.org/</a>)</Typography>,
                            <Typography key="task">Please select species to perform enrichment:</Typography>,
                            <Autocomplete
                                key="select"
                                disableClearable
                                getOptionLabel={(option) => option.label}
                                options={store.pantherAPI.genomes}
                                onChange={(e, v) => {
                                    setCalculationText(null)
                                    calcEnrichment(v.value)
                                    startTimer().then(() => {
                                        setCalculationText("This seems to take longer than normally. There might be a problem with PANTHER")
                                    })
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
                            href="http://pantherdb.org/">http://pantherdb.org/</a> for GO Term enrichment. Please adapt
                            your
                            browser settings to allow mixed content and check if their website is down.</Alert>}
                </Grid>
                <Grid item xs={6}/>
                {goVis}
            </Grid>
        </div>
    );
});

SecondLevelAnalysis.propTypes = {
    conditions: PropTypes.arrayOf(PropTypes.string).isRequired,
    isVisible: PropTypes.bool.isRequired,
};

export default SecondLevelAnalysis;
