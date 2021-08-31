import React, {createRef, useCallback, useEffect, useState} from "react";
import {StoreProvider, useStore} from "../Stores/RootStore";
import Axis from "../Trends/Axis";
import * as d3 from "d3";
import MultiClusterProfilePlot from "./MultiClusterProfilePlot";
import PropTypes from "prop-types";
import {Grid, Typography} from "@material-ui/core";
import GoChart from "./GoChart";
import Select from "react-select";
import CircularProgress from "@material-ui/core/CircularProgress";
import Alert from "@material-ui/core/Alert";
import {observer} from "mobx-react";


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
                <Typography>Calculating GO-enrichment...</Typography>
                <CircularProgress/>
            </Grid>;
    } else if (store.isLoaded) {
        const goEnrichment = store.goData.map((d, i) =>
            <Grid item xs={4} key={store.pantherAPI.annoSets[i].id}>
                <Typography variant="h6">{store.pantherAPI.annoSets[i].label}</Typography>
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
        <svg key="ds1" width={width} height={height}>
            <g transform={"translate(" + margin.left + ",0)"}>
                <StoreProvider store={store.parent.ds1}>
                    <MultiClusterProfilePlot selection={store.ds1selection} yScale={yScale} xScale={xScale}
                                             colorScale={store.parent.colorScale}/>
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
                                             colorScale={store.parent.colorScale}/>
                </StoreProvider>
                {axis1}
                {axis2}
            </g>
        </svg>

    return (
        <div style={{padding: 10}}>
            <Grid container spacing={3}>
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
                <Grid item xs={6}>
                    {store.pantherAPI.genomesLoaded ?
                        [<Typography key="title" variant="h5">GO-enrichment</Typography>,
                            <Typography key="powerdBy">Powerd by <b>PANTHER</b> (<a
                                href="http://pantherdb.org/">http://pantherdb.org/</a>)</Typography>,
                            <Typography key="task">Please select species to perform enrichment:</Typography>,
                            <Select key="select" options={store.pantherAPI.genomes}
                                    onChange={(val) => calcEnrichment(val.value)}/>]
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
