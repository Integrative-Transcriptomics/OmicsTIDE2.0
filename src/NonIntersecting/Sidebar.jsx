import {observer} from "mobx-react";
import React from "react";
import {useStore} from "../Stores/RootStore";
import Controls from "../Controls";
import SelectionTable from "./SelectionTable";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PropTypes from "prop-types";
import GeneSearch from "../GeneSearch";


const Sidebar = observer((props) => {
    const store = useStore();

    return (
        <div style={{padding: 10}}>
            <Accordion expanded={store.uiStore.controlsExpanded}
                       onChange={() => store.uiStore.setControlsExpanded(!store.uiStore.controlsExpanded)}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>Controls</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Controls viewID={props.viewID}/>
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={store.uiStore.searchExpanded}
                       onChange={() => store.uiStore.setSearchExpanded(!store.uiStore.searchExpanded)}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>Search</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <GeneSearch filteredGenes={store.filteredGenes}
                                setSearchGenes={(genes) => store.setSearchGenes(genes)}/>
                </AccordionDetails>
            </Accordion>
            {store.ds1.selectedClusters.length > 0 || store.ds2.selectedClusters.length > 0 ?
                <Accordion expanded={store.uiStore.selectionExpanded}
                           onChange={() => store.uiStore.setSelectionExpanded(!store.uiStore.selectionExpanded)}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>Selection</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <SelectionTable colorScale={store.colorScale}/>
                        <Button variant="contained" endIcon={<OpenInNewIcon/>}
                                onClick={() => {
                                    props.analyzeDetail(store.comparison.index, store.ds1.geneSelection, store.ds2.geneSelection)
                                    store.clearSelection();
                                }}>Start
                            detailed analysis</Button>
                    </AccordionDetails>
                </Accordion>
                : null}
        </div>

    );
});

Sidebar.propTypes = {
    analyzeDetail: PropTypes.func.isRequired,
    viewID: PropTypes.string.isRequired,
};
export default Sidebar;