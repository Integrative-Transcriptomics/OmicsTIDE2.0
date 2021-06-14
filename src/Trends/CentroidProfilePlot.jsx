import {observer} from "mobx-react";
import PropTypes from "prop-types";
import * as d3 from 'd3';
import React from "react";


const CentroidProfilePlot = observer((props) => {
    const centroids = [];
    const lower = [];
    const upper = [];
    props.conditions.forEach((cond) => {
        const values = props.data.map(gene => gene[cond]);
        const mean = d3.mean(values)
        centroids.push({cond: cond, value: mean});
        const stdDev = d3.deviation(values);
        lower.push({cond: cond, value: mean - stdDev});
        upper.push({cond: cond, value: mean + stdDev});
    })
    let centroidPoints = "";
    let bandPoints = "";
    centroids.forEach(centroid => {
        const point = props.xScale(centroid.cond) + "," + props.yScale(centroid.value);
        centroidPoints += point + " ";
    })
    lower.forEach(elem => {
        const point = props.xScale(elem.cond) + "," + props.yScale(elem.value);
        bandPoints += point + " ";
    })
    upper.reverse().forEach(elem => {
        const point = props.xScale(elem.cond) + "," + props.yScale(elem.value);
        bandPoints += point + " ";
    })

    return (
        <g>
            <polygon points={bandPoints} fill={props.color} opacity={0.7}/>
            <polyline points={centroidPoints} fill="none" stroke="white"/>
        </g>


    );
});

CentroidProfilePlot.propTypes = {
    data: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.number)).isRequired,
    yScale: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
};
export default CentroidProfilePlot;