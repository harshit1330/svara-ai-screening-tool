function formatGender(value) {
  if (!value) return "Not provided";
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function ProfileView({ userData }) {
  return (
    <main className="mx-auto max-w-[980px] px-6 py-14">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">Patient account</p>
      <h1 className="mb-2 text-3xl font-bold">Profile</h1>
      <p className="text-sm text-slate-500">Your information used on screening reports.</p>
      <section className="mt-7 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3">
        <div><p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Name</p><strong>{userData?.name || "Not provided"}</strong></div>
        <div><p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Age</p><strong>{userData?.age || "Not provided"}</strong></div>
        <div><p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Gender</p><strong>{formatGender(userData?.gender)}</strong></div>
      </section>
    </main>
  );
}

export function HistoryView({ reports, onNewScreening, onViewReport }) {
  return (
    <main className="mx-auto max-w-[980px] px-6 py-14">
      <header className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">Patient records</p>
          <h1 className="mb-2 text-3xl font-bold">Report history</h1>
          <p className="text-sm text-slate-500">Every completed screening is saved here with its date and time.</p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700">{reports.length} {reports.length === 1 ? "report" : "reports"}</span>
      </header>

      {reports.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-bold">No saved reports yet</h2>
          <p className="mb-6 text-sm text-slate-500">Your first completed voice analysis will appear here automatically.</p>
          <button onClick={onNewScreening} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Start a screening</button>
        </section>
      ) : (
        <div className="grid gap-3">
          {reports.map((report) => {
            const createdAt = new Date(report.created_at);
            const isFlagged = report.flagged_for_follow_up;
            return (
              <article key={report.report_id} className="grid items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:grid-cols-[1fr_1.5fr_.7fr_auto]">
                <div><strong className="block text-sm">{createdAt.toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" })}</strong><span className="mt-1 block text-xs text-slate-400">{createdAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span></div>
                <span className={`w-max rounded-full px-3 py-2 text-[11px] font-bold ${isFlagged ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{isFlagged ? "Follow-up suggested" : "Negative screening result"}</span>
                <div><p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">Confidence</p><strong className="text-sm">{(report.model_score * 100).toFixed(1)}%</strong></div>
                <button onClick={() => onViewReport(report)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">View report</button>
              </article>
            );
          })}
        </div>
      )}
      {reports.length > 0 && <p className="mt-5 text-xs text-slate-400">New reports are added automatically after each completed analysis.</p>}
    </main>
  );
}
