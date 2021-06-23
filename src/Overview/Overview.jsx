import {useStore} from "../Stores/RootStore";
import Button from "@material-ui/core/Button";
import React from "react";
import * as d3 from 'd3';
import BarChart from "./BarChart";
import {TableContainer, TableRow, Typography} from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";


function Overview(props) {
    const store = useStore();
    const width = 300;
    let domain = ["concordant", "discordant"]
    const maxGenes = d3.max(store.comparisons.map(comparison => {
        let sum = 0;
        if (comparison.intersecting != null) {
            sum += comparison.intersecting.initialConcordantDiscordant.concordant + comparison.intersecting.initialConcordantDiscordant.discordant;
        }
        if (comparison.nonIntersecting != null) {
            sum += Object.keys(comparison.nonIntersecting.ds1.genes).length + Object.keys(comparison.nonIntersecting.ds2.genes).length;
            if (!(domain.includes(comparison.file1))) {
                domain.push(comparison.file1);
            }
            if (!(domain.includes(comparison.file2))) {
                domain.push(comparison.file2);
            }
        }
        return sum;
    }))
    const xScale = d3.scaleLinear().domain([0, maxGenes]).range([0, width]);
    const colorScale = d3.scaleOrdinal().domain(domain).range(d3.schemeCategory10)
    const buttons = store.comparisons.map((comparison, i) => {
        let barChartData = {};
        if (comparison.intersecting != null) {
            barChartData.intersecting = {};
            barChartData.intersecting.concordant = comparison.intersecting.initialConcordantDiscordant.concordant;
            barChartData.intersecting.discordant = comparison.intersecting.initialConcordantDiscordant.discordant;
        }
        if (comparison.nonIntersecting != null) {
            barChartData.nonIntersecting = {}
            barChartData.nonIntersecting[comparison.file1] = Object.keys(comparison.nonIntersecting.ds1.genes).length;
            barChartData.nonIntersecting[comparison.file2] = Object.keys(comparison.nonIntersecting.ds2.genes).length;
        }

        return (<TableRow>
            <TableCell>
                <Typography>{comparison.file1 + " - " + comparison.file2}</Typography>
            </TableCell>
            <TableCell>
                <BarChart data={barChartData} xScale={xScale} colorScale={colorScale}/>
            </TableCell>
            <TableCell>
                {comparison.intersecting != null ?
                    <Button key={i} onClick={() => props.addIntersectTab(i)}>Analyze Intersecting</Button> : null
                }
            </TableCell>
            <TableCell>
                {comparison.nonIntersecting != null ?
                    <Button key={i} onClick={() => props.addNITab(i)}>Analyze Non-Intersecting</Button> : null
                }
            </TableCell>
        </TableRow>);
    });
    const legend = colorScale.domain().map(elem => <div>
        <svg width={20} height={20}>
            <rect width={20} height={20} fill={colorScale(elem)}/>
        </svg>
        {elem}
    </div>)
    return (
        <div>
            <Typography>Comparisons</Typography>
            <TableContainer component={Paper}>
                <Table>
                    {buttons}
                </Table>
            </TableContainer>
            {legend}
        </div>
    );
}

export default Overview;
