// Компонент выбора и добавления профиля руководителя.
import { useState } from "react";

export default function BossSelector({ bosses, activeBossId, onSelect, onCreate }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate({ name: name.trim(), role: role.trim() });
    setName("");
    setRole("");
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
      <div className="mb-3 flex flex-wrap gap-2">
        {bosses.map((boss) => (
          <button
            key={boss.id}
            onClick={() => onSelect(boss.id)}
            className={`rounded-full px-3 py-1 text-sm ${
              boss.id === activeBossId ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700"
            }`}
            type="button"
          >
            {boss.name}
          </button>
        ))}
      </div>
      <form className="grid gap-2 md:grid-cols-3" onSubmit={handleCreate}>
        <input
          className="rounded border p-2 text-slate-900"
          placeholder="Имя руководителя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded border p-2 text-slate-900"
          placeholder="Должность (необязательно)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <button className="rounded bg-emerald-600 p-2 text-white" type="submit">
          Добавить профиль
        </button>
      </form>
    </div>
  );
}
