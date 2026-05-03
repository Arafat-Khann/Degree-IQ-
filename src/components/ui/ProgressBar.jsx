export function ProgressBar({ value = 0, label = '', max = 100, className = '' }) {
  const percentage = (value / max) * 100

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[14px] font-medium text-[#0F172A]">{label}</span>
        <span className="text-[12px] font-medium text-[#94A3B8]">{percentage.toFixed(0)}%</span>
      </div>
      <div className="h-[6px] bg-[#EEF4FF] rounded-[3px] overflow-hidden">
        <div
          className="h-full bg-[#003F87] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}
