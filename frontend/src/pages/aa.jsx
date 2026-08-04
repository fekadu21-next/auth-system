import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUi } from "../Componnts/useUi.js";
import { API_URL } from "../api.js";
import {
  FileText,
  ShieldCheck,
  History,
  Zap,
  Sparkles,
  ArrowRight,
  X,
  MousePointer,
  MessageSquare,
  Bell,
  RotateCcw,
  Edit3,
  Clock,
  Check,
  Layers
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [showCommentTooltip, setShowCommentTooltip] = useState(false);
  const [activeTab, setActiveTab] = useState("editor"); // "editor" | "history"

  const navigate = useNavigate();
  const { showToast } = useUi();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get("redirect") || "/dashboard";

      if (res.ok) {
        navigate(redirectUrl);
      } else {
        showToast(
          data.message || "Unable to sign in. Please check your credentials.",
          "error"
        );
      }
    } catch (error) {
      showToast("Server error. Please try again later.", "error");
    }
  };

  const handleGoogleLogin = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const redirectUrl = searchParams.get("redirect");

    if (redirectUrl) {
      document.cookie = `post_login_redirect=${redirectUrl}; path=/; max-age=3600`;
    }

    window.location.href = `${API_URL}/api/auth/google`;
  };

  const openModal = (mode = "login") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Custom Keyframe Style for Horizontal Motion Animation */}
      <style>{`
        @keyframes floatHorizontal {
          0%, 100% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
        }
        .animate-float-horizontal {
          animation: floatHorizontal 4s ease-in-out infinite;
        }
      `}</style>

      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-tr from-blue-100/60 via-indigo-100/40 to-teal-50/30 blur-3xl -z-10 rounded-full pointer-events-none" />

      {/* Header / Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/80 px-6 md:px-12 py-3 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate("/")}>
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 text-white group-hover:scale-105 transition-transform duration-300">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              LiveDocs
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Enterprise
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal("login")}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 rounded-lg transition-all duration-200"
          >
            Sign In
          </button>
          <button
            onClick={() => openModal("register")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-xl font-semibold shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-300 flex items-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Start Free</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-8 pb-12 grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero Text Content */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full text-blue-700 text-xs font-semibold tracking-wide shadow-2xs">
            <Sparkles size={13} className="text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Next-Gen Real-Time Collaboration</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            Write together. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Collaborate seamlessly.
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-lg">
            LiveDocs empowers modern engineering teams, researchers, and creators to co-author, comment, and sync rich documents instantly with zero latency.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => openModal("register")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-3 rounded-xl font-semibold shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started Free
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Animated Live Document Preview Card Section (Horizontal Floating Animation) */}
        <div className="lg:col-span-6 relative">
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 p-5 space-y-4 transition-all duration-500 hover:shadow-2xl animate-float-horizontal">

            {/* Document Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 hover:scale-125 transition-transform cursor-pointer" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 hover:scale-125 transition-transform cursor-pointer" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 hover:scale-125 transition-transform cursor-pointer" />
                </div>
                <span className="ml-1.5 text-xs font-bold text-slate-700 truncate max-w-[180px]">
                  Q4 System Architecture Spec.docx
                </span>
              </div>

              {/* View Mode Toggle Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all duration-300 ${activeTab === "editor"
                      ? "bg-white text-blue-600 shadow-xs scale-105"
                      : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all duration-300 flex items-center gap-1 ${activeTab === "history"
                      ? "bg-white text-blue-600 shadow-xs scale-105"
                      : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  <History size={11} /> Revisions
                </button>
              </div>
            </div>

            {/* View Tab 1: Live Editor Area */}
            {activeTab === "editor" && (
              <div className="space-y-3.5 transition-all duration-300 ease-in-out">
                {/* Live Writer Indicator Badge */}
                <div className="flex items-center justify-between bg-blue-50/90 border border-blue-200/60 px-3 py-1.5 rounded-xl transition-all duration-300 hover:border-blue-300 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    <span className="text-xs font-medium text-blue-900 flex items-center gap-1">
                      <MousePointer size={11} className="text-blue-600 animate-bounce" style={{ animationDuration: '2s' }} />
                      <strong className="font-bold">Hana</strong> is writing...
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-md shadow-2xs border border-blue-100 animate-pulse">
                    Live Session
                  </span>
                </div>

                <div className="space-y-2.5 text-slate-700 text-xs">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    1. Distributed Synchronization Protocol
                  </h2>

                  <p className="leading-relaxed text-slate-600 text-[11px]">
                    By leveraging Conflict-free Replicated Data Types (CRDTs) with WebSockets, LiveDocs guarantees deterministic state reconciliation across all concurrent clients.
                  </p>

                  {/* Active Context Discussion Card */}
                  <div className="p-2.5 bg-slate-50/90 border border-slate-200/80 rounded-xl space-y-2 relative transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/30">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1 text-slate-700 font-bold text-[11px]">
                        <MessageSquare size={12} className="text-blue-600 animate-pulse" /> Active Context Discussion
                      </span>
                      <span className="text-[10px] text-slate-400">2m ago</span>
                    </div>

                    <p className="text-[11px] text-slate-700 leading-snug">
                      <span className="font-bold text-blue-600">Alex:</span> "Should we benchmark the WebSocket fallback frame buffers for long-polling fallback clients?"
                    </p>

                    {/* Interactive Comment Preview Action */}
                    <div className="pt-1 flex items-center justify-between border-t border-slate-200/60">
                      <div className="relative">
                        <button
                          onMouseEnter={() => setShowCommentTooltip(true)}
                          onMouseLeave={() => setShowCommentTooltip(false)}
                          onClick={() => setShowCommentTooltip(!showCommentTooltip)}
                          className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2 py-0.5 rounded-lg transition-all duration-200 active:scale-95"
                        >
                          <MessageSquare size={10} />
                          <span>Reply to thread</span>
                        </button>

                        {/* Animated Hover Tooltip Popover */}
                        {showCommentTooltip && (
                          <div className="absolute left-0 bottom-full mb-2 z-30 w-44 bg-slate-900 text-white p-2 rounded-xl shadow-xl text-xs space-y-0.5 transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-2">
                            <div className="font-bold text-blue-300 text-[10px]">Quick Preview:</div>
                            <p className="text-[11px] text-slate-200 font-medium">
                              "hi all of you"
                            </p>
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 font-medium">Click or hover for preview</span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator Card */}
                <div className="p-2 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between transition-all duration-300 hover:border-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                      <MousePointer size={10} className="animate-pulse" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-medium">Cursor Positions</div>
                      <div className="text-[11px] font-bold text-slate-800">Line 42, Col 18</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    <Check size={12} className="animate-bounce" style={{ animationDuration: '1.5s' }} /> Saved
                  </div>
                </div>
              </div>
            )}

            {/* View Tab 2: Compact Version History Log */}
            {activeTab === "history" && (
              <div className="space-y-3 transition-all duration-300 ease-in-out">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Layers size={13} className="text-blue-600" />
                    Revision Log
                  </span>
                  <span className="text-[10px] text-slate-400">Auto-saved</span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                  <VersionItem
                    version="v2.4 (Current)"
                    time="10m ago"
                    author="Hana"
                    isCurrent
                  />
                  <VersionItem
                    version="v2.3"
                    time="2h ago"
                    author="Alex"
                  />
                  <VersionItem
                    version="v2.2"
                    time="Yesterday"
                    author="Sarah"
                  />
                </div>
              </div>
            )}

            {/* Live Footer Bar with Active Collaborators & Avatars */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Overlapping Collaborator Avatars */}
                <div className="flex items-center -space-x-2 overflow-hidden">
                  <img
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                    alt="Hana"
                    title="Hana (Active Now)"
                  />
                  <img
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Alex"
                    title="Alex (Active Now)"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-800">
                    Two active collaborators
                  </span>
                </div>
              </div>

              {/* Notification Badge Button */}
              <div className="relative">
                <button
                  onClick={() => showToast("2 new realtime mentions", "info")}
                  className="w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center shadow-md shadow-blue-600/30 transition-all duration-300 hover:scale-105 active:scale-95"
                  title="Notifications"
                >
                  <Bell size={13} />
                </button>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-xs animate-bounce" style={{ animationDuration: '2s' }}>
                  2
                </span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Feature Section Grid */}
      <section className="max-w-7xl mx-auto px-6 py-10 border-t border-slate-200/60">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Engineered for High-Performance Workflows
          </h2>
          <p className="text-slate-600 mt-1 text-xs">
            Everything you need from production-grade security to precise revision tracking.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <FeatureCard
            icon={<Zap className="w-5 h-5 text-blue-600" />}
            title="Real-Time Synchronization"
            text="Sub-millisecond latency co-editing backed by persistent WebSocket tunnels."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-5 h-5 text-indigo-600" />}
            title="Role-Based Access"
            text="Granular permission control (Viewer, Commenter, Editor) for document protection."
          />
          <FeatureCard
            icon={<History className="w-5 h-5 text-purple-600" />}
            title="Immutable Version History"
            text="Inspect past document revisions, compare diffs, and restore prior states easily."
          />
        </div>
      </section>

      {/* Auth Modal Overlay */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 max-w-sm w-full relative transform transition-all scale-100">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                <FileText size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {authMode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {authMode === "login"
                  ? "Sign in to access your LiveDocs dashboard"
                  : "Start real-time co-authoring in seconds"}
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-xs transition shadow-md shadow-blue-600/20 active:scale-95"
              >
                {authMode === "login" ? "Sign In" : "Register"}
              </button>
            </form>

            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                OR
              </span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 border border-slate-200 py-2 rounded-xl hover:bg-slate-50 transition font-medium text-slate-700 text-xs shadow-2xs"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="mt-4 text-center text-xs text-slate-500">
              {authMode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setAuthMode("register")}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button
                    onClick={() => setAuthMode("login")}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="p-2.5 bg-slate-50 rounded-lg w-fit mb-3">{icon}</div>
      <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
    </div>
  );
}

function VersionItem({ version, time, author, isCurrent }) {
  const [name, setName] = useState(version);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-2 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between hover:border-blue-300 transition-all duration-200 hover:shadow-2xs">
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setIsEditing(false)}
              autoFocus
              className="text-xs font-bold px-1 py-0.5 border border-blue-400 rounded outline-none"
            />
          ) : (
            <span className="text-xs font-bold text-slate-900">{name}</span>
          )}
          {isCurrent && (
            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="text-[10px] text-slate-500 flex items-center gap-1">
          <Clock size={9} /> {time} • by <span className="font-semibold text-slate-700">{author}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition text-[11px] flex items-center gap-0.5"
          title="Rename revision"
        >
          <Edit3 size={11} />
          <span className="hidden sm:inline">Rename</span>
        </button>

        {!isCurrent && (
          <button
            onClick={() => alert(`Restored to ${name}`)}
            className="p-1 text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 rounded transition text-[11px] font-bold flex items-center gap-0.5 shadow-2xs"
            title="Restore version"
          >
            <RotateCcw size={11} />
            <span className="hidden sm:inline">Restore</span>
          </button>
        )}
      </div>
    </div>
  );
}