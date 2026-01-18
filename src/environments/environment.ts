const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_URL = isLocalhost
  ? "http://localhost:3000/api/"
  : "https://sendit-backend-znj6.onrender.com/api";

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  mapboxToken: 'your_mapbox_token',
}; 