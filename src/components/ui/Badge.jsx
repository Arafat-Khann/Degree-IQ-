export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[#EEF4FF] text-[#003F87]',
    success: 'bg-[#DCFCE7] text-[#166534]',
    warning: 'bg-[#FEF3C7] text-[#92400E]',
    danger: 'bg-[#FEE2E2] text-[#991B1B]',
    secondary: 'bg-[#F1F5F9] text-[#475569]',
  }

  return (
    <span
      className={`inline-block px-[10px] py-[2px] rounded-[20px] text-[11px] font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
