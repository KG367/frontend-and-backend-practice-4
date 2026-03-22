import React from "react";  
  
export default function ProductItem({ product, onEdit, onDelete }) {  
    return (  
        <div className="productRow">  
            <div className="productMain">  
                <div className="productId">#{product.id}</div>  
                <div className="productTitle">{product.title}</div>  
                <div className="productDesc">{product.description}</div>
                <div className="productCat">{product.category}</div>
            </div>  
  
            <div className="productActions">  
                <button className="btn" onClick={() => onEdit(product)}>  
                    Редактировать  
                </button>  
                <button className="btn btn--danger" onClick={() => onDelete(product.id)}>  
                    Удалить  
                </button>  
            </div>  
        </div>  
    );  
}