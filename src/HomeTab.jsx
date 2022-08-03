import React from "react";
import {Button} from "@mui/material";
import abstract from "./graphical_abstract.png"
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

function HomeTab(props) {
    return <div style={{margin: 10}}>
        <Grid container spacing={2}>
            <Grid item xs={5}>
                <img src={abstract} alt="Graphical Abstract" style={{maxWidth: "100%"}}/>
            </Grid>
            <Grid item xs={7}>
                <Typography variant={"h3"}>OmicsTIDE</Typography>
                <Typography variant={"body1"}>
                    OmicsTIDE integrates numerical omics data, such as transcriptomic and proteomic data, by concatenating
                    two tables with expression labels and clustering them with k-means. As a result, each gene is associated
                    with a cluster in both data sets. The result is visualized in OmicsTIDE.
                </Typography>
                <Typography variant={"body1"}>
                    While OmicsTIDE is especially useful for integrating transcriptomic and proteomic data, it is not limited
                    to those. OmicsTIDE can compare any numerical omics data sets sharing keys, and can therefore also compare
                    two transcriptomic data sets, protemomic data sets or metabolomic data sets.
                </Typography>
                <Typography variant={"body1"}>
                    How it works:
                    <ul>
                        <li>Select two or more files or load test files. First column: Gene IDs, header "gene", Other
                            columns conditions, e.g. timepoint 1, timepoint 2, timepoint 3. Cells: expression values.
                        </li>
                        <li>Select k for k-means: K determines how many trends will be created, feel free to play with
                            different K for your data.
                        </li>
                        <li>Variance filter: Filters data by percentile of variance. Sometimes results are improved by only
                            considering highly variant genes.
                        </li>
                        <li>
                            PANTHER species selection. For functional analysis you need to select the correct species from
                            the list of available species at Panther. Your gene IDs need match those used by PANTHER.
                            Selecting the species is optional. If you do not have fitting IDs you can still conduct an
                            analysis but without functional analysis.
                        </li>
                    </ul>
                </Typography>
                <Typography variant={"body1"}>More information and contact: <a
                    href="https://tuevis.cs.uni-tuebingen.de/omicstide/">https://tuevis.cs.uni-tuebingen.de/omicstide/</a>
                </Typography>
                <Button onClick={props.jumpToLoad} variant={"contained"}>Load Data</Button>
            </Grid>
        </Grid>
    </div>
}

export default HomeTab;