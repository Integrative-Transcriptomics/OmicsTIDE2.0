import React from "react";


function BarChart(props) {
    let currX = 0;
    const bars = [];
    if ("intersecting" in props.data) {
        Object.keys(props.data.intersecting).forEach(elem => {
            bars.push(<rect width={props.xScale(props.data.intersecting[elem])} height={20} x={currX} fill={props.colorScale(elem)}/>)
            currX += props.xScale(props.data.intersecting.concordant)
        })
    }
    if ("nonIntersecting" in props.data) {
        Object.keys(props.data.nonIntersecting).forEach(file => {
            bars.push(<rect width={props.xScale(props.data.nonIntersecting[file])} height={20} x={currX} fill={props.colorScale(file)}/>)
            currX += props.xScale(props.data.intersecting.concordant)
        })
    }
    return (
        <svg width={currX} height={20}>
            {bars}
        </svg>
    );
}

export default BarChart;
