import { useState } from 'react'
import { Card } from './Card'

const INSIGHT_TONE_STYLES = {
  success: 'border-l-4 border-l-[#16A34A]',
  warning: 'border-l-4 border-l-[#D97706]',
  info: 'border-l-4 border-l-[#003F87]',
}

export function ExpandableCard({ card }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => setIsExpanded(!isExpanded)
  const handleMouseEnter = () => setIsExpanded(true)
  const handleMouseLeave = () => setIsExpanded(false)

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={toggleExpanded}
      className="cursor-pointer"
    >
      <Card
        className={`${INSIGHT_TONE_STYLES[card.tone] || INSIGHT_TONE_STYLES.info} transition-all duration-500 ease-in-out hover:shadow-lg`}
      >
        <div className="overflow-hidden">
          {!isExpanded ? (
            // Compact view
            <div className="space-y-[8px] animate-fadeIn">
              <div className="flex justify-between items-start gap-[12px]">
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-[#0F172A] mb-[4px]">{card.title}</div>
                  <p className="text-[13px] text-[#475569] line-clamp-2 transition-opacity duration-500">{card.recommendation}</p>
                </div>
                <div className="text-[18px] flex-shrink-0 mt-[2px] transition-transform duration-500">↓</div>
              </div>
            </div>
          ) : (
            // Expanded view
            <div className="space-y-[12px] animate-fadeIn">
              <div className="flex justify-between items-start gap-[12px]">
                <div className="flex-1">
                  <div className="text-[12px] font-medium uppercase mb-[8px] text-[#003F87] transition-opacity duration-500">{card.metric}</div>
                  <div className="text-[15px] font-bold text-[#0F172A] mb-[8px]">{card.title}</div>
                  <p className="text-[13px] text-[#475569] mb-[10px] transition-opacity duration-500">{card.explanation}</p>
                  <p className="text-[13px] font-medium text-[#0F172A] mb-[8px] transition-opacity duration-500">Recommendation: {card.recommendation}</p>
                  {card.action && <div className="text-[12px] text-[#94A3B8] transition-opacity duration-500">{card.action}</div>}
                </div>
                <div className="text-[18px] flex-shrink-0 mt-[2px] transition-transform duration-500">↑</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
