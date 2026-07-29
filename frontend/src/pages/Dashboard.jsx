import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  // Load profile
  const fetchProfile = async () => {
    const res = await fetch("http://localhost:5000/api/auth/profile", {
      credentials: "include",
    });

    if (!res.ok) {
      navigate("/");
      return;
    }

    const data = await res.json();
    setUser(data);
  };

  // Load sessions
  const fetchSessions = async () => {
    const res = await fetch("http://localhost:5000/api/auth/sessions", {
      credentials: "include",
    });

    const data = await res.json();
    setSessions(data);
  };

  // Delete session
  const deleteSession = async (sid) => {
    await fetch(`http://localhost:5000/api/auth/sessions/${sid}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchSessions(); // refresh
  };

  // Logout current session
  const logout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
      credentials: "include",
    });
    navigate("/");
  };

  useEffect(() => {
    fetchProfile();
    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Dashboard
              </h1>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 transition duration-200 active:scale-[0.98]"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Active Sessions
              </h2>
              <p className="text-sm text-slate-500">
                Manage your active logged-in devices and sessions
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              {sessions.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {sessions.map((s) => {
              const sessionData = typeof s.sess === "string" ? JSON.parse(s.sess) : s.sess;
              const userData = sessionData?.user || {};
              const isSuspicious = userData.suspicious;
              
              return (
                <div
                  key={s.sid}
                  className={`p-4 rounded-lg border transition duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isSuspicious ? 'border-rose-300 bg-rose-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isSuspicious ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                      <p className="text-sm font-mono text-slate-700 break-all">
                        {s.sid}
                      </p>
                      {isSuspicious && (
                        <span className="ml-2 text-xs font-bold text-rose-600 uppercase tracking-wider bg-rose-200 px-2 py-0.5 rounded-full">Suspicious</span>
                      )}
                    </div>
                    
                    {userData.ip && (
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold">IP:</span> {userData.ip}
                      </p>
                    )}
                    {userData.userAgent && (
                      <p className="text-xs text-slate-600 truncate max-w-xs sm:max-w-md" title={userData.userAgent}>
                        <span className="font-semibold">Device/Browser:</span> {userData.userAgent}
                      </p>
                    )}

                    <p className="text-xs text-slate-500">
                      Expires: {new Date(s.expire).toLocaleString()}
                    </p>
                    
                    {isSuspicious && (
                      <p className="text-xs text-rose-600 font-medium mt-1">
                        Unrecognized device or IP. If this was not you, remove this session immediately.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => deleteSession(s.sid)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border transition duration-200 self-start sm:self-center shadow-sm ${isSuspicious ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700' : 'bg-white hover:bg-rose-600 hover:text-white text-rose-600 border-rose-200'}`}
                  >
                    Remove Session
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}