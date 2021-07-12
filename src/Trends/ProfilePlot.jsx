import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import {useStore} from "../Stores/RootStore";

const ProfilePlot = observer((props) => {
    const store = useStore();
    // create lines
    const lines = Object.keys(props.data).map(gene => {
        // create points for each line
        let points = "";
        props.data[gene].forEach(elem => {
            const point = props.xScale(elem.cond) + "," + props.yScale(elem.value);
            points += point + " "
        })
        return (<polyline key={gene} points={points} fill="none" stroke={props.color} opacity={props.opacity}
                          onMouseEnter={() => store.parent.setHighlightedGenes([gene])}/>)
    });

    return (lines);
});

ProfilePlot.propTypes = {
    data: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any))).isRequired,
    yScale: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
    opacity: PropTypes.number.isRequired,
};
export default ProfilePlot;