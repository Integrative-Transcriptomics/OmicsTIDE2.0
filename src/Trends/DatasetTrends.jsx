import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import {useStore} from "../Stores/RootStore";
import ProfilePlot from "./ProfilePlot";
import * as d3 from "d3";
import Axis from "./Axis";
import CentroidProfilePlot from "./CentroidProfilePlot";
import HighlightLines from "./HighlightLines";


const DatasetTrends = observer((props) => {
    const store = useStore()
    // margins for subplots
    const margin = {
        left: 50,
        right: 10,
        top: 10,
        bot: 30,
    }

    // height and width of subplots
    const height = (props.height - (props.numClusters - 1) * (margin.top + margin.bot)) / props.numClusters;
    const width = props.width - margin.left - margin.right

    // shared xScale and yScale
    const yScale = d3.scaleLinear().domain([props.maxValue, props.minValue]).range([0, height]);
    const xScale = d3.scalePoint().domain(props.conditions).range([0, width]);
    const xAxis = d3.axisBottom()
        .scale(xScale)
    const yAxis = d3.axisLeft()
        .scale(yScale)
    const plots = [];
    console.log(store.filteredClusterNames);
    store.filteredClusterNames.forEach((cluster, i) => {
            let plot = null;

            // highlighting
            let opacity = 0.7;
            if (store.highlightedClusters.length > 0) {
                opacity = 0.2;
                if (store.highlightedClusters.includes(cluster)) {
                    opacity = 1;
                }
            }
                // create plots based on plotTypes
                const geneCentricData = store.geneCentricMapping[cluster]
                const conditionCentricData = store.conditionMapping[cluster];
                if (props.plotType === "profile") {
                    plot = <g>
                        <ProfilePlot data={geneCentricData} yScale={yScale} xScale={xScale}
                                     color={props.colorScale(cluster)} opacity={opacity}/>
                        <HighlightLines data={geneCentricData} yScale={yScale} xScale={xScale}
                                        genes={store.parent.highlightedGenes} stroke={"black"}/>
                    </g>
                } else if (props.plotType === "centroid") {
                    // if there is only one gene in the cluster we create a profile plot instead of a centroid profile plot
                    if (Object.keys(store.geneCentricMapping[cluster]).length === 1) {
                        plot = <ProfilePlot data={geneCentricData} yScale={yScale} xScale={xScale}
                                            color={props.colorScale(cluster)} opacity={opacity}/>
                    } else {
                        plot = <CentroidProfilePlot data={conditionCentricData} conditions={props.conditions}
                                                    yScale={yScale} xScale={xScale}
                                                    color={props.colorScale(cluster)} opacity={opacity}/>
                    }
                }

                plots.push(
                    <svg key={cluster} width={props.width} height={props.height / props.numClusters}
                         onClick={() => store.setSelectedCluster(cluster)}
                         onMouseLeave={() => store.parent.setHighlightedGenes([])}>
                        <g transform={"translate(" + margin.left + ",0)"}>
                            <g>
                                {plot}
                                <HighlightLines data={geneCentricData} yScale={yScale} xScale={xScale}
                                                genes={store.parent.searchGenes} stroke={"black"}/>
                            </g>
                            <Axis h={height} w={width} axis={yAxis} axisType={'y'} label={"z-score"}/>
                            <Axis h={height} w={width} axis={xAxis} axisType={'x'} label={""}/>
                        </g>
                    </svg>)
        }
    )
    return (
        <div>{plots}</div>
    );
});

DatasetTrends.propTypes = {
    numClusters: PropTypes.number.isRequired,
    colorScale: PropTypes.func.isRequired,
    conditions: PropTypes.arrayOf(PropTypes.string).isRequired,
    minValue: PropTypes.number.isRequired,
    maxValue: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    handleClick: PropTypes.func.isRequired,
};
export default DatasetTrends;