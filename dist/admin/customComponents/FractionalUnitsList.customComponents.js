import React from "react";
const FractionalUnitsList = ({ record }) => {
    const selectedUnits = record?.params?.SubscribeToFractionsOfProject214 || [];
    const availableUnits = record?.params?.availableFractionalUnits || [];
    return (React.createElement("div", null,
        React.createElement("h3", null, "Selected Fractional Units"),
        selectedUnits.length > 0 ? (React.createElement("ul", null, selectedUnits.map((unit, index) => (React.createElement("li", { key: index },
            unit.fractionalUnitName,
            " - $",
            unit.fractionUnitSalesPrice))))) : (React.createElement("p", null, "No units selected.")),
        React.createElement("h3", null, "Available Fractional Units"),
        availableUnits.length > 0 ? (React.createElement("ul", null, availableUnits.map((unit, index) => (React.createElement("li", { key: index },
            unit.fractionalUnitName,
            " - $",
            unit.fractionUnitSalesPrice))))) : (React.createElement("p", null, "No available units."))));
};
export default FractionalUnitsList;
