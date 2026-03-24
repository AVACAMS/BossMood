// Форма добавления новой записи о настроении на выбранную дату.
import { useState } from "react";

const moods = [
  { value: 1, label: "Ужасно", emoji: "😡" },
  { value: 2, label: "Плохо", emoji: "😒" },
  { value: 3, label: "Нейтрально", emoji: "😐" },
  { value: 4, label: "Хорошо", emoji: "🙂" },
  { value: 5, label: "Отлично", emoji: "😄" }
];

export default function EntryForm({ bossId, onAdd }) {
  const [moodRating, setMoodRating] = useState(3);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    await onAdd({
      bossId,
      moodRating,
      note,
      observedAt: `${date}T09:00:00.000Z`
    });
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
      <h2 className="mb-3 text-lg font-semibold">Добавить запись о настроении</h2>
      <div className="mb-3 flex gap-2">
        {moods.map((m) => (
          <button
            type="button"
            key={m.value}
            title={m.label}
            onClick={() => setMoodRating(m.value)}
            className={`rounded border px-3 py-2 text-xl ${moodRating === m.value ? "border-indigo-600" : ""}`}
          >
            {m.emoji}
          </button>
        ))}
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <input
          className="rounded border p-2 text-slate-900"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          className="rounded border p-2 text-slate-900"
          placeholder="Комментарий (например: повысил голос)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <button className="mt-3 rounded bg-indigo-600 px-4 py-2 text-white">Сохранить</button>
    </form>
  );
}
