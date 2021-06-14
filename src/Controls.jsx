import {observer} from "mobx-react";
import React from "react";
import Form from 'react-bootstrap/Form';
import Col from "react-bootstrap/Col";


const Controls = observer((props) => {
    return (
        <Form>
            <fieldset>
                <Form.Group as={Form.Row}>
                    <Form.Label as="legend" column sm={2}>
                        Trend visualization
                    </Form.Label>
                    <Col sm={10}>
                        <Form.Check
                            type="radio"
                            label="Centroid Profile Plots"
                            checked={props.plotType === "centroid"}
                            onChange={() => props.setPlotType("centroid")}
                        />
                        <Form.Check
                            type="radio"
                            label="Profile Plots"
                            checked={props.plotType === "profile"}
                            onChange={() => props.setPlotType("profile")}
                        />
                        <Form.Check
                            type="radio"
                            checked={props.plotType === "radio"}
                            label="Box Plots"
                            onChange={() => props.setPlotType("box")}
                        />
                    </Col>
                </Form.Group>
            </fieldset>
        </Form>


    );
});

Controls.propTypes = {};
export default Controls;