class ApiClient {
    async getDashboard() {
        try {
            const response = await fetch('/api/dashboard');
            if (!response.ok) {
                throw new Error('Failed to fetch data from the server');
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
}
export default ApiClient;
