import React, {createRef} from "react";
import PropTypes from "prop-types";

function TabPanel(props) {
    const {children, value, index, ...other} = props;
    const ref= createRef();

    return (
        <div
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
        >
            <div ref={ref}>
                {children}
            </div>
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};
export default TabPanel;