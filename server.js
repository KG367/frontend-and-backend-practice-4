const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");

// Подключаем Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { preinitModule } = require("react-dom");

const app = express();
const port = 3000;

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use((req, res, next) => {
    res.on("finish", () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

let users = [
    { id: nanoid(6), email: "petr@petrov.org", first_name: 'Петр', last_name: "Петров", password: bcrypt.hash("1", 10) },
    { id: nanoid(6), email: "ivan@petrov.org", first_name: 'Иван', last_name: "Иванов", password: bcrypt.hash("2", 10) },
    { id: nanoid(6), email: "ivan_petrov@petrov.org", first_name: 'Иван', last_name: "Петров", password: bcrypt.hash("3", 10) }, // 2
];

let products = [
    {
        id: nanoid(6),
        title: "Oleg",
        category: "Живое",
        description: "Универсальное существо, полезное во многих делах",
        price: 100
    },
    {
        id: nanoid(6),
        title: "Хлеб",
        category: "Вкусное",
        description: "Вкусно и полезно, многие его любят, некоторые ненавидят",
        price: 34
    },
    {
        id: nanoid(6),
        title: "Автомобиль",
        category: "Движимость",
        description: "Много ест, буквально и фигурально",
        price: 1111111111111111
    }
]

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный уникальный ID пользователя
 *           example: "abc123"
 *         email:
 *            type: string
 *            description: Почта пользователя
 *            example: "a@email.com"
 *         first_name:
 *            type: string
 *            description: Имя пользователя
 *            example: "Петр"
 *         last_name:
 *            type: string
 *            description: Фамилия пользователя
 *            example: "Иванов"
 *         password:
 *            type: string
 *            description: Хеш пароля пользователя
 *            example: "$2a$10$JjvRoDEDGGsYr2jb76avhOuD1NfRoHcJ4uYD6j8BbVWFpRu8Lfk2i" 
 *     Product:
 *       required:
 *         - id
 *         - title
 *         - category
 *         - description
 *         - price
 *       properties:
 *         id:
 *            type: string
 *            description: Уникальный id
 *            example: "skl123"
 *         title:
 *            type: string
 *            description: Наименование товара
 *            example: "Ложка"
 *         category:
 *            type: string
 *            desctiption: Категория товара
 *            example: "Посуда"
 *         description:
 *            type: string
 *            description: Описание товара
 *            example: "Не вилка"
 *         price:
 *            type: integer
 *            description: Цена товара
 *            example: 15
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Сообщение об ошибке
 *           example: "User not found"
 */


// Swagger definition
// Описание основного API
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API управления пользователями',
            version: '1.0.0',
            description: 'Простое API для управления пользователями',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
    },
    // Путь к файлам, в которых мы будем писать JSDoc-комментарии (наш текущий файл)
    apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Подключаем Swagger UI по адресу /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

function findUserOr404(email, res) {
    const user = users.find(u => u.email === email);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return null;
    }
    return user;
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Создать нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Почта пользователя
 *                 example: "a@email.com"
 *               first_name:
 *                 type: string
 *                 description: Имя пользователя
 *                 example: "Петр"
 *               last_name:
 *                 type: string
 *                 description: Фамилия пользователя
 *                 example: "Иванов"
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *                 example: "12345678"
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные данные запроса
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post("/api/auth/register", (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: "Email, fisrt name, last name and password are required" });
    }

    const newUser = {
        id: nanoid(6),
        email: email.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        password: bcrypt(password, 10)
    };

    users.push(newUser);
    res.status(201).json(newUser);
});

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     description: Проверяет логин и пароль пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Почта пользователя
 *                 example: "a@email.com"
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *                 example: "12345678"
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учетные данные
 *       404:
 *         description: Пользователь не найден
 */

app.post("/api/auth/login", async (req, res) => {
    const { username: email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "username and password are required" });
    }

    const user = findUserOr404(email, res);
    if (!user) return;

    isAuthentethicated = await verifyPassword(password, user.hashedPassword);
    if (isAuthentethicated) {
        res.status(200).json({ login: true });
    }
    else {
        res.status(401).json({ error: "not authentethicated" })
    }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название товара
 *                 example: "Мышь компьютерная"
 *               category:
 *                 type: string
 *                 description: Категория товара
 *                 example: "Электроника"
 *               description:
 *                 type: string
 *                 description: Описание товара
 *                 example: "Мышка компьютерная, устойчивая к падениям"
 *               price:
 *                 type: integer
 *                 description: Цена товара
 *                 example: 12
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Неверные данные запроса
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
*/

app.post("/api/products", (req, res) => {
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: "Title, category, description and price are required" });
    }

    const newProduct = {
        id: nanoid(6),
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price)
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
})

/**
* @swagger
* /api/products:
*   get:
*     summary: Список всех товаров
*     tags: [Products]
*     responses:
*       200:
*         description: Список товаров
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Product'
*/
app.get("/api/products", (req, res) => {
    res.json(products);
});

function findProductOr404(id, res) {
    const product = products.find(u => u.id == id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product;
}

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/products/:id", (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;
    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить параметры товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Новое название товара
 *                 example: "Петр Петров"
 *               category:
 *                 type: string
 *                 description: Новая категория товара
 *                 example: "Бананы"
 *               description:
 *                 type: string
 *                 description: Новое описание товара
 *                 example: "Вкусное"
 *               price:
 *                 type: integer
 *                 description: Новая цена товара
 *                 example: 156
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

app.put("/api/products/:id", (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    const { title, category, description, price } = req.body;

    if (title !== undefined) product.title = title.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);

    res.json(user);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удален (нет тела ответа)
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete("/api/products/:id", (req, res) => {
    const id = req.params.id;

    const exists = users.some((u) => u.id === id);
    if (!exists) return res.status(404).json({ error: "User not found" });

    users = users.filter((u) => u.id !== id);

    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});