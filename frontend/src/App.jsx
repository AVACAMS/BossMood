// Основной экран приложения: состояние, загрузка данных и компоновка UI.
import { useEffect, useMemo, useState } from "react";
import api from "./api";
import AuthForm from "./components/AuthForm";
import BossSelector from "./components/BossSelector";
import EntryForm from "./components/EntryForm";
import MoodCalendar from "./components/MoodCalendar";
import PredictionPanel from "./components/PredictionPanel";
import StatsPanel from "./components/StatsPanel";

export default function App() {
  const [user, setUser] = useState(null);
  const [bosses, setBosses] = useState([]);
  const [activeBossId, setActiveBossId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const activeBoss = useMemo(
    () => bosses.find((boss) => boss.id === activeBossId) || null,
    [bosses, activeBossId]
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    fetchBosses();
  }, []);

  useEffect(() => {
    if (!activeBossId) return;
    fetchEntries(activeBossId);
    fetchStats(activeBossId);
    fetchPrediction(activeBossId);
  }, [activeBossId]);

  async function fetchBosses() {
    const { data } = await api.get("/bosses");
    setBosses(data);
    if (data.length > 0) setActiveBossId(data[0].id);
  }

  async function fetchEntries(bossId) {
    const { data } = await api.get("/entries", { params: { bossId } });
    setEntries(data);
  }

  async function fetchStats(bossId) {
    const { data } = await api.get("/analytics/stats", { params: { bossId, threshold: 2 } });
    setStats(data);
  }

  async function fetchPrediction(bossId) {
    const { data } = await api.get("/analytics/prediction", { params: { bossId } });
    setPrediction(data);
  }

  async function createBoss(payload) {
    await api.post("/bosses", payload);
    await fetchBosses();
  }

  async function addEntry(payload) {
    await api.post("/entries", payload);
    await fetchEntries(payload.bossId);
    await fetchStats(payload.bossId);
    await fetchPrediction(payload.bossId);
  }

  if (!localStorage.getItem("token")) {
    return <AuthForm onAuthSuccess={setUser} />;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between pb-4">
        <h1 className="text-2xl font-bold">Трекер настроения руководителя</h1>
        <div className="flex gap-2">
          <button
            className="rounded bg-slate-700 px-3 py-1 text-sm text-white"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          >
            {theme === "light" ? "Тёмная" : "Светлая"} тема
          </button>
          <button
            className="rounded bg-rose-600 px-3 py-1 text-sm text-white"
            onClick={() => {
              localStorage.removeItem("token");
              setUser(null);
              window.location.reload();
            }}
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-4">
        <BossSelector
          bosses={bosses}
          activeBossId={activeBossId}
          onSelect={setActiveBossId}
          onCreate={createBoss}
        />

        {!activeBoss && <p className="rounded bg-white p-4 dark:bg-slate-800">Создайте профиль руководителя, чтобы начать.</p>}

        {activeBoss && (
          <>
            <EntryForm bossId={activeBossId} onAdd={addEntry} />
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MoodCalendar entries={entries} />
              </div>
              <PredictionPanel prediction={prediction} />
            </div>
            <StatsPanel stats={stats} />
          </>
        )}
      </div>
    </main>
  );
}
