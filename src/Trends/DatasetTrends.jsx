import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import {useStore} from "../Stores/RootStore";
import ProfilePlot from "./ProfilePlot";
import * as d3 from "d3";
import Axis from "./Axis";
import CentroidProfilePlot from "./CentroidProfilePlot";


const DatasetTrends = observer((props) => {
    const store = useStore()
    const margin = {
        left: 50,
        right: 10,
        top: 10,
        bot: 20,
    }
    const height = (props.height - (props.clusterNames.length - 1) * (margin.top + margin.bot)) / props.clusterNames.length;
    const width = props.width - margin.left - margin.right
    const yScale = d3.scaleLinear().domain([props.minValue, props.maxValue]).range([0, height]);
    const xScale = d3.scalePoint().domain(props.conditions).range([0, width]);
    const xAxis = d3.axisBottom()
        .scale(xScale)
    const yAxis = d3.axisLeft()
        .scale(yScale)
    const plots = props.clusterNames.map((cluster, i) => {
        let plot = null;
        if (props.plotType === "profile") {
            plot = <ProfilePlot data={store.geneCentricMapping[cluster]} yScale={yScale} xScale={xScale}
                                color={props.colorScale(cluster)}/>
        } else if (props.plotType === "centroid") {
            plot =
                <CentroidProfilePlot data={store.conditionMapping[cluster]} conditions={props.conditions}
                                     yScale={yScale} xScale={xScale}
                                     color={props.colorScale(cluster)}/>
        }
        return (
            <g key={cluster}
               transform={"translate(" + margin.left + "," + ((props.height / props.clusterNames.length) * i + margin.top) + ")"}>
                {plot}
                <Axis h={height} w={width} axis={yAxis} axisType={'y'} label={""}/>
                <Axis h={height} w={width} axis={xAxis} axisType={'x'} label={""}/>
            </g>)
    })
    return (
        <g>{plots}</g>
    );
});

DatasetTrends.propTypes = {
    clusterNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    colorScale: PropTypes.func.isRequired,
    conditions: PropTypes.arrayOf(PropTypes.string).isRequired,
    minValue: PropTypes.number.isRequired,
    maxValue: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};
export default DatasetTrends;