import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import {useStore} from "../Stores/RootStore";
import * as d3 from "d3";
import Axis from "../Trends/Axis";


const Bars = observer((props) => {
    const store = useStore()
    // margins for subplots
    const margin = {
        left: 5,
        right: 20,
        top: 10,
        bot: 30,
    }

    // height and width of subplots
    const height = (props.height - (props.clusterNames.length - 1) * (margin.top + margin.bot)) / props.clusterNames.length;
    const width = props.width - margin.left - margin.right

    const barHeight = height/3;
    // shared xScale and yScale
    const xScale = d3.scaleLinear().domain([0, props.maxValue]).range([0, width]);
    const xAxis = d3.axisBottom()
        .scale(xScale)
    const filteredNames = props.clusterNames.filter(cluster => store.clusterSizes[cluster] > 0)
    const bars = filteredNames.map((cluster, i) => {
            let axis = null;
            if (i === filteredNames.length - 1) {
                axis = <g transform={"translate(" + (margin.left) + ",0)"}>
                    <Axis h={height} w={width} axis={xAxis}
                          axisType={'x'} label={"Cluster size"}/>
                </g>
            }
            return (
                <svg key={cluster} width={props.width} height={props.height / props.clusterNames.length}>
                    <g transform={"translate(" + (margin.left) + "," + ((height - barHeight) / 2) + ")"}>
                        <rect height={barHeight} width={xScale(store.clusterSizes[cluster])}
                              fill={props.colorScale(cluster)}/>
                    </g>
                    {axis}
                </svg>)

        }
    )
    return (
        <div>
            {bars}
        </div>
    );
});

Bars.propTypes = {
    clusterNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    colorScale: PropTypes.func.isRequired,
    conditions: PropTypes.arrayOf(PropTypes.string).isRequired,
    maxValue: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};
export default Bars;