import React, { useEffect, useState } from "react";
import "./ProductPage.scss";

import ProductsList from "../../components/ProductsList";
import ProductModal from "../../components/ProductModal";
import { api } from "../../api";
import UserCard from "../../components/UserCard";
import UserItem from "../../components/UserItem";
import UserModal from "../../components/UserModal";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // create | edit
    const [editingProduct, setEditingProduct] = useState(null);

    const [editingUser, setEditingUser] = useState(null);

    const [user, setUser] = useState(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState("login"); // login || register ; need only if user===null
    const [users, setUsers] = useState([]);

    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken"));

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(data);
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки товаров");
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            api.getAllUsers().then((data) =>
                setUsers(data)
            ).catch((err)=>{
                console.log(err)
            });
        } catch (err) {
            console.log(err);
        }
    }

    const openCreate = () => {
        setModalMode("create");
        setEditingProduct(null);
        setModalOpen(true);
    };

    const openEdit = (product) => {
        setModalMode("edit");
        setEditingProduct(product);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Удалить товар?");
        if (!ok) return;

        try {
            await api.deleteProduct(id);
            setProducts((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error(err);
            alert("Ошибка удаления товара");
        }
    };

    const handleSubmitModal = async (payload) => {
        try {
            if (modalMode === "create") {
                const newProduct = await api.createProduct(payload);
                setProducts((prev) => [...prev, newProduct]);
            } else {
                const updatedProduct = await api.updateProduct(payload.id, payload);
                setProducts((prev) =>
                    prev.map((u) => (u.id === payload.id ? updatedProduct : u))
                );
            }
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Ошибка сохранения товара");
        }
    };

    const handleUserModal = async (payload) => {
        try {
            const updatedUser = await api.updateUser(payload.id, payload);
            setUsers((prev) =>
                prev.map((u) => (u.id === payload.id ? updatedUser : u))
            );
            setEditingUser(null);
        } catch (err) {
            console.error(err);
            alert("Ошибка сохранения пользователя");
        }
    };

    const loginUser = async (username, login) => {
        try {
            const data = await api.logUser(username, login);
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
        } catch (err) {
            console.log(err);
            alert("Login error");
            return;
        }
    }

    const register = async (username, login) => {
        try {
            await api.addUser(username, login);
            alert("Регистрация успешна, войдите");
            setMode("login");
        } catch (err) {
            console.log(err);
            alert("Login error");
        }
    }

    useEffect(() => {
        if (localStorage.getItem("accessToken") !== accessToken) {
            if (accessToken !== null)
                localStorage.setItem("accessToken", accessToken);
            else localStorage.removeItem("accessToken");
        }
        try {
            api.getMe(username).then((data) => {
                setUser(data);
            }).catch(() => {
                setUser(null);
                console.log("eggog");
            })
        } catch (err) {
            console.log(err); // а этот код доступен?
        }
        if (accessToken) {
            loadProducts();
            loadUsers();
        }
    }, [accessToken]);

    useEffect(() => {
        if (localStorage.getItem("refreshToken") !== refreshToken) {
            if (refreshToken !== null)
                localStorage.setItem("refreshToken", refreshToken);
            else localStorage.removeItem("refreshToken");
        }
    }, [refreshToken]);

    let refreshInFlight = null;

    api.apiClient.interceptors.response.use(
        (response) => response,
        async (error) => {
            const status = error?.response?.status;
            const originalRequest = error.config;

            // 401 от защищённых маршрутов (accessToken протух/битый/отсутствует)
            if (status === 401 && originalRequest && !originalRequest._retry) {
                originalRequest._retry = true;

                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) {
                    // Нечем обновлять → пользователь должен залогиниться заново
                    setAccessToken(null);
                    setRefreshToken(null);
                    return Promise.reject(error);
                }

                try {
                    if (!refreshInFlight) {
                        refreshInFlight = api.apiClient
                            .post("/auth/refresh",
                                {
                                    "refreshToken": refreshToken,
                                }, { _retry: true })
                            .then((r) => r.data)
                            .finally(() => {
                                refreshInFlight = null;
                            });
                    }

                    // tokens = { accessToken, refreshToken }
                    const tokens = await refreshInFlight;
                    setAccessToken(tokens.accessToken);
                    // из-за того что set срабатывает не сразу, необходимо выставить вручную для корректной обработки запроса
                    localStorage.setItem("refreshToken", tokens.refreshToken)
                    setRefreshToken(tokens.refreshToken);

                    // Повторяем исходный запрос уже с новым accessToken
                    originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
                    return api.apiClient(originalRequest);
                } catch (refreshErr) {
                    // refresh не сработал → чистим токены и "отдаём" ошибку наверх
                    setAccessToken(null);
                    setRefreshToken(null);
                    return Promise.reject(refreshErr);
                }
            } else if (status === 401) {
                console.log(status === 401, originalRequest, !originalRequest._retry)
            }

            return Promise.reject(error);
        }
    );

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">Products App</div>
                    <div className="header__right">React</div>
                </div>
            </header>
            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Профиль</h1>
                    </div>
                    {user === null ? (
                        <>
                            <p>Для продолжения авторизуйтесь или зарегистрируйтесь</p>
                            <label>Имя пользователя
                                <input className="input" onChange={(e) => setUsername(e.target.value)}></input>
                            </label>
                            <br />
                            <label>Пароль
                                <input className="input" onChange={(e) => setPassword(e.target.value)}></input>
                            </label>
                            <br />
                            {mode === "login" ? (
                                <div>
                                    <button className="btn btn--primary" onClick={() => loginUser(username, password)}>Войти</button>
                                    <br />
                                    <label>Нет учётной записи?
                                        <button className="btn" onClick={() => setMode("register")}>Регистрация</button>
                                    </label>
                                </div>
                            ) : (
                                <div>
                                    <label>
                                        <button className="btn btn--primary" onClick={() => register(username, password)}>Регистрация</button>
                                        <br />
                                        <label>Есть учётная запись?
                                            <button className="btn" onClick={() => setMode("login")}>Вход</button>
                                        </label>
                                    </label>
                                </div>
                            )}
                        </>
                    )
                        :
                        <>
                            <UserCard user={user} setAccessToken={setAccessToken} setRefreshToken={setRefreshToken} />
                            {user.role === 'admin' &&
                                <>
                                    <div className="toolbar">
                                        <h1 className="title">Пользователи</h1>
                                    </div>
                                    {//блять как же меня заебали эти set они никогда блядь не работают вовремя а постоянно спустя пол года. я уже заебался дебажить состояние гонки я хочу нормального последовательного выполнения реакт иди нахуй
                                        // а всё норм это я долбоёб
                                    }
                                    {users.map((u) =>
                                        <UserItem key={u.id} user={u} setEditingUser={setEditingUser} />
                                    )}
                                </>
                            }
                            <div className="toolbar">
                                <h1 className="title">Товары</h1>
                                {['seller', 'admin'].includes(user.role) &&
                                    <button className="btn btn--primary" onClick={openCreate}>
                                        + Создать
                                    </button>
                                }
                            </div>
                            {loading ? (
                                <div className="empty">Загрузка...</div>
                            ) : (
                                <ProductsList
                                    products={products}
                                    onEdit={openEdit}
                                    onDelete={handleDelete}
                                    role={user.role}
                                />
                            )}
                        </>
                    }
                </div>
            </main>
            <footer className="footer">
                <div className="footer__inner">
                    © {new Date().getFullYear()} Products App
                </div>
            </footer>
            <ProductModal open={modalOpen}
                mode={modalMode}
                initialProduct={editingProduct}
                onClose={closeModal}
                onSubmit={handleSubmitModal}
            />
            <UserModal inititalUser={editingUser} onClose={() => setEditingUser(null)} onSubmit={handleUserModal} />
        </div>
    );
}