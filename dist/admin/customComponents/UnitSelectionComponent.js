import React, { useState, useEffect } from 'react';
const UnitSelectionComponent = ({ record, property, availableUnits }) => {
    const [selectedUnits, setSelectedUnits] = useState([]);
    useEffect(() => {
        if (record.params[property.name]) {
            setSelectedUnits(record.params[property.name]);
        }
    }, [record, property.name]);
    const handleSelectUnit = (unit) => {
        setSelectedUnits((prev) => {
            if (prev.includes(unit.fractionalUnitID)) {
                return prev.filter((id) => id !== unit.fractionalUnitID);
            }
            else {
                return [...prev, unit.fractionalUnitID];
            }
        });
    };
    useEffect(() => {
        record.params[property.name] = selectedUnits;
    }, [selectedUnits, record, property.name]);
    return (React.createElement("div", null,
        React.createElement("h3", null, "Available Fractional Units"),
        availableUnits.map((unit) => (React.createElement("div", { key: unit.fractionalUnitID },
            React.createElement("label", null,
                React.createElement("input", { type: "checkbox", checked: selectedUnits.includes(unit.fractionalUnitID), onChange: () => handleSelectUnit(unit) }),
                unit.fractionalUnitName,
                " - ",
                unit.fractionUnitSalesPrice)))),
        React.createElement("h4", null,
            "Selected Units: ",
            selectedUnits.length)));
};
export default UnitSelectionComponent;
