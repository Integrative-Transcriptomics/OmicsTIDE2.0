import {observer} from "mobx-react";
import React, {createRef, useCallback, useEffect, useState} from "react";
import DatasetTrends from "../Trends/DatasetTrends";
import Sankey from "./Sankey";
import PropTypes from "prop-types";
import {StoreProvider, useStore} from "../Stores/RootStore";
import Controls from "../Controls";
import Grid from "@material-ui/core/Grid";
import SelectionTable from "./SelectionTable";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

const IntersectVis = observer((props) => {
    const store = useStore();
    const sankey = createRef();
    const profiles = createRef();
    const [sankeyWidth, setSankeyWidth] = useState(1);
    const [profilesWidth, setProfilesWidth] = useState(1);
    const height = 800;
    const changeWidth = useCallback(() => {
        if (sankey.current != null) {
            setSankeyWidth(sankey.current.getBoundingClientRect().width)
        }
        if (profiles.current != null) {
            setProfilesWidth(profiles.current.getBoundingClientRect().width)
        }
    }, [sankey, profiles]);
    useEffect(() => {
        changeWidth();
        window.addEventListener("resize", changeWidth);
    }, [profiles, sankey, changeWidth]);

    return (
        <div style={{padding: 10}}>
            <Grid container spacing={3}>
                <Grid item xs={3}>
                    <Controls/>
                    {store.selectedIntersections.length > 0 ?
                        <div>
                            <Typography>Selection</Typography>
                            <SelectionTable colorScale={store.colorScale}/>
                            <Button variant="contained" endIcon={<OpenInNewIcon/>} onClick={()=>props.analyzeDetail(store.comparison.index,store.ds1.geneSelection, store.ds2.geneSelection)}>Start detailed analysis</Button>
                        </div> : null}
                </Grid>
                <Grid item xs={9}>
                    <Grid container spacing={3}>
                        <Grid item xs={3}>
                            <Typography>{store.comparison.file1}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            {"Concordant genes: " + Math.round(store.concordantDiscordant.concordant / store.genes.length * 100)
                            + "% (" + store.concordantDiscordant.concordant
                            + ") Discordant genes: " + Math.round(store.concordantDiscordant.discordant / store.genes.length * 100)
                            + "% (" + store.concordantDiscordant.discordant + ")"}
                        </Grid>
                        <Grid item xs={3}>
                            <Typography>{store.comparison.file2}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container spacing={0}>
                        <Grid item xs={3}>
                            <div ref={profiles}>
                                <StoreProvider store={store.ds1}>
                                    <DatasetTrends clusterNames={store.clusterNames} colorScale={store.colorScale}
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
                                <Sankey width={sankeyWidth} height={height} colorScale={store.colorScale}/>
                            </div>
                        </Grid>
                        <Grid item xs={3}>
                            <StoreProvider store={store.ds2}>
                                <DatasetTrends clusterNames={store.clusterNames} colorScale={store.colorScale}
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
};
export default IntersectVis;