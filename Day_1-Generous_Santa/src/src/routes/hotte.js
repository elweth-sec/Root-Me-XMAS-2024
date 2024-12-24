const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/add', async (req, res) => {
    const { product } = req.body;

    try {
        const Gift = require(`../models/${product.toLowerCase()}`);
        const gift = new Gift({ name: product, description: `Description of ${product}` });
        output = gift.store();
        res.json({ success: true, output: output });
    } catch (error) {
        res.status(500).json({ message: `Error adding the product ${product}. ${error.message}` });
    }
});

router.post('/suggest', upload.single('photo'), (req, res) => {
    const { name } = req.body;

    if (!name || !req.file) {
        return res.status(400).json({ message: 'Name and photo are required.' });
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
    const tempDir = path.join('/tmp', `${dateStr}_${timeStr}`);

    fs.mkdirSync(tempDir, { recursive: true });

    const tempPath = path.join(tempDir, req.file.originalname);

    fs.writeFile(tempPath, req.file.buffer, (err) => {
        if (err) {
            return res.status(500).json({ message: `Error saving the image: ${err.message}` });
        }
        res.json({ message: `Thank you! Santa will consider your suggestion.`, photoPath: tempPath });
    });
});

module.exports = router;
