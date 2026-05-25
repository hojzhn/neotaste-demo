import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          neotaste<span className="text-indigo-600">.</span>
        </h1>
        <p className="text-slate-600">
          Vite + React + Tailwind, ready to deploy on Vercel.
        </p>
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white font-medium shadow-sm hover:bg-indigo-700 transition"
        >
          Count is {count}
        </button>
        <p className="text-sm text-slate-500">
          Edit <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-slate-800">src/App.jsx</code> to get started.
        </p>
      </div>
    </main>
  )
}

export default App
