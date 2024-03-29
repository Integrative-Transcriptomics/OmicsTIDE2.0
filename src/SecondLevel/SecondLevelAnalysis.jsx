import React, {createRef, useCallback, useEffect, useState} from "react";
import {StoreProvider, useStore} from "../Stores/RootStore";
import Axis from "../Trends/Axis";
import * as d3 from "d3";
import MultiClusterProfilePlot from "./MultiClusterProfilePlot";
import {Button, Grid, Typography} from "@material-ui/core";
import GoChart from "./GoChart";
import CircularProgress from "@material-ui/core/CircularProgress";
import {observer} from "mobx-react";
import GeneSearch from "../GeneSearch";
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from "@material-ui/core/IconButton";
import RadioGroup from "@material-ui/core/RadioGroup";
import {exportPDF} from "../Stores/HelperFunctions";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import {v4 as uuidv4} from "uuid";
import {Alert, FormControl, FormLabel} from "@mui/material";
import PropTypes from "prop-types";
import SpeciesSelection from "../SpeciesSelection";


function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

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
    const [isWholeGenomeRef, setIsWholeGenomeRef] = useState(false);
    const [useSelectGenes, setUseSelectGenes] = useState(false);

    const id = "id" + uuidv4()


    const height = 500;

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

    const performEnrichment = useCallback(() => {
        setCalculationText(null)
        store.calcOverrepresentation(store.pantherAPI.selectedSpecies, isWholeGenomeRef, useSelectGenes);
        startTimer().then(() => {
            setCalculationText("This seems to take longer than normally. This could be due to a large list of genes or there might be a problem with PANTHER.")
        })
    }, [isWholeGenomeRef, useSelectGenes, store])
    /*useEffect(() => {
        performEnrichment();
    }, [performEnrichment])*/

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
        if (store.apiMessage === "success") {
            const goEnrichment = store.goData.map((d, i) =>
                <Grid item xs={4} key={store.pantherAPI.annoSets[i].id}>
                    <Typography variant="h6">{store.pantherAPI.annoSets[i].label}
                        <IconButton
                            onClick={() => store.createDownload(store.pantherAPI.annoSets[i].id)}><DownloadIcon/></IconButton></Typography>
                    <GoChart data={d} maxVal={store.totalMax} isVisible={props.isVisible}/>
                </Grid>);
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
                .concat(<Button variant="outlined" key="download" onClick={() => store.createDownload(null)}>Download
                    all</Button>
                )
        } else {
            goVis = <Grid item xs={12}><Alert severity={"warning"}>{store.apiMessage}</Alert></Grid>
        }
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
        <svg key="ds1" width={width} height={height} onMouseLeave={() => store.parent.setHighlightedGenes([])}
             onClick={() => window.open(`https://www.ncbi.nlm.nih.gov/gene/?term=${store.parent.highlightedGenes[0]}`, '_blank').focus()}>
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
        <svg key="ds2" width={width} height={height} onMouseLeave={() => store.parent.setHighlightedGenes([])}
             onClick={() => window.open(`https://www.ncbi.nlm.nih.gov/gene/?term=${store.parent.highlightedGenes[0]}`, '_blank').focus()}>
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
                    <FormLabel>Search</FormLabel>
                    <StoreProvider store={store.parent}>
                        <GeneSearch filteredGenes={store.genes}
                                    setSearchGenes={(genes) => store.setSearchGenes(genes)}/>
                    </StoreProvider>
                    <FormControl>
                        <FormLabel>Export</FormLabel>
                        <RadioGroup
                            row
                            value={expType}
                            onChange={(e) => setExptype(e.target.value)}
                        >
                            <Button size={"small"} style={{marginRight: "5px"}} variant={"contained"}
                                    onClick={() => exportPDF(id, expType === "png")}>Export
                                View</Button>
                            <FormControlLabel value="pdf" control={<Radio/>} label="PDF"/>
                            <FormControlLabel value="png" control={<Radio/>} label="PNG"/>
                        </RadioGroup>
                        <Button size={"small"} style={{marginTop: "5px"}} variant={"contained"}
                                onClick={() => download("selection.txt", store.genes.join("\n"))}>Save
                            gene list to file</Button>
                    </FormControl>
                    <br/>
                    <FormControl>
                        <FormLabel>GO enrichment background</FormLabel>
                        <StoreProvider store={store}>
                            <SpeciesSelection/>
                        </StoreProvider>
                        {store.pantherAPI.selectedSpecies !== null ?
                            [
                                <RadioGroup
                                    key="radio"
                                    row
                                    value={isWholeGenomeRef.toString()}
                                    onChange={(e) => setIsWholeGenomeRef(e.target.value === "true")}
                                >
                                    <FormControlLabel value={"false"}
                                                      control={<Radio/>}
                                                      label="Use only genes in current comparison as background"/>
                                    <FormControlLabel value={"true"}
                                                      control={<Radio/>} label="Use all genes as background"/>
                                </RadioGroup>,
                                <Button key="button" size={"small"} style={{marginTop: "5px"}} variant={"contained"}
                                        onClick={performEnrichment}>Perform
                                    enrichment</Button>]
                            : null
                        }
                    </FormControl>
                    {store.searchGenes.length > 1 ?
                        <FormControl>
                            <FormLabel>GO enrichment target genes</FormLabel>
                            <RadioGroup
                                row
                                value={useSelectGenes.toString()}
                                onChange={(e) => setUseSelectGenes(e.target.value === "true")}
                            >
                                <FormControlLabel value={"false"}
                                                  control={<Radio/>}
                                                  label="Use all genes in current tab"/>
                                <FormControlLabel value={"true"}
                                                  control={<Radio/>} label="Use only highlighted genes"/>
                            </RadioGroup>,
                            <Button size={"small"} style={{marginTop: "5px"}} variant={"contained"}
                                    onClick={performEnrichment}>Perform
                                enrichment</Button>

                        </FormControl> : null
                    }
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
