import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import {useStore} from "../Stores/RootStore";

const StackedBars = observer((props) => {
    const store = useStore();
    let currPos = 0;
    const rects = [];
    props.clusterNames.forEach((cluster, i) => {
        let opacity = 0.7;
        if (props.highlightedCluster !== null) {
            if (props.highlightedCluster === cluster) {
                opacity = 1;
            } else {
                opacity = 0.5;
            }
        }

        const height = props.yScale(props.data[cluster])
        rects.push(<rect key={cluster} height={height} y={currPos} width={props.rectWidth}
                         fill={props.colorScale(cluster)} opacity={opacity}
                         /*onMouseEnter={() => store.setHighlightedCluster(cluster)}
                         onMouseLeave={() => store.setHighlightedIntersection([])}*//>)
        currPos += height + props.whiteSpace
    })
    return (
        <g>{rects}</g>

    );
});

StackedBars.propTypes = {
    data: PropTypes.objectOf(PropTypes.number).isRequired,
    clusterNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    yScale: PropTypes.func.isRequired,
    rectWidth: PropTypes.number.isRequired,
    whiteSpace: PropTypes.number.isRequired
};
export default StackedBars;