const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");

// Подключаем Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
    {id: nanoid(6), name: 'Петр', age: 16},
    {id: nanoid(6), name: 'Иван', age: 18},
    {id: nanoid(6), name: 'Дарья', age: 20},
];

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

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - age
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный уникальный ID пользователя
 *         name:
 *           type: string
 *           description: Имя пользователя
 *         age:
 *           type: integer
 *           description: Возраст пользователя
 *       example:
 *         id: "abc123"
 *         name: "Петр"
 *         age: 16
 */


function findUserOr404(id, res) {
    const user = users.find(u => u.id == id);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return null;
    }
    return user;
}

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 */
app.get("/api/users", (req, res) => {
    res.json(users);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 */
app.get("/api/users/:id", (req, res) => {
    const user = findUserOr404(req.params.id, res);
    if (!user) return;
    res.json(user);
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Создать пользователя
 *     tags: [Users]
 */
app.post("/api/users", (req, res) => {
    const { name, age } = req.body;

    if (!name || age === undefined) {
        return res.status(400).json({ error: "Name and age are required" });
    }

    const newUser = {
        id: nanoid(6),
        name: name.trim(),
        age: Number(age)
    };

    users.push(newUser);
    res.status(201).json(newUser);
});

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Обновить пользователя
 *     tags: [Users]
 */
app.patch("/api/users/:id", (req, res) => {
    const user = findUserOr404(req.params.id, res);
    if (!user) return;

    const { name, age } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (age !== undefined) user.age = Number(age);

    res.json(user);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Удалить пользователя
 *     tags: [Users]
 */
app.delete("/api/users/:id", (req, res) => {
    const id = req.params.id;

    const exists = users.some((u) => u.id === id);
    if (!exists) return res.status(404).json({ error: "User not found" });

    users = users.filter((u) => u.id !== id);

    // Правильнее 204 без тела
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});