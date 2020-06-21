'use strict';

const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
    name: String,
});


tagSchema.statics.lista = function(filter, limit, skip, sort, fields, distinct) {

    const query = Tag.find(filter);
    query.limit(limit);
    query.skip(skip);
    query.sort(sort);
    query.select(fields);
    query.distinct(distinct);
    return query.exec();
};

const Tag = mongoose.model('Tag', tagSchema);


module.exports = Tag;