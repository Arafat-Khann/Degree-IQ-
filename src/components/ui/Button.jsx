export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const baseClasses = 'font-medium transition-colors rounded-[8px] border-0 cursor-pointer'

  const variants = {
    primary: 'bg-[#003F87] text-white hover:bg-[#002D5E]',
    ghost: 'bg-transparent border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]',
    secondary: 'bg-[#EEF4FF] text-[#003F87] hover:bg-[#DCE8FF]',
  }

  const sizes = {
    sm: 'px-[12px] py-[6px] text-[12px]',
    md: 'px-[20px] py-[10px] text-[14px]',
    lg: 'px-[24px] py-[12px] text-[16px]',
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
