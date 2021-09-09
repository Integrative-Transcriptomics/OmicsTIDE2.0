import {IconButton, TableContainer, TableHead} from "@material-ui/core";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Table from "@material-ui/core/Table";
import React from "react";
import TableBody from "@material-ui/core/TableBody";
import Checkbox from "@material-ui/core/Checkbox";
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';

function ComparisonTable(props) {


    const switchFiles = function (index) {
        let comparisonsCopy = props.comparisons.slice();
        comparisonsCopy[index].files = comparisonsCopy[index].files.reverse();
        props.setComparisons(comparisonsCopy);
    }
    const selectFile = function (index) {
        let comparisonsCopy = props.comparisons.slice();
        comparisonsCopy[index].selected = !comparisonsCopy[index].selected;
        props.setComparisons(comparisonsCopy);
    }
    const cells = props.comparisons.map((comparison, i) =>
        <TableRow>
            <TableCell>{comparison.files[0].slice(0,-4)}</TableCell>
            <TableCell>
                <IconButton onClick={() => switchFiles(i)}>
                    <CompareArrowsIcon/>
                </IconButton>
            </TableCell>
            <TableCell>{comparison.files[1].slice(0,-4)}</TableCell>
            <TableCell><Checkbox checked={comparison.selected} onChange={() => selectFile(i)}/>
            </TableCell>
        </TableRow>)
    return (<TableContainer>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>
                        Left
                    </TableCell>
                    <TableCell/>
                    <TableCell>
                        Right
                    </TableCell>
                    <TableCell/>
                </TableRow>

            </TableHead>
            <TableBody>
                {cells}
            </TableBody>
        </Table>
    </TableContainer>)
}

export default ComparisonTable