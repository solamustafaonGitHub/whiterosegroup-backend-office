import React from 'react';

const FractionalUnitsList = ({record, fractionalUnits}) => {
    return (
        <div>
            <h2>Fractional Units for {record.params.projectName}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Unit ID</th>
                        <th>Unique Identifier</th>
                        <th>Sales Price</th>
                        <th>Sales Tag</th>
                    </tr>
                </thead>
                <tbody>
                    {fractionalUnits.map((unit) => (
                        <tr key={unit.fractionalUnitID}>
                            <td>{unit.fractionalUnitID}</td>
                            <td>{unit.fractionalUnitUniqueIdentifier}</td>
                            <td>{unit.fractionUnitSalesPrice}</td>
                            <td>{unit.fractionalUnitSalesTag}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FractionalUnitsList;