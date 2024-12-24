const express = require('express');
const path = require('path');
const hotteRoutes = require('./routes/hotte');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const availableProducts = [];
fs.readdirSync(path.join(__dirname, 'models')).forEach(file => {
    const modelName = path.basename(file, '.js');
    availableProducts.push(modelName);
});

app.get('/', async (req, res) => {
    try {
        const products = availableProducts.map(productName => {
            const model = require(`./models/${productName}`);
            return {
                name: model.modelName,
                description: model.schema.obj.description.default
            };
        });

        res.render('index', { products });
    } catch (err) {
        res.status(500).send('Error when displaying products');
    }
});

app.get('/suggest', (req, res) => {
    res.render('suggest');
});

app.use('/api', hotteRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
