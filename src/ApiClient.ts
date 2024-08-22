class ApiClient {
    // Define a method to fetch dashboard data from the API
    async getDashboard() {
      try {
        // Make a fetch request to the API endpoint
        const response = await fetch('/api/dashboard');
  
        // Check if the response is successful
        if (!response.ok) {
          // Throw an error if the response is not ok
          throw new Error('Failed to fetch data from the server');
        }
  
        // Parse the JSON response and return the data
        return await response.json();
      } catch (error) {
        // Log and re-throw any errors that occur during the request
        console.error('Error fetching data:', error);
        throw error;
      }
    }
  }
  
  export default ApiClient;
  