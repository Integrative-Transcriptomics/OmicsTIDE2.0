import {observer} from "mobx-react";
import React, {createRef, useCallback, useEffect, useState} from "react";
import {StoreProvider, useStore} from "../Stores/RootStore";
import Grid from "@material-ui/core/Grid";
import {Typography} from "@material-ui/core";
import DatasetTrends from "../Trends/DatasetTrends";
import Sankey from "./Sankey";
import PropTypes from "prop-types";
import Sidebar from "./Sidebar";
import { v4 as uuidv4 } from 'uuid';


const IntersectVis = observer((props) => {
    const store = useStore();
    const ref=createRef();

    const id = "id" + uuidv4()

    // refs to dynamically adapt sizes of plots
    const sankey = createRef();
    const profiles = createRef();

    // states for widths of plots
    const [sankeyWidth, setSankeyWidth] = useState(100);
    const [profilesWidth, setProfilesWidth] = useState(100);
    const numClusters = Math.max(store.ds1.filteredClusterNames.length, store.ds2.filteredClusterNames.length)
    const height = 800;
    const changeWidth = useCallback(() => {
        if (props.isVisible && sankey.current !== null && profiles.current !== null) {
            const sankeyWidth = sankey.current.getBoundingClientRect().width;
            const profilesWidth = profiles.current.getBoundingClientRect().width;
            setSankeyWidth(sankeyWidth)
            setProfilesWidth(profilesWidth)
        }
    }, [props.isVisible, sankey, profiles])

    // change width when window is resized
    useEffect(() => {
        changeWidth();
        window.addEventListener("resize", changeWidth);
        return () => {
            window.removeEventListener('resize', changeWidth);
        }
    }, [changeWidth]);
    return (
        <div style={{padding: 10}}>
            <Grid container spacing={3}>
                <Grid item xs={3}>
                    <Sidebar analyzeDetail={props.analyzeDetail} viewID={id}/>
                </Grid>
                <Grid id={id} ref={ref} item xs={9}>
                    <Grid container spacing={3}>
                        <Grid item xs={3}>
                            <Typography variant={"h5"}>{store.comparison.file1}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant={"h5"}>
                            {"Concordant genes: " + Math.round(store.concordantDiscordant.concordant / store.genes.length * 100)
                            + "% (" + store.concordantDiscordant.concordant
                            + ") Discordant genes: " + Math.round(store.concordantDiscordant.discordant / store.genes.length * 100)
                            + "% (" + store.concordantDiscordant.discordant + ")"}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant={"h5"}>{store.comparison.file2}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container spacing={0}>
                        <Grid item xs={3}>
                            <div ref={profiles}>
                                <StoreProvider store={store.ds1}>
                                    <DatasetTrends colorScale={store.colorScale}
                                                   numClusters={numClusters}
                                                   conditions={props.conditions}
                                                   minValue={store.minValue}
                                                   maxValue={store.maxValue}
                                                   plotType={store.plotType}
                                                   width={profilesWidth} height={height}
                                                   handleClick={(c) => {
                                                   }}/>
                                </StoreProvider>
                            </div>
                        </Grid>
                        <Grid item xs={6}>
                            <div ref={sankey}>
                                <Sankey numClusters={numClusters} width={sankeyWidth} height={height}
                                        colorScale={store.colorScale}/>
                            </div>
                        </Grid>
                        <Grid item xs={3}>
                            <StoreProvider store={store.ds2}>
                                <DatasetTrends colorScale={store.colorScale}
                                               numClusters={numClusters}
                                               conditions={props.conditions}
                                               minValue={store.minValue}
                                               maxValue={store.maxValue}
                                               plotType={store.plotType}
                                               width={profilesWidth} height={height}
                                               handleClick={(c) => {
                                               }}/>
                            </StoreProvider>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div>

    );
});

IntersectVis.propTypes = {
    conditions: PropTypes.arrayOf(PropTypes.string).isRequired,
    isVisible: PropTypes.bool.isRequired,
    analyzeDetail: PropTypes.func.isRequired,
};
export default IntersectVis;