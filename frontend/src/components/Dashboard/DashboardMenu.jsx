import { useEffect } from "react";
import { Link } from "react-router-dom";

const menuItems = [
  { id: "profile", label: "Profile", icon: "◎" },
  { id: "history", label: "Results / History", icon: "▤" },
  { id: "screening", label: "New screening", icon: "+" },
];

export function DashboardMenu({ activeView, isOpen, onClose, onSelect, userData }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <button
        className="fixed inset-x-0 bottom-0 top-18 z-30 border-0 bg-slate-950/30"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="fixed bottom-0 left-0 top-18 z-40 w-[292px] max-w-[85vw] overflow-y-auto bg-white px-4 py-6 pb-20 text-[#0B1E39] shadow-2xl" aria-label="Navigation menu">
        <div className="flex items-center justify-between border-b border-slate-200 px-2 pb-4">
          <strong className="text-lg">Menu</strong>
          <button onClick={onClose} aria-label="Close menu" className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-lg text-slate-500 hover:bg-slate-200">×</button>
        </div>

        <div className="mx-1 my-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3.5">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 font-extrabold text-blue-700">
            {(userData?.name || "P").charAt(0).toUpperCase()}
          </span>
          <span><strong className="block text-sm">{userData?.name || "Patient"}</strong><small className="mt-0.5 block text-[11px] text-slate-500">Patient profile</small></span>
        </div>

        <nav className="grid gap-2">
          <Link to="/" onClick={onClose} aria-current={activeView === "home" ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold ${activeView === "home" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}><span className="w-6 text-center" aria-hidden="true">⌂</span>Home</Link>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-bold transition ${activeView === item.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <span className="w-6 text-center text-lg">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        <p className="mt-6 border-t border-slate-200 pt-4 text-[10px] text-slate-400">Svara · Research voice screening</p>
      </aside>
    </>
  );
}
