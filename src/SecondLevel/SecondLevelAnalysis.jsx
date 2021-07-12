import React, {createRef, useCallback, useEffect, useState} from "react";
import {StoreProvider, useStore} from "../Stores/RootStore";
import Axis from "../Trends/Axis";
import * as d3 from "d3";
import MultiClusterProfilePlot from "./MultiClusterProfilePlot";
import PropTypes from "prop-types";
import {Grid} from "@material-ui/core";


function SecondLevelAnalysis(props) {
    const store = useStore();
    const plot = createRef();
    const margin = {
        left: 50,
        right: 10,
        top: 10,
        bot: 30,
    }
    const [width, setWidth] = useState(500)
    const changeWidth = useCallback(() => {
        if (plot.current != null) {
            setWidth(plot.current.getBoundingClientRect().width)
        }
    }, [plot]);
    useEffect(() => {
        changeWidth()
        window.addEventListener("resize", changeWidth);
    }, [plot, changeWidth]);


    // height and width of subplots
    const height = 400

    // shared xScale and yScale
    const yScale = d3.scaleLinear().domain([store.maxValue, store.minValue]).range([0, height - margin.top - margin.bot]);
    const xScale = d3.scalePoint().domain(props.conditions).range([0, width - margin.left - margin.right]);
    const xAxis = d3.axisBottom()
        .scale(xScale)
    const yAxis = d3.axisLeft()
        .scale(yScale)
    const axis1 = <Axis h={height - margin.top - margin.bot} w={width} axis={yAxis} axisType={'y'} label={""}/>
    const axis2 = <Axis h={height - margin.top - margin.bot} w={width} axis={xAxis} axisType={'x'} label={""}/>
    let plot1 =
        <svg key="ds1" width={width} height={height}>
            <g transform={"translate(" + margin.left + ",0)"}>
                <StoreProvider store={store.ds1}>
                    <MultiClusterProfilePlot selection={props.ds1Selection} yScale={yScale} xScale={xScale} colorScale={store.colorScale}/>
                </StoreProvider>
                {axis1}
                {axis2}
            </g>
        </svg>

    let plot2 =
        <svg key="ds2" width={props.width / 2} height={height}>
            <g transform={"translate(" + margin.left + ",0)"}>
                <StoreProvider store={store.ds2}>
                    <MultiClusterProfilePlot selection={props.ds2Selection} yScale={yScale} xScale={xScale} colorScale={store.colorScale}/>
                </StoreProvider>
                {axis1}
                {axis2}
            </g>
        </svg>

    return (
        <Grid container spacing={3}>
            <Grid item xs={6}>
                <div ref={plot}>
                    {plot1}
                </div>
            </Grid>
            <Grid item xs={6}>
                {plot2}
            </Grid>
        </Grid>
    );
}

SecondLevelAnalysis.propTypes = {
    conditions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SecondLevelAnalysis;
