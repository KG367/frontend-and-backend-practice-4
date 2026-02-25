import React from "react";
export default function UserItem({ user }) {
    return (
        <div className="userRow">
            <div className="userMain">
                <div className="userId">#{user.id}</div>
                <div className="userName">{user.name}</div>
                <div>{user.desc}</div>
                <div className="userAge">{user.price} р.</div>
            </div>
            <div style={{ display: 'flex' }}>
                {user.category.map((u) =>
                    <div className="category" key={u}>{u}</div>
                )}
            </div>
            <p style={{ color: '#b8bed2', margin: '3px' }}>{user.quantity !== 0 ? `${user.quantity} шт.` : 'Кончилосб'}</p>
            <div className="userActions">
                <button className="btn" onClick={()=>alert('Добавлено в корзину!')}>
                    В корзину
                </button>
            </div>
        </div>
    );
}