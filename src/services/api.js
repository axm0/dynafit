import axios from 'axios';
/*
const api = axios.create({
    baseURL: 'http://dynafitbackend.us-east-1.elasticbeanstalk.com/'
});

*/
const api = axios.create({
    baseURL: 'http://localhost:5000/'
});

export default api;
