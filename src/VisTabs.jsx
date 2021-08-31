import React, {useCallback, useEffect, useState} from "react";
import Tabs from "@material-ui/core/Tabs";
import PropTypes from "prop-types";
import Overview from "./Overview/Overview";
import {StoreProvider, useStore} from "./Stores/RootStore";
import IntersectVis from "./Intersecting/IntersectVis";
import Tab from "@material-ui/core/Tab";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close"
import NIVis from "./NonIntersecting/NIVis";
import SecondLevelAnalysis from "./SecondLevel/SecondLevelAnalysis";
import {SecondLevelStore} from "./SecondLevel/SecondLevelStore";


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
            <div>
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

function VisTabs() {
    const store = useStore();
    // tab types: home, overview, intersect, nonIntersect, intersectdetail, nonintersectdetail
    const [tabs, setTabs] = useState([]);
    const [selectedTab, selectTab] = useState(0);
    const addIntersectTab = useCallback((index) => {
        const tabIndex = tabs.map(d => d.type === "intersect" ? d.index : -1).indexOf(index)
        if (tabIndex === -1) {
            setTabs(tabs.concat([{type: "intersect", index: index}]))
        } else {
            selectTab(tabIndex + 1)
        }
    }, [tabs]);
    const addNITab = useCallback((index) => {
        const tabIndex = tabs.map(d => d.type === "nonIntersect" ? d.index : -1).indexOf(index)
        if (tabIndex === -1) {
            setTabs(tabs.concat([{type: "nonIntersect", index: index}]))
        } else {
            selectTab(tabIndex + 1)
        }
    }, [tabs]);
    const addDetailTabI = useCallback((index, ds1Selection, ds2Selection) => {
        const secondLevelStore = new SecondLevelStore(store.pantherAPI, store.comparisons[index].intersecting, ds1Selection, ds2Selection);
        setTabs(tabs.concat([{
            type: "detail",
            index: index,
            store: secondLevelStore,
        }]))
        selectTab(tabs.length)
    }, [tabs, store.pantherAPI, store.comparisons])
    const addDetailTabNI = useCallback((index, ds1Selection, ds2Selection) => {
        const secondLevelStore = new SecondLevelStore(store.pantherAPI, store.comparisons[index].nonIntersecting, ds1Selection, ds2Selection);
        setTabs(tabs.concat([{
            type: "detail",
            index: index,
            store: secondLevelStore,
        }]))
        selectTab(tabs.length)
    }, [tabs, store.pantherAPI, store.comparisons])
    const removeTab = useCallback((index) => {
        let currentTabs = tabs.slice();
        currentTabs.splice(index, 1)
        setTabs(currentTabs);
    }, [tabs]);

    useEffect(() => {
        selectTab(tabs.length)
    }, [tabs.length]);
    const tabElems = tabs.map((tab, i) => <Tab key={tab.type + i} component="div" label={
        <span>
            {tab.type + " " + (tab.index + 1)}
            <IconButton onClick={() => removeTab(i)}>
                <CloseIcon/>
            </IconButton>
        </span>
    }/>)
    const tabPanels = tabs.map((tab, i) => {
        if (tab.type === "intersect") {
            return (
                <TabPanel key={tab.type + i} index={i + 1} value={selectedTab}>
                    <StoreProvider store={store.comparisons[tab.index].intersecting}>
                        <IntersectVis conditions={store.conditions} analyzeDetail={addDetailTabI}
                                      isVisible={selectedTab === (i + 1)}/>
                    </StoreProvider>
                </TabPanel>
            )
        }
        if (tab.type === "nonIntersect") {
            return (
                <TabPanel key={tab.type + i} index={i + 1} value={selectedTab}>
                    <StoreProvider store={store.comparisons[tab.index].nonIntersecting}>
                        <NIVis conditions={store.conditions} analyzeDetail={addDetailTabNI} isVisible={selectedTab === (i + 1)}/>
                    </StoreProvider>
                </TabPanel>
            )
        }
        if (tab.type === "detail") {
            return (
                <TabPanel key={tab.type + i} index={i + 1} value={selectedTab}>
                    <StoreProvider store={tab.store}>
                        <SecondLevelAnalysis conditions={store.conditions} isVisible={selectedTab === (i + 1)}/>
                    </StoreProvider>
                </TabPanel>
            )
        }
        return null;
    })
    return (
        <div>
            <Tabs
                value={selectedTab}
                onChange={(e, v) => selectTab(v)}
                scrollButtons="auto"
            >
                <Tab label="Overview"/>
                {tabElems}
            </Tabs>
            {/* eslint-disable-next-line react/jsx-no-undef */}
            <TabPanel value={selectedTab} index={0}>
                <Overview addIntersectTab={addIntersectTab} addNITab={addNITab}/>
            </TabPanel>
            {tabPanels}
        </div>
    );
}

export default VisTabs;
