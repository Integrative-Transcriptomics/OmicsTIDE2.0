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
    const height = (props.height - (props.numClusters) * (margin.top + margin.bot)) / props.numClusters;
    const width = props.width - margin.left - margin.right
    const barHeight = height/3;
    // shared xScale and yScale
    const xScale = d3.scaleLinear().domain([0, props.maxValue]).range([0, width]);
    const xAxis = d3.axisBottom()
        .scale(xScale)
    const bars = store.filteredClusterNames.map((cluster, i) => {
            let axis = null;
            if (i === store.filteredClusterNames.length - 1 || store.filteredClusterNames.length === 1) {
                axis = <g transform={"translate(" + (margin.left) + ",0)"}>
                    <Axis h={height} w={width} axis={xAxis}
                          axisType={'x'} label={"Cluster size"}/>
                </g>
            }
            return (
                <svg key={cluster} width={props.width} height={props.height / props.numClusters}>
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
    colorScale: PropTypes.func.isRequired,
    conditions: PropTypes.arrayOf(PropTypes.string).isRequired,
    maxValue: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};
export default Bars;