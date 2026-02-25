const express = require('express');
const { nanoid } = require('nanoid');
const cors = require("cors");
const app = express();
const port = 3000;

// сервер очень кривой вообще, есть куча эндпоинтов которые не используются и вообще я так зае устал всё это делать. время уже 4 ночи аааа. завтра вечером закину и хватит

let products = [
    { id: nanoid(6), name: 'Чайник', category: ['Круглое', 'Греет'], desc: 'Чайник хороший металлический, греет не только чай но и душу', price: 16, quantity: 0 },
    { id: nanoid(6), name: 'Плита', category: ['Квадратное', 'Греет'], desc: 'Греет не только чай, но и всё в целом греет', price: 160, quantity: 10 },
    { id: nanoid(6), name: 'Шкаф', category: ['Квадратное', 'Хранилище', 'Деревянное'], desc: 'Шкаф большой вместительный', price: 10, quantity: 30 },
    { id: nanoid(6), name: 'Стол', category: ['Круглое', 'Деревянное'], desc: 'Стол стоит, что с него взять', price: 351, quantity: 49 },
    { id: nanoid(6), name: 'Стул', category: ['Круглое', 'Деревянное'], desc: 'Стул сидит', price: 79, quantity: 69 },
    { id: nanoid(6), name: 'Батарейки', category: ['Круглое', 'Греет'], desc: 'Вещь полезная, надо всем', price: 10, quantity: 3 },
    { id: nanoid(6), name: 'Флешка', category: ['Квадратное', 'Хранилище'], desc: 'Где же вы ещё увидите квадратную флешку. Теперь со встроенным ящиком!', price: 9, quantity: 10 },
    { id: nanoid(6), name: 'Ящик', category: ['Круглое', 'Хранилище', 'Деревянное'], desc: 'Запасной ящик для флешки', price: 10, quantity: 19 },
    { id: nanoid(6), name: 'Примогемы', category: ['Квадратное', 'Греет'], desc: 'Незнание - сила', price: 60, quantity: 7 },
    { id: nanoid(6), name: 'Название товара', category: ['Категория 1', 'Категория 2'], desc: 'Описание товара', price: 0, quantity: 0 },
    { id: nanoid(6), name: 'Альбом', category: ['Квадратное', 'Хранилище'], desc: 'То ли для фотографий, то ли музыкальный', price: 10, quantity: 7 },
]

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

// Функция-помощник для получения пользователя из списка
function findProductOr404(id, res) {
    const product = product.find(u => u.id == id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product;
}

// Функция-помощник

// POST /api/products
app.post("/api/products", (req, res) => {
    const { name, age } = req.body;
    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        age: Number(age),
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// GET /api/products
app.get("/api/products", (req, res) => {
    res.json(products);
});

// GET /api/products/:id
app.get("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;
    res.json(product);
});

// PATCH /api/products/:id
app.patch("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const product = findUserOr404(id, res);
    if (!product) return;
    // Нельзя PATCH без полей
    if (req.body?.name === undefined && req.body?.age === undefined) {
        return res.status(400).json({
            error: "Nothing to update",
        });
    }
    const { name, age } = req.body;
    if (name !== undefined) product.name = name.trim();
    if (age !== undefined) product.age = Number(age);
    res.json(product);
});

// DELETE /api/products/:id
app.delete("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const exists = products.some((u) => u.id === id);
    if (!exists) return res.status(404).json({ error: "Product not found" });
    products = products.filter((u) => u.id !== id);
    // Правильнее 204 без тела
    res.status(204).send();
});

// 404 для всех остальных маршрутов
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Глобальный обработчик ошибок (чтобы сервер не падал)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});