import React from "react";
import { api } from "../api";

const onDelete = (setAccessToken, setRefreshToken) => {
    setAccessToken(null);
    setRefreshToken(null);
}

const onRefresh = async(setAccessToken, setRefreshToken) => {
    try {
        const data = await api.refreshToken();
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
    } catch (err) {
        alert("Refresh Error")
    }
}

export default function UserCard({ user, setAccessToken, setRefreshToken }) {
    return (
        <div className="productRow">
            <div className="productMain">
                <div className="productId">ID: {user.id}</div>
                <div className="productTitle">{user.username}</div>
                <div className="productCat">{user.role}</div>
            </div>

            <div className="productActions">
                <button className="btn" onClick={() => onRefresh(setAccessToken, setRefreshToken)}>
                    Обновить токен
                </button>
                <button className="btn btn--danger" onClick={() => onDelete(setAccessToken, setRefreshToken)}>
                    Выход
                </button>
            </div>
        </div>
    );
}