import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import ProfilePlot from "../Trends/ProfilePlot";
import {StoreProvider, useStore} from "../Stores/RootStore";
import HighlightLines from "../Trends/HighlightLines";

const MultiClusterProfilePlot = observer((props) => {
    let lines = []
    const store = useStore();
    Object.keys(props.selection).forEach(cluster => {
        lines = lines.concat(<g>
            <ProfilePlot data={props.selection[cluster]} yScale={props.yScale}
                         xScale={props.xScale}
                         color={props.colorScale(cluster)} opacity={0.5}/>
            <StoreProvider store={store.parent}>
                <HighlightLines data={props.selection[cluster]} yScale={props.yScale} xScale={props.xScale}/>
            </StoreProvider>

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
    selection: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any))).isRequired,
    yScale: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    colorScale: PropTypes.func.isRequired,
};
export default MultiClusterProfilePlot;