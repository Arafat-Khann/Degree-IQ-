import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { StudentContext } from '../../context/StudentContext'

export function Navbar({ onBack = null, onReset = null, showBack = false, showReset = false }) {
  const { degree } = useContext(StudentContext)
  const degreeMap = {
    BCS: 'BS Computer Science',
    BAI: 'BS Artificial Intelligence',
    BDS: 'BS Data Science',
    BCT: 'BS Cyber Security',
    BSE: 'BS Software Engineering',
  }

  return (
    <nav className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-[16px] sm:px-[24px] py-[12px] sm:py-[14px] flex justify-between items-center gap-[12px] sm:gap-[24px]">
        <Link to="/" className="flex items-center gap-[8px] sm:gap-[12px] shrink-0">
          <img
            src="/images/logo/LOGO.png"
            alt="DegreeIQ"
            className="h-[36px] w-[36px] sm:h-[42px] sm:w-[42px] object-contain shrink-0"
          />
          <span className="text-[clamp(1rem,3vw,1.125rem)] font-semibold tracking-[-0.02em] text-[#0F172A]\">DegreeIQ</span>
        </Link>

        <div className="flex items-center gap-[8px] sm:gap-[10px] ml-auto min-w-0">
          {degree && (
            <span className=\"hidden sm:inline text-[14px] text-[#475569] whitespace-nowrap mr-[4px]\">
              {degreeMap[degree] || degree}
            </span>
          )}

          {showBack && onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center rounded-[8px] sm:rounded-[12px] border border-[#D7E2F0] bg-white px-[10px] sm:px-[12px] py-[6px] sm:py-[8px] text-[12px] sm:text-[13px] font-medium text-[#003F87] shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-colors hover:border-[#B8CBE3] hover:bg-[#F8FBFF] hover:text-[#002D5E] cursor-pointer whitespace-nowrap"
            >
              ← Back
            </button>
          )}

          {showReset && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center rounded-[8px] sm:rounded-[12px] border border-[#E2E8F0] bg-white px-[10px] sm:px-[12px] py-[6px] sm:py-[8px] text-[12px] sm:text-[13px] font-medium text-[#475569] shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#0F172A] cursor-pointer whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
