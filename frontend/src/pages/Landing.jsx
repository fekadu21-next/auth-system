import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  Zap,
  Shield,
  Globe,
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles,
  MousePointer,
  MessageSquare,
  History,
  Check,
  Bell,
  Layers,
  Edit3,
  RotateCcw,
  Mail,
  ChevronRight
} from "lucide-react";

// Inline Brand Icon SVGs to prevent lucide-react export breaking changes
const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const TwitterIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export default function Landing() {
  const [activeTab, setActiveTab] = useState("editor"); // "editor" | "history"
  const [showCommentTooltip, setShowCommentTooltip] = useState(false);

  const features = [
    {
      icon: Users,
      title: "Real-time Collaboration",
      description: "See changes instantly as team members edit. Multiple users can work together simultaneously with live cursors and presence indicators.",
      badge: "Sub-10ms Sync",
      gradient: "from-blue-600/10 via-indigo-600/5 to-transparent",
      borderHover: "hover:border-indigo-400/50",
      iconBg: "from-blue-600 to-indigo-600",
      accentGlow: "group-hover:shadow-indigo-500/10"
    },
    {
      icon: Globe,
      title: "Share Anywhere",
      description: "Share documents with anyone via link. Control permissions with viewer, commenter, or editor access levels.",
      badge: "Granular Access",
      gradient: "from-purple-600/10 via-pink-600/5 to-transparent",
      borderHover: "hover:border-purple-400/50",
      iconBg: "from-purple-600 to-pink-600",
      accentGlow: "group-hover:shadow-purple-500/10"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built for speed with instant syncing and minimal latency. Your changes are saved and propagated in milliseconds.",
      badge: "CRDT Powered",
      gradient: "from-amber-600/10 via-orange-600/5 to-transparent",
      borderHover: "hover:border-amber-400/50",
      iconBg: "from-amber-500 to-orange-600",
      accentGlow: "group-hover:shadow-amber-500/10"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security with encrypted connections. Your data is protected with advanced security protocols.",
      badge: "E2E Encrypted",
      gradient: "from-emerald-600/10 via-teal-600/5 to-transparent",
      borderHover: "hover:border-emerald-400/50",
      iconBg: "from-emerald-500 to-teal-600",
      accentGlow: "group-hover:shadow-emerald-500/10"
    },
    {
      icon: Clock,
      title: "Version History",
      description: "Never lose your work with automatic version tracking. Restore previous versions anytime with detailed history.",
      badge: "Auto-Revisions",
      gradient: "from-cyan-600/10 via-blue-600/5 to-transparent",
      borderHover: "hover:border-cyan-400/50",
      iconBg: "from-cyan-500 to-blue-600",
      accentGlow: "group-hover:shadow-cyan-500/10"
    },
    {
      icon: FileText,
      title: "Rich Document Editor",
      description: "Powerful editor with formatting, tables, images, and more. Create professional documents with ease.",
      badge: "Markdown Ready",
      gradient: "from-rose-600/10 via-red-600/5 to-transparent",
      borderHover: "hover:border-rose-400/50",
      iconBg: "from-rose-500 to-red-600",
      accentGlow: "group-hover:shadow-rose-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Custom Keyframe Animations */}
      <style>{`
        @keyframes floatHorizontal {
          0%, 100% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
        }
        .animate-float-horizontal {
          animation: floatHorizontal 4s ease-in-out infinite;
        }
      `}</style>

      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-tr from-indigo-200/50 via-purple-200/40 to-blue-100/30 blur-3xl -z-10 rounded-full pointer-events-none" />
      <div className="absolute top-[35%] right-0 w-[500px] h-[500px] bg-indigo-100/40 blur-[120px] -z-10 rounded-full pointer-events-none" />
      <div className="absolute top-[60%] left-0 w-[500px] h-[500px] bg-purple-100/40 blur-[120px] -z-10 rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 text-white group-hover:scale-105 transition-transform duration-300">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              LiveDocs
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors px-2 py-1"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-100 transition-all duration-200 flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Left Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-200/80 rounded-full text-indigo-700 text-xs font-semibold tracking-wide shadow-2xs">
              <Zap className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>Real-time collaboration made simple</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Collaborate on documents{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block mt-1">
                in real-time
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Work together seamlessly with your team. Edit, share, and collaborate on documents with live syncing, instant updates, and powerful sharing controls.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 items-stretch sm:items-center">
              <Link
                to="/register"
                className="group px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-105 active:scale-100 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <span>Start Free Today</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-7 py-3.5 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-md transition-all duration-200 text-center text-sm"
              >
                Sign In
              </Link>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>No credit card required • Free forever for individuals</span>
            </div>
          </div>

          {/* Right Live Preview Demonstration */}
          <div className="lg:col-span-6 relative">
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 p-5 space-y-4 animate-float-horizontal hover:shadow-indigo-500/10 transition-all duration-500">

              {/* Document Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400 hover:scale-125 transition-transform cursor-pointer" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 hover:scale-125 transition-transform cursor-pointer" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 hover:scale-125 transition-transform cursor-pointer" />
                  </div>
                  <span className="ml-1.5 text-xs font-bold text-slate-700 truncate max-w-[180px]">
                    Project Roadmap & Specs.docx
                  </span>
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab("editor")}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all duration-300 ${activeTab === "editor"
                      ? "bg-white text-indigo-600 shadow-xs scale-105"
                      : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    Editor
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all duration-300 flex items-center gap-1 ${activeTab === "history"
                      ? "bg-white text-indigo-600 shadow-xs scale-105"
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
                  <div className="flex items-center justify-between bg-indigo-50/90 border border-indigo-200/60 px-3 py-1.5 rounded-xl transition-all duration-300 hover:border-indigo-300 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                      </span>
                      <span className="text-xs font-medium text-indigo-900 flex items-center gap-1">
                        <MousePointer size={11} className="text-indigo-600 animate-bounce" style={{ animationDuration: '2s' }} />
                        <strong className="font-bold">Sarah</strong> is editing...
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md shadow-2xs border border-indigo-100 animate-pulse">
                      Live Sync
                    </span>
                  </div>

                  <div className="space-y-2.5 text-slate-700 text-xs">
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      1. Executive Overview & Milestones
                    </h2>

                    <p className="leading-relaxed text-slate-600 text-[11px]">
                      LiveDocs ensures high-throughput document reconciliation utilizing CRDT data types with sub-10ms network synchronization across geographical regions.
                    </p>

                    {/* Active Context Discussion Card */}
                    <div className="p-2.5 bg-slate-50/90 border border-slate-200/80 rounded-xl space-y-2 relative transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50/30">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1 text-slate-700 font-bold text-[11px]">
                          <MessageSquare size={12} className="text-indigo-600 animate-pulse" /> Active Thread
                        </span>
                        <span className="text-[10px] text-slate-400">Just now</span>
                      </div>

                      <p className="text-[11px] text-slate-700 leading-snug">
                        <span className="font-bold text-indigo-600">Alex:</span> "Are we ready to publish the main document specs to the team?"
                      </p>

                      <div className="pt-1 flex items-center justify-between border-t border-slate-200/60">
                        <div className="relative">
                          <button
                            onMouseEnter={() => setShowCommentTooltip(true)}
                            onMouseLeave={() => setShowCommentTooltip(false)}
                            onClick={() => setShowCommentTooltip(!showCommentTooltip)}
                            className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-2 py-0.5 rounded-lg transition-all duration-200 active:scale-95"
                          >
                            <MessageSquare size={10} />
                            <span>Reply to thread</span>
                          </button>

                          {showCommentTooltip && (
                            <div className="absolute left-0 bottom-full mb-2 z-30 w-48 bg-slate-900 text-white p-2 rounded-xl shadow-xl text-xs space-y-0.5 transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-2">
                              <div className="font-bold text-indigo-300 text-[10px]">Preview:</div>
                              <p className="text-[11px] text-slate-200 font-medium">
                                "Yes, everything is verified!"
                              </p>
                            </div>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400 font-medium">Hover for reply preview</span>
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
                        <div className="text-[11px] font-bold text-slate-800">Line 14, Col 08</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                      <Check size={12} className="animate-bounce" style={{ animationDuration: '1.5s' }} /> Saved
                    </div>
                  </div>
                </div>
              )}

              {/* View Tab 2: Revisions Log */}
              {activeTab === "history" && (
                <div className="space-y-3 transition-all duration-300 ease-in-out">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Layers size={13} className="text-indigo-600" />
                      Revision Log
                    </span>
                    <span className="text-[10px] text-slate-400">Auto-saved</span>
                  </div>

                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-0.5">
                    <div className="p-2 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">v2.4 (Current)</span>
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full">Active</span>
                        </div>
                        <div className="text-[10px] text-slate-500">10m ago • by Sarah</div>
                      </div>
                      <button className="p-1 text-slate-600 hover:text-indigo-600 text-[11px] flex items-center gap-0.5">
                        <Edit3 size={11} /> Rename
                      </button>
                    </div>

                    <div className="p-2 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900">v2.3</span>
                        <div className="text-[10px] text-slate-500">2h ago • by Alex</div>
                      </div>
                      <button className="p-1 text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 rounded text-[11px] font-bold flex items-center gap-0.5 shadow-2xs">
                        <RotateCcw size={11} /> Restore
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Footer Bar with Active Collaborators */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center -space-x-2 overflow-hidden">
                    <img
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover shadow-2xs"
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                      alt="Sarah"
                    />
                    <img
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover shadow-2xs"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                      alt="Alex"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-800">
                      2 collaborators live
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/30">
                    <Bell size={13} />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                    2
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-gradient-to-b from-slate-100/70 via-indigo-50/30 to-slate-100/80 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-purple-100/80 text-purple-700 border border-purple-200/80 rounded-full text-xs font-semibold mb-3 shadow-2xs">
              <Sparkles size={12} />
              <span>Built for Modern Workflows</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Everything you need to collaborate
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Powerful features engineered for modern high-performance engineering, product, and writing teams.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative group bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-slate-200/90 hover:border-transparent transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl ${feature.accentGlow} overflow-hidden flex flex-col justify-between`}
              >
                {/* Background Dynamic Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                {/* Top Border Highlight Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.iconBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.iconBg} rounded-xl flex items-center justify-center shadow-md text-white group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-slate-800 rounded-md border border-slate-200/60 transition-colors">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-indigo-900 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100/80 flex items-center text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                  <span>Explore capability</span>
                  <ChevronRight size={14} className="ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-10 lg:p-16 text-center shadow-2xl relative overflow-hidden">
          {/* Subtle Overlay Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Ready to transform how you collaborate?
            </h2>
            <p className="text-base sm:text-lg text-indigo-100 mb-8 leading-relaxed">
              Join thousands of teams already using LiveDocs to work together more effectively.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-slate-50 hover:shadow-2xl hover:scale-105 active:scale-100 transition-all duration-200 text-sm shadow-lg"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Expanded Multi-Column Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800">

            {/* Brand Column */}
            <div className="col-span-2 space-y-4 pr-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">LiveDocs</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Next-generation real-time collaborative document platform. Engineered for distributed engineering, product, and content teams requiring sub-millisecond sync precision.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a href="#twitter" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                  <TwitterIcon className="w-4 h-4" />
                </a>
                <a href="#github" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                  <GithubIcon className="w-4 h-4" />
                </a>
                <a href="#linkedin" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                  <LinkedinIcon className="w-4 h-4" />
                </a>
                <a href="#email" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                  <Mail size={15} />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-xs font-medium">
                <li><a href="#editor" className="hover:text-indigo-400 transition-colors">Document Editor</a></li>
                <li><a href="#collaboration" className="hover:text-indigo-400 transition-colors">Real-time Engine</a></li>
                <li><a href="#history" className="hover:text-indigo-400 transition-colors">Version Control</a></li>
                <li><a href="#security" className="hover:text-indigo-400 transition-colors">Security & Encryption</a></li>
                <li><a href="#templates" className="hover:text-indigo-400 transition-colors">Templates Gallery</a></li>
                <li><a href="#changelog" className="hover:text-indigo-400 transition-colors">Changelog & Updates</a></li>
              </ul>
            </div>

            {/* Solutions Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Solutions</h4>
              <ul className="space-y-2 text-xs font-medium">
                <li><a href="#engineering" className="hover:text-indigo-400 transition-colors">For Engineering Teams</a></li>
                <li><a href="#product" className="hover:text-indigo-400 transition-colors">For Product Managers</a></li>
                <li><a href="#writers" className="hover:text-indigo-400 transition-colors">For Technical Writers</a></li>
                <li><a href="#enterprise" className="hover:text-indigo-400 transition-colors">Enterprise Suite</a></li>
                <li><a href="#startups" className="hover:text-indigo-400 transition-colors">Startup Program</a></li>
              </ul>
            </div>

            {/* Resources & Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources & Legal</h4>
              <ul className="space-y-2 text-xs font-medium">
                <li><a href="#documentation" className="hover:text-indigo-400 transition-colors">API Documentation</a></li>
                <li><a href="#status" className="hover:text-indigo-400 transition-colors">System Status</a></li>
                <li><a href="#privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                <li><a href="#security-policy" className="hover:text-indigo-400 transition-colors">Security Overview</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <p>© 2026 LiveDocs Technologies Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#terms" className="hover:text-slate-400 transition-colors">Terms</a>
              <a href="#privacy" className="hover:text-slate-400 transition-colors">Privacy</a>
              <a href="#cookies" className="hover:text-slate-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}