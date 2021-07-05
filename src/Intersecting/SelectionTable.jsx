import {observer} from "mobx-react";
import React from "react";

import {IconButton, TableBody, TableContainer, TableHead, TableRow} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import {useStore} from "../Stores/RootStore";
import CloseIcon from "@material-ui/icons/Close"
import Paper from "@material-ui/core/Paper";


const SelectionTable = observer((props) => {
    const store = useStore();
    const width = 100;
    const height = 30;

    const rows = store.selectedIntersections.map(intersection => {
        return (<TableRow key={intersection}>
            <TableCell>
                <svg width={width} height={height}>
                    <rect height={height} width={width} fill={props.colorScale(intersection[1])}/>
                    <polygon
                        points={"0,0 " + width / 3 + ",0 " + width / 3 * 2 + "," + height / 2 + " " + width / 3 + "," + height + " 0," + height}
                        fill={props.colorScale(intersection[0])} strokeWidth={1} stroke={"white"}/>
                </svg>
            </TableCell>
            <TableCell>{store.intersectionSizes[intersection]}</TableCell>
            <TableCell>{Math.round(store.intersectionSizes[intersection] / store.genes.length * 100) + "%"}</TableCell>
            <TableCell padding="none">
                <IconButton onClick={() => store.handleIntersectionSelection(intersection)}>
                    <CloseIcon/>
                </IconButton>
            </TableCell>
        </TableRow>)
    })
    return (
        <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell>From - To</TableCell>
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

SelectionTable.propTypes = {};
export default SelectionTable;