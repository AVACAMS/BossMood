// Панель агрегированной статистики по выбранному руководителю.
const weekdayMap = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export default function StatsPanel({ stats }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
      <h2 className="mb-3 text-lg font-semibold">Статистика</h2>
      <div className="grid gap-2 text-sm md:grid-cols-3">
        <div className="rounded bg-slate-100 p-2 dark:bg-slate-700">Среднее за неделю: {stats?.averages?.week ?? "н/д"}</div>
        <div className="rounded bg-slate-100 p-2 dark:bg-slate-700">Среднее за месяц: {stats?.averages?.month ?? "н/д"}</div>
        <div className="rounded bg-slate-100 p-2 dark:bg-slate-700">Срывов: {stats?.outbursts ?? 0}</div>
      </div>
      <div className="mt-3 text-sm">
        <p className="font-medium">Самые рискованные дни недели:</p>
        <ul>
          {(stats?.dangerDays || []).map((d) => (
            <li key={d.weekday}>
              {weekdayMap[Number(d.weekday)]} - среднее {d.avg_mood}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3 text-sm">
        <p className="font-medium">Самые рискованные часы:</p>
        <ul>
          {(stats?.dangerHours || []).map((d) => (
            <li key={d.hour}>
              {d.hour}:00 - среднее {d.avg_mood}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
