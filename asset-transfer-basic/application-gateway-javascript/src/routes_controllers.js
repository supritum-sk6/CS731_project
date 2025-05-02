// File: backend/app.js (single file canvas setup)
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('node:crypto');

const { registerProviderIdentity } = require('../scripts/registerProviderIdentity');

const {
    initLedger_route,
    registerProvider_route,
    loginProvider_route,
    updateProvider_route,
    deleteProvider_route,
    addModeOfTransport_route,
    removeModeOfTransport_route,
    addTransportOption_route,
    removeTransportOption_route,
    queryProviderTransportOptions_route
} = require('./app');

// app.use(cors());
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(bodyParser.json());

app.post('/initLedger', async (req, res) => {
    try {
        const result = await initLedger_route();
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/provider/register', async (req, res) => {
    const { companyName, contactEmail, contactPhone, password } = req.body;

    const fabricResult = await registerProviderIdentity({ email: contactEmail, password });

    try {
        const result = await registerProvider_route(companyName, contactEmail, contactPhone, password);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/provider/login', async (req, res) => {
    const { contactEmail, password } = req.body;
    try {
        const result = await loginProvider_route(contactEmail, password);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }

});

app.post('/provider/update', async (req, res) => {
    const { companyName, contactEmail, contactPhone } = req.body;
    try {
        const result = await updateProvider_route(companyName, contactEmail, contactPhone);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/provider/delete', async (req, res) => {
    try {
        const result = await deleteProvider_route();
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/provider/transport/mode/add', async (req, res) => {
    const { mode } = req.body;
    try {
        const result = await addModeOfTransport_route(mode);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/provider/transport/mode/remove', async (req, res) => {
    const { mode } = req.body;
    try {
        const result = await removeModeOfTransport_route(mode);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/provider/transport/option/add', async (req, res) => {
    const { mode, source, destination, departure, arrival, price, seats } = req.body;
    try {
        const result = await addTransportOption_route(mode, source, destination, departure, arrival, price, seats);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/provider/transport/option/remove', async (req, res) => {
    const { transportId } = req.body;
    try {
        const result = await removeTransportOption_route(transportId);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/provider/transport/query', async (req, res) => {
    const { source, destination } = req.body;
    try {
        const result = await queryProviderTransportOptions_route(source, destination);
        res.json({ success: true, result });
        return result;
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
