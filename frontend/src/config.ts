export const apiUrl = 'https://canabacoafiestas-production.up.railway.app/api';
//export const apiUrl = 'http://localhost:3000/api';
// Configuración de Axios
export const axiosConfig = {
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
}; 