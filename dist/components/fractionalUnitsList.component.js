import React from 'react';
const FractionalUnitsList = ({ record, fractionalUnits }) => {
    return (React.createElement("div", null,
        React.createElement("h2", null,
            "Fractional Units for ",
            record.params.projectName),
        React.createElement("table", null,
            React.createElement("thead", null,
                React.createElement("tr", null,
                    React.createElement("th", null, "Unit ID"),
                    React.createElement("th", null, "Unique Identifier"),
                    React.createElement("th", null, "Sales Price"),
                    React.createElement("th", null, "Sales Tag"))),
            React.createElement("tbody", null, fractionalUnits.map((unit) => (React.createElement("tr", { key: unit.fractionalUnitID },
                React.createElement("td", null, unit.fractionalUnitID),
                React.createElement("td", null, unit.fractionalUnitUniqueIdentifier),
                React.createElement("td", null, unit.fractionUnitSalesPrice),
                React.createElement("td", null, unit.fractionalUnitSalesTag))))))));
};
export default FractionalUnitsList;
