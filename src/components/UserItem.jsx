import React from "react";
import UserModal from "./UserModal";

export default function UserItem({ user, setEditingUser }) {
    return (
        <div className="productRow">
            <div className="productMain">
                <div className="productId">#{user.id}</div>
                <div className="productTitle">{user.username}</div>
                <div className="productCat">{user.role}</div>
            </div>

            <div className="productActions">
                <button className="btn" onClick={() => setEditingUser(user)}>
                    Редактировать
                </button>
                <button className="btn btn--danger" onClick={() => onDelete(user.id)}>
                    Удалить
                </button>
            </div>
        </div>
    );
}