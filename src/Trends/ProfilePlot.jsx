import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";

const ProfilePlot = observer((props) => {
    // create lines
    const lines = Object.keys(props.data).map(gene => {
        // create points for each line
        let points = "";
        props.data[gene].forEach(elem => {
            const point = props.xScale(elem.cond) + "," + props.yScale(elem.value);
            points += point + " "
        })
        return (<polyline key={gene} points={points} fill="none" stroke={props.color} opacity={props.opacity}/>)
    });

    return (
        <g>
            {lines}
        </g>


    );
});

ProfilePlot.propTypes = {
    data: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any))).isRequired,
    yScale: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
    opacity: PropTypes.number.isRequired,
};
export default ProfilePlot;