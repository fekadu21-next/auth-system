import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const deviceIcon = (device) => {
  if (device === "Mobile") return <Smartphone size={18} />;
  if (device === "Tablet") return <Tablet size={18} />;
  return <Monitor size={18} />;
};

/**
 * SecuritySessionsPanel — renders the active sessions of the current user with
 * device, browser, OS, IP and location, plus a "Sign out" action per session.
 *
 * @param {Object} props
 * @param {Array} props.sessions - Sessions from useDashboardSessions
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onRemove - Called with a session sid when signing out
 */
export default function SecuritySessionsPanel({ sessions, loading, onRemove }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
        <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">No active sessions</h3>
        <p className="text-slate-500">Sessions will appear here after you sign in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <div
          key={s.sid}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4"
        >
          <div className="h-11 w-11 shrink-0 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            {deviceIcon(s.device)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-slate-900 text-sm capitalize">{s.device}</p>
              {s.isCurrent && (
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {s.browser}
              {s.os && s.os !== "Unknown" ? ` · ${s.os}` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {s.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe size={13} /> {s.ip}
              </span>
              {s.expiresAt && (
                <span className="flex items-center gap-1.5">
                  <Clock size={13} /> Expires {new Date(s.expiresAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          {!s.isCurrent && (
            <button
              onClick={() => onRemove(s.sid)}
              className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg transition"
            >
              <LogOut size={14} /> Sign out
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
