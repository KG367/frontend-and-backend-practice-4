import React, { useEffect, useState } from "react";
export default function UserModal({ open, mode, initialUser, onClose, onSubmit
}) {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [price, setPrice] = useState("");
    useEffect(() => {
        if (!open) return;
        setName(initialUser?.name ?? "");
        setDesc(initialUser?.desc ?? "");
        setPrice(initialUser?.price != null ? String(initialUser.price) : "");
    }, [open, initialUser]);
    if (!open) return null;
    const title = mode === "edit" ? "Редактирование товара" : "Создание товара";
    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        const trimdesc = desc.trim();
        const parsedAge = Number(price);
        if (!trimmed) {
            alert("Введите название");
            return;
        }
        if (!trimdesc) {
            alert("Введите описание");
            return;
        }
        if ((!Number.isFinite(parsedAge)) || parsedAge <= 0) {
            alert("Введите корректную цену");
            return;
        }
        onSubmit({
            id: initialUser?.id,
            name: trimmed,
            desc: trimdesc,
            age: parsedAge,
        });
    };
    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}
                role="dialog" aria-modal="true">
                <div className="modal__header">
                    <div className="modal__title">{title}</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </button>
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Название
                        <input
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ручка пишушая"
                            autoFocus
                        />
                    </label>
                    <label className="label">
                        Описание
                        <textarea
                            rows={10}
                            className="input"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="Ручка синяя"
                        />
                    </label>
                    <label className="label">
                        Цена
                        <input
                            className="input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Например, 20"
                            inputMode="numeric"
                        />
                    </label>
                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            {mode === "edit" ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}