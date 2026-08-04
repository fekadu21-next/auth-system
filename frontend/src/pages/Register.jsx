import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUi } from "../Componnts/useUi.js";
import { API_URL } from "../api.js";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { showToast } = useUi();

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Your account has been created successfully. Please sign in.", "success");
      navigate("/");
    } else {
      showToast(data.message || data.error || "We couldn't create your account. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign up to get started with your dashboard
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 text-slate-800 placeholder-slate-400"
              placeholder="John Doe"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 text-slate-800 placeholder-slate-400"
              placeholder="name@company.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 text-slate-800 placeholder-slate-400"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-200 ease-in-out active:scale-[0.99]"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/"
            className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline transition duration-150"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}