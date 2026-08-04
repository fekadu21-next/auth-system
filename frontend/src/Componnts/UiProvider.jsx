import { useCallback, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { UiContext } from "./uiContext.js";

/**
 * UiProvider — Professional in-UI messaging layer.
 *
 * Renders every message inside the body of the app (never native browser
 * popups) and exposes a single context API used across the whole frontend:
 *
 *   const { showToast, confirm, prompt } = useUi();
 *
 *   showToast("Saved", "success")           -> top-right toast notification
 *   const ok = await confirm({ title, message, danger })
 *   const url = await prompt({ title, placeholder, defaultValue })
 *
 * Toast types: "success" | "error" | "info"
 */

let toastId = 0;

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    barClass: "bg-emerald-500",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-rose-600",
    barClass: "bg-rose-500",
  },
  info: {
    icon: Info,
    iconClass: "text-indigo-600",
    barClass: "bg-indigo-500",
  },
};

export function UiProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [promptState, setPromptState] = useState(null);
  const confirmResolveRef = useRef(null);
  const promptResolveRef = useRef(null);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success", duration = 4000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => dismissToast(id), duration);
    },
    [dismissToast]
  );

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirmState({
        title: "Are you sure?",
        message: "",
        confirmText: "Confirm",
        cancelText: "Cancel",
        danger: false,
        ...options,
      });
    });
  }, []);

  const resolveConfirm = useCallback((value) => {
    confirmResolveRef.current?.(value);
    confirmResolveRef.current = null;
    setConfirmState(null);
  }, []);

  const prompt = useCallback((options) => {
    return new Promise((resolve) => {
      promptResolveRef.current = resolve;
      setPromptState({
        title: "Enter a value",
        message: "",
        defaultValue: "",
        placeholder: "",
        confirmText: "OK",
        cancelText: "Cancel",
        ...options,
        value: options.defaultValue || "",
      });
    });
  }, []);

  const resolvePrompt = useCallback((value) => {
    promptResolveRef.current?.(value);
    promptResolveRef.current = null;
    setPromptState(null);
  }, []);

  return (
    <UiContext.Provider value={{ showToast, confirm, prompt }}>
      {children}

      {/* Toasts — fixed top-right, inside the page body */}
      <div className="fixed top-4 right-4 z-[1000] flex w-full max-w-sm flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg animate-toast-in"
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${style.barClass}`} />
              <Icon size={18} className={`mt-0.5 shrink-0 ${style.iconClass}`} />
              <p className="flex-1 text-sm leading-snug text-slate-700">{toast.message}</p>
              <button
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 text-slate-400 transition hover:text-slate-600"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirm dialog — in-body replacement for window.confirm */}
      {confirmState && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => resolveConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-toast-in">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  confirmState.danger
                    ? "bg-rose-100 text-rose-600"
                    : "bg-indigo-100 text-indigo-600"
                }`}
              >
                {confirmState.danger ? <AlertTriangle size={18} /> : <AlertCircle size={18} />}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">{confirmState.title}</h3>
                {confirmState.message && (
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {confirmState.message}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => resolveConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                {confirmState.cancelText}
              </button>
              <button
                onClick={() => resolveConfirm(true)}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
                  confirmState.danger
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt dialog — in-body replacement for window.prompt */}
      {promptState && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => resolvePrompt(null)}
          />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-toast-in">
            <h3 className="font-semibold text-slate-900">{promptState.title}</h3>
            {promptState.message && (
              <p className="mt-1 text-sm text-slate-500">{promptState.message}</p>
            )}
            <input
              type="text"
              autoFocus
              value={promptState.value}
              placeholder={promptState.placeholder}
              onChange={(e) => setPromptState((s) => ({ ...s, value: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") resolvePrompt(promptState.value.trim());
                if (e.key === "Escape") resolvePrompt(null);
              }}
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => resolvePrompt(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                {promptState.cancelText}
              </button>
              <button
                onClick={() => resolvePrompt(promptState.value.trim())}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                {promptState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </UiContext.Provider>
  );
}
