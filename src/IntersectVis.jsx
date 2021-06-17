import {observer} from "mobx-react";
import React, {createRef, useCallback, useEffect, useState} from "react";
import DatasetTrends from "./Trends/DatasetTrends";
import Sankey from "./Sankey/Sankey";
import PropTypes from "prop-types";
import {StoreProvider, useStore} from "./Stores/RootStore";
import * as d3 from "d3";
import Controls from "./Controls";
import Grid from "@material-ui/core/Grid";
import SelectionTable from "./Sankey/SelectionTable";
import {Typography} from "@material-ui/core";

const IntersectVis = observer((props) => {
    const store = useStore();
    const mainVis = createRef();
    const [width, setWidth] = useState(1000);
    const colorScale = d3.scaleOrdinal().domain(store.clusterNames).range(d3.schemeCategory10);
    const height = 800;
    const changeWidth = useCallback(() => {
        if (mainVis.current != null) {
            setWidth(mainVis.current.getBoundingClientRect().width)
        }
    }, [mainVis]);
    useEffect(() => {
        changeWidth()
        window.addEventListener("resize", changeWidth);
    }, [mainVis]);

    return (
        <div style={{padding: 10}}>
            <Grid container spacing={3}>
                <Grid item xs={3}>
                    <Controls/>
                    {store.selectedIntersections.length > 0 ?
                        <div>
                            <Typography>Selection</Typography>
                            <SelectionTable colorScale={colorScale}/>
                        </div> : null}
                </Grid>
                <Grid item xs={9}>
                    <div ref={mainVis}>
                        <p>
                            {"Concordant genes: " + Math.round(store.concordantDiscordant.concordant / store.genes.length * 100)
                            + "% (" + store.concordantDiscordant.concordant
                            + ") Discordant genes: " + Math.round(store.concordantDiscordant.discordant / store.genes.length * 100)
                            + "% (" + store.concordantDiscordant.discordant + ")"}
                        </p>
                        <svg width={width} height={height}>
                            <g>
                                <StoreProvider store={store.ds1}>
                                    <DatasetTrends clusterNames={store.clusterNames} colorScale={colorScale}
                                                   conditions={props.conditions}
                                                   minValue={store.minValue}
                                                   maxValue={store.maxValue}
                                                   plotType={store.plotType}
                                                   width={width / 4} height={height}/>
                                </StoreProvider>
                            </g>
                            <g transform={"translate(" + width / 4 + ",0)"}>
                                <Sankey width={width / 2} height={height} colorScale={colorScale}/>
                            </g>
                            <g transform={"translate(" + width * 3 / 4 + ",0)"}>
                                <StoreProvider store={store.ds2}>
                                    <DatasetTrends clusterNames={store.clusterNames} colorScale={colorScale}
                                                   conditions={props.conditions}
                                                   minValue={store.minValue}
                                                   maxValue={store.maxValue}
                                                   plotType={store.plotType}
                                                   width={width / 4} height={height}/>
                                </StoreProvider>
                            </g>
                        </svg>
                    </div>
                </Grid>
            </Grid>
        </div>

    );
});

IntersectVis.propTypes = {
    conditions: PropTypes.arrayOf(PropTypes.string).isRequired,
};
export default IntersectVis;