import axios from "axios";

// Backend server
export const BASE_URL = "http://localhost:8080";        

// Create an Axios instance pre-configured with base settings
const clientServer = axios.create({
  baseURL: BASE_URL,  // Use the backend API base URL
  headers: {
    "Content-Type": "application/json" // Default content type for requests
  }
});

// Export the Axios instance for use across the application
export default clientServer;