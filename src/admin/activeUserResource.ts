import {ResourceOptions} from 'adminjs';

const ActiveUserResourceOptions: ResourceOptions = {
  properties: {
    activeUserAssetDeliveryAddress: {
      type: 'textarea', // Make it a textarea (textbox)
      props: {
        rows: 5,
        placeholder: 'Enter the delivery address here...',
      },
    },
  },
  actions: {
    new: {isVisible: true},
    edit: {isVisible: true},
  },
};

export default ActiveUserResourceOptions;
