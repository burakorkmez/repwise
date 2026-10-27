"use client";

import { useState, useSyncExternalStore } from "react";

type Habit = { id: string; name: string; done: string[] };

const KEY = "repwise-habits";

// Local YYYY-MM-DD, `offset` days ago
const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString("en-CA");
};

// Consecutive days done, ending today (or yesterday if today isn't checked yet)
const streak = (done: string[]) => {
  let i = done.includes(day(0)) ? 0 : 1;
  let n = 0;
  while (done.includes(day(i++))) n++;
  return n;
};

// localStorage is the store; "storage" events re-render (other tabs fire it natively)
const subscribe = (cb: () => void) => {
  addEventListener("storage", cb);
  return () => removeEventListener("storage", cb);
};

const newId = () => Date.now().toString();

const save = (next: Habit[]) => {
  localStorage.setItem(KEY, JSON.stringify(next));
  dispatchEvent(new StorageEvent("storage"));
};

const toggleTheme = () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", root.dataset.theme);
};

export default function Home() {
  const [name, setName] = useState("");
  const json = useSyncExternalStore(subscribe, () => localStorage.getItem(KEY) ?? "[]", () => null);

  if (json === null) return null;
  const habits: Habit[] = JSON.parse(json);

  const toggle = (id: string, d: string) =>
    save(
      habits.map((h) =>
        h.id !== id
          ? h
          : { ...h, done: h.done.includes(d) ? h.done.filter((x) => x !== d) : [...h.done, d] },
      ),
    );

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    save([...habits, { id: newId(), name: name.trim(), done: [] }]);
    setName("");
  };

  const days = [6, 5, 4, 3, 2, 1, 0].map(day);

  return (
    <main className="mx-auto w-full max-w-xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Repwise</h1>
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="rounded border border-zinc-300 px-3 py-1 dark:border-zinc-700"
        >
          ◐
        </button>
      </div>

      <form className="mb-6 flex gap-2" onSubmit={add}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New habit"
          aria-label="New habit"
          className="flex-1 rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
        />
        <button className="rounded bg-foreground px-4 py-2 text-background">Add</button>
      </form>

      {habits.length === 0 && <p className="text-zinc-500">No habits yet. Add one above.</p>}

      <ul className="space-y-3">
        {habits.map((h) => (
          <li key={h.id} className="rounded border border-zinc-300 p-3 dark:border-zinc-700">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex-1 font-medium">{h.name}</span>
              <span className="text-sm text-zinc-500">🔥 {streak(h.done)}</span>
              <button
                onClick={() => save(habits.filter((x) => x.id !== h.id))}
                aria-label={`Delete ${h.name}`}
                className="text-zinc-500 hover:text-red-500"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-1">
              {days.map((d) => {
                const on = h.done.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggle(h.id, d)}
                    aria-pressed={on}
                    aria-label={`${h.name} on ${d}`}
                    title={d}
                    className={`h-10 flex-1 rounded text-xs ${on ? "bg-green-500 text-white" : "bg-zinc-200 dark:bg-zinc-800"}`}
                  >
                    {new Date(`${d}T00:00`).toLocaleDateString(undefined, { weekday: "short" })}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
