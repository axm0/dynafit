import axios from 'axios';
/*
//Url for cloudfront:
const api = axios.create({
    baseURL: 'https://dgby0smavkgb3.cloudfront.net/'
});
*/

//Url for local testing:
const api = axios.create({
    baseURL: 'http://localhost:5000/'
});


export default api;