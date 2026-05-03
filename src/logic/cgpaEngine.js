export const MARK_GRADE_BRACKETS = [
  { min: 85, max: 100, grade: 'A', gradePoints: 4.0 },
  { min: 80, max: 84, grade: 'A-', gradePoints: 3.66 },
  { min: 75, max: 79, grade: 'B+', gradePoints: 3.33 },
  { min: 70, max: 74, grade: 'B', gradePoints: 3.0 },
  { min: 65, max: 69, grade: 'B-', gradePoints: 2.66 },
  { min: 60, max: 64, grade: 'C+', gradePoints: 2.33 },
  { min: 55, max: 59, grade: 'C', gradePoints: 2.0 },
  { min: 50, max: 54, grade: 'C-', gradePoints: 1.66 },
  { min: 45, max: 49, grade: 'D+', gradePoints: 1.33 },
  { min: 40, max: 44, grade: 'D', gradePoints: 1.0 },
  { min: 0, max: 39, grade: 'F', gradePoints: 0.0 },
]

export const GRADE_POINTS = MARK_GRADE_BRACKETS.reduce((table, bracket) => {
  table[bracket.grade] = bracket.gradePoints
  return table
}, {})

export function getGradeInfoFromMarks(marks) {
  const numericMarks = Number(marks)
  if (!Number.isFinite(numericMarks) || numericMarks < 0 || numericMarks > 100) return null

  return MARK_GRADE_BRACKETS.find(bracket => numericMarks >= bracket.min && numericMarks <= bracket.max) || null
}

export function getGradePointsFromMarks(marks) {
  return getGradeInfoFromMarks(marks)?.gradePoints ?? null
}

function resolveGradePoints(course) {
  if (course?.gradePoints != null) return course.gradePoints
  if (course?.marks != null) return getGradePointsFromMarks(course.marks)
  if (course?.grade && Object.prototype.hasOwnProperty.call(GRADE_POINTS, course.grade)) {
    return GRADE_POINTS[course.grade]
  }
  return null
}

const CREDIT_HOUR_CGPA_IMPACT = 0.02

/**
 * Calculate CGPA from completed grades
 * @param {Object} completedGrades - { courseCode: { grade, gradePoints, credits }, ... }
 * @returns {string} CGPA to 2 decimal places
 */
export function calculateCGPA(completedGrades) {
  const courses = Object.values(completedGrades)
    .map(course => ({ ...course, resolvedGradePoints: resolveGradePoints(course) }))
    .filter(course => course.credits > 0 && course.resolvedGradePoints !== null)
  if (courses.length === 0) return '0.00'

  const totalPoints = courses.reduce((sum, c) => sum + c.credits * c.resolvedGradePoints, 0)
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0)

  return (totalPoints / totalCredits).toFixed(2)
}

/**
 * Calculate CGPA including predicted grades from ongoing courses
 * @param {Object} completedGrades - completed courses
 * @param {Object} currentCourses - ongoing courses with predictedGrade values
 * @returns {string} projected CGPA to 2 decimal places
 */
export function calculateProjectedCGPAFromCurrentCourses(completedGrades, currentCourses = {}) {
  const projectedGrades = { ...completedGrades }

  Object.entries(currentCourses).forEach(([courseCode, courseData]) => {
    const predictedGrade = courseData?.predictedGrade
    if (!predictedGrade || predictedGrade === '-' || !GRADE_POINTS.hasOwnProperty(predictedGrade)) return

    projectedGrades[courseCode] = {
      grade: predictedGrade,
      gradePoints: GRADE_POINTS[predictedGrade],
      credits: courseData.credits || 0,
      courseName: courseData.courseName || courseCode,
    }
  })

  return calculateCGPA(projectedGrades)
}

/**
 * Calculate CGPA if a specific course grade changes
 * @param {Object} completedGrades - current grades
 * @param {string} courseCode - course to modify
 * @param {string} newGrade - new grade letter
 * @returns {string} projected CGPA
 */
export function calculateProjectedCGPA(completedGrades, courseCode, newGrade) {
  if (!GRADE_POINTS.hasOwnProperty(newGrade)) return calculateCGPA(completedGrades)

  const modified = { ...completedGrades }
  if (modified[courseCode]) {
    modified[courseCode] = {
      ...modified[courseCode],
      grade: newGrade,
      gradePoints: GRADE_POINTS[newGrade],
    }
  }
  return calculateCGPA(modified)
}

/**
 * Calculate CGPA impact of improving one course
 * @param {Object} completedGrades - current grades
 * @param {string} courseCode - course to improve
 * @param {string} targetGrade - target grade (usually 'A')
 * @returns {number} CGPA delta (can be negative)
 */
export function calculateImpact(completedGrades, courseCode, targetGrade = 'A') {
  if (!completedGrades[courseCode]) return 0

  const credits = completedGrades[courseCode].credits || 0
  return parseFloat((credits * CREDIT_HOUR_CGPA_IMPACT).toFixed(4))
}

/**
 * Get courses ranked by their CGPA improvement potential
 * @param {Object} completedGrades - current grades
 * @returns {Array} [{ courseCode, courseName, currentGrade, impact, credits }, ...]
 */
export function getRankedImprovements(completedGrades) {
  return Object.entries(completedGrades)
    .filter(([_, courseData]) => courseData.credits > 0 && courseData.grade !== 'A')
    .map(([code, courseData]) => ({
      courseCode: code,
      currentGrade: courseData.grade,
      credits: courseData.credits,
      courseName: courseData.courseName || code,
      impact: calculateImpact(completedGrades, code, 'A'),
    }))
    .sort((a, b) => b.impact - a.impact)
}

/**
 * Calculate average grade needed for remaining semesters
 * @param {number} currentCGPA - current CGPA as number (e.g., 3.2)
 * @param {number} completedCredits - credits earned so far
 * @param {number} remainingCredits - credits left to take
 * @param {number} targetCGPA - target CGPA (default 3.5)
 * @returns {number} required average grade points
 */
export function getNeededAverage(currentCGPA, completedCredits, remainingCredits, targetCGPA = 3.5) {
  if (remainingCredits === 0) return 0

  const currentPoints = currentCGPA * completedCredits
  const targetPoints = targetCGPA * (completedCredits + remainingCredits)
  const neededPoints = targetPoints - currentPoints

  return parseFloat((neededPoints / remainingCredits).toFixed(2))
}

/**
 * Estimate remaining credits from current semester to end
 * Assumes 16-18 credits per semester average
 * @param {number} currentSemester - which semester (1-8)
 * @returns {number} estimated remaining credits
 */
export function estimateRemainingCredits(currentSemester) {
  const semestersLeft = 8 - currentSemester
  return semestersLeft * 16 // conservative estimate
}
