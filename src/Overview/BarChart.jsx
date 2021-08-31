import React from "react";
import * as d3 from "d3";
import Axis from "../Trends/Axis";
import PropTypes from "prop-types";


function BarChart(props) {
    const margins = {top: 0, left: 5, right: 5, bottom: 0}
    const barHeight=20;
    let currX = 0;
    const bars = [];
    if ("intersecting" in props.data) {
        Object.keys(props.data.intersecting).forEach(elem => {
            bars.push(<rect key={elem} width={props.xScale(props.data.intersecting[elem])} height={20} x={currX}
                            fill={props.colorScale(elem)}/>)
            currX += props.xScale(props.data.intersecting[elem])
        })
    }
    if ("nonIntersecting" in props.data) {
        Object.keys(props.data.nonIntersecting).forEach(file => {
            bars.push(<rect key={file} width={props.xScale(props.data.nonIntersecting[file])} height={20} x={currX}
                            fill={props.colorScale(file)}/>)
            currX += props.xScale(props.data.nonIntersecting[file])
        })
    }
    let axis = null;
    // only show axis once
    if (props.showAxis) {
        margins.bottom=35
        const xAxis = d3.axisBottom()
            .scale(props.xScale)
        axis = <Axis h={25} w={currX} axis={xAxis} axisType={'x'} label={"# Genes"}/>
    }
    return (
        <svg width={currX+margins.left+margins.right} height={barHeight+margins.top+margins.bottom}>
            <g transform={"translate(" + margins.left + "," + margins.top + ")"}>
                {bars}
                {axis}
            </g>
        </svg>
    );
}
BarChart.propTypes = {
    data: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number)).isRequired,
    xScale: PropTypes.func.isRequired,
    colorScale: PropTypes.func.isRequired,
};
export default BarChart;
