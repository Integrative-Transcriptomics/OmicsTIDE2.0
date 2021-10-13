import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {createRef, useCallback, useEffect, useState} from "react";
import * as d3 from "d3";

const PlotBand = observer((props) => {
        const xScale = props.xScale;
        const yScale = props.yScale;
        const [upper, setUpper] = useState(props.upper);
        const [lower, setLower] = useState(props.lower);
        const band = createRef();
        const createBand = useCallback((upper, lower) => {
            let bandPoints = "";
            lower.forEach(elem => {
                const point = xScale(elem.cond) + "," + yScale(elem.value);
                bandPoints += point + " ";
            })
            upper.slice().reverse().forEach(elem => {
                const point = xScale(elem.cond) + "," + yScale(elem.value);
                bandPoints += point + " ";
            })
            return bandPoints
        }, [xScale, yScale]);
        const startAnimation = useCallback((upper, lower) => {
            let polygon = d3.select(band.current);
            polygon.transition().duration(200).attr("points", createBand(upper, lower))
                .on('end', () => {
                    setUpper(upper);
                    setLower(lower);
                });
        }, [band, createBand])
        useEffect(() => {
            startAnimation(props.upper, props.lower);
        }, [props.upper, props.lower, startAnimation]);
        const polygonPoints = createBand(upper, lower)

        return <polygon ref={band} points={polygonPoints} fill={props.color} opacity={props.opacity - 0.1}/>
    })
;

PlotBand.propTypes = {
    upper: PropTypes.arrayOf(PropTypes.object).isRequired,
    lower: PropTypes.arrayOf(PropTypes.object).isRequired,
    yScale: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
    opacity: PropTypes.number.isRequired,
};
export default PlotBand;