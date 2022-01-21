import React, {useCallback} from "react";
import Overview from "./Overview/Overview";
import {StoreProvider, useStore} from "./Stores/RootStore";
import IntersectVis from "./Intersecting/IntersectVis";
import NIVis from "./NonIntersecting/NIVis";
import SecondLevelAnalysis from "./SecondLevel/SecondLevelAnalysis";
import {SecondLevelStore} from "./SecondLevel/SecondLevelStore";
import TabPanel from "./TabPanel";


function VisTabs(props) {
    const store = useStore();
    const {selectTab,setTabs}=props
    // tab types: home, overview, intersect, nonIntersect, intersectdetail, nonintersectdetail
    const addIntersectTab = useCallback((index) => {
        const tabIndex = props.tabs.map(d => d.type === "intersect" ? d.index : -1).indexOf(index)
        if (tabIndex === -1) {
            setTabs(props.tabs.concat([{type: "intersect", index: index}]))
            selectTab(props.tabs.length + 2)
        } else {
            selectTab(tabIndex + 2)
        }
    }, [props.tabs, setTabs, selectTab]);
    const addNITab = useCallback((index) => {
        const tabIndex = props.tabs.map(d => d.type === "nonIntersect" ? d.index : -1).indexOf(index)
        if (tabIndex === -1) {
            setTabs(props.tabs.concat([{type: "nonIntersect", index: index}]))
            selectTab(props.tabs.length + 2)
        } else {
            selectTab(tabIndex + 2)
        }
    }, [props.tabs, setTabs, selectTab]);
    const addDetailTabI = useCallback((index, ds1Selection, ds2Selection) => {
        const secondLevelStore = new SecondLevelStore(store.pantherAPI, store.comparisons[index].intersecting, ds1Selection, ds2Selection);
        setTabs(props.tabs.concat([{
            type: "detail",
            index: index,
            store: secondLevelStore,
        }]))
        selectTab(props.tabs.length + 2)
    }, [store.pantherAPI, store.comparisons, setTabs, props.tabs, selectTab])
    const addDetailTabNI = useCallback((index, ds1Selection, ds2Selection) => {
        const secondLevelStore = new SecondLevelStore(store.pantherAPI, store.comparisons[index].nonIntersecting, ds1Selection, ds2Selection);
        setTabs(props.tabs.concat([{
            type: "detail",
            index: index,
            store: secondLevelStore,
        }]))
        selectTab(props.tabs.length + 2)
    }, [store.pantherAPI, store.comparisons, setTabs, props.tabs, selectTab])

    const tabPanels = [
        <TabPanel key="Home" value={props.selectedTab} index={1}>
            <Overview addIntersectTab={addIntersectTab} addNITab={addNITab}/>
        </TabPanel>]
        .concat(props.tabs.map((tab, i) => {
            if (tab.type === "intersect") {
                return (
                    <TabPanel key={tab.type + i} index={i + 2} value={props.selectedTab}>
                        <StoreProvider store={store.comparisons[tab.index].intersecting}>
                            <IntersectVis conditions={store.conditions} analyzeDetail={addDetailTabI}
                                          isVisible={props.selectedTab === (i + 2)}/>
                        </StoreProvider>
                    </TabPanel>
                )
            }
            if (tab.type === "nonIntersect") {
                return (
                    <TabPanel key={tab.type + i} index={i + 2} value={props.selectedTab}>
                        <StoreProvider store={store.comparisons[tab.index].nonIntersecting}>
                            <NIVis conditions={store.conditions} analyzeDetail={addDetailTabNI}
                                   isVisible={props.selectedTab === (i + 2)}/>
                        </StoreProvider>
                    </TabPanel>
                )
            }
            if (tab.type === "detail") {
                return (
                    <TabPanel key={tab.type + i} index={i + 2} value={props.selectedTab}>
                        <StoreProvider store={tab.store}>
                            <SecondLevelAnalysis conditions={store.conditions}
                                                 isVisible={props.selectedTab === (i + 2)}/>
                        </StoreProvider>
                    </TabPanel>
                )
            }
            return null;
        }))
    return (tabPanels);
}

export default VisTabs;
