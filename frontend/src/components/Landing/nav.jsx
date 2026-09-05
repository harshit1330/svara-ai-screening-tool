import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardMenu } from "../Dashboard/DashboardMenu";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  let userData = null;
  try { userData = JSON.parse(localStorage.getItem("userData")); } catch { /* Use guest profile. */ }

  return (
    <>
      <nav aria-label="Main navigation" className="relative grid h-18 grid-cols-[1fr_auto_1fr] items-center bg-blue-600 px-7 text-white">
        <button onClick={() => setMenuOpen(true)} aria-label="Open navigation menu" aria-expanded={menuOpen} className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 transition hover:bg-white/25">
          <span className="grid gap-1.5" aria-hidden="true"><span className="h-0.5 w-6 rounded bg-white" /><span className="h-0.5 w-6 rounded bg-white" /><span className="h-0.5 w-6 rounded bg-white" /></span>
        </button>
        <Link to="/" className="text-3xl font-bold" aria-label="Svara home">Svara</Link>
      </nav>
      <DashboardMenu activeView="home" isOpen={menuOpen} onClose={() => setMenuOpen(false)} userData={userData} onSelect={(view) => {
        setMenuOpen(false);
        navigate(view === "screening" ? "/dashboard" : `/dashboard?view=${view}`);
      }} />
    </>
  );
};
