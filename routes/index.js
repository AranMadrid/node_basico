'use strict'

var express = require('express');
var router = express.Router();
const api = require('./../public/javascripts/apiCalls');
const { getAds, getTags } = api();

const { query, check, validationResult } = require('express-validator');

router.get('/', async function(req, res, next) {
    try {
        const queryparams = req.url;
        const sell = req.query.sell;
        const price = req.query.price;
        let isIncorrect = false;

        if (typeof sell !== 'undefined') {
            if (sell !== 'true' && sell !== 'false' && sell !== '1' && sell !== '0') {
                isIncorrect = true;
            }
        }
        if (typeof price !== 'undefined') {
            const regExpNumbers = new RegExp(/^[0-9]+(.[0-9]+)?$/);
            const rango = price.split('-');
            if (rango.length === 1) {
                if (!(regExpNumbers.test(price)) || price.indexOf(',') !== -1)
                    isIncorrect = true;
            } else if (rango.length === 2) {
                if (price.startsWith('-', 0)) {
                    if (!(regExpNumbers.test(rango[1])) || rango[1].indexOf(',') !== -1)
                        isIncorrect = true;
                } else {
                    if (!rango[1]) {
                        if (!(regExpNumbers.test(rango[0])) || rango[0].indexOf(',') !== -1)
                            isIncorrect = true;
                    } else {
                        if (!(regExpNumbers.test(rango[0])) || rango[0].indexOf(',') !== -1 || !(regExpNumbers.test(rango[1])) || rango[1].indexOf(',') !== -1)
                            isIncorrect = true;
                    }
                }
            } else {
                isIncorrect = true;
            }
        }

        let ads;
        if (isIncorrect) {
            ads = [];
        } else {
            ads = await getAds(queryparams);
        }

        const tags = await getTags("?distinct=name");


        res.render('index', {
            title: 'NodePOP',
            data: [ads, tags],
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;