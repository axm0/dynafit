// Abdul Aziz Mohammed
import axios from 'axios';

const api = axios.create({
    //baseURL: 'http://localhost:5000/'
    baseURL: 'https://dgby0smavkgb3.cloudfront.net/'
});

export default api;