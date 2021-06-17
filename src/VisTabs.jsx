import React, {useCallback, useEffect, useState} from "react";
import Tabs from "@material-ui/core/Tabs";
import AppBar from "@material-ui/core/AppBar";
import PropTypes from "prop-types";
import Overview from "./Overview";
import {StoreProvider, useStore} from "./Stores/RootStore";
import IntersectVis from "./IntersectVis";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Tab from "@material-ui/core/Tab";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close"


function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function VisTabs() {
    const store = useStore();
    // tab types: home, overview, intersect, nonintersect, intersectdetail, nonintersectdetail
    const [tabs, setTabs] = useState([]);
    const [selectedTab, selectTab] = useState(0);
    const addIntersectTab = useCallback((index) => {
        setTabs(tabs.concat([{type: "intersect", index: index}]))
    }, [tabs]);
    const removeTab = useCallback((index) => {
        let currentTabs = tabs.slice();
        currentTabs.splice(index, 1)
        setTabs(currentTabs);
    }, [tabs]);
    useEffect(() => {
        selectTab(tabs.length)
    }, [tabs]);
    const tabElems = tabs.map((tab, i) => <Tab key={tab.type + tab.index} component="div" label={
        <span>
            {tab.type + " " + tab.index + 1}
            <IconButton onClick={() => removeTab(i)}>
                <CloseIcon/>
            </IconButton>
        </span>
    }/>)
    const tabPanels = tabs.map((tab, i) => {
        if (tab.type === "intersect") {
            return (<TabPanel key={tab.type + tab.index} index={i + 1} value={selectedTab}>
                <StoreProvider store={store.comparisons[tab.index].intersecting}>
                    <IntersectVis conditions={store.conditions}/>
                </StoreProvider>
            </TabPanel>)
        }
    })
    return (
        <div>
            <AppBar>
                <Tabs
                    value={selectedTab}
                    onChange={(e, v) => selectTab(v)}
                    scrollButtons="auto"
                >
                    <Tab label="Overview"/>
                    {tabElems}
                </Tabs>
            </AppBar>
            {/* eslint-disable-next-line react/jsx-no-undef */}
            <TabPanel value={selectedTab} index={0}>
                <Overview addIntersectTab={addIntersectTab}/>
            </TabPanel>
            {tabPanels}
        </div>
    );
}

export default VisTabs;
