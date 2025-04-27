import React, { useState, useEffect } from 'react';

const UnitSelectionComponent = ({ record, property, availableUnits }) => {
  const [selectedUnits, setSelectedUnits] = useState([]);

  // Load previously selected units from the record (if editing)
  useEffect(() => {
    if (record.params[property.name]) {
      setSelectedUnits(record.params[property.name]);
    }
  }, [record, property.name]);

  const handleSelectUnit = (unit) => {
    setSelectedUnits((prev) => {
      if (prev.includes(unit.fractionalUnitID)) {
        return prev.filter((id) => id !== unit.fractionalUnitID);
      } else {
        return [...prev, unit.fractionalUnitID];
      }
    });
  };

  // Update the record with the selected units
  useEffect(() => {
    record.params[property.name] = selectedUnits;
  }, [selectedUnits, record, property.name]);

  return (
    <div>
      <h3>Available Fractional Units</h3>
      {availableUnits.map((unit) => (
        <div key={unit.fractionalUnitID}>
          <label>
            <input
              type="checkbox"
              checked={selectedUnits.includes(unit.fractionalUnitID)}
              onChange={() => handleSelectUnit(unit)}
            />
            {unit.fractionalUnitName} - {unit.fractionUnitSalesPrice}
          </label>
        </div>
      ))}
      <h4>Selected Units: {selectedUnits.length}</h4>
    </div>
  );
};

export default UnitSelectionComponent;