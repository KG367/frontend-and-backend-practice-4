const express = require('express');
const app = express();
const port = 5000;
goods = [
    {
        id: 0,
        name: "Oleg",
        price: 100
    },
    {
        id: 1,
        name: "Хлеб",
        price: 34
    },
    {
        id: 2,
        name: "Автомобиль",
        price: "1111111111111111"
    }
]

app.use(express.json());

app.get('/goods', (req, res) => {
    res.send(goods);
});

app.get("/goods/:id", (req, res) => {
    res.send(goods.find(u => u.id == req.params.id));
});

app.post("/goods", (req, res) => {
    const { name, price } = req.body;
    let newId = Math.max(...goods.map(u => u.id)) + 1;
    goods.push({
        id: newId,
        name,
        price
    });
    res.json(newId);
});

app.patch("/goods/:id", (req, res) => {
    const { name, price } = req.body;
    const product = goods.find(u => u.id == req.params.id);

    if (name!==undefined) product.name = name;
    if (name!==undefined) product.price = price;

    res.status(201);
});

app.delete("/goods/:id", (req, res) => {
    goods = goods.filter(u => u.id != req.params.id);
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});