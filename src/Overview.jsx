import axios from 'axios';
import {RootStore, StoreProvider, useStore} from "./Stores/RootStore";
import InteresectVis from "./IntersectVis";
import Button from "@material-ui/core/Button";
import React from "react";


function Overview(props) {
    const store = useStore();
    const buttons = store.comparisons.map((comparison, i) =>
        <Button onClick={()=>props.addIntersectTab(i)}>{"Comparison " + (i + 1)}</Button>
    )
    return (
        <div className="App">
            {buttons}
        </div>
    );
}

export default Overview;
