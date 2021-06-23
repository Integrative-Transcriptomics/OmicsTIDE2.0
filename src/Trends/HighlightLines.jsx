import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import {useStore} from "../Stores/RootStore";

const HighlightLines = observer((props) => {
    const store = useStore();
    // create lines
    const lines = [];
    store.highlightedGenes.forEach(gene => {
        // create points for each line
        if (gene in props.data) {
            let points = "";
            props.data[gene].forEach(elem => {
                const point = props.xScale(elem.cond) + "," + props.yScale(elem.value);
                points += point + " "
            })
            lines.push(<polyline key={gene} points={points} fill="none" stroke="black" strokeWidth={2}
                                 onMouseLeave={() => store.setHighlightedGenes([])}/>)
        }
    });
    return (
        <g>
            {lines}
        </g>


    );
});

HighlightLines.propTypes = {
    data: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any))).isRequired,
    yScale: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
};
export default HighlightLines;