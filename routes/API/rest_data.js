const axios = require('axios');
const qs = require('qs');

const fetchEntities = endpoint => {
    return getToken(endpoint).then(response => {

        if (typeof response.error !== 'undefined'){
            return {error: true};
        }

        const {data} = response;
        const {access_token} = data;

        const opts = {
            url: endpoint.entities_url,
            method: 'GET',
            timeout: process.env.TIMEOUT_DATA || 4000,
            /*params: {
                access_token: access_token,
            },*/
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            json: true
        };

        return axios(opts).then( response => {
            const entities = response.data;
            return entities.map(e => {
                e.supplier_id = endpoint.supplier_id;
                return e;
            });
        });
    });
};

const getToken = endpoint => {

    const opts = {
        url: endpoint.token_url,
        method: 'post',
        timeout: process.env.TIMEOUT_TOKEN || 2000,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': "Basic " + Buffer.from(`${endpoint.client_id}:${endpoint.client_secret}`).toString('base64')
        },
        data: qs.stringify({
            grant_type: 'password',
            username: endpoint.username,
            password: endpoint.password,
            client_id: endpoint.client_id,
            client_secret: endpoint.client_secret,
            scope:  endpoint.scope
        }),
        json: true
    };

    return axios(opts).catch(e => {
        console.log(e);
        return {error: true};
    });
};

const fetchData = (endpoint, options) => {
    return getToken(endpoint).then(response => {

        if (typeof response.error !== 'undefined'){
            return {
                supplier_name: endpoint.supplier_name,
                supplier_id: endpoint.supplier_id,
                levels: endpoint.levels,
                error: true
            };
        }

        const {data} = response;
        const {access_token} = data;

        let opts = {
            url: endpoint.url,
            method: 'post',
            timeout: process.env.TIMEOUT_DATA || 4000,
            /*params: {
                access_token: access_token
            },*/
            headers: {
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json'
            },
            data: options,
            json: true
        };

        //console.log(opts);

        return axios(opts).then( request => {
            let {data} = request;
            data.supplier_name = endpoint.supplier_name;
            data.supplier_id = endpoint.supplier_id;
            data.levels = endpoint.levels;
            data.endpoint_type = endpoint.type;
            return data;
        }).catch(e => {
            console.log(e);
            return {
                supplier_name: endpoint.supplier_name,
                supplier_id: endpoint.supplier_id,
                levels: endpoint.levels,
                error: true
            };
        });
    });
};

module.exports = {
    fetchData,
    fetchEntities
};