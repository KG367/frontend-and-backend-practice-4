const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Подключаем Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { preinitModule } = require("react-dom");
const { use } = require("react");

const app = express();
const port = 3000;

const ACCESS_SECRET = "secret_secret";
const REFRESH_SECRET = "very_secret_secret";

const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES = "1d";

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
 
let users = [];

(async () => {
    users = [
        { id: nanoid(6), username: "petr", password: await bcrypt.hash("1", 10) },
        { id: nanoid(6), username: "ivan", password: await bcrypt.hash("2", 10) },
        { id: nanoid(6), username: "ivan_petrov", password: await bcrypt.hash("3", 10) },
    ]
})().then();

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
 *         - username
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный уникальный ID пользователя
 *           example: "abc123"
 *         username:
 *           type: string
 *           description: Имя пользователя
 *           example: "LaughtLover"
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

// for auth
function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";

    // header должен быть вида: "Bearer eyJhbGciOi..."
    const [scheme, token] = header.split(" ");

    // 1) Нет "Bearer" или нет токена → сразу 401
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "auth_header_missing",
            message: "Нужен заголовок Authorization: Bearer <token>",
        });
    }

    try {
        // 2) Проверяем подпись токена и срок действия (exp)
        const payload = jwt.verify(token, ACCESS_SECRET);

        // payload — это объект, который мы подписали при логине.
        // Например: { sub: userId, email, iat, exp }
        req.user = payload;

        // 3) Пропускаем запрос дальше → к защищённому обработчику
        next();
    } catch (err) {
        // Сюда попадём, если токен:
        // - подделан
        // - протух (expired)
        // - подписан другим секретом
        return res.status(401).json({
            error: "token_invalid",
            message: "Токен недействителен или срок действия истёк",
        });
    }
}

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о себе
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Данные успешно получены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Неверный токен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

app.get("/api/auth/me", authMiddleware, (req, res) => {
    // sub мы положили в токен при login
    const userId = req.user.sub;
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({
            error: "User not found",
        });
    }
    // никогда не возвращаем passwordHash
    res.json({
        id: user.id,
        username: user.username,
    });
});

function findUserOr404(username, res) {
    const user = users.find(u => u.username === username);
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
 *               - username
 *               - password
 *             properties:
 *               username:
 *                type: string
 *                description: Имя пользователя
 *                example: "SuperVova2003"
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
app.post("/api/auth/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const newUser = {
        id: nanoid(6),
        username: username.trim(),
        password: await bcrypt.hash(password, 10)
    };

    users.push(newUser);
    res.status(201).json({ id: newUser.id, username: newUser.id });
});

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

const refreshTokens = new Set();

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
 *               username:
 *                 type: string
 *                 description: Имя пользователя
 *                 example: "McGog"
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
 *                 accessToken: {type: string}
 *                 refreshToken: {type: string}
 *       400:
 *         description: Отсутствуют обязательные поля
 *       404:
 *         description: Пользователь не найден
 */

app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" });
    }

    const user = findUserOr404(username, res);
    if (!user) return;

    const isAuthentethicated = await verifyPassword(password, user.password);
    if (isAuthentethicated) {
        const accessToken = jwt.sign(
            {
                sub: user.id,
                username: user.username,
            },
            ACCESS_SECRET,
            {
                expiresIn: ACCESS_EXPIRES
            }
        );
        const refreshToken = jwt.sign(
            {
                sub: user.id, username: user.username,
            },
            REFRESH_SECRET,
            {
                expiresIn: REFRESH_EXPIRES
            }
        )
        refreshTokens.add(refreshToken);
        res.json({ "accessToken": accessToken, "refreshToken": refreshToken });
    }
    else {
        res.status(401).json({ error: "not authentethicated" })
    }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление токенов
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         description: Refresh-token
 *         name: refresh-token
 *         required: f
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Новые токены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 refreshToken: { type: string }
 *       400:
 *         description: Не передан refresh-токен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Refresh-токен неверен.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post("/api/auth/refresh", (req, res) => {
    const refreshToken = req.body?.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            error: "refresh_token_required",
        });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({
            error: "invalid_refresh_token",
        });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = users.find((u) => u.id === payload.sub);
        if (!user) {
            return res.status(404).json({
                error: "user_not_found",
            });
        }

        refreshTokens.delete(refreshToken);

        const accessToken = jwt.sign(
            {
                sub: user.id,
                username: user.username,
            },
            ACCESS_SECRET,
            {
                expiresIn: ACCESS_EXPIRES
            }
        );
        const newRefreshToken = jwt.sign(
            {
                sub: user.id, username: user.username,
            },
            REFRESH_SECRET,
            {
                expiresIn: REFRESH_EXPIRES
            }
        )

        refreshTokens.add(newRefreshToken);

        return res.json({ accessToken: accessToken, refreshToken: newRefreshToken });
    } catch (err) {
        refreshTokens.delete(refreshToken);
        return res.status(401).json({
            error: "refresh_token_invalid_or_expired",
            message: "Refresh-токен недействителен или срок действия истёк",
        });
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
app.get("/api/products/:id", authMiddleware, (req, res, next) => {
    try {
        const product = findProductOr404(req.params.id, res);
        if (!product) return;
        res.json(product);
    } catch (err) {
        next(err);
    }
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

app.put("/api/products/:id", authMiddleware, (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    const { title, category, description, price } = req.body;

    if (title !== undefined) product.title = title.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);

    res.json(product);
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
app.delete("/api/products/:id", authMiddleware, (req, res) => {
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