export function Select({ options = [], value = '', onChange, placeholder = 'Select...', className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border border-[#E2E8F0] rounded-[8px] px-[12px] py-[8px] text-[14px] focus:outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] bg-white cursor-pointer ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
