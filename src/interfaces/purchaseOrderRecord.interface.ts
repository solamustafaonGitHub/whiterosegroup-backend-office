export interface LocalRecordJSON {
    id: string;
    title: string;
    params: {
      [key: string]: any; // Additional parameters or data related to the record
    };
    populated: {
      [key: string]: LocalRecordJSON; // Populated relationships with other records
    };
    errors: {
      [key: string]: {
        message: string;
        type: string;
      }[];
    };
  }
  


  