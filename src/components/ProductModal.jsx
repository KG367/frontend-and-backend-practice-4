import React, { useEffect, useState } from "react";

export default function ProductModal({ open, mode, inititalProduct, onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");

    useEffect(() => {
        if (!open) return;
        setName(inititalProduct?.name ?? "");
        setAge(inititalProduct?.age != null ? String(inititalProduct.age) : "");
    }, [open, inititalProduct]);

    if (!open) return null;

    const title = mode === "edit" ? "Редактирование товара" : "Создание товара";

    const handleSubmit = (e) => {
        e.preventDefault();

        const parsedAge = Number(age);

        if (!name.trim()) {
            alert("Введите название");
            return;
        }
        if (!description.trim()) {
            alert("Введите описание");
            return;
        }
        if (!category.trim()) {
            alert("Введите категорию");
            return;
        }
        if (!Number.isFinite(parsedAge) || parsedAge < 0) {
            alert("Введите корректную цену (>=0)");
            return;
        }

        onSubmit({
            id: inititalProduct?.id,
            name: name.trim(),
            age: parsedAge,
            category: category.trim(),
            description: description.trim()
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
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
                            placeholder="Например, Иван"
                            autoFocus
                        />
                    </label>

                    <label className="label">
                        Описание
                        <input
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Красивый, хороший"
                        />
                    </label>

                    <label className="label">
                        Категория
                        <input
                            className="input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Рыжий"
                        />
                    </label>

                    <label className="label">
                        Возраст
                        <input
                            className="input"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
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