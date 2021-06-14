import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import {useStore} from "../Stores/RootStore";

const Bands = observer((props) => {
    const store = useStore();
    const paths = [];
    let currPos1 = 0;
    let currPos2 = [];
    let currPos = 0;
    store.clusterNames.forEach((cluster, i) => {
        const height = props.yScale(props.clusters2[cluster])
        currPos2.push(currPos)
        currPos += height + props.whiteSpace
    })
    store.clusterNames.forEach((cluster1) => {
        store.clusterNames.forEach((cluster2, i2) => {
            if ([cluster1, cluster2] in props.intersections) {
                const fill1 = props.colorScale(cluster1);
                const fill2 = props.colorScale(cluster2);
                let opacity = 0.7;
                if (store.highlightedIntersection.length === 2) {
                    if (JSON.stringify(store.highlightedIntersection) === JSON.stringify([cluster1, cluster2])) {
                        opacity = 1;
                    } else{
                        opacity = 0.5
                    }
                }

                const height = props.yScale(props.intersections[cluster1 + "," + cluster2])
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
                        onMouseEnter={() => store.setHighlightedIntersection([cluster1, cluster2])}
                        onMouseLeave={() => store.setHighlightedIntersection([])}/>
                </g>)
                currPos1 += height;
                currPos2[i2] += height;
            }
        })
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