export function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-[12px] p-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  )
}
