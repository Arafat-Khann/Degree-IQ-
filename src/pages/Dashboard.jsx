import { useContext, useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentContext } from '../context/StudentContext'
import { DEGREE_MAP } from '../utils/degrees'
import { GRADE_POINTS, calculateCGPA, calculateProjectedCGPAFromCurrentCourses } from '../logic/cgpaEngine'
import { buildCourseMap, getMissingPrereqs } from '../logic/prerequisiteChecker'
import { getSemesterLoad } from '../logic/workloadAnalyzer'
import { getSmartInsightCards, getBoosterCards, getPlannerCards, getCourseManagerCards } from '../logic/aiAdvisor'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Navbar } from '../components/ui/Navbar'

const INSIGHT_TONE_STYLES = {
  success: 'border-l-4 border-l-[#16A34A]',
  warning: 'border-l-4 border-l-[#D97706]',
  info: 'border-l-4 border-l-[#003F87]',
}

function InsightCard({ card }) {
  return (
    <Card className={INSIGHT_TONE_STYLES[card.tone] || INSIGHT_TONE_STYLES.info}>
      <div className="text-[12px] font-medium uppercase mb-[8px] text-[#003F87]">{card.metric}</div>
      <div className="text-[15px] font-bold text-[#0F172A] mb-[8px]">{card.title}</div>
      <p className="text-[13px] text-[#475569] mb-[10px]">{card.explanation}</p>
      <p className="text-[13px] font-medium text-[#0F172A] mb-[8px]">Recommendation: {card.recommendation}</p>
      {card.action && <div className="text-[12px] text-[#94A3B8]">{card.action}</div>}
    </Card>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const { degree, currentSemester, completedGrades, goalGpa, resetAll } = useContext(StudentContext)
  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [activeTab])

  if (!degree) {
    navigate('/')
    return null
  }

  const handleBack = () => {
    navigate('/onboarding', { state: { step: 5 } })
  }

  const handleReset = () => {
    if (window.confirm('This will erase all your data. Continue?')) {
      resetAll()
      navigate('/')
    }
  }

  const degreeData = DEGREE_MAP[degree]?.data

  return (
    <div className="min-h-screen bg-white">
      <Navbar onBack={handleBack} onReset={handleReset} showBack showReset />

      {/* Tab Navigation */}
      <div className="border-b border-[#E2E8F0] sticky top-[65px] z-30 bg-white">
        <div className="max-w-[1280px] mx-auto px-[24px] flex gap-[32px]">
          {[
            { id: 'home', label: 'Home' },
            { id: 'planner', label: 'Planner' },
            { id: 'booster', label: 'GPA Booster' },
            { id: 'manager', label: 'Course Manager' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-[16px] text-[14px] font-medium border-b-2 ${
                activeTab === tab.id
                  ? 'text-[#003F87] border-[#003F87]'
                  : 'text-[#94A3B8] border-transparent hover:text-[#475569]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-[1280px] mx-auto px-[24px] py-[32px]">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'planner' && <PlannerTab />}
        {activeTab === 'booster' && <GpaBoosterTab />}
        {activeTab === 'manager' && <CourseManagerTab />}
      </div>

      {/* Footer */}
      <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] mt-[64px]">
        <div className="max-w-[1280px] mx-auto px-[24px] py-[24px] text-center">
          <p className="text-[12px] text-[#94A3B8]">
            Built by Students · BS Computer Science · COMSATS University Islamabad · 2025
          </p>
        </div>
      </div>
    </div>
  )
}

function HomeTab() {
  const { degree, currentSemester, completedGrades, currentCourses, goalGpa } = useContext(StudentContext)
  const degreeData = DEGREE_MAP[degree]?.data

  const cgpa = calculateCGPA(completedGrades)
  const projectedCGPA = calculateProjectedCGPAFromCurrentCourses(completedGrades, currentCourses)
  const completedCredits = Object.values(completedGrades).reduce((sum, c) => sum + (c.credits || 0), 0)
  const semestersLeft = 8 - currentSemester
  const targetGpa = goalGpa ?? 3.5

  const insightCards = useMemo(
    () =>
      getSmartInsightCards({
        completedGrades,
        degreeData,
        currentSemester,
        currentCourses,
        targetGpa,
      }),
    [completedGrades, degreeData, currentSemester, currentCourses, targetGpa],
  )

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      <div className="mb-[40px] pb-[24px] border-b border-[#E2E8F0]">
        <p className="text-[14px] text-[#475569]">
          {getGreeting()}, here's your degree overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-[16px] mb-[48px] lg:grid-cols-4">
        <Card>
          <div className="text-[12px] text-[#94A3B8] font-medium mb-[8px]">Current CGPA</div>
          <div className="text-[32px] font-bold text-[#003F87]">{cgpa}</div>
          <div className="text-[12px] text-[#94A3B8] mt-[12px]">Target: {targetGpa.toFixed(2)}</div>
        </Card>

        <Card>
          <div className="text-[12px] text-[#94A3B8] font-medium mb-[8px]">Projected CGPA</div>
          <div className="text-[32px] font-bold text-[#003F87]">{projectedCGPA}</div>
          <div className="text-[12px] text-[#94A3B8] mt-[12px]">With ongoing semester grades</div>
        </Card>

        <Card>
          <div className="text-[12px] text-[#94A3B8] font-medium mb-[8px]">Credits Completed</div>
          <div className="text-[32px] font-bold text-[#003F87]">{completedCredits}</div>
          <div className="text-[12px] text-[#94A3B8] mt-[12px]">of 133 total</div>
        </Card>

        <Card>
          <div className="text-[12px] text-[#94A3B8] font-medium mb-[8px]">Semesters Left</div>
          <div className="text-[32px] font-bold text-[#003F87]">{semestersLeft}</div>
          <div className="text-[12px] text-[#94A3B8] mt-[12px]">Semester {currentSemester} in progress</div>
        </Card>
      </div>

      <div className="mb-[48px]">
        <h2 className="text-[18px] font-bold text-[#0F172A] mb-[20px]">Graduation Progress</h2>
        <div className="space-y-[20px]">
          <ProgressBar label="Overall Credits" value={completedCredits} max={133} />
          <ProgressBar label="Computing Core" value={Math.min(completedCredits, 36)} max={36} />
          <ProgressBar label="Domain Core" value={Math.min(completedCredits, 24)} max={24} />
        </div>
      </div>

      <div>
        <h2 className="text-[18px] font-bold text-[#0F172A] mb-[20px]">Smart Insights</h2>
        <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-2">
          {insightCards.map((card, index) => (
            <InsightCard key={`${card.title}-${index}`} card={card} />
          ))}
        </div>
      </div>
    </div>
  )
}

function PlannerTab() {
  const { degree, currentSemester, completedGrades } = useContext(StudentContext)
  const degreeData = DEGREE_MAP[degree]?.data
  const courseMap = buildCourseMap(degreeData)

  const plannerCards = useMemo(
    () => getPlannerCards({ degreeData, completedGrades, currentSemester }),
    [degreeData, completedGrades, currentSemester],
  )

  if (!degreeData?.semesters_plan) return <div className="text-[#94A3B8]">No data</div>

  const getCourseStatus = (courseCode) => {
    if (completedGrades[courseCode]) return 'completed'
    const prereqs = courseMap[courseCode]?.prerequisites || []
    if (prereqs.length === 0) return 'ready'
    const allMet = prereqs.every(p => completedGrades[p])
    return allMet ? 'ready' : 'locked'
  }

  return (
    <div className="space-y-[24px]">
      <div>
        <h2 className="text-[18px] font-bold text-[#0F172A] mb-[12px]">Planner Advisory</h2>
        <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-3">
          {plannerCards.map((card, index) => (
            <InsightCard key={`${card.title}-${index}`} card={card} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-[18px] font-bold text-[#0F172A]">Full Degree Roadmap</h2>
        <p className="text-[13px] text-[#475569] mt-[8px] mb-[20px]">
          Full course names are shown, and locked courses include the missing prerequisite names directly below them.
        </p>
      </div>

      {degreeData.semesters_plan.map(semester => (
        <Card key={semester.semester}>
          <div className="flex justify-between items-center mb-[16px]">
            <h3 className="text-[15px] font-bold text-[#0F172A]">
              Semester {semester.semester} · {semester.courses?.reduce((sum, c) => sum + (c.credits || 0), 0)} credits
            </h3>
            <Badge variant={semester.semester === currentSemester ? 'default' : 'secondary'}>
              {semester.semester === currentSemester ? '📍 Now' : semester.semester < currentSemester ? '✅ Done' : 'Upcoming'}
            </Badge>
          </div>

          <div className="space-y-[8px]">
            {semester.courses?.map(course => {
              const status = getCourseStatus(course.code)
              const missingPrereqs = status === 'locked' ? getMissingPrereqs(course.code, completedGrades, courseMap) : []
              const statusColors = {
                completed: 'bg-[#DCFCE7] text-[#166534]',
                ready: 'bg-[#DBEAFE] text-[#1E40AF]',
                locked: 'bg-[#F3F4F6] text-[#6B7280]',
              }

              return (
                <div
                  key={course.code}
                  className="flex justify-between items-center p-[12px] border border-[#E2E8F0] rounded-[8px] hover:bg-[#F8FAFC]"
                >
                  <div className="flex-1">
                    <div className="text-[12px] text-[#94A3B8] font-medium">{course.code}</div>
                    <div className="text-[14px] font-medium text-[#0F172A]">{course.name}</div>
                    {status === 'locked' && missingPrereqs.length > 0 && (
                      <div className="mt-[6px] text-[12px] text-[#6B7280]">
                        Requires: {missingPrereqs.map(prereq => prereq.name).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <Badge variant="secondary">{course.credits} cr</Badge>
                    <span className={`text-[12px] font-medium px-[8px] py-[4px] rounded-[6px] ${statusColors[status]}`}>
                      {status === 'completed' && '✅ Completed'}
                      {status === 'ready' && '🔓 Ready'}
                      {status === 'locked' && '🔒 Locked'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ))}
    </div>
  )
}

function GpaBoosterTab() {
  const { degree, currentSemester, completedGrades } = useContext(StudentContext)
  const degreeData = DEGREE_MAP[degree]?.data
  const [whatIfGrades, setWhatIfGrades] = useState(completedGrades)

  const boosterCards = useMemo(
    () => getBoosterCards({ completedGrades, degreeData, currentSemester }),
    [completedGrades, degreeData, currentSemester],
  )

  const currentCGPA = calculateCGPA(completedGrades)
  const projectedCGPA = calculateCGPA(whatIfGrades)

  return (
    <div>
      <h2 className="text-[18px] font-bold text-[#0F172A] mb-[12px]">GPA Booster</h2>
      <p className="text-[13px] text-[#475569] mb-[20px]">
        The booster ranks the courses with the biggest CGPA effect and suggests the lightest semester to retake them.
      </p>

      <div className="grid grid-cols-1 gap-[16px] mb-[32px] lg:grid-cols-2">
        {boosterCards.map((card, index) => (
          <InsightCard key={`${card.title}-${index}`} card={card} />
        ))}
      </div>

      <Card className="mb-[32px]">
        <div className="text-[12px] text-[#94A3B8] font-medium mb-[4px]">What-If Simulator</div>
        <div className="flex items-center gap-[12px] mb-[8px]">
          <div className="text-[32px] font-bold text-[#0F172A]">{currentCGPA}</div>
          <span className="text-[14px] font-medium text-[#475569]">→</span>
          <div className="text-[32px] font-bold text-[#003F87]">{projectedCGPA}</div>
        </div>
        <p className="text-[13px] text-[#475569]">
          Change a grade below to see the manual forecast shift. The cards above already rank the smartest retake path.
        </p>
      </Card>

      <div>
        <h3 className="text-[15px] font-bold text-[#0F172A] mb-[16px]">Scenario Controls</h3>
        <div className="space-y-[8px]">
          {Object.entries(completedGrades).map(([code, data]) => (
            <div key={code} className="flex justify-between items-center bg-[#F8FAFC] p-[12px] rounded-[8px]">
              <div>
                <div className="text-[12px] text-[#94A3B8]">{code}</div>
                <div className="text-[14px] font-medium text-[#0F172A]">{data.courseName || code}</div>
              </div>
              <select
                value={whatIfGrades[code]?.grade || data.grade}
                onChange={e => {
                  setWhatIfGrades(prev => ({
                    ...prev,
                    [code]: {
                      ...prev[code],
                      grade: e.target.value,
                      gradePoints: Object.prototype.hasOwnProperty.call(GRADE_POINTS, e.target.value)
                        ? GRADE_POINTS[e.target.value]
                        : null,
                    },
                  }))
                }}
                className="border border-[#E2E8F0] rounded-[6px] px-[12px] py-[6px] text-[14px]"
              >
                {['-', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CourseManagerTab() {
  const { degree, currentSemester, currentCourses, setPredictedGrade, completedGrades } = useContext(StudentContext)
  const degreeData = DEGREE_MAP[degree]?.data

  const currentSemesterData = degreeData?.semesters_plan?.[currentSemester - 1]
  const courses = currentSemesterData?.courses || []
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0)
  const workload = getSemesterLoad(courses)
  const projectedCGPA = calculateProjectedCGPAFromCurrentCourses(completedGrades, currentCourses)
  const managerCards = useMemo(
    () => getCourseManagerCards({ completedGrades, currentCourses, degreeData, currentSemester }),
    [completedGrades, currentCourses, degreeData, currentSemester],
  )

  return (
    <div>
      <h2 className="text-[18px] font-bold text-[#0F172A] mb-[12px]">Enter expected grades for this semester</h2>
      <p className="text-[13px] text-[#475569] mb-[20px]">
        The course manager predicts how this semester will affect your CGPA and flags the course that is dragging the forecast down.
      </p>

      <div className="grid grid-cols-1 gap-[16px] mb-[32px] lg:grid-cols-3">
        {managerCards.map((card, index) => (
          <InsightCard key={`${card.title}-${index}`} card={card} />
        ))}
      </div>

      <Card className="mb-[32px]">
        <div className="grid grid-cols-1 gap-[16px] md:grid-cols-4">
          <div>
            <div className="text-[12px] text-[#94A3B8] font-medium mb-[4px]">Total Credits</div>
            <div className="text-[24px] font-bold text-[#0F172A]">{totalCredits}</div>
          </div>
          <div>
            <div className="text-[12px] text-[#94A3B8] font-medium mb-[4px]">Heavy Courses</div>
            <div className="text-[24px] font-bold text-[#0F172A]">{courses.filter(c => c.credits >= 4).length}</div>
          </div>
          <div>
            <div className="text-[12px] text-[#94A3B8] font-medium mb-[4px]">Workload</div>
            <div
              className={`text-[24px] font-bold ${
                workload === 'heavy' ? 'text-[#DC2626]' : workload === 'moderate' ? 'text-[#D97706]' : 'text-[#16A34A]'
              }`}
            >
              {workload.charAt(0).toUpperCase() + workload.slice(1)}
            </div>
          </div>
          <div>
            <div className="text-[12px] text-[#94A3B8] font-medium mb-[4px]">Projected CGPA</div>
            <div className="text-[24px] font-bold text-[#003F87]">{projectedCGPA}</div>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="text-[15px] font-bold text-[#0F172A] mb-[16px]">Courses</h3>
        <div className="space-y-[8px]">
          {courses.map(course => (
            <Card key={course.code}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[12px] text-[#94A3B8]">{course.code}</div>
                  <div className="text-[14px] font-medium text-[#0F172A]">{course.name}</div>
                  <div className="flex gap-[8px] mt-[8px]">
                    <Badge variant="secondary">{course.credits} credits</Badge>
                    <Badge
                      variant={course.credits >= 4 ? 'warning' : course.credits === 3 ? 'default' : 'secondary'}
                    >
                      {course.credits >= 4 ? '⚡ Heavy' : course.credits === 3 ? '📚 Medium' : '✨ Light'}
                    </Badge>
                  </div>
                </div>
                <select
                  value={currentCourses[course.code]?.predictedGrade || '-'}
                  onChange={e => setPredictedGrade(course.code, e.target.value, course.credits, course.name)}
                  className="border border-[#E2E8F0] rounded-[6px] px-[12px] py-[8px] text-[14px]"
                >
                  {['-', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map(g => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
