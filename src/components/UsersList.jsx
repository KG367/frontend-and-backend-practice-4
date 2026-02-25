import React from "react";
import UserItem from "./UserItem";

export default function ProductList({ products, onEdit, onDelete }) {
    if (!products.length) {
        return <div className="empty">Товаров пока нет</div>;
    }
    return (
        <div className="list">
            {products.map((u) => (
                <UserItem key={u.id} user={u} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    );
}