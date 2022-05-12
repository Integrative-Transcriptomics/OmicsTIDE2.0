import Alert from "@material-ui/core/Alert";
import React from "react";
import {Button} from "@mui/material";

function HomeTab(props) {
    return<div>
        <Alert severity="info">
            OmicsTIDE integrates proteomics and transcriptomics data by concatenating two tables with expression
            labels and clustering them with k-means. As a result, each gene is associated with a cluster in both
            data sets. The result is visualized in OmicsTIDE.
            <br/>
            How it works:
            <ul>
                <li>Select two or more files or load test files. First column: Gene IDs, header "gene", Other
                    columns conditions, e.g. timepoint 1, timepoint 2, timepoint 3. Cells: expression values
                </li>
                <li>Select k for k-means: K determines how many trends will be created, feel free to play with
                    different K for your data.
                </li>
                <li>Variance filter: Filters data by variance. Sometimes results are improved by only
                    considering
                    highly variant genes.
                </li>
            </ul></Alert>
        <Button onClick={props.jumpToLoad} variant={"contained"}>Load Data</Button>
    </div>
}

export default HomeTab;