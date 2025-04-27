import React, { useEffect, useState } from "react";
const formatCurrency = (value) => {
    const formatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formattedValue = formatter.format(Math.abs(value));
    return value < 0 ? `(${formattedValue})` : formattedValue;
};
const FractionalUnitsList = ({ record, onChange }) => {
    const [selectedUnits, setSelectedUnits] = useState(record?.params?.SubscribeToFractionsOfProject214 || []);
    const [availableUnits, setAvailableUnits] = useState(record?.params?.availableFractionalUnits || []);
    useEffect(() => {
        console.log("Record Params in Component:", record?.params);
        console.log("Available Units in Component:", availableUnits);
    }, [record?.params, availableUnits]);
    const calculateTotalSalePrice = (units) => {
        return units.reduce((total, unit) => total + (unit.fractionUnitSalesPrice || 0), 0);
    };
    const handleCheckboxChange = (unit) => {
        const isSelected = selectedUnits.some((selected) => selected.fractionalUnitID === unit.fractionalUnitID);
        let updatedSelection;
        if (isSelected) {
            updatedSelection = selectedUnits.filter((selected) => selected.fractionalUnitID !== unit.fractionalUnitID);
            setAvailableUnits([...availableUnits, unit]);
        }
        else {
            updatedSelection = [...selectedUnits, unit];
            setAvailableUnits(availableUnits.filter((available) => available.fractionalUnitID !== unit.fractionalUnitID));
        }
        setSelectedUnits(updatedSelection);
        onChange("SubscribeToFractionsOfProject214", updatedSelection);
        onChange("projectFractionalUnitsTotalSalePrice", calculateTotalSalePrice(updatedSelection));
    };
    return (React.createElement("div", null,
        React.createElement("h3", null, "Selected Fractional Units"),
        selectedUnits.length > 0 ? (React.createElement("ul", null, selectedUnits.map((unit, index) => (React.createElement("li", { key: index },
            React.createElement("input", { type: "checkbox", checked: true, onChange: () => handleCheckboxChange(unit) }),
            unit.fractionalUnitName,
            " || NGN",
            formatCurrency(unit.fractionUnitSalesPrice)))))) : (React.createElement("p", null, "No Units Selected.")),
        React.createElement("h3", null, "Available Fractional Units"),
        availableUnits.length > 0 ? (React.createElement("ul", null, availableUnits.map((unit, index) => (React.createElement("li", { key: index },
            React.createElement("input", { type: "checkbox", checked: selectedUnits.some((selected) => selected.fractionalUnitID === unit.fractionalUnitID), onChange: () => handleCheckboxChange(unit) }),
            unit.fractionalUnitName,
            " || NGN",
            formatCurrency(unit.fractionUnitSalesPrice)))))) : (React.createElement("p", null, "No Available Units.")),
        React.createElement("h3", null, "Total Sale Price"),
        React.createElement("p", null,
            "NGN",
            formatCurrency(calculateTotalSalePrice(selectedUnits)))));
};
export default FractionalUnitsList;
