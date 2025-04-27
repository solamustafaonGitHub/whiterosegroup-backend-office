"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Define React component to display the purchase order details & the transaction table.
const react_1 = __importStar(require("react"));
const design_system_1 = require("@adminjs/design-system");
const react_router_dom_1 = require("react-router-dom");
const adminjs_1 = require("adminjs");
const api = new adminjs_1.ApiClient(); // Create an instance of the API client
const ActionSee = () => {
    const { recordId } = (0, react_router_dom_1.useParams)(); // Retrieve the record ID from the URL
    const [record, setRecord] = (0, react_1.useState)(null); // State to store the record details
    const [loading, setLoading] = (0, react_1.useState)(true); // Loading state
    const navigate = (0, react_router_dom_1.useNavigate)(); // Hook to navigate to a different page
    // Fetch the record data when the component mounts
    (0, react_1.useEffect)(() => {
        const fetchRecord = async () => {
            setLoading(true);
            try {
                const response = await api.recordAction({
                    actionName: 'exportToPDF', // The action you want to perform on the record
                    resourceId: 'PurchaseOrder', // Replace with your actual resource ID
                    recordId: recordId, // The record ID from the URL
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
        return <design_system_1.Loader />;
    }
    return (<design_system_1.Box variant="grey">
      <design_system_1.Header.H3>Record Details</design_system_1.Header.H3>
      {/* Render record details */}
      <design_system_1.Box>
        {Object.entries(record?.params || {}).map(([key, value]) => (<design_system_1.Box key={key}>
            <strong>{key}:</strong> {value}
          </design_system_1.Box>))}
      </design_system_1.Box>
      <design_system_1.Button onClick={() => navigate(-1)}>Go Back</design_system_1.Button>
    </design_system_1.Box>);
};
exports.default = ActionSee;
