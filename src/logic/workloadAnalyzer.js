/**
 * Analyze semester workload: light, moderate, or heavy
 * @param {Array} courses - courses in semester [{ credits }, ...]
 * @returns {string} 'light', 'moderate', or 'heavy'
 */
export function getSemesterLoad(courses) {
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0)
  const heavyCourses = courses.filter(c => (c.credits || 0) >= 4).length

  if (totalCredits > 18 || heavyCourses >= 3) return 'heavy'
  if (totalCredits > 15 || heavyCourses >= 2) return 'moderate'
  return 'light'
}

/**
 * Get warnings/insights for a specific semester
 * @param {Array} courses - courses in semester
 * @param {Object} degreeData - degree data to check theory/math ratio
 * @returns {Array} warning strings
 */
export function getSemesterWarnings(courses, degreeData = {}) {
  const warnings = []
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0)
  const heavyCourses = courses.filter(c => (c.credits || 0) >= 4)

  if (totalCredits > 18) {
    warnings.push(`⚠️ Heavy load: ${totalCredits} credits. Consider dropping an optional course.`)
  }

  if (heavyCourses.length >= 3) {
    warnings.push(`⚠️ Multiple heavy courses (4cr+). Balance your semester load.`)
  }

  // Count theory vs practical
  const courseNames = courses.map(c => c.name.toLowerCase())
  const theoryKeywords = ['theory', 'algorithm', 'structure', 'database', 'calculus', 'discrete']
  const theoryCourses = courseNames.filter(name =>
    theoryKeywords.some(keyword => name.includes(keyword))
  ).length

  if (theoryCourses >= 3) {
    warnings.push(`💡 Theory-heavy semester. Pair with practical courses or labs if possible.`)
  }

  return warnings
}

/**
 * Estimate which semester is best to take an elective
 * Tries to find first semester where:
 *  1. Prerequisites are met
 *  2. Total credits < 18
 *  3. Fewer than 3 heavy courses
 *
 * @param {string} elective - elective course code
 * @param {Array} semesterPlans - all semesters with courses
 * @param {Object} completedGrades - completed courses (prerequisites already done)
 * @param {Object} courseMap - all courses with prerequisite info
 * @returns {Object} { recommendedSemester, reason } or null
 */
export function recommendElectiveSemester(
  elective,
  semesterPlans,
  completedGrades,
  courseMap
) {
  const electiveData = courseMap[elective]
  if (!electiveData) return null

  const electivePrereqs = electiveData.prerequisites || []

  // Find first semester where all prereqs are met
  for (let i = 0; i < semesterPlans.length; i++) {
    const semester = semesterPlans[i]
    const semesterNumber = i + 1

    // By this semester, which courses would be completed?
    // (all courses in semesters 1 through i + current completedGrades)
    const willBeCompleted = { ...completedGrades }
    for (let j = 0; j < i; j++) {
      semesterPlans[j].courses?.forEach(course => {
        if (course.code !== elective) {
          willBeCompleted[course.code] = { grade: 'B', credits: course.credits }
        }
      })
    }

    // Check if all elective prerequisites are met
    const allPrereqsMet = electivePrereqs.every(prereq => willBeCompleted[prereq])
    if (!allPrereqsMet) continue

    // Check workload of this semester
    const semesterCourses = semester.courses || []
    const totalCredits = semesterCourses.reduce((sum, c) => sum + (c.credits || 0), 0) + (electiveData.credits || 0)
    const load = getSemesterLoad([...semesterCourses, electiveData])

    if (totalCredits < 18 && load !== 'heavy') {
      return {
        recommendedSemester: semesterNumber,
        reason: `Semester ${semesterNumber} has lighter core load — good time for this elective.`,
      }
    }
  }

  // If no ideal semester, recommend last one
  return {
    recommendedSemester: 8,
    reason: `Take this elective in Semester 8 when you have more flexibility.`,
  }
}

/**
 * Check if a course is theory-heavy based on keywords
 * @param {string} courseCode - course code
 * @param {string} courseName - course name
 * @returns {boolean}
 */
export function isTheoryHeavy(courseName) {
  const keywords = [
    'theory',
    'algorithm',
    'structure',
    'database',
    'calculus',
    'discrete',
    'complexity',
    'formal',
    'automata',
  ]
  const lower = courseName.toLowerCase()
  return keywords.some(kw => lower.includes(kw))
}

/**
 * Count credits from a specific course type in a semester
 * @param {Array} courses - courses in semester
 * @param {string} type - 'heavy' (4cr), 'medium' (3cr), 'light' (<=2cr)
 * @returns {number} count
 */
export function countByType(courses, type) {
  return courses.filter(c => {
    const credits = c.credits || 0
    if (type === 'heavy') return credits >= 4
    if (type === 'medium') return credits === 3
    if (type === 'light') return credits < 3
    return false
  }).length
}
