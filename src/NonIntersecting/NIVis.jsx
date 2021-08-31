import {observer} from "mobx-react";
import React, {createRef, useCallback, useEffect, useState} from "react";
import DatasetTrends from "../Trends/DatasetTrends";
import PropTypes from "prop-types";
import {StoreProvider, useStore} from "../Stores/RootStore";
import * as d3 from "d3";
import Controls from "../Controls";
import Grid from "@material-ui/core/Grid";
import {Typography} from "@material-ui/core";
import Bars from "./Bars";
import SelectionTable from "./SelectionTable";
import Button from "@material-ui/core/Button";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

const NIVis = observer((props) => {
    const store = useStore();
    const profiles = createRef();
    const [width, setWidth] = useState(1000);
    const height = 800;
    const numClusters = Math.max(store.ds1.filteredClusterNames.length, store.ds2.filteredClusterNames.length);
    const changeWidth = useCallback(() => {
        if (props.isVisible && profiles.current !== null) {
            setWidth(profiles.current.getBoundingClientRect().width)
        }
    }, [profiles, props.isVisible]);
    useEffect(() => {
        changeWidth()
        window.addEventListener("resize", changeWidth);
        return () => {
            window.removeEventListener('resize', changeWidth);
        }
    }, [changeWidth]);
    const maxCluster = d3.max([d3.max(Object.keys(store.ds1.clusterSizes).map(cluster => store.ds1.clusterSizes[cluster]))
        , d3.max(Object.keys(store.ds2.clusterSizes).map(cluster => store.ds2.clusterSizes[cluster]))]);
    return (
        <div style={{padding: 10}}>
            <Grid container spacing={3}>
                <Grid item xs={3}>
                    <Controls/>
                    {store.ds1.selectedClusters > 0 || store.ds2.selectedClusters > 0 ?
                        <div>
                            <Typography>Selection</Typography>
                            <SelectionTable colorScale={store.colorScale}/>
                            <Button variant="contained" endIcon={<OpenInNewIcon/>}
                                    onClick={() => {
                                        props.analyzeDetail(store.comparison.index, store.ds1.geneSelection, store.ds2.geneSelection)
                                        store.clearSelection();
                                    }}>Start
                                detailed analysis</Button>
                        </div> : null
                    }
                </Grid>
                <Grid item xs={9}>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <Typography>{store.comparison.file1 + ": " + store.ds1.numFilteredGenes + " genes"}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography>{store.comparison.file2 + ": " + store.ds2.numFilteredGenes + " genes"}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container spacing={0}>
                        <Grid item xs={4}>
                            <div ref={profiles}>
                                <StoreProvider store={store.ds1}>
                                    <DatasetTrends colorScale={store.colorScale}
                                                   numClusters={numClusters}
                                                   conditions={props.conditions}
                                                   minValue={store.minValue}
                                                   maxValue={store.maxValue}
                                                   plotType={store.plotType}
                                                   width={width} height={height}
                                                   handleClick={store.ds1.setSelectedCluster}/>
                                </StoreProvider>
                            </div>
                        </Grid>
                        <Grid item xs={2}>
                            <StoreProvider store={store.ds1}>
                                <Bars clusterNames={store.clusterNames} colorScale={store.colorScale}
                                      conditions={props.conditions} maxValue={maxCluster}
                                      width={width / 2} height={height}/>
                            </StoreProvider>
                        </Grid>

                        <Grid item xs={4}>
                            <StoreProvider store={store.ds2}>
                                <DatasetTrends colorScale={store.colorScale}
                                               numClusters={numClusters}
                                               conditions={props.conditions}
                                               minValue={store.minValue}
                                               maxValue={store.maxValue}
                                               plotType={store.plotType}
                                               width={width} height={height}
                                               handleClick={store.ds1.setSelectedCluster}/>
                            </StoreProvider>
                        </Grid>
                        <Grid item xs={2}>
                            <StoreProvider store={store.ds2}>
                                <Bars clusterNames={store.clusterNames} colorScale={store.colorScale}
                                      conditions={props.conditions} maxValue={maxCluster}
                                      width={width / 2} height={height}/>
                            </StoreProvider>
                        </Grid>
                    </Grid>

                </Grid>
            </Grid>
        </div>

    );
});

NIVis.propTypes = {
    conditions: PropTypes.arrayOf(PropTypes.string).isRequired,
    isVisible: PropTypes.bool.isRequired,
};
export default NIVis;