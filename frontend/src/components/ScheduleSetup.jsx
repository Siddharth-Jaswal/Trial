import { useMemo, useState, useEffect } from "react";
import api from "../api/axios.js";

export default function ScheduleSetup({ extracted }) {
  const [chatId, setChatId] = useState(""); // Telegram Chat ID instead of phone
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  // Create rows from extracted prescription
  const items = useMemo(() => {
    const pres = extracted?.prescription || [];
    return pres.map((p) => ({
      medicine: p.medicine || "Medicine",
      durationDays: "",
      times: [""],
    }));
  }, [extracted]);

  useEffect(() => {
    setRows(items);
  }, [items]);

  const updateTime = (ri, ti, value) => {
    const copy = rows.map((r) => ({ ...r, times: [...r.times] }));
    copy[ri].times[ti] = value;
    setRows(copy);
  };

  const addTimeField = (ri) => {
    const copy = rows.map((r) => ({ ...r, times: [...r.times] }));
    copy[ri].times.push("");
    setRows(copy);
  };

  const removeTimeField = (ri) => {
    const copy = rows.map((r) => ({ ...r, times: [...r.times] }));
    if (copy[ri].times.length > 1) {
      copy[ri].times.pop();
      setRows(copy);
    }
  };

  const submit = async () => {
    setMsg("");
    try {
      if (!chatId) throw new Error("Please enter your Telegram Chat ID (from @userinfobot)");

      for (const r of rows) {
        const d = parseInt(r.durationDays, 10);
        if (!d || d <= 0) throw new Error(`Set duration for ${r.medicine}`);
        if (!r.times.some(Boolean)) throw new Error(`Add at least one time for ${r.medicine}`);
      }

      // Format payload for Telegram reminder API
      const schedules = rows.flatMap((r) =>
        r.times
          .filter(Boolean)
          .map((t) => ({
            medicine: r.medicine,
            time: t,
            duration: parseInt(r.durationDays, 10),
          }))
      );

      const body = { chatId, schedules };
      const res = await api.post("/schedules", body);
      const data = res.data;

      if (data.success || data.count)
        setMsg(`✅ Created ${data.count || schedules.length} Telegram reminders`);
      else setMsg("⚠️ Failed to create reminders");
    } catch (err) {
      console.error(err);
      setMsg("❌ " + err.message);
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm space-y-4">
      <h2 className="text-xl font-semibold text-blue-300">Schedule Setup</h2>

      {/* Telegram Chat ID input */}
      <div>
        <input
          className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder-slate-500 w-full"
          placeholder="Enter Telegram Chat ID (e.g. 123456789)"
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
        />
      </div>

      {(!rows || rows.length === 0) && (
        <p className="text-sm text-slate-400">Scan a prescription to populate medicines</p>
      )}

      {rows.map((r, ri) => (
        <div
          key={ri}
          className="bg-slate-950 border border-slate-800 rounded p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <b>{r.medicine}</b>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Duration (days)</span>
              <input
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 w-20 text-slate-200 placeholder-slate-500"
                placeholder="e.g. 5"
                value={r.durationDays}
                onChange={(e) => {
                  const copy = rows.map((x) => ({ ...x }));
                  copy[ri].durationDays = e.target.value;
                  setRows(copy);
                }}
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mt-1">
            {r.times.map((t, ti) => (
              <input
                key={ti}
                className="bg-slate-900 border border-slate-800 rounded px-3 py-2 w-28 text-slate-200 placeholder-slate-500"
                placeholder="HH:mm"
                value={t}
                onChange={(e) => updateTime(ri, ti, e.target.value)}
              />
            ))}
            <button
              type="button"
              className="px-2 py-1 border border-slate-700 rounded"
              onClick={() => addTimeField(ri)}
            >
              + time
            </button>
            <button
              type="button"
              className="px-2 py-1 border border-slate-700 rounded"
              onClick={() => removeTimeField(ri)}
            >
              - time
            </button>
          </div>
        </div>
      ))}

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 w-full"
        onClick={submit}
      >
        Create Telegram Reminders
      </button>

      {msg && <p className="text-sm text-blue-300">{msg}</p>}
    </div>
  );
}
