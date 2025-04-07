const express = require('express');
const cors = require('cors');
const  { createClient } = require('redis');
const {generate} = require('../utils/utils.js');

const app = express();
const port = 3000;
const redisClient = createClient();



const corsOptions = {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    };
app.use(cors(corsOptions));
app.use(express.json());

app.get('/createModel', (req, res) => {
    const model = generate();
    redisClient.set(model, JSON.stringify(
        {
            'layers': [],
            'createdAt': new Date().toISOString(),
            'updatedAt': new Date().toISOString(),
        }));
    res.json({model});
});

app.post('/addLayer', async (req, res) => {
    const model = req.body.model;
    const layer = req.body.layer;
    const modelData = await redisClient.get(model);
    if (!modelData) {
        return res.status(404).json({error: 'Model not found'});
    }
    const modelObj = JSON.parse(modelData);
    modelObj.layers.push(layer);
    modelObj.updatedAt = new Date().toISOString();
    redisClient.set(model, JSON.stringify(modelObj));
    res.json({model: modelObj});
});
app.get('/getModel', async (req, res) => {
    const {model} = req.query;
    const modelData = await redisClient.get(model);
    if (!modelData) {
        return res.status(404).json({error: 'Model not found'});
    }
    res.json(JSON.parse(modelData));
});

app.delete('/deleteModel', async (req, res) => {
    const {model} = req.query;
    const modelData = await redisClient.get(model);
    if (!modelData) {
        return res.status(404).json({error: 'Model not found'});
    }
    await redisClient.del(model);
    res.json({message: 'Model deleted successfully'});
});
app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`);
    await redisClient.connect();
    redisClient.on('error', (err) => console.log('Redis Client Error', err));

})

console.log("hohofsd")
