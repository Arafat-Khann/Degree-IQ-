/**
 * Build a flat map of all courses indexed by code
 * @param {Object} degreeData - degree JSON data
 * @returns {Object} { courseCode: { name, credits, prerequisites, type }, ... }
 */
export function buildCourseMap(degreeData) {
  const map = {}

  // Add courses from semesters_plan
  if (degreeData.semesters_plan) {
    degreeData.semesters_plan.forEach(semester => {
      if (semester.courses) {
        semester.courses.forEach(course => {
          map[course.code] = {
            code: course.code,
            name: course.name,
            credits: course.credits || 0,
            prerequisites: course.prerequisites || [],
            type: course.type || 'core',
            semester: semester.semester,
          }
        })
      }
    })
  }

  // Add domain core courses
  if (degreeData.domain_core) {
    degreeData.domain_core.forEach(course => {
      if (!map[course.code]) {
        map[course.code] = {
          code: course.code,
          name: course.name,
          credits: course.credits || 0,
          prerequisites: course.prerequisites || [],
          type: 'domain_core',
        }
      }
    })
  }

  // Add domain electives
  if (degreeData.domain_electives) {
    degreeData.domain_electives.forEach(course => {
      if (!map[course.code]) {
        map[course.code] = {
          code: course.code,
          name: course.name,
          credits: course.credits || 0,
          prerequisites: course.prerequisites || [],
          type: 'domain_elective',
        }
      }
    })
  }

  return map
}

/**
 * Get status of a course: completed, ready, or locked
 * @param {string} courseCode - course code to check
 * @param {Object} completedGrades - completed courses with grades
 * @param {Object} courseMap - full course map
 * @returns {string} 'completed', 'ready', or 'locked'
 */
export function getCourseStatus(courseCode, completedGrades, courseMap) {
  if (completedGrades[courseCode]) {
    return 'completed'
  }

  const course = courseMap[courseCode]
  if (!course) return 'unknown'

  const prerequisites = course.prerequisites || []
  if (prerequisites.length === 0) return 'ready'

  const allMet = prerequisites.every(prereq => completedGrades[prereq])
  return allMet ? 'ready' : 'locked'
}

/**
 * Get list of missing prerequisites for a course
 * @param {string} courseCode - course code to check
 * @param {Object} completedGrades - completed courses
 * @param {Object} courseMap - full course map
 * @returns {Array} [{ code, name }, ...] of missing prerequisites
 */
export function getMissingPrereqs(courseCode, completedGrades, courseMap) {
  const course = courseMap[courseCode]
  if (!course) return []

  const prerequisites = course.prerequisites || []
  return prerequisites
    .filter(prereq => !completedGrades[prereq])
    .map(prereq => {
      const prereqCourse = courseMap[prereq]
      return {
        code: prereq,
        name: prereqCourse ? prereqCourse.name : prereq,
      }
    })
}

/**
 * Get all courses unlocked by the completed courses
 * @param {Object} completedGrades - completed courses
 * @param {Object} courseMap - full course map
 * @returns {Array} [courseCode, ...] of newly unlocked courses
 */
export function getUnlockedCourses(completedGrades, courseMap) {
  return Object.keys(courseMap)
    .filter(code => {
      if (completedGrades[code]) return false
      return getCourseStatus(code, completedGrades, courseMap) === 'ready'
    })
}

/**
 * Find the course that unlocks the most future courses (highest impact)
 * @param {Object} courseMap - full course map
 * @param {Object} completedGrades - completed courses (to exclude)
 * @returns {Object} { code, name, unlocksCount } or null
 */
export function getHighImpactCourse(courseMap, completedGrades = {}) {
  const unlockedByEach = {}

  // For each course, count how many other courses have it as a prerequisite
  Object.entries(courseMap).forEach(([code, course]) => {
    if (completedGrades[code]) return // skip already completed

    unlockedByEach[code] = 0

    Object.entries(courseMap).forEach(([otherCode, otherCourse]) => {
      if (otherCode === code) return
      if (completedGrades[otherCode]) return

      const prereqs = otherCourse.prerequisites || []
      if (prereqs.includes(code)) {
        unlockedByEach[code]++
      }
    })
  })

  // Find course with highest unlock count
  let bestCode = null
  let bestCount = 0

  Object.entries(unlockedByEach).forEach(([code, count]) => {
    if (count > bestCount) {
      bestCount = count
      bestCode = code
    }
  })

  if (!bestCode) return null

  return {
    code: bestCode,
    name: courseMap[bestCode].name,
    unlocksCount: bestCount,
  }
}
