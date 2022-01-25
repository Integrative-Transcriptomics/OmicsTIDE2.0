import React, {createRef, useCallback, useEffect, useState} from "react";
import Axis from "../Trends/Axis";
import * as d3 from "d3";
import PropTypes from "prop-types";
import {Typography} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import {observer} from "mobx-react";


const GoChart = observer((props) => {
    const plot = createRef();
    const margin = {
        left: 0,
        right: 10,
        top: 10,
        bot: 30,
    }
    const textWidth = 200;
    const [width, setWidth] = useState(500)

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
    }, [plot, changeWidth]);
    let vis = <Typography>No significant enrichments</Typography>;
    if (props.data.length > 0) {
        const xScale = d3.scaleLinear().domain([0, props.maxVal]).range([0, width - margin.left - margin.right - textWidth-10]);
        const xAxis = d3.axisBottom()
            .scale(xScale)
        const axis = <Axis h={margin.top} w={width - margin.left - margin.right - textWidth} axis={xAxis}
                           axisType={'x'} label={"-log2(FDR)"}/>
        const rects = props.data.map((category, i) =>
            <Tooltip key={category.termID}
                     title={category.termID + " (" + category.termName + "): " + category.padj.toExponential(2)}
                     followCursor>

                <div onClick={()=>window.open(`http://amigo.geneontology.org/amigo/term/${category.termID}`, '_blank').focus()}>
                    <div style={{
                        width: textWidth,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        float: "left",
                    }}>{category.termName}</div>
                    <svg width={xScale(category.negLogFDR)} height={12}>
                        <rect width={xScale(category.negLogFDR)} height={12}
                              fill={category.plus_minus === "+" ? "red" : "blue"}/>
                    </svg>
                </div>
            </Tooltip>)
        vis =
            <div ref={plot}>
                <div style={{overflowY: "auto", maxHeight: "400px"}}>
                    {rects}
                </div>
                <svg width={width - 20} height={margin.bot + margin.top}>
                    <g transform={"translate(" + margin.left + textWidth + ",0)"}>
                        {axis}
                    </g>
                </svg>
            </div>;
    }
    return (vis);
});

GoChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    isVisible: PropTypes.bool.isRequired,
};

export default GoChart;
