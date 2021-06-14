import {observer} from "mobx-react";
import React, {useState} from "react";
import DatasetTrends from "./Trends/DatasetTrends";
import Sankey from "./Sankey/Sankey";
import PropTypes from "prop-types";
import {StoreProvider, useStore} from "./Stores/RootStore";
import * as d3 from "d3";
import Controls from "./Controls";

const IntersectVis = observer((props) => {
    const store = useStore();
    const [plotType, setPlotType] = useState("centroid")
    const colorScale = d3.scaleOrdinal().domain(store.clusterNames).range(d3.schemeCategory10);
    const width = 1000;
    const height = 800;

    return (
        <div>
            <Controls plotType={plotType} setPlotType={setPlotType}/>
            <svg width={props.width} height={props.height}>
                <g>
                    <StoreProvider store={store.ds1}>
                        <DatasetTrends clusterNames={store.clusterNames} colorScale={colorScale}
                                       conditions={props.conditions}
                                       minValue={store.minValue}
                                       maxValue={store.maxValue}
                                       plotType={plotType}
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
                                       plotType={plotType}
                                       width={width / 4} height={height}/>
                    </StoreProvider>
                </g>
            </svg>
        </div>

    );
});

IntersectVis.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    conditions: PropTypes.arrayOf(PropTypes.string).isRequired,
};
export default IntersectVis;