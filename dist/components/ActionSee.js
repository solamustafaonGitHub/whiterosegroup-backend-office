import React, { useEffect, useState } from 'react';
import { Box, Header, Button, Loader } from '@adminjs/design-system';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiClient } from 'adminjs';
const api = new ApiClient();
const ActionSee = () => {
    const { recordId } = useParams();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchRecord = async () => {
            setLoading(true);
            try {
                const response = await api.recordAction({
                    actionName: 'exportToPDF',
                    resourceId: 'PurchaseOrder',
                    recordId: recordId,
                });
                setRecord(response.data.record);
            }
            catch (error) {
                console.error('Error fetching record:', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchRecord();
    }, [recordId]);
    if (loading) {
        return React.createElement(Loader, null);
    }
    return (React.createElement(Box, { variant: "grey" },
        React.createElement(Header.H3, null, "Record Details"),
        React.createElement(Box, null, Object.entries(record?.params || {}).map(([key, value]) => (React.createElement(Box, { key: key },
            React.createElement("strong", null,
                key,
                ":"),
            " ",
            value)))),
        React.createElement(Button, { onClick: () => navigate(-1) }, "Go Back")));
};
export default ActionSee;
