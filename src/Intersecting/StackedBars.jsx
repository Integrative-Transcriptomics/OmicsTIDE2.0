import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import {useStore} from "../Stores/RootStore";
import Tooltip from "@material-ui/core/Tooltip";

const StackedBars = observer((props) => {
    const store = useStore();
    // current position for placement of bars
    let currPos = 0;
    const rects = [];
    store.filteredClusterNames.forEach((cluster, i) => {
        // highlighting
        let opacity = 0.7;
        if (store.highlightedClusters.length > 0) {
            if (store.highlightedClusters.includes(cluster)) {
                opacity = 1;
            } else {
                opacity = 0.2;
            }
        }
        // height of current bar
        const height = props.yScale(props.data[cluster])
        rects.push(<Tooltip title={"Cluster size: " + props.data[cluster]} followCursor>
            <rect key={cluster} height={height} y={currPos} width={props.rectWidth}
                  fill={props.colorScale(cluster)} opacity={opacity}
                  onMouseEnter={() => store.setHighlightedCluster(cluster)}
                  onMouseLeave={() => store.parent.setHighlightedIntersection([])}
                  onClick={() => store.setSelectedCluster(cluster)} style={{cursor: "pointer"}}/>
        </Tooltip>)
        // increment currpos and add white space
        currPos += height + props.whiteSpace
    })
    return (rects);
});

StackedBars.propTypes = {
    data: PropTypes.objectOf(PropTypes.number).isRequired,
    yScale: PropTypes.func.isRequired,
    rectWidth: PropTypes.number.isRequired,
    whiteSpace: PropTypes.number.isRequired
};
export default StackedBars;