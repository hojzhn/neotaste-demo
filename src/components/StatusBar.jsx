import { Signal, Wifi, BatteryFull } from 'lucide-react'

export function StatusBar({ time = '9:41', dark = false }) {
  const tone = dark ? 'text-white' : 'text-ink'
  return (
    <div className={`h-11 px-6 pt-2 flex items-center justify-between text-[15px] font-semibold ${tone}`}>
      <span>{time}</span>
      <div className="flex items-center gap-1.5">
        <Signal className="w-4 h-4" strokeWidth={2.5} />
        <Wifi className="w-4 h-4" strokeWidth={2.5} />
        <BatteryFull className="w-5 h-5" strokeWidth={2.5} />
      </div>
    </div>
  )
}
