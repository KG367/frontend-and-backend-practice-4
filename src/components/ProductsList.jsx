import React from "react";
import ProductItem from "./ProductItem";

export default function ProductsList({ products, onEdit, onDelete, role }) {
    if (!products.length) {
        return <div className="empty">Товаров пока нет</div>;
    }

    return (
        <div className="list">
            {products.map((u) => (
                <ProductItem key={u.id} product={u} onEdit={onEdit} onDelete={onDelete} role={role} />
            ))}
        </div>
    );
}