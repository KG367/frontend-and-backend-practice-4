const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');
const app = express();

app.use(express.json());

const sequelize = new Sequelize('postgres', 'postgres', '1', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5433
});

// Проверка подключения
sequelize.authenticate()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error:', err));

const User = sequelize.define(
    'Пользователь',
    {
        id: { type: DataTypes.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true },
        first_name: { type: DataTypes.STRING, allowNull: false },
        last_name: { type: DataTypes.STRING, allowNull: false },
        age: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

// Синхронизация с БД
sequelize.sync(); // Опция `force` пересоздает таблицы

app.post('/users', async (req, res) => {
    try {
        console.log(req.body);
        const user = await User.create(req.body);
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.params.id } });
        res.send(user)
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.patch('/users/:id', async (req, res) => {
    try {
        const user = await User.update(req.body, {
            where: { id: req.params.id },
            returning: true, // Для PostgreSQL (возвращает обновленную запись)
        });
        res.send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        await User.destroy({ where: { id: req.params.id } });
        res.send({ message: 'User deleted' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
