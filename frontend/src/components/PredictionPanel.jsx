// Панель прогноза настроения и уровня риска на ближайшие дни.
export default function PredictionPanel({ prediction }) {
  const riskLabel = {
    high: "высокий",
    medium: "средний",
    low: "низкий",
    unknown: "неизвестно"
  };

  const riskColor = {
    high: "text-rose-600",
    medium: "text-amber-500",
    low: "text-emerald-600",
    unknown: "text-slate-400"
  };

  const today = prediction?.forecast?.[0];

  return (
    <div className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
      <h2 className="mb-3 text-lg font-semibold">Прогноз</h2>
      {today && today.risk === "high" && (
        <p className="mb-2 rounded bg-rose-100 p-2 text-sm text-rose-700">
          Внимание: сегодня высокий риск плохого настроения, будьте осторожны.
        </p>
      )}
      <div className="space-y-1 text-sm">
        {prediction?.forecast?.map((item) => (
          <div key={item.date} className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-700">
            <span>{item.date}</span>
            <span className={riskColor[item.risk]}>
              {item.predictedMood ? `${item.predictedMood}/5` : "н/д"} ({riskLabel[item.risk]})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
