'use strict';

const conn = require('./lib/connectMongoose');

const Anuncio = require('./models/Anuncio');

const Tag = require('./models/Tag');

conn.once('open', async() => {
    try {
        await initAnuncios();
        await initTags();
        conn.close();
    } catch (err) {
        console.error('ha habido un fallo, por favor, reinicie la aplicación:', err);
        process.exit(1);
    }
});

async function initAnuncios() {
    const date = new Date();
    const detailLoren = "Si estás desarrollando un servicio que se va haciendo popular o los niveles de acceso a base de datos son cada vez más altos, empezarás a notar que tu base de datos está siendo atacada por un tráfico creciente y tu servidor esté sufriendo por los altos niveles de stress y te podrías ver en la necesidad de actualizar tu infraestructura para soportar la demanda";
    await Anuncio.deleteMany();
    await Anuncio.insertMany([
        { name: 'Bicicleta eléctrica Rodars 1000W', sell: true, price: 230.15, photo: 'bicicleta-rodars-1000W.jpg', tags: ['lifestyle', 'motor'], detail: detailLoren, createdAt: date, updatedAt: date },
        { name: 'iPhone 11Pro', sell: true, price: 50.00, photo: 'iPhone-11-pro.jpg', tags: ['lifestyle', 'mobile'], detail: detailLoren, createdAt: date, updatedAt: date },
        { name: 'Aston Martin DBS', sell: true, price: 225630.55, photo: 'aston-martin-dbs.jpg', tags: ['lifestyle', 'motor'], detail: detailLoren, createdAt: date, updatedAt: date },
    ]);
}


async function initTags() {
    await Tag.deleteMany();
    await Tag.insertMany([
        { name: 'lifestyle' },
        { name: 'mobile' },
        { name: 'motor' },
    ]);
}