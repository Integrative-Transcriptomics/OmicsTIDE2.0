import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import {useStore} from "../Stores/RootStore";

const Bands = observer((props) => {
    const store = useStore();
    const paths = [];
    // current y position of intersection at ds1
    let currPos1 = 0;
    // array to store y positions of intersections at ds2
    let currPos2 = [];
    // helper to fill currPos2
    let currPos = 0;
    // fill currPos2 with y positions of nodes at ds2
    store.clusterNames.forEach((cluster, i) => {
        const height = props.yScale(props.clusters2[cluster])
        currPos2.push(currPos)
        currPos += height + props.whiteSpace
    })
    // iterate through clusters of both data sets
    store.clusterNames.forEach((cluster1) => {
        store.clusterNames.forEach((cluster2, i2) => {
            // if there is an intersection, draw a band
            if ([cluster1, cluster2] in props.intersections) {
                const fill1 = props.colorScale(cluster1);
                const fill2 = props.colorScale(cluster2);
                let opacity = 0.7;

                // highlighting
                if (store.highlightedIntersections.length > 0) {
                    if (store.highlightedIntersections
                        .filter(intersection => JSON.stringify(intersection) === JSON.stringify([cluster1, cluster2])).length > 0) {
                        opacity = 1;
                    } else {
                        opacity = 0.2
                    }
                }
                // height of band
                const height = props.yScale(props.intersections[cluster1 + "," + cluster2])
                // create curved band
                const p1 = "M0 " + currPos1;
                const p2 = "C " + props.width / 2 + " " + currPos1 + ", "
                    + props.width / 2 + " " + currPos2[i2] + ", "
                    + props.width + " " + currPos2[i2]
                const p3 = "L" + props.width + " " + (currPos2[i2] + height);
                const p4 = "C " + props.width / 2 + " " + (currPos2[i2] + height) + ", "
                    + props.width / 2 + " " + (currPos1 + height) + ", "
                    + "0 " + (currPos1 + height)
                paths.push(<g key={cluster1 + cluster2}>
                    <defs>
                        <linearGradient id={cluster1 + cluster2} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{stopColor: fill2}}/>
                            <stop offset="100%" style={{stopColor: fill1}}/>
                        </linearGradient>
                    </defs>
                    <path
                        d={p1 + " " + p2 + " " + p3 + " " + p4 + " Z"} opacity={opacity}
                        fill={"url(#" + cluster1 + cluster2 + ")"}
                        onMouseEnter={() => store.setHighlightedIntersection([[cluster1, cluster2]])}
                        onMouseLeave={() => store.setHighlightedIntersection([])}/>
                </g>)
                // next position on ds1
                currPos1 += height;
                // save next position of ds2 for current ds2 cluster
                currPos2[i2] += height;
            }
        })
        // add whitespace to currPos1 when finished with a cluster
        currPos1 += props.whiteSpace;
    })
    return (
        <g>{paths}</g>

    );
});

Bands.propTypes = {
    clusters1: PropTypes.objectOf(PropTypes.number).isRequired,
    clusters2: PropTypes.objectOf(PropTypes.number).isRequired,
    intersections: PropTypes.objectOf(PropTypes.number).isRequired,
    yScale: PropTypes.func.isRequired,
    colorScale: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    whiteSpace: PropTypes.number.isRequired
};
export default Bands;