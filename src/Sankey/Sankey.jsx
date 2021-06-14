import {observer} from "mobx-react";
import {useStore} from "../Stores/RootStore";
import * as d3 from "d3";
import React from "react";
import PropTypes from "prop-types";
import StackedBars from "./StackedBars";
import Bands from "./Bands";

const Sankey = observer((props) => {
    const height = props.height;
    const whiteSpace = 10
    const rectWidth = 50
    const store = useStore();
    const ds1clusters = {}
    const ds2clusters = {}
    store.clusterNames.forEach(cluster => {
        ds1clusters[cluster] = store.ds1.clusters[cluster].length;
        ds2clusters[cluster] = store.ds2.clusters[cluster].length;
    });
    const intersectionSizes = {}
    Object.keys(store.filteredIntersections).forEach(intersection => {
        intersectionSizes[intersection] = store.intersections[intersection].length
    })

    const yScale = d3.scaleLinear().domain([0, store.genes.length]).range([0, height - Object.keys(ds1clusters).length * whiteSpace])
    const colorScale = d3.scaleOrdinal().domain(store.clusterNames).range(d3.schemeCategory10);
    return (
        <g>
            <g>{<StackedBars data={ds1clusters}
                             clusterNames={store.clusterNames}
                             yScale={yScale}
                             colorScale={colorScale}
                             rectWidth={rectWidth}
                             highlightedCluster={store.highlightedIntersection.length === 2 ? store.highlightedIntersection[0] : null}
                             whiteSpace={whiteSpace}/>}</g>
            <g transform={"translate(" + (props.width - rectWidth) + ",0)"}><StackedBars data={ds2clusters}
                                                                                         clusterNames={store.clusterNames}
                                                                                         yScale={yScale}
                                                                                         colorScale={colorScale}
                                                                                         rectWidth={rectWidth}
                                                                                         highlightedCluster={store.highlightedIntersection.length === 2 ? store.highlightedIntersection[1] : null}
                                                                                         whiteSpace={whiteSpace}/></g>
            <g transform={"translate(" + rectWidth + ",0)"}><Bands clusters1={ds1clusters} clusters2={ds2clusters}
                                                                   intersections={intersectionSizes}
                                                                   yScale={yScale} whiteSpace={whiteSpace}
                                                                   colorScale={colorScale}
                                                                   width={props.width - 2 * rectWidth}/></g>
        </g>

    );
});

Sankey.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};
export default Sankey;