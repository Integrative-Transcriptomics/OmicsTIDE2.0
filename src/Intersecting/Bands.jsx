import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import {useStore} from "../Stores/RootStore";
import Tooltip from "@material-ui/core/Tooltip";
import {v4 as uuidv4} from 'uuid';
import Typography from "@material-ui/core/Typography";


const Bands = observer((props) => {
    const store = useStore();
    const paths = [];
    // current y position of intersection at ds1
    let currPos1 = 0;
    let ds1Start=0;
    // array to store y positions of intersections at ds2
    let currPos2 = [];
    // helper to fill currPos2
    let currPos = 0;
    // fill currPos2 with y positions of nodes at ds2
    store.ds2.filteredClusterNames.forEach((cluster) => {
        const height = props.yScale(store.ds2.clusterSizes[cluster])
        currPos2.push(currPos)
        currPos += height + props.whiteSpace
    })
    // iterate through clusters of both data sets
    store.ds1.filteredClusterNames.forEach((cluster1) => {
        store.ds2.filteredClusterNames.forEach((cluster2, i2) => {
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
                const gradientID = uuidv4();
                paths.push(<g key={cluster1 + cluster2}>
                    <defs>
                        <linearGradient id={gradientID} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{stopColor: fill2}}/>
                            <stop offset="100%" style={{stopColor: fill1}}/>
                        </linearGradient>
                    </defs>
                    <Tooltip title={<Typography>{"Intersection size: " + props.intersections[cluster1 + "," + cluster2]}</Typography>}
                             followCursor>
                        <path
                            d={p1 + " " + p2 + " " + p3 + " " + p4 + " Z"} opacity={opacity}
                            fill={"url(#" + gradientID + ")"}
                            onMouseEnter={() => store.setHighlightedIntersection([[cluster1, cluster2]])}
                            onMouseLeave={() => store.setHighlightedIntersection([])}
                            onClick={() => store.handleIntersectionSelection([cluster1, cluster2])}
                            style={{cursor: "pointer"}}>
                        </path>
                    </Tooltip>
                </g>)
                // next position on ds1
                currPos1 += height;
                // save next position of ds2 for current ds2 cluster
                currPos2[i2] += height;
            }

        })
        // add whitespace to currPos1 when finished with a cluster
        ds1Start += props.yScale(store.ds1.clusterSizes[cluster1]) + props.whiteSpace;
        currPos1=ds1Start
    })
    return (
        <g>{paths}</g>

    );
});

Bands.propTypes = {
    intersections: PropTypes.objectOf(PropTypes.number).isRequired,
    yScale: PropTypes.func.isRequired,
    colorScale: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    whiteSpace: PropTypes.number.isRequired
};
export default Bands;