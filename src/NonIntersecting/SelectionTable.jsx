import {observer} from "mobx-react";
import React from "react";
import {IconButton, TableBody, TableContainer, TableHead, TableRow} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import {useStore} from "../Stores/RootStore";
import CloseIcon from "@material-ui/icons/Close"
import Paper from "@material-ui/core/Paper";


const SelectionTable = observer(() => {
    const store = useStore();
    const width = 30;
    const height = 30;
    const numGenes=store.ds1.numFilteredGenes + store.ds2.numFilteredGenes;

    let rows = store.ds1.selectedClusters.map(cluster => {
        return (<TableRow key={cluster + "1"}>
            <TableCell>
                <svg width={width} height={height}>
                    <rect height={height} width={width} fill={store.colorScale(cluster)}/>
                </svg>
            </TableCell>
            <TableCell/>
            <TableCell>{store.ds1.clusterSizes[cluster]}</TableCell>
            <TableCell>{Math.round(store.ds1.clusterSizes[cluster] / numGenes * 100) + "%"}</TableCell>
            <TableCell padding="none">
                <IconButton onClick={() => store.ds1.setSelectedCluster(cluster)}>
                    <CloseIcon/>
                </IconButton>
            </TableCell>
        </TableRow>)
    }).concat(store.ds2.selectedClusters.map(cluster => {
        return (<TableRow key={cluster + "2"}>
            <TableCell/>
            <TableCell>
                <svg width={width} height={height}>
                    <rect height={height} width={width} fill={store.colorScale(cluster)}/>
                </svg>
            </TableCell>
            <TableCell>{store.ds2.clusterSizes[cluster]}</TableCell>
            <TableCell>{Math.round(store.ds2.clusterSizes[cluster] / numGenes * 100) + "%"}</TableCell>
            <TableCell padding="none">
                <IconButton onClick={() => store.ds2.setSelectedCluster(cluster)}>
                    <CloseIcon/>
                </IconButton>
            </TableCell>
        </TableRow>)
    }));
    return (
        <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell>Left</TableCell>
                        <TableCell>Right</TableCell>
                        <TableCell>
                            Count
                        </TableCell>
                        <TableCell padding="none"/>
                        <TableCell padding="none"/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows}
                </TableBody>
            </Table>
        </TableContainer>
    );
});

export default SelectionTable;