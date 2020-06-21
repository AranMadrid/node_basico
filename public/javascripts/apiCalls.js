'use strict'

const axios = require('axios');


const API_URL_BASE = 'http://localhost:3000/api/v1';

const api = () => {
    return {
        getAds: async(search) => {
            try {
                const endpoint = `${API_URL_BASE}/anuncios${search}`;
                const response = await axios(endpoint, {
                    method: 'GET',

                });

                const results = await response.data;
                return results;
            } catch (error) {
                console.error("Error!! (getAds):", error.message);
                throw error;
            }
        },
        getTags: async(search) => {
            try {
                const endpoint = `${API_URL_BASE}/tags${search}`;
                const response = await axios(endpoint, {
                    method: 'GET',

                });

                const results = await response.data;
                return results;
            } catch (error) {
                console.error("Error!!(getTags):", error.message);
                throw error;
            }
        },
    };
};
module.exports = api;