import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {createRef, useCallback, useEffect, useState} from "react";
import * as d3 from "d3";


const Boxplot = observer((props) => {
        const [outliers, setOutliers] = useState(props.outliers);
        const [quantiles, setQuantiles] = useState(props.quantiles);

        const box = createRef();
        const min = createRef();
        const max = createRef();
        const median = createRef();
        const upperLine = createRef();
        const lowerLine = createRef();
        const outliersRef = createRef();

        const yScale = props.yScale;
        const createBoxplot = useCallback((outliers, quantiles) => {
            const points = outliers.map((point,i) => {
                return <circle key={i} cy={yScale(point)} cx={props.width / 2} r={1} opacity={props.opacity}/>
            })
            return (<g>
                <rect ref={box} y={yScale(quantiles[3])} width={props.width}
                      height={yScale(quantiles[1]) - yScale(quantiles[3])}
                      fill={props.color}
                      stroke="black" opacity={props.opacity}/>
                <line ref={min} x1={0} x2={props.width}
                      y1={yScale(quantiles[0])}
                      y2={yScale(quantiles[0])} stroke={"black"}/>
                <line ref={median} x1={0} x2={props.width}
                      y1={yScale(quantiles[2])}
                      y2={yScale(quantiles[2])} stroke={"black"}/>
                <line ref={max} x1={0} x2={props.width}
                      y1={yScale(quantiles[4])}
                      y2={yScale(quantiles[4])} stroke={"black"}/>
                <line ref={lowerLine} x1={props.width / 2} x2={props.width / 2}
                      y1={yScale(quantiles[0])}
                      y2={yScale(quantiles[1])} stroke={"black"}/>
                <line ref={upperLine} x1={props.width / 2} x2={props.width / 2}
                      y1={yScale(quantiles[3])}
                      y2={yScale(quantiles[4])} stroke={"black"}/>
                <g ref={outliersRef}>{points}</g>
            </g>)
        }, [box, yScale, props.width, props.color, props.opacity, min, median, max, lowerLine, upperLine, outliersRef])
        const animateLine = useCallback((reference, quantile1, quantile2, callback) => {
            reference.transition().duration(200)
                .attr("y1", yScale(quantile1))
                .attr("y2", yScale(quantile2))
                .on("end", callback)
        }, [yScale])
        const startAnimation = useCallback((quantiles, outliers) => {
            d3.select(box.current).transition().duration(200)
                .attr("y", yScale(quantiles[3]))
                .attr("height", yScale(quantiles[1]) - yScale(quantiles[3]))
                .on("end", () => setQuantiles(quantiles))
            animateLine(d3.select(min.current), quantiles[0], quantiles[0], () => setQuantiles(quantiles))
            animateLine(d3.select(median.current), quantiles[2], quantiles[2], () => setQuantiles(quantiles))
            animateLine(d3.select(max.current), quantiles[4], quantiles[4], () => setQuantiles(quantiles))
            animateLine(d3.select(upperLine.current), quantiles[3], quantiles[4], () => setQuantiles(quantiles))
            animateLine(d3.select(lowerLine.current), quantiles[0], quantiles[1], () => setQuantiles(quantiles))
            /*const currOutliers = d3.selectAll([...outliersRef.current.childNodes]);
            currOutliers.transition().duration(200)
                .attr("opacity", 0)
                .on("end", setOutliers(outliers));*/
            setOutliers(outliers)
        }, [animateLine, box, lowerLine, max, median, min, upperLine, yScale])
        useEffect(() => {
            startAnimation(props.quantiles, props.outliers);
        }, [props.outliers, props.quantiles, startAnimation]);
        return (createBoxplot(outliers, quantiles));
    })
;

Boxplot.propTypes = {
    quantiles: PropTypes.arrayOf(PropTypes.number).isRequired,
    outliers: PropTypes.arrayOf(PropTypes.number).isRequired,
    width: PropTypes.number.isRequired,
    yScale: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
    opacity: PropTypes.number.isRequired,
};
export default Boxplot;