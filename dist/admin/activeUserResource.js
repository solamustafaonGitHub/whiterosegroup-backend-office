const ActiveUserResourceOptions = {
    properties: {
        activeUserAssetDeliveryAddress: {
            type: 'textarea',
            props: {
                rows: 5,
                placeholder: 'Enter the delivery address here...',
            },
        },
    },
    actions: {
        new: { isVisible: true },
        edit: { isVisible: true },
    },
};
export default ActiveUserResourceOptions;
