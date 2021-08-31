import {observer} from "mobx-react";
import PropTypes from "prop-types";
import * as d3 from 'd3';
import React, {createRef, useCallback, useEffect, useState} from "react";


const CentroidProfilePlot = observer((props) => {
    const centroidLine = createRef();
    const stdDevBand = createRef();
    const [data, setData] = useState(props.data);
    const yScale = props.yScale;
    const xScale = props.xScale;
    // positions of centroids, lower and upper std dev line


    const calculateStatistics = useCallback((currData) => {
        const centroids = [];
        const lower = [];
        const upper = [];
        props.conditions.forEach((cond) => {
            const values = currData.map(gene => gene[cond]);
            const mean = d3.mean(values)
            const stdDev = d3.deviation(values);
            centroids.push({cond: cond, value: mean});
            lower.push({cond: cond, value: mean - stdDev});
            upper.push({cond: cond, value: mean + stdDev});
        })
        return {centroids, lower, upper}
    }, [props.conditions]);
    const createLine = useCallback((centroids) => {
        let centroidPoints = "";
        centroids.forEach(centroid => {
            const point = xScale(centroid.cond) + "," + yScale(centroid.value);
            centroidPoints += point + " ";
        })
        return centroidPoints
    }, [xScale, yScale]);
    const createBand = useCallback((upper, lower) => {
        let bandPoints = "";
        lower.forEach(elem => {
            const point = xScale(elem.cond) + "," + yScale(elem.value);
            bandPoints += point + " ";
        })
        upper.reverse().forEach(elem => {
            const point = xScale(elem.cond) + "," + yScale(elem.value);
            bandPoints += point + " ";
        })
        return bandPoints
    }, [xScale, yScale]);
    const startAnimation = useCallback((currData) => {
        const statistics = calculateStatistics(currData);
        let line = d3.select(centroidLine.current);
        let polygon = d3.select(stdDevBand.current);
        line.transition().duration(200).attr("points", createLine(statistics.centroids))
        polygon.transition().duration(200).attr("points", createBand(statistics.upper, statistics.lower))
            .on('end', () => {
                setData(currData)
            });
    }, [calculateStatistics, createBand, createLine, centroidLine, stdDevBand])
    useEffect(() => {
        startAnimation(props.data);
    }, [props.data, startAnimation]);
    const statistics = calculateStatistics(data);

    // create points for centroid line and band polygon
    let centroidPoints = createLine(statistics.centroids);
    let bandPoints = createBand(statistics.upper, statistics.lower);


    return (
        <g>
            <polygon ref={stdDevBand} points={bandPoints} fill={props.color} opacity={props.opacity}/>
            <polyline ref={centroidLine} points={centroidPoints} fill="none" stroke="white"/>
        </g>


    );
});

CentroidProfilePlot.propTypes = {
    conditions: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.number)).isRequired,
    yScale: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
    opacity: PropTypes.number.isRequired,
};
export default CentroidProfilePlot;