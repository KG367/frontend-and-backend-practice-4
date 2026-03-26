import { useEffect, useState } from "react";

export default function UserModal({ inititalUser, onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [role, setRole] = useState("");

    console.log(inititalUser);

    useEffect(() => {
        if (!inititalUser) return;
        setName(inititalUser?.username ?? "");
        setRole(inititalUser?.role != null ? inititalUser.role : "");
    }, [inititalUser]);

    if (!inititalUser) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("Введите имя");
            return;
        }
        if (!role.trim()) {
            alert("Введите роль");
            return;
        }

        onSubmit({
            id: inititalUser?.id,
            name: name.trim(),
            role: role.trim(),
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="modal__header">
                    <div className="modal__title">Редактирование пользователя</div>
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
                        Роль
                        <input
                            className="input"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Рыжий"
                        />
                    </label>

                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}