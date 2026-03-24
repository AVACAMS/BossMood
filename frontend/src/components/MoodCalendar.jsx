// Календарная сетка последних записей с цветовой индикацией настроения.
const colors = {
  1: "bg-rose-500",
  2: "bg-orange-400",
  3: "bg-amber-300",
  4: "bg-lime-400",
  5: "bg-emerald-500"
};

export default function MoodCalendar({ entries }) {
  const byDate = entries.reduce((acc, item) => {
    const day = item.observed_at.slice(0, 10);
    acc[day] = item;
    return acc;
  }, {});

  const dates = Object.keys(byDate).sort().reverse().slice(0, 35);

  return (
    <div className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
      <h2 className="mb-3 text-lg font-semibold">Календарь настроения (последние записи)</h2>
      <div className="grid grid-cols-7 gap-2">
        {dates.map((day) => (
          <div key={day} className={`rounded p-2 text-center text-xs text-white ${colors[byDate[day].mood_rating]}`}>
            <div>{day.slice(5)}</div>
            <div>{byDate[day].mood_rating}/5</div>
          </div>
        ))}
      </div>
    </div>
  );
}
