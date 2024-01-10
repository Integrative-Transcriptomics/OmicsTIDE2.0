import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import ProfilePlot from "../Trends/ProfilePlot";
import HighlightLines from "../Trends/HighlightLines";

const MultiClusterProfilePlot = observer((props) => {
    let lines = []
    Object.keys(props.selection).forEach(cluster => {
        lines = lines.concat(<g key={cluster}>
            <ProfilePlot data={props.selection[cluster]} yScale={props.yScale}
                         xScale={props.xScale}
                         color={props.colorScale(cluster)} opacity={0.5}/>
            <HighlightLines data={props.selection[cluster]} yScale={props.yScale} xScale={props.xScale}
                            genes={props.highlightedGenes} stroke={"black"}/>
            <HighlightLines data={props.selection[cluster]} yScale={props.yScale} xScale={props.xScale}
                            genes={props.searchGenes} stroke={"black"}/>
        </g>)
    });
    // create lines
    return (
        <g>
            {lines}
        </g>
    );
});

MultiClusterProfilePlot.propTypes = {
    selection: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)).isRequired,
    yScale: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    colorScale: PropTypes.func.isRequired,
};
export default MultiClusterProfilePlot;