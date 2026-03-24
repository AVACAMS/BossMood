// Форма авторизации и регистрации пользователя.
import { useState } from "react";
import api from "../api";

export default function AuthForm({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, { email, password });
      localStorage.setItem("token", data.token);
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка авторизации");
    }
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-md rounded-xl bg-white p-6 shadow dark:bg-slate-800">
      <h1 className="mb-4 text-2xl font-bold">Трекер настроения руководителя</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full rounded border p-2 text-slate-900"
          type="email"
          placeholder="Электронная почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded border p-2 text-slate-900"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="w-full rounded bg-indigo-600 p-2 text-white hover:bg-indigo-700" type="submit">
          {isLogin ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>
      <button
        className="mt-3 text-sm text-indigo-600"
        onClick={() => setIsLogin((v) => !v)}
        type="button"
      >
        {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
      </button>
    </div>
  );
}
