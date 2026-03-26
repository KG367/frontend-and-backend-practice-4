import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
    }
});

apiClient.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken && !config.headers.Authorization)
            config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
    },
    (error) => Promise.reject(error)
);

export const api = {
    apiClient,

    createProduct: async (product) => {
        return (await apiClient.post("/products", product)).data;
    },

    getProducts: async () => {
        return (await apiClient.get("/products")).data;
    },

    getProductById: async (id) => {
        return (await apiClient.get(`/products/${id}`)).data;
    },

    updateProduct: async (id, product) => {
        return (await apiClient.put(`/products/${id}`, product)).data;
    },

    deleteProduct: async (id) => {
        return (await apiClient.delete(`/products/${id}`)).data;
    },

    getMe: async () => {
        return (await apiClient.get("/auth/me")).data
    },

    addUser: async (username, password) => {
        return (await apiClient.post("/auth/register", { "username": username, "password": password })).data
    },

    logUser: async (username, password) => {
        return (await apiClient.post("/auth/login",
            {
                "username": username,
                "password": password
            })).data
    },

    refreshToken: async () => {
        return (await apiClient.post("/auth/refresh", { "refreshToken": localStorage.getItem("refreshToken") })).data
    },

    getAllUsers: async () => {
        return (await apiClient.get("/auth/users")).data;
    },

    updateUser: async (id, user) => {
        return (await apiClient.post(`/auth/users/${user.id}`, user)).data;
    }
}
