import { useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { StudentContext } from '../../context/StudentContext'
import { DEGREE_MAP } from '../../utils/degrees'
import { calculateCGPA, GRADE_POINTS } from '../../logic/cgpaEngine'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { ProgressBar } from '../ui/ProgressBar'

export function OnboardingLayout() {
  const location = useLocation()
  const [step, setStep] = useState(location.state?.step || 2) // Start at step 2 by default
  const navigate = useNavigate()
  const { setDegree, setGoalGpa, setCurrentSemester, setCompletedGrades, completeOnboarding, degree, currentSemester } =
    useContext(StudentContext)

  const handleDegreeSelect = (selectedDegree) => {
    setDegree(selectedDegree)
    setStep(3)
  }

  const handleGoalGpaSelect = (goalGpa) => {
    setGoalGpa(goalGpa)
    setStep(4)
  }

  const handleSemesterSelect = (semester) => {
    setCurrentSemester(semester)
    setStep(5)
  }

  const handleGradesSubmit = (grades) => {
    setCompletedGrades(grades)
    completeOnboarding()
    navigate('/dashboard')
  }

  const handleBack = () => {
    if (step > 2) {
      setStep(step - 1)
      return
    }

    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Indicator */}
      <div className="border-b border-[#E2E8F0] sticky top-0 bg-white z-40">
        <div className="max-w-[1280px] mx-auto px-[16px] sm:px-[24px] py-[12px] sm:py-[16px]">
          <div className="flex items-center justify-between gap-[12px] mb-[12px]">
            <div className="flex gap-[8px]">
              <div className={`w-[8px] h-[8px] rounded-full ${step >= 2 ? 'bg-[#003F87]' : 'bg-[#E2E8F0]'}`}></div>
              <div className={`w-[8px] h-[8px] rounded-full ${step >= 3 ? 'bg-[#003F87]' : 'bg-[#E2E8F0]'}`}></div>
              <div className={`w-[8px] h-[8px] rounded-full ${step >= 4 ? 'bg-[#003F87]' : 'bg-[#E2E8F0]'}`}></div>
              <div className={`w-[8px] h-[8px] rounded-full ${step >= 5 ? 'bg-[#003F87]' : 'bg-[#E2E8F0]'}`}></div>
            </div>
            <div className="flex items-center gap-[8px] sm:gap-[12px]">
              <span className="text-[11px] sm:text-[12px] text-[#94A3B8] font-medium">Step {step - 1} of 4</span>
              <button
                onClick={handleBack}
                className="text-[12px] sm:text-[13px] text-[#003F87] hover:text-[#002D5E] font-medium cursor-pointer whitespace-nowrap"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-[16px] sm:px-[24px] py-[32px] sm:py-[48px]">
        {/* Step 2: Degree Selection */}
        {step === 2 && <DegreeSelector onSelect={handleDegreeSelect} />}

        {/* Step 3: Goal GPA Selection */}
        {step === 3 && <GoalGpaSelector onSelect={handleGoalGpaSelect} />}

        {/* Step 4: Semester Selection */}
        {step === 4 && (
          <SemesterSelector onSelect={handleSemesterSelect} selectedDegree={degree} />
        )}

        {/* Step 5: Grade Input */}
        {step === 5 && (
          <GradeInput
            onSubmit={handleGradesSubmit}
            selectedDegree={degree}
            currentSemester={currentSemester}
          />
        )}
      </div>
    </div>
  )
}

export function DegreeSelector({ onSelect }) {
  return (
    <div className="animate-[fadeIn_0.2s_ease-out]">
      <h1 className="text-[clamp(1.3rem,4vw,24px)] font-bold text-[#0F172A] mb-[8px]">Which program are you in?</h1>
      <p className="text-[13px] sm:text-[14px] text-[#475569] mb-[24px] sm:mb-[32px]">Select your degree program to get personalized insights.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] sm:gap-[16px] lg:grid-cols-3">
        {Object.entries(DEGREE_MAP).map(([code, { label, icon, data }]) => (
          <button
            key={code}
            onClick={() => onSelect(code)}
            className="border-2 border-[#E2E8F0] rounded-[12px] p-[20px] sm:p-[24px] text-center hover:border-[#003F87] hover:bg-[#EEF4FF] transition-all cursor-pointer"
          >
            <div className="text-[28px] sm:text-[32px] mb-[12px]">{icon}</div>
            <div className="text-[14px] sm:text-[15px] font-medium text-[#0F172A] mb-[8px]">{label}</div>
            <div className="text-[11px] sm:text-[12px] text-[#94A3B8]">4 years · 133 credits</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function GoalGpaSelector({ onSelect }) {
  const goalOptions = ['4.00', '3.75', '3.50', '3.25', '3.00', '2.75', '2.50']

  return (
    <div className="animate-[fadeIn_0.2s_ease-out] max-w-[720px]">
      <h1 className="text-[clamp(1.3rem,4vw,24px)] font-bold text-[#0F172A] mb-[8px]">What is your target CGPA?</h1>
      <p className="text-[13px] sm:text-[14px] text-[#475569] mb-[24px] sm:mb-[32px]">
        Choose the GPA goal you want us to optimize for.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-[12px] sm:gap-[12px] mb-[32px] lg:grid-cols-3">
        {goalOptions.map(goal => (
          <button
            key={goal}
            onClick={() => onSelect(parseFloat(goal))}
            className="border-2 border-[#E2E8F0] rounded-[12px] p-[16px] sm:p-[20px] text-center hover:border-[#003F87] hover:bg-[#EEF4FF] transition-all cursor-pointer"
          >
            <div className="text-[11px] sm:text-[12px] text-[#94A3B8] font-medium mb-[8px]">Goal GPA</div>
            <div className="text-[20px] sm:text-[24px] font-bold text-[#0F172A]">{goal}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function SemesterSelector({ onSelect, selectedDegree }) {
  const degrees = {
    BCS: 'BS Computer Science',
    BAI: 'BS Artificial Intelligence',
    BDS: 'BS Data Science',
    BCT: 'BS Cyber Security',
    BSE: 'BS Software Engineering',
  }

  return (
    <div className="animate-[fadeIn_0.2s_ease-out]">
      <h1 className="text-[clamp(1.3rem,4vw,24px)] font-bold text-[#0F172A] mb-[8px]">Which semester are you in?</h1>
      <p className="text-[13px] sm:text-[14px] text-[#475569] mb-[24px] sm:mb-[32px]">
        We'll only ask for grades from completed semesters.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-[12px] mb-[32px] lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => i + 1).map(sem => (
          <button
            key={sem}
            onClick={() => onSelect(sem)}
            className="border-2 border-[#E2E8F0] rounded-[8px] py-[10px] sm:py-[12px] px-[14px] sm:px-[16px] font-medium text-[13px] sm:text-[14px] hover:border-[#003F87] hover:bg-[#EEF4FF] transition-all cursor-pointer"
          >
            Sem {sem}
          </button>
        ))}
      </div>
    </div>
  )
}

export function GradeInput({ onSubmit, selectedDegree, currentSemester }) {
  const { data: degreeData } = DEGREE_MAP[selectedDegree] || {}
  const [grades, setGrades] = useState({})

  if (!degreeData || !degreeData.semesters_plan) {
    return <div className="text-center text-[#94A3B8]">Loading...</div>
  }

  // Show courses from semesters 1 to currentSemester-1
  const pastSemesters = degreeData.semesters_plan.slice(0, currentSemester - 1)

  const gradeOptions = [
    { value: '-', label: '-' },
    { value: 'A', label: 'A' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B', label: 'B' },
    { value: 'B-', label: 'B-' },
    { value: 'C+', label: 'C+' },
    { value: 'C', label: 'C' },
    { value: 'C-', label: 'C-' },
    { value: 'D+', label: 'D+' },
    { value: 'D', label: 'D' },
    { value: 'F', label: 'F' },
  ]

  const handleGradeChange = (courseCode, grade, courseName, credits, semesterNumber) => {
    setGrades(prev => ({
      ...prev,
      [courseCode]: {
        grade,
        gradePoints: Object.prototype.hasOwnProperty.call(GRADE_POINTS, grade) ? GRADE_POINTS[grade] : null,
        credits,
        courseName,
        semester: semesterNumber,
      },
    }))
  }

  return (
    <div className="animate-[fadeIn_0.2s_ease-out]">
      <div className="mb-[32px]">
        <h1 className="text-[24px] font-bold text-[#0F172A] mb-[8px]">Enter your past grades</h1>
        <p className="text-[14px] text-[#475569]">
          Select the grade for each course and the CGPA will update in real time using the verified bracket table.
        </p>
      </div>

      {/* Sticky CGPA bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-40 px-[24px] py-[16px]">
        <div className="max-w-[960px] mx-auto flex justify-between items-center">
          <div>
            <div className="text-[12px] text-[#94A3B8] mb-[2px]">Current CGPA</div>
            <div className="text-[28px] font-bold text-[#003F87]">{calculateCGPA(grades)}</div>
          </div>
          <Button onClick={() => onSubmit(grades)}>See my dashboard →</Button>
        </div>
      </div>

      {/* Courses grouped by semester */}
      <div className="mb-[120px] space-y-[32px]">
        {pastSemesters.map(semester => (
          <div key={semester.semester}>
            <h2 className="text-[18px] font-bold text-[#0F172A] mb-[12px]">
              Semester {semester.semester}
            </h2>
            <div className="space-y-[8px]">
              {semester.courses.map(course => (
                <div
                  key={course.code}
                  className="flex justify-between items-center bg-[#F8FAFC] p-[12px] rounded-[8px] border border-[#E2E8F0]"
                >
                  <div>
                    <div className="text-[12px] text-[#94A3B8] font-medium">{course.code}</div>
                    <div className="text-[14px] font-medium text-[#0F172A]">{course.name}</div>
                    {course.credits > 0 && (
                      <Badge variant="secondary" className="mt-[4px]">
                        {course.credits} credits
                      </Badge>
                    )}
                  </div>
                  <select
                    value={grades[course.code]?.grade || ''}
                    onChange={e =>
                      handleGradeChange(course.code, e.target.value, course.name, course.credits, semester.semester)
                    }
                    className="border border-[#E2E8F0] rounded-[6px] px-[12px] py-[8px] text-[14px] focus:outline-none focus:border-[#003F87]"
                  >
                    {gradeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
