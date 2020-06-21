'use strict';

const express = require('express');
const router = express.Router();

const Anuncio = require('../../../models/Anuncio');

const { query, check, validationResult } = require('express-validator');

router.get('/', async(req, res, next) => {
    try {
        const name = req.query.name;
        const sell = req.query.sell;
        const price = req.query.price;
        const tags = req.query.tags;
        const limit = parseInt(req.query.limit || 100);
        const skip = parseInt(req.query.skip);
        const sort = req.query.sort;
        let fields = req.query.fields;
        let filter = {};
        let isIncorrectPrice = false;

        (typeof fields === 'undefined') ? fields = '-__v': fields = '-__v';

        if (typeof name !== 'undefined') {
            filter.name = { $regex: '^' + name, $options: 'i' };
        }

        if (typeof sell !== 'undefined') {
            if (sell !== 'true' && sell !== 'false' && sell !== '1' && sell !== '0') {
                const err = new Error('valor boolean (true or false).');
                err.status = 422;
                next(err);
                return;
            }
            filter.sell = sell;
        }

        if (typeof price !== 'undefined') {
            const regExpNumbers = new RegExp(/^[0-9]+(.[0-9]+)?$/);
            const rango = price.split('-');
            if (rango.length === 1) {
                (regExpNumbers.test(price) && price.indexOf(',') === -1) ? filter.price = parseFloat(price): isIncorrectPrice = true;
            } else if (rango.length === 2) {
                if (price.startsWith('-', 0)) {
                    (regExpNumbers.test(rango[1]) && rango[1].indexOf(',') === -1) ? filter.price = { $lte: parseFloat(rango[1]) }: isIncorrectPrice = true;
                } else {
                    if (!rango[1]) {
                        (regExpNumbers.test(rango[0]) && rango[0].indexOf(',') === -1) ? filter.price = { $gte: parseFloat(rango[0]) }: isIncorrectPrice = true;
                    } else {
                        ((regExpNumbers.test(rango[0]) && rango[0].indexOf(',') === -1) && (regExpNumbers.test(rango[1]) && rango[1].indexOf(',') === -1)) ? filter.price = { $gte: parseFloat(rango[0]), $lte: parseFloat(rango[1]) }: isIncorrectPrice = true;
                    }
                }
            } else {
                isIncorrectPrice = true;
            }
        }


        if (typeof tags !== 'undefined') { //if (tags) {
            let arrayTags;
            if (tags.indexOf(' ') != -1)
                arrayTags = tags.split(' ');
            else if (tags.indexOf(',') != -1)
                arrayTags = tags.split(',');
            else
                arrayTags = tags;
            filter.tags = { "$in": arrayTags };
        }

        if (isIncorrectPrice) {

            const err = new Error('introduce números.');
            err.status = 422;
            next(err);
            return;
        }

        const docs = await Anuncio.lista(filter, limit, skip, sort, fields);
        res.json(docs);

    } catch (err) {
        next(err);
    }
});

router.get('/:id', async(req, res, next) => {
    try {
        const _id = req.params.id;
        const regExpIsIDMongoDB = new RegExp("^[0-9a-fA-F]{24}$");
        let anuncio;
        if (regExpIsIDMongoDB.test(_id))
            anuncio = await Anuncio.findOne({ _id: _id });
        if (!anuncio) {

            const err = new Error('Not found');
            err.status = 404;
            next(err);
            return;
        }
        res.json({ result: anuncio });
    } catch (err) {
        next(err);
    }
});

router.post('/', [
        check('name').isString().withMessage('should be string'),
        check('sell').isBoolean().withMessage('should be boolean'),
        check('price').isNumeric().withMessage('should be numeric'),
        check('photo').isString().withMessage('should be string'),
        check('detail').isString().withMessage('should be string'),
    ],
    async(req, res, next) => {
        try {
            validationResult(req).throw();

            let anuncioData = req.body;
            const tags = req.body.tags;
            const sell = req.body.sell;
            const price = req.body.price;
            let failure = false;

            const RegexImageExtension = RegExp("\.(gif|jpe?g|tiff|png|webp|bmp)$");
            if (!(RegexImageExtension.test(req.body.photo.toLowerCase()))) {
                const err = new Error(`Not valid (${req.body.photo}). The allowed extensions for photo are: gif|jpg|jpeg|tiff|png|webp|bmp`);
                err.status = 422;
                next(err);
                return;
            }

            if (sell !== 'true' && sell !== 'false' && sell !== '1' && sell !== '0') {
                const err = new Error('The sell should be boolean (true or false).');
                err.status = 422;
                next(err);
                return;
            }

            const regExpNumbers = new RegExp(/^[0-9]+(.[0-9]+)?$/);
            if (!(regExpNumbers.test(price)) || price.indexOf(',') !== -1) {
                const err = new Error('The price should be numeric.');
                err.status = 422;
                next(err);
                return;
            }

            if (typeof tags !== 'undefined') {
                const tagsPermitidos = ["lifestyle", "motor", "mobile", "work"];
                if (typeof tags !== 'object') {
                    if (tags !== tagsPermitidos[0] && tags !== tagsPermitidos[1] && tags !== tagsPermitidos[2] && tags !== tagsPermitidos[3])
                        failure = true;
                } else {
                    tags.forEach(tag => {
                        if (tag !== tagsPermitidos[0] && tag !== tagsPermitidos[1] && tag !== tagsPermitidos[2] && tag !== tagsPermitidos[3])
                            failure = true;
                    });
                }
            } else
                failure = true;

            if (failure) {
                const err = new Error(`Not valid (${tags}). The allowed values for tags are: 'lifestyle', 'motor', 'mobile', 'work'`);
                err.status = 422;
                next(err);
                return;
            }

            const date = new Date();
            anuncioData.createdAt = date;
            anuncioData.updatedAt = date;


            const anuncio = new Anuncio(anuncioData);
            const anuncioGuardado = await anuncio.save();

            res.status(201).json({ result: anuncioGuardado });
        } catch (err) {
            next(err);
        }
    });

router.put('/:id', async(req, res, next) => {
    try {
        const _id = req.params.id;
        const anuncioData = req.body;
        const photo = req.body.photo;
        const price = req.body.price;
        const sell = req.body.sell;

        if (typeof photo !== 'undefined') {
            const RegexImageExtension = RegExp("\.(gif|jpe?g|tiff|png|webp|bmp)$");
            if (!(RegexImageExtension.test(req.body.photo.toLowerCase()))) {
                const err = new Error(`Not valid (${req.body.photo}). The allowed extensions for photo are: gif|jpg|jpeg|tiff|png|webp|bmp`);
                err.status = 422;
                next(err);
                return;
            }
        }

        if (typeof sell !== 'undefined') {
            if (sell !== 'true' && sell !== 'false' && sell !== '1' && sell !== '0') {
                boolean
                const err = new Error('The sell should be boolean (true or false).');
                err.status = 422;
                next(err);
                return;
            }
        }

        if (typeof price !== 'undefined') {
            const regExpNumbers = new RegExp(/^[0-9]+(.[0-9]+)?$/);
            if (!(regExpNumbers.test(price)) || price.indexOf(',') !== -1) {
                const err = new Error('The price should be numeric.');
                err.status = 422;
                next(err);
                return;
            }
        }

        const tags = req.body.tags;
        let failure = false;
        if (typeof tags !== 'undefined') {
            const tagsPermitidos = ["lifestyle", "motor", "mobile", "work"];
            if (typeof tags !== 'object') {
                if (tags !== tagsPermitidos[0] && tags !== tagsPermitidos[1] && tags !== tagsPermitidos[2] && tags !== tagsPermitidos[3])
                    failure = true;
            } else {
                tags.forEach(tag => {
                    if (tag !== tagsPermitidos[0] && tag !== tagsPermitidos[1] && tag !== tagsPermitidos[2] && tag !== tagsPermitidos[3])
                        failure = true;
                });
            }
        }

        if (failure) {
            const err = new Error(`Not valid (${tags}). The allowed values for tags are: 'lifestyle', 'motor', 'mobile', 'work'`);
            err.status = 422;
            next(err);
            return;
        }

        const date = new Date();
        anuncioData.updatedAt = date;

        const anuncioActualizado = await Anuncio.findOneAndUpdate({ _id: _id }, anuncioData, {
            new: true,
            useFindAndModify: false,
        });

        res.status(200).json({ result: anuncioActualizado });
    } catch (err) {
        next(err);
    }
});


router.delete('/:id', async(req, res, next) => {
    try {
        const _id = req.params.id;
        await Anuncio.deleteOne({ _id: _id });
        res.json();
    } catch (err) {
        next(err);
    }
});

module.exports = router;