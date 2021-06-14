import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";


const ProfilePlot = observer((props) => {
    const lines = Object.keys(props.data).map(gene => {
        let points = "";
        props.data[gene].forEach(elem => {
            const point = props.xScale(elem.cond) + "," + props.yScale(elem.value);
            points += point + " "
        })
        return (<polyline key={gene} points={points} fill="none" stroke={props.color}/>)
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
};
export default ProfilePlot;