import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {useCallback} from "react";
import * as d3 from "d3";
import Boxplot from "./Boxplot";
import PlotBand from "./PlotBand";

const Boxplots = observer((props) => {
        const calculateStatistics = useCallback((currData) => {
            const statistics = {}
            const bandPoints = {upper: [], lower: []}
            props.conditions.forEach((cond) => {
                const values = currData.map(gene => gene[cond]);
                const twentyFive = d3.quantile(values, 0.25);
                const median = d3.quantile(values, 0.5);
                const seventyFive = d3.quantile(values, 0.75);
                const IQR = seventyFive - twentyFive;
                const min = twentyFive - 1.5 * IQR;
                const max = seventyFive + 1.5 * IQR;
                const closestMin = values.reduce((prev, curr) =>
                    Math.abs(curr - min) < Math.abs(prev - min) ? curr : prev
                );
                const closestMax = values.reduce((prev, curr) =>
                    Math.abs(curr - max) < Math.abs(prev - max) ? curr : prev);
                const outliers = values.filter(value => value > closestMax || value < closestMin);
                statistics[cond] = {
                    quantiles: [closestMin, twentyFive, median, seventyFive, closestMax],
                    outliers: outliers
                }
                bandPoints.upper.push({cond: cond, value: seventyFive})
                bandPoints.lower.push({cond: cond, value: twentyFive})
            })
            return {statistics, bandPoints};
        }, [props.conditions]);

        const yScale = props.yScale;
        const xScale = props.xScale;

        const boxWidth = (xScale(xScale.domain()[1]) - xScale(xScale.domain()[0]))*(1/3);

        const createBoxplots = useCallback((statistics) => {
            return (props.conditions.map(cond => {
                return <g key={cond} transform={"translate(" + (xScale(cond) - 0.5 * boxWidth) + ",0)"}>
                    <Boxplot quantiles={statistics[cond].quantiles}
                             outliers={statistics[cond].outliers}
                             width={boxWidth} yScale={yScale}
                             color={props.color}
                             opacity={props.opacity}/>
                </g>

            }))
        }, [yScale, xScale, props.color, props.conditions, props.opacity])


        const statistics = calculateStatistics(props.data)
        const boxPlots = createBoxplots(statistics.statistics);

        return <g>
            <PlotBand upper={statistics.bandPoints.upper} lower={statistics.bandPoints.lower} yScale={props.yScale}
                      xScale={props.xScale} color={props.color} opacity={props.opacity}/>
            {boxPlots}
        </g>;
    })
;

Boxplots.propTypes = {
    data: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any))).isRequired,
    yScale: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
    opacity: PropTypes.number.isRequired,
};
export default Boxplots;