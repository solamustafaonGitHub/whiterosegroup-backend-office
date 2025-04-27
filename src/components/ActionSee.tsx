// Define React component to display the purchase order details & the transaction table.
import React, {FC, useEffect, useState} from 'react';
import {Box, Header, Button, Loader} from '@adminjs/design-system';
import {useNavigate, useParams} from 'react-router-dom';
import {ApiClient} from 'adminjs';

const api = new ApiClient(); // Create an instance of the API client

const ActionSee: FC = () => {
  const {recordId} = useParams<{recordId:string}>(); // Retrieve the record ID from the URL
  const [record, setRecord] = useState<any>(null); // State to store the record details
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate(); // Hook to navigate to a different page

  // Fetch the record data when the component mounts
  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        const response = await api.recordAction({
          actionName: 'exportToPDF', // The action you want to perform on the record
          resourceId: 'PurchaseOrder', // Replace with your actual resource ID
          recordId: recordId!, // The record ID from the URL
        });

        setRecord(response.data.record);
      } catch (error) {
        console.error('Error fetching record:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [recordId]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Box variant="grey">
      <Header.H3>Record Details</Header.H3>
      {/* Render record details */}
      <Box>
        {Object.entries(record?.params || {}).map(([key, value]) => (
          <Box key={key}>
            <strong>{key}:</strong> {value as string}
          </Box>
        ))}
      </Box>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </Box>
  );
};

export default ActionSee;
