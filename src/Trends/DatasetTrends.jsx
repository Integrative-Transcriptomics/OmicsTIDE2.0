import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import {StoreProvider, useStore} from "../Stores/RootStore";
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
    const height = (props.height - (props.clusterNames.length - 1) * (margin.top + margin.bot)) / props.clusterNames.length;
    const width = props.width - margin.left - margin.right

    // shared xScale and yScale
    const yScale = d3.scaleLinear().domain([props.maxValue, props.minValue]).range([0, height]);
    const xScale = d3.scalePoint().domain(props.conditions).range([0, width]);
    const xAxis = d3.axisBottom()
        .scale(xScale)
    const yAxis = d3.axisLeft()
        .scale(yScale)
    const plots = [];
    const filteredNames = props.clusterNames.filter(cluster => store.clusterSizes[cluster] > 0)
    filteredNames.forEach((cluster, i) => {
            let plot = null;

            // highlighting
            let opacity = 0.7;
            if (store.highlightedClusters.length > 0) {
                opacity = 0.2;
                if (store.highlightedClusters.includes(cluster)) {
                    opacity = 1;
                }
            }
            if (store.clusterSizes[cluster] > 0) {
                // create plots based on plotTypes
                if (props.plotType === "profile") {
                    const data = store.geneCentricMapping[cluster]
                    plot = <g>
                        <ProfilePlot data={data} yScale={yScale} xScale={xScale}
                                     color={props.colorScale(cluster)} opacity={opacity}/>
                        <StoreProvider store={store.parent}>
                            <HighlightLines data={data} yScale={yScale} xScale={xScale}/>
                        </StoreProvider>

                    </g>
                } else if (props.plotType === "centroid") {
                    // if there is only one gene in the cluster we create a profile plot instead of a centroid profile plot
                    if (Object.keys(store.geneCentricMapping[cluster]).length === 1) {
                        const data = store.geneCentricMapping[cluster]
                        plot = <ProfilePlot data={data} yScale={yScale} xScale={xScale}
                                            color={props.colorScale(cluster)} opacity={opacity}/>
                    } else {
                        const data = store.conditionMapping[cluster]
                        plot = <CentroidProfilePlot data={data} conditions={props.conditions}
                                                    yScale={yScale} xScale={xScale}
                                                    color={props.colorScale(cluster)} opacity={opacity}/>
                    }
                }

                plots.push(
                    <svg key={cluster} width={props.width} height={props.height / props.clusterNames.length}
                         onClick={() => store.setSelectedCluster(cluster)}>
                        <g transform={"translate(" + margin.left + ",0)"}>
                            {plot}
                            <Axis h={height} w={width} axis={yAxis} axisType={'y'} label={"z-score"}/>
                            <Axis h={height} w={width} axis={xAxis} axisType={'x'} label={""}/>
                        </g>
                    </svg>)
            }
        }
    )
    return (
        <div>{plots}</div>
    );
});

DatasetTrends.propTypes = {
    clusterNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    colorScale: PropTypes.func.isRequired,
    conditions: PropTypes.arrayOf(PropTypes.string).isRequired,
    minValue: PropTypes.number.isRequired,
    maxValue: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    handleClick: PropTypes.func.isRequired,
};
export default DatasetTrends;