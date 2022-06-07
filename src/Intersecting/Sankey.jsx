import {observer} from "mobx-react";
import {StoreProvider, useStore} from "../Stores/RootStore";
import * as d3 from "d3";
import React from "react";
import PropTypes from "prop-types";
import StackedBars from "./StackedBars";
import Bands from "./Bands";

const Sankey = observer((props) => {
    const whiteSpace = 10
    const rectWidth = 25
    const store = useStore();

    // size of intersections TODO: add to store
    const intersectionSizes = {}
    Object.keys(store.filteredIntersections).forEach(intersection => {
        intersectionSizes[intersection] = store.filteredIntersections[intersection].length
    })
    // scale for heights of bands/nodes
    const yScale = d3.scaleLinear().domain([0, store.genes.length]).range([0, props.height - props.numClusters * whiteSpace])
    const colorScale = d3.scaleOrdinal().domain(store.clusterNames).range(d3.schemeCategory10);
    return (
        <svg height={props.height} width={props.width}>
            <g>
                <StoreProvider store={store.ds1}>
                    <StackedBars data={store.ds1.clusterSizes}
                                 clusterNames={store.clusterNames}
                                 yScale={yScale}
                                 colorScale={colorScale}
                                 rectWidth={rectWidth}
                                 whiteSpace={whiteSpace}/>
                </StoreProvider>
            </g>
            <g transform={"translate(" + (props.width - rectWidth) + ",0)"}>
                <StoreProvider store={store.ds2}>
                    <StackedBars data={store.ds2.clusterSizes}
                                 clusterNames={store.clusterNames}
                                 yScale={yScale}
                                 colorScale={colorScale}
                                 rectWidth={rectWidth}
                                 whiteSpace={whiteSpace}/>
                </StoreProvider>
            </g>
            <g transform={"translate(" + rectWidth + ",0)"}>
                <Bands intersections={intersectionSizes}
                       yScale={yScale} whiteSpace={whiteSpace}
                       colorScale={colorScale}
                       width={props.width - 2 * rectWidth}/>
            </g>
        </svg>

    );
});

Sankey.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    numClusters: PropTypes.number.isRequired,
};
export default Sankey;