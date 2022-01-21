import {RootStore, StoreProvider} from "./Stores/RootStore";
import VisTabs from "./VisTabs";
import DefaultView from "./DefaultView";
import React, {useCallback, useEffect, useState} from "react";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TabPanel from "./TabPanel";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const rootStore = new RootStore();

function App() {
    const [dataLoaded, setDataLoaded] = useState(false);
    const [tabs, setTabs] = useState([]);
    const [selectedTab, selectTab] = useState(0);
    const removeTab = useCallback((index) => {
        if (selectedTab - 2 === index) {
            selectTab(1)
        } else if (selectedTab - 2 > index) {
            selectTab(selectedTab - 1)
        }
        let currentTabs = tabs.slice();
        currentTabs.splice(index, 1)
        setTabs(currentTabs);
    }, [selectedTab, tabs]);
    useEffect(() => {
        if (dataLoaded) {
            selectTab(1)
        } else{
            setTabs([])
        }
    }, [dataLoaded]);
    const tabElems = tabs.map((tab, i) => <Tab key={tab.type + i} component="div" label={
        <span>
            {tab.type + " " + (tab.index + 1)}
            <IconButton onClick={(e) => {
                e.stopPropagation();
                removeTab(i)
            }}>
                <CloseIcon/>
            </IconButton>
        </span>
    }/>)
    return (
        <div className="App">
            <AppBar position="static">
                <Typography>
                    OmicsTIDE
                </Typography>
            </AppBar>
            <Tabs
                value={selectedTab}
                onChange={(e, v) => selectTab(v)}
                scrollButtons="auto"
            >
                <Tab label="Data upload"/>
                {dataLoaded ? <Tab label="Overview"/> : null}
                {tabElems}
            </Tabs>
            {/* eslint-disable-next-line react/jsx-no-undef */}
            <TabPanel key="data" value={selectedTab} index={0}>
                <StoreProvider store={rootStore}>
                    <DefaultView setDataLoaded={setDataLoaded}/>
                </StoreProvider>
            </TabPanel>
            {dataLoaded ?
                <StoreProvider store={rootStore.dataStore}>
                    <VisTabs tabs={tabs} setTabs={setTabs} selectedTab={selectedTab} selectTab={selectTab}/>
                </StoreProvider> : null}
        </div>
    );
}

export default App;
