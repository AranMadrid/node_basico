'use strict'

var express = require('express');
var router = express.Router();

const Tag = require('../models/Tag');

router.get('/', async(req, res, next) => {
    try {
        const name = req.query.name;
        const limit = parseInt(req.query.limit || 100);
        const skip = parseInt(req.query.skip);
        const sort = req.query.sort;
        let fields = req.query.fields;
        const distinct = req.query.distinct || "name";
        let filter = {};

        (typeof fields === 'undefined') ? fields = '-__v': fields = '-__v';

        if (typeof name !== 'undefined') {
            filter.name = { $regex: '^' + name, $options: 'i' };
        }
        const docs = await Tag.lista(filter, limit, skip, sort, fields, distinct);
        res.render('tags', {
            title: 'NodePOP',
            data: docs,
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;