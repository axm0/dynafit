import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3002/'
//    baseURL: 'https://dgby0smavkgb3.cloudfront.net/'
});

export default api;