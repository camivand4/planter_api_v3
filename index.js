require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const https = require('https');

const key = fs.readFileSync('./private.key');
const cert = fs.readFileSync('./certificate.crt');

const port = 3000;

const cred = {
    key,
    cert
}

const app = express();
const devices = [
    {
        "id": 'test',
        "userId": "hiylW4UeGDbbjNAV648RZ1w0udw1",
        "name": "Device 2",
        "plant": "Plant A",
        "humidity": 60,
        "wateringTime": "10:00 AM"
    }

];

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    const allowedOrigin = process.env.URL;

    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    if ((req.method === 'POST' || req.method === 'DELETE' || req.method === 'PUT') && req.header('Origin') !== allowedOrigin) {
        return res
            .status(403)
            .json({error: 'Forbidden'});
    }

    next();
});

app.get('/devices/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const userDevices = devices.filter((device) => device.userId === userId);
    res.json(userDevices);
});

app.get('/devices/:deviceId', (req, res) => {
    const deviceId = req.params.deviceId;
    const device = devices.find((device) => device.id === deviceId);

    if (device) {
        res.json(device);
    } else {
        res
            .status(404)
            .json({error: 'Device not found'});
    }
});

app.delete('/devices/:deviceId', (req, res) => {
    const deviceId = req.params.deviceId;
    const deviceIndex = devices.findIndex((device) => device.id === deviceId);

    if (deviceIndex !== -1) {
        devices.splice(deviceIndex, 1);
        res.json({message: `Device with ID ${deviceId} deleted successfully.`});
    } else {
        res
            .status(404)
            .json({error: 'Device not found'});
    }
});

app.put('/devices/:deviceId', (req, res) => {
    const deviceId = req.params.deviceId;
    const deviceIndex = devices.findIndex((device) => device.id === deviceId);

    if (deviceIndex !== -1) {
        const updatedDevice = req.body;
        devices[deviceIndex] = {
            ...devices[deviceIndex],
            ...updatedDevice
        };
        res.json({message: `Device with ID ${deviceId} updated successfully.`});
    } else {
        res
            .status(404)
            .json({error: 'Device not found'});
    }
});

app.get('/devices', (req, res) => {
    res.json(devices);
});

app.post('/devices', (req, res) => {
    const newDevice = req.body;
    devices.push(newDevice);
    res
        .status(201)
        .json(newDevice);
});

app.listen(port, () => {
    console.log(`Listening on ${port} acess from ${process.env.URL}`);
});

const httpsServer = https.createServer(cred, app)
httpsServer.listen(8443)