import React, {useEffect, useState} from "react";
import {BasePropertyProps} from "adminjs";

//Function to format currency values
const formatCurrency = (value) => {
  const formatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedValue = formatter.format(Math.abs(value));
  return value < 0 ? `(${formattedValue})` : formattedValue;
};

const FractionalUnitsList: React.FC<BasePropertyProps> = ({ record, onChange }) => {
  const [selectedUnits, setSelectedUnits] = useState(record?.params?.SubscribeToFractionsOfProject214 || []);
  const [availableUnits, setAvailableUnits] = useState(record?.params?.availableFractionalUnits || []);
  useEffect(() => {
    console.log("Record Params in Component:", record?.params);
    console.log("Available Units in Component:", availableUnits);
  }, [record?.params, availableUnits]);

  //Calculate total sale price
  const calculateTotalSalePrice = (units) => {
    return units.reduce((total, unit) => total + (unit.fractionUnitSalesPrice || 0), 0);
  };

  //Handle checkbox selection
  const handleCheckboxChange = (unit) => {
    const isSelected = selectedUnits.some((selected) => selected.fractionalUnitID === unit.fractionalUnitID);
    let updatedSelection;

    if (isSelected) {
      //Remove unit if already selected
      updatedSelection = selectedUnits.filter((selected) => selected.fractionalUnitID !== unit.fractionalUnitID);
      setAvailableUnits([...availableUnits, unit]); // Add back to available list
    } else {
      //Add unit if not selected
      updatedSelection = [...selectedUnits, unit];
      setAvailableUnits(availableUnits.filter((available) => available.fractionalUnitID !== unit.fractionalUnitID)); // Remove from available list
    }
    setSelectedUnits(updatedSelection);
    //Update the values in the AdminJS form
    onChange("SubscribeToFractionsOfProject214", updatedSelection);
    onChange("projectFractionalUnitsTotalSalePrice", calculateTotalSalePrice(updatedSelection));
  };

  return (
    <div>
      <h3>Selected Fractional Units</h3>
      {selectedUnits.length > 0 ? (
        <ul>
          {selectedUnits.map((unit, index) => (
            <li key={index}>
              <input type="checkbox" checked onChange={() => handleCheckboxChange(unit)} />
              {unit.fractionalUnitName} || NGN{formatCurrency(unit.fractionUnitSalesPrice)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No Units Selected.</p>
      )}

      <h3>Available Fractional Units</h3>
      {availableUnits.length > 0 ? (
        <ul>
          {availableUnits.map((unit, index) => (
            <li key={index}>
              <input
                type="checkbox"
                checked={selectedUnits.some((selected) => selected.fractionalUnitID === unit.fractionalUnitID)}
                onChange={() => handleCheckboxChange(unit)}
              />
              {unit.fractionalUnitName} || NGN{formatCurrency(unit.fractionUnitSalesPrice)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No Available Units.</p>
      )}

      <h3>Total Sale Price</h3>
      <p>NGN{formatCurrency(calculateTotalSalePrice(selectedUnits))}</p>
    </div>
  );
};

export default FractionalUnitsList;
