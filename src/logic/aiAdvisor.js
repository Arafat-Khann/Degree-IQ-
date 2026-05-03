import { calculateCGPA, calculateProjectedCGPAFromCurrentCourses, GRADE_POINTS, getNeededAverage, estimateRemainingCredits, getRankedImprovements } from './cgpaEngine.js'
import { buildCourseMap, getCourseStatus, getHighImpactCourse, getMissingPrereqs } from './prerequisiteChecker.js'
import { getSemesterWarnings, isTheoryHeavy } from './workloadAnalyzer.js'

const GRADE_ORDER = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']

function createCard({ tone = 'info', title, explanation, recommendation, metric, action }) {
  return { tone, title, explanation, recommendation, metric, action }
}

function getNextGrade(grade) {
  const index = GRADE_ORDER.indexOf(grade)
  if (index < 0 || index === 0) return null
  return GRADE_ORDER[index - 1]
}

function getWeightedAverage(courses) {
  const totalCredits = courses.reduce((sum, course) => sum + (course.credits || 0), 0)
  if (totalCredits === 0) return 0
  const totalPoints = courses.reduce((sum, course) => sum + (course.credits || 0) * (course.gradePoints || 0), 0)
  return totalPoints / totalCredits
}

function getCourseBucket(courseMeta = {}, courseData = {}, courseCode = '') {
  const name = (courseData.courseName || courseMeta.name || courseCode).toLowerCase()
  const type = courseMeta.type || courseData.type || ''

  if (type === 'computing_core' || /programming|oop|software|database|network|operating systems|security|data structures|algorithm|ai|machine learning/.test(name)) {
    return 'coding-heavy'
  }

  if (type === 'quantitative_reasoning' || /calculus|statistics|probability|discrete|math|linear|numerical/.test(name)) {
    return 'theory/math'
  }

  if (type === 'general_education' || type === 'social_sciences' || type === 'interdisciplinary') {
    return 'support/theory'
  }

  return 'general'
}

function buildProjectedGradeSet(completedGrades, currentCourses = {}) {
  const projected = { ...completedGrades }

  Object.entries(currentCourses).forEach(([courseCode, courseData]) => {
    const predictedGrade = courseData?.predictedGrade
    if (!predictedGrade || predictedGrade === '-' || !Object.prototype.hasOwnProperty.call(GRADE_POINTS, predictedGrade)) return

    projected[courseCode] = {
      grade: predictedGrade,
      gradePoints: GRADE_POINTS[predictedGrade],
      credits: courseData.credits || 0,
      courseName: courseData.courseName || courseCode,
    }
  })

  return projected
}

function getRemainingCredits(degreeData, currentSemester) {
  if (!degreeData?.semesters_plan?.length || !currentSemester) return 0

  return degreeData.semesters_plan
    .filter(semester => semester.semester >= currentSemester)
    .flatMap(semester => semester.courses || [])
    .reduce((sum, course) => sum + (course.credits || 0), 0)
}

function getCurrentSemesterCredits(degreeData, currentSemester) {
  const semester = degreeData?.semesters_plan?.find(item => item.semester === currentSemester)
  return (semester?.courses || []).reduce((sum, course) => sum + (course.credits || 0), 0)
}

/**
 * Generate CGPA recovery insight
 * @param {Object} completedGrades - completed courses
 * @param {number} currentSemester - current semester (1-8)
 * @param {number} targetCGPA - target CGPA, default 3.5
 * @returns {Object} { type: 'warning'|'info'|'success', title, text, action }
 */
export function getCGPARecoveryInsight(completedGrades, currentSemester, targetCGPA = 3.5) {
  const current = parseFloat(calculateCGPA(completedGrades))
  const completedCredits = Object.values(completedGrades).reduce((sum, c) => sum + (c.credits || 0), 0)
  const remainingCredits = estimateRemainingCredits(currentSemester)
  const neededAvg = getNeededAverage(current, completedCredits, remainingCredits, targetCGPA)

  // If already at target
  if (current >= targetCGPA) {
    return {
      type: 'success',
      title: '🎯 On Target',
      text: `Your current CGPA is ${current} — you've reached your 3.5 target! Maintain this average to graduate with honors.`,
      action: 'View GPA Plan',
    }
  }

  // If impossible
  if (neededAvg > 4.0) {
    return {
      type: 'warning',
      title: '📈 Reach 3.5 CGPA',
      text: `Reaching 3.5 requires ~${neededAvg} average (impossible). Consider retaking courses with low grades to improve your transcript.`,
      action: 'Best to Repeat',
    }
  }

  // If difficult
  if (neededAvg > 3.8) {
    return {
      type: 'warning',
      title: '📈 Reach 3.5 CGPA',
      text: `You need ~${neededAvg} average in your next ${8 - currentSemester} semesters. Challenging, but doable with focused effort.`,
      action: 'View GPA Plan',
    }
  }

  // If moderate
  if (neededAvg > 3.0) {
    return {
      type: 'info',
      title: '📈 Reach 3.5 CGPA',
      text: `You need ~${neededAvg} average going forward. Achievable with consistent B+ and A- performance.`,
      action: 'View GPA Plan',
    }
  }

  // If easy
  return {
    type: 'success',
    title: '✨ Easy Path Ahead',
    text: `You're well on track. Maintain ~${neededAvg} average to exceed 3.5 CGPA easily.`,
    action: 'View GPA Plan',
  }
}

/**
 * Find weak patterns: courses where student frequently struggles
 * @param {Object} completedGrades - completed courses with grades
 * @param {Object} degreeData - degree data to categorize courses
 * @returns {Object} { type, title, text, action } or null if no pattern
 */
export function getWeakSubjectPattern(completedGrades, degreeData) {
  const courses = Object.entries(completedGrades).filter(([_, data]) => data.credits > 0)
  if (courses.length < 3) return null // need sample size

  // Categorize weak courses (< B-, which is 2.67)
  const weakCourses = courses.filter(([_, data]) => (data.gradePoints || 0) < 2.67)
  if (weakCourses.length < 2) return null // no pattern

  // Simple categorization by course name keywords
  const mathKeywords = ['calculus', 'linear', 'discrete', 'probability', 'statistics', 'differential']
  const progKeywords = ['programming', 'java', 'python', 'c++', 'coding', 'oop']
  const theoryKeywords = ['theory', 'algorithm', 'structure', 'database', 'formal', 'automata']

  const mathWeak = weakCourses.filter(([code, data]) => {
    const name = (data.courseName || code).toLowerCase()
    return mathKeywords.some(kw => name.includes(kw))
  })

  const progWeak = weakCourses.filter(([code, data]) => {
    const name = (data.courseName || code).toLowerCase()
    return progKeywords.some(kw => name.includes(kw))
  })

  const theoryWeak = weakCourses.filter(([code, data]) => {
    const name = (data.courseName || code).toLowerCase()
    return theoryKeywords.some(kw => name.includes(kw))
  })

  // Return most significant pattern
  if (mathWeak.length >= 2) {
    return {
      type: 'warning',
      title: '📐 Struggling with Math?',
      text: `You've had difficulty in multiple math courses. Consider forming a study group or seeking tutoring early in your next quantitative course.`,
      action: 'Learn More',
    }
  }

  if (progWeak.length >= 2) {
    return {
      type: 'warning',
      title: '💻 Programming Challenges',
      text: `Your grades dip in programming courses. Practice coding daily and build projects to strengthen these skills.`,
      action: 'Learn More',
    }
  }

  if (theoryWeak.length >= 2) {
    return {
      type: 'info',
      title: '🧠 Theory-Heavy Courses',
      text: `Abstract theory courses have been tougher for you. Start these courses early to have time for extra practice.`,
      action: 'Learn More',
    }
  }

  return null
}

/**
 * Recommend the single best course to repeat for maximum CGPA boost
 * @param {Object} completedGrades - completed courses
 * @returns {Object} { type, title, text, action } or null
 */
export function getBestRepeatCandidate(completedGrades) {
  const improvements = getRankedImprovements(completedGrades)
  if (improvements.length === 0) return null

  const best = improvements[0]
  const newCGPA = parseFloat(calculateCGPA(completedGrades)) + best.impact

  return {
    type: 'success',
    title: '🔄 Best Course to Repeat',
    text: `Repeating ${best.courseName} (currently ${best.currentGrade}) could raise your CGPA from ${calculateCGPA(completedGrades)} to ${newCGPA.toFixed(2)} (+${best.impact.toFixed(2)} points).`,
    action: 'View All Options',
  }
}

/**
 * Generate a combined booster strategy
 * @param {Object} completedGrades - completed courses
 * @param {number} currentSemester - current semester
 * @returns {string} strategy explanation
 */
export function getBoosterStrategy(completedGrades, currentSemester = 4) {
  const improvements = getRankedImprovements(completedGrades)
  if (improvements.length === 0) return 'Your CGPA is already at maximum!'

  const top2 = improvements.slice(0, 2)
  const currentCGPA = calculateCGPA(completedGrades)

  if (top2.length === 1) {
    const delta = top2[0].impact.toFixed(2)
    return `Focus on retaking ${top2[0].courseName}. This single course improvement gains +${delta} CGPA.`
  }

  const totalDelta = (top2[0].impact + top2[1].impact).toFixed(2)
  const projectedCGPA = (parseFloat(currentCGPA) + parseFloat(totalDelta)).toFixed(2)

  return `Retake ${top2[0].courseName} and ${top2[1].courseName} — your most impactful courses. Combined, this raises your CGPA from ${currentCGPA} to ${projectedCGPA} (+${totalDelta}).`
}

/**
 * Get semester-specific insights (high impact courses, workload warnings, etc.)
 * @param {number} semesterNumber - which semester (1-8)
 * @param {Array} courses - courses in that semester
 * @param {Object} completedGrades - courses completed so far
 * @param {Object} courseMap - full course map with prerequisites
 * @returns {Array} insight strings
 */
export function getSemesterInsights(semesterNumber, courses, completedGrades, courseMap) {
  const insights = []

  // Workload warnings
  const warnings = getSemesterWarnings(courses)
  insights.push(...warnings)

  // High-impact course detection
  if (courses.length > 0 && courseMap) {
    const highImpactCourse = courses.find(c => {
      // Find course that unlocks many future courses
      let unlocksCount = 0
      Object.values(courseMap).forEach(other => {
        if (other.code === c.code) return
        const prereqs = other.prerequisites || []
        if (prereqs.includes(c.code)) unlocksCount++
      })
      return unlocksCount >= 3
    })

    if (highImpactCourse) {
      insights.push(
        `🔑 ${highImpactCourse.name} unlocks many future courses — prioritize this course to stay on track.`
      )
    }
  }

  // Theory-heavy warning
  const theoryCount = courses.filter(c => isTheoryHeavy(c.name)).length
  if (theoryCount >= 2 && courses.length >= 4) {
    insights.push(`💡 Multiple theory courses this semester. Start early and form study groups.`)
  }

  return insights
}

/**
 * Build personalized smart insight cards from the user's grade history.
 * @param {Object} params
 * @returns {Array}
 */
export function getSmartInsightCards({ completedGrades, degreeData, currentSemester, currentCourses = {}, targetGpa = 3.5 }) {
  const courseMap = buildCourseMap(degreeData || {})
  const cards = []

  const semesterEntries = Object.entries(completedGrades).filter(([, data]) => (data.credits || 0) > 0 && data.gradePoints != null)
  const semesters = new Map()

  semesterEntries.forEach(([courseCode, data]) => {
    const semesterNumber = data.semester || courseMap[courseCode]?.semester
    if (!semesterNumber) return

    const bucket = semesters.get(semesterNumber) || { courses: [], totalCredits: 0, totalPoints: 0 }
    bucket.courses.push({ code: courseCode, ...data })
    bucket.totalCredits += data.credits || 0
    bucket.totalPoints += (data.gradePoints || 0) * (data.credits || 0)
    semesters.set(semesterNumber, bucket)
  })

  const trendSummaries = [...semesters.entries()]
    .map(([semesterNumber, data]) => ({
      semesterNumber: Number(semesterNumber),
      cgpa: data.totalCredits ? data.totalPoints / data.totalCredits : 0,
      courses: data.courses,
    }))
    .sort((a, b) => a.semesterNumber - b.semesterNumber)

  if (trendSummaries.length >= 2) {
    const latest = trendSummaries[trendSummaries.length - 1]
    const previous = trendSummaries[trendSummaries.length - 2]
    const delta = latest.cgpa - previous.cgpa
    const biggestDropSemester = trendSummaries.reduce((worst, current, index, list) => {
      if (index === 0) return worst
      const change = current.cgpa - list[index - 1].cgpa
      if (!worst || change < worst.change) return { semesterNumber: current.semesterNumber, change, data: current }
      return worst
    }, null)

    const problemCourse = biggestDropSemester?.data?.courses
      ?.filter(course => course.gradePoints != null)
      .sort((a, b) => (a.gradePoints || 0) - (b.gradePoints || 0) || (b.credits || 0) - (a.credits || 0))[0]

    if (delta <= -0.2 && problemCourse) {
      cards.push(createCard({
        tone: 'warning',
        title: `Semester ${latest.semesterNumber} dropped by ${Math.abs(delta).toFixed(2)}`,
        explanation: `Your latest semester GPA fell from ${previous.cgpa.toFixed(2)} to ${latest.cgpa.toFixed(2)}. The biggest drag came from ${problemCourse.courseName || problemCourse.code} (${problemCourse.grade}).`,
        recommendation: `If this pattern continues, focus extra practice on ${problemCourse.courseName || problemCourse.code} and the courses that share its subject pattern.`,
        metric: `Trend: ${delta.toFixed(2)}`,
        action: 'Stabilize trend',
      }))
    } else if (delta >= 0.2) {
      cards.push(createCard({
        tone: 'success',
        title: `Semester ${latest.semesterNumber} improved by ${delta.toFixed(2)}`,
        explanation: `You raised your semester GPA from ${previous.cgpa.toFixed(2)} to ${latest.cgpa.toFixed(2)}. The latest term is outperforming the previous one.`,
        recommendation: 'Keep the same study pattern and protect the courses with the highest credit weight.',
        metric: `Trend: +${delta.toFixed(2)}`,
        action: 'Maintain momentum',
      }))
    } else {
      cards.push(createCard({
        tone: 'info',
        title: 'Your semester GPAs are fairly inconsistent',
        explanation: `Your recent semesters vary between ${Math.min(...trendSummaries.map(item => item.cgpa)).toFixed(2)} and ${Math.max(...trendSummaries.map(item => item.cgpa)).toFixed(2)}. That usually means one or two course types are affecting the average.`,
        recommendation: 'Focus on the low-credit-noisy courses first, then protect the 3-4 credit courses that move CGPA the most.',
        metric: 'Pattern: inconsistent',
        action: 'Review course pattern',
      }))
    }
  } else {
    cards.push(createCard({
      tone: 'info',
      title: 'Trend analysis is still limited',
      explanation: `I need semester tags on at least 2 completed semesters to compare GPA movement. Right now I can only see ${semesterEntries.length} graded courses with full detail.`,
      recommendation: 'Keep entering semester-specific grades so the app can identify drops, rebounds, and weak terms.',
      metric: 'Data: incomplete',
      action: 'Add more grades',
    }))
  }

  const categoryScores = new Map()
  semesterEntries.forEach(([courseCode, data]) => {
    const bucket = getCourseBucket(courseMap[courseCode] || {}, data, courseCode)
    const item = categoryScores.get(bucket) || { courses: [], totalCredits: 0, totalPoints: 0 }
    item.courses.push({ code: courseCode, ...data })
    item.totalCredits += data.credits || 0
    item.totalPoints += (data.gradePoints || 0) * (data.credits || 0)
    categoryScores.set(bucket, item)
  })

  const categorySummaries = [...categoryScores.entries()]
    .filter(([, data]) => data.totalCredits >= 6)
    .map(([bucket, data]) => ({ bucket, avg: data.totalPoints / data.totalCredits, courses: data.courses }))
    .sort((a, b) => b.avg - a.avg)

  if (categorySummaries.length >= 2) {
    const strongest = categorySummaries[0]
    const weakest = categorySummaries[categorySummaries.length - 1]
    const spread = strongest.avg - weakest.avg

    if (spread >= 0.25) {
      cards.push(createCard({
        tone: 'success',
        title: `You perform better in ${strongest.bucket} work`,
        explanation: `Your weighted average is ${strongest.avg.toFixed(2)} in ${strongest.bucket} courses versus ${weakest.avg.toFixed(2)} in ${weakest.bucket} courses.`,
        recommendation: `Use ${strongest.bucket} subjects as GPA stabilizers and protect ${weakest.bucket} subjects with earlier study time and revision.`,
        metric: `Gap: ${spread.toFixed(2)}`,
        action: 'Leverage your strength',
      }))
    } else {
      cards.push(createCard({
        tone: 'info',
        title: 'Your subject performance is mixed',
        explanation: `No category stands out strongly yet. The spread between your best and weakest buckets is only ${spread.toFixed(2)}.`,
        recommendation: 'I need a few more graded courses before calling out a real subject strength or weakness.',
        metric: 'Pattern: mixed',
        action: 'Collect more data',
      }))
    }
  } else {
    cards.push(createCard({
      tone: 'info',
      title: 'Subject pattern is not clear yet',
      explanation: 'I need at least two course groups with enough credit weight to compare coding-heavy and theory-heavy performance.',
      recommendation: 'Keep adding grades across different course types so the model can isolate the real strengths.',
      metric: 'Data: low',
      action: 'Continue grading',
    }))
  }

  const projectedGrades = buildProjectedGradeSet(completedGrades, currentCourses)
  const projectedCGPA = calculateProjectedCGPAFromCurrentCourses(completedGrades, currentCourses)
  const knownCredits = Object.values(projectedGrades).reduce((sum, course) => sum + (course.credits || 0), 0)
  const knownPoints = Object.values(projectedGrades).reduce((sum, course) => sum + (course.credits || 0) * (course.gradePoints || 0), 0)
  const remainingCredits = Math.max(getRemainingCredits(degreeData, currentSemester) - Object.values(currentCourses).reduce((sum, course) => sum + (course.credits || 0), 0), 0)
  const bestCase = knownCredits + remainingCredits ? ((knownPoints + remainingCredits * 4) / (knownCredits + remainingCredits)).toFixed(2) : projectedCGPA
  const worstGradePoints = parseFloat(projectedCGPA) >= 3.2 ? 2.67 : 2.33
  const worstCase = knownCredits + remainingCredits ? ((knownPoints + remainingCredits * worstGradePoints) / (knownCredits + remainingCredits)).toFixed(2) : projectedCGPA

  cards.push(createCard({
    tone: parseFloat(worstCase) < targetGpa ? 'warning' : 'info',
    title: `Projected CGPA range: ${worstCase} to ${bestCase}`,
    explanation: `This range is based on the grades you have already entered plus the credits still left in your plan. I assumed missing future grades land between ${worstGradePoints.toFixed(2)} and 4.00 grade points.`,
    recommendation: `To stay above your ${targetGpa.toFixed(2)} goal, protect the highest-credit courses first and avoid letting more than one heavy course slip below B.`,
    metric: `Current projection: ${projectedCGPA}`,
    action: 'Track the range',
  }))

  const highImpact = getHighImpactCourse(courseMap, completedGrades)
  if (highImpact) {
    cards.push(createCard({
      tone: 'warning',
      title: `${highImpact.name} is your highest-leverage course`,
      explanation: `Completing ${highImpact.name} earlier unlocks ${highImpact.unlocksCount} future courses. That makes it a structural GPA and progress lever, not just a single grade.`,
      recommendation: `Prioritize this course before stacking another heavy semester on top of it.`,
      metric: `Unlocks: ${highImpact.unlocksCount}`,
      action: 'Prioritize unlocks',
    }))
  }

  return cards.slice(0, 4)
}

/**
 * Build strategic GPA booster cards.
 */
export function getBoosterCards({ completedGrades, degreeData, currentSemester }) {
  const cards = []
  const ranked = getRankedImprovements(completedGrades)
  const courseMap = buildCourseMap(degreeData || {})

  if (!ranked.length) {
    cards.push(createCard({
      tone: 'info',
      title: 'No retake candidates yet',
      explanation: 'I need completed courses with grades below A before I can recommend a retake that materially changes your CGPA.',
      recommendation: 'Add at least one graded course below A so the booster can rank your highest-impact repeats.',
      metric: 'Data: insufficient',
      action: 'Enter grades',
    }))
    return cards
  }

  const futureSemesters = (degreeData?.semesters_plan || []).filter(semester => semester.semester >= currentSemester)
  const semesterLoads = futureSemesters.map(semester => ({
    semester: semester.semester,
    credits: (semester.courses || []).reduce((sum, course) => sum + (course.credits || 0), 0),
    heavyCourses: (semester.courses || []).filter(course => (course.credits || 0) >= 4).length,
  }))
  const bestRetakeSemester = semesterLoads.sort((a, b) => a.credits - b.credits || a.heavyCourses - b.heavyCourses)[0]

  ranked.slice(0, 3).forEach(course => {
    const nextGrade = getNextGrade(course.currentGrade) || 'A'
    const semesterLabel = bestRetakeSemester
      ? `Semester ${bestRetakeSemester.semester} has the lightest load (${bestRetakeSemester.credits} credits).`
      : 'No future semester load data is available, so I am using the nearest available term.'

    cards.push(createCard({
      tone: 'success',
      title: `Retake ${course.courseName}`,
      explanation: `Improving ${course.currentGrade} to A changes your CGPA by ~${course.impact.toFixed(2)} because this course carries ${course.credits} credits.`,
      recommendation: `${semesterLabel} That makes it the safest slot for a retake or grade recovery attempt.`,
      metric: `Impact: +${course.impact.toFixed(2)}`,
      action: `Plan for ${nextGrade}`,
    }))
  })

  const strongest = ranked[0]
  if (strongest && ranked[1]) {
    const totalDelta = (strongest.impact + ranked[1].impact).toFixed(2)
    cards.push(createCard({
      tone: 'warning',
      title: 'Two-course retake strategy',
      explanation: `Repeating ${strongest.courseName} and ${ranked[1].courseName} gives the biggest combined boost from your current transcript.`,
      recommendation: `Do not pair both with the heaviest semester; keep the retakes in a lighter term and preserve bandwidth for core subjects.`,
      metric: `Combined boost: +${totalDelta}`,
      action: 'Stage the retakes',
    }))
  }

  const highImpact = getHighImpactCourse(courseMap, completedGrades)
  if (highImpact) {
    cards.push(createCard({
      tone: 'info',
      title: `${highImpact.name} unlocks future progress`,
      explanation: `This course unlocks ${highImpact.unlocksCount} downstream courses, so its scheduling matters more than the raw credit count suggests.`,
      recommendation: 'Take structural unlock courses earlier whenever the semester load is low.',
      metric: `Unlocks: ${highImpact.unlocksCount}`,
      action: 'Open the path',
    }))
  }

  return cards.slice(0, 4)
}

/**
 * Build planner advisory cards.
 */
export function getPlannerCards({ degreeData, completedGrades, currentSemester }) {
  const cards = []
  const courseMap = buildCourseMap(degreeData || {})
  const semesters = degreeData?.semesters_plan || []

  if (!semesters.length) {
    cards.push(createCard({
      tone: 'info',
      title: 'Planner data is missing',
      explanation: 'I cannot inspect semester load or prerequisites until the degree plan is loaded.',
      recommendation: 'Select a degree program so the planner can analyze your roadmap.',
      metric: 'Data: missing',
      action: 'Choose degree',
    }))
    return cards
  }

  const semesterSummaries = semesters.map(semester => ({
    semester: semester.semester,
    credits: (semester.courses || []).reduce((sum, course) => sum + (course.credits || 0), 0),
    heavyCourses: (semester.courses || []).filter(course => (course.credits || 0) >= 4).length,
    theoryHeavy: (semester.courses || []).filter(course => isTheoryHeavy(course.name)).length,
    courses: semester.courses || [],
  }))

  const heaviest = semesterSummaries
    .filter(item => item.semester >= currentSemester)
    .sort((a, b) => b.credits - a.credits || b.heavyCourses - a.heavyCourses)[0]

  if (heaviest) {
    const riskyCourses = heaviest.courses
      .filter(course => course.credits >= 3)
      .slice(0, 3)
      .map(course => course.name)

    cards.push(createCard({
      tone: heaviest.credits > 18 || heaviest.heavyCourses >= 3 ? 'warning' : 'info',
      title: `Semester ${heaviest.semester} is your heaviest term`,
      explanation: `This term carries ${heaviest.credits} credits with ${heaviest.heavyCourses} heavy courses. A dense term like this usually suppresses GPA unless the workload is planned.`,
      recommendation: riskyCourses.length >= 3
        ? `Avoid combining ${riskyCourses.join(' + ')} in one semester if you can shift any elective or buffer course.`
        : 'Protect the high-credit courses first and use your easiest electives as CGPA stabilizers.',
      metric: `Load: ${heaviest.credits} credits`,
      action: 'Balance the load',
    }))
  }

  const highImpact = getHighImpactCourse(courseMap, completedGrades)
  if (highImpact) {
    cards.push(createCard({
      tone: 'success',
      title: `Take ${highImpact.name} early`,
      explanation: `${highImpact.name} unlocks ${highImpact.unlocksCount} downstream courses. Taking it early keeps your roadmap flexible.`,
      recommendation: 'Prioritize prerequisite chains before they bottleneck later semesters.',
      metric: `Unlocks: ${highImpact.unlocksCount}`,
      action: 'Unlock the path',
    }))
  }

  const lockedCourses = semesters.flatMap(semester => semester.courses || []).filter(course => getCourseStatus(course.code, completedGrades, courseMap) === 'locked')
  if (lockedCourses.length) {
    const firstLocked = lockedCourses[0]
    const missing = getMissingPrereqs(firstLocked.code, completedGrades, courseMap)
    cards.push(createCard({
      tone: 'warning',
      title: `${firstLocked.name} is blocked by prerequisites`,
      explanation: `You cannot take this course until ${missing.map(item => item.name).join(', ')} is complete.`,
      recommendation: 'Use the locked list to map out the shortest path toward your next advanced subjects.',
      metric: `Blocked by ${missing.length} course(s)`,
      action: 'Clear blockers',
    }))
  }

  return cards.slice(0, 3)
}

/**
 * Build current semester predictive cards.
 */
export function getCourseManagerCards({ completedGrades, currentCourses, degreeData, currentSemester }) {
  const cards = []
  const projectedCGPA = calculateProjectedCGPAFromCurrentCourses(completedGrades, currentCourses)
  const predictedEntries = Object.entries(currentCourses).filter(([, data]) => data?.predictedGrade && data.predictedGrade !== '-' && Object.prototype.hasOwnProperty.call(GRADE_POINTS, data.predictedGrade))

  if (!predictedEntries.length) {
    cards.push(createCard({
      tone: 'info',
      title: 'Enter expected grades for this semester',
      explanation: 'I need predicted grades for your ongoing courses before I can calculate your projected CGPA and risk profile.',
      recommendation: 'Start with the highest-credit course first, because that will move your projection the most.',
      metric: 'Waiting for input',
      action: 'Add predictions',
    }))
    return cards
  }

  const lowestCourse = predictedEntries
    .map(([code, data]) => ({ code, ...data }))
    .sort((a, b) => (a.gradePoints || 0) - (b.gradePoints || 0) || (b.credits || 0) - (a.credits || 0))[0]

  const nextGrade = getNextGrade(lowestCourse.predictedGrade)
  const projectedIfImproved = nextGrade
    ? calculateProjectedCGPAFromCurrentCourses(completedGrades, {
        ...currentCourses,
        [lowestCourse.code]: { ...currentCourses[lowestCourse.code], predictedGrade: nextGrade },
      })
    : projectedCGPA

  const delta = (parseFloat(projectedIfImproved) - parseFloat(projectedCGPA)).toFixed(2)

  cards.push(createCard({
    tone: parseFloat(projectedCGPA) < 3 ? 'warning' : 'success',
    title: `Projected CGPA is ${projectedCGPA}`,
    explanation: `This uses the grades you entered for ongoing courses. If you keep those predictions unchanged, your forecast lands at ${projectedCGPA}.`,
    recommendation: `Protect your strongest course first, then lift ${lowestCourse.courseName || lowestCourse.code} because it is currently pulling the forecast down the most.`,
    metric: `Forecast: ${projectedCGPA}`,
    action: 'Track forecast',
  }))

  cards.push(createCard({
    tone: 'warning',
    title: `${lowestCourse.courseName || lowestCourse.code} is the current risk point`,
    explanation: `You entered ${lowestCourse.predictedGrade} for this course. Because it carries ${lowestCourse.credits} credits, it has a disproportionate effect on the semester projection.`,
    recommendation: nextGrade
      ? `Improving it by one grade to ${nextGrade} increases your projected CGPA by about ${delta}.`
      : 'This course is already at the top grade in the scale; shift attention to the next-highest credit course.',
    metric: nextGrade ? `One-step gain: +${delta}` : 'Already maxed',
    action: 'Fix the risk',
  }))

  if (degreeData?.semesters_plan?.length) {
    const currentSemesterCourses = degreeData.semesters_plan.find(semester => semester.semester === currentSemester)?.courses || []
    const unfinished = currentSemesterCourses.filter(course => !currentCourses[course.code])

    if (unfinished.length) {
      cards.push(createCard({
        tone: 'info',
        title: 'Some current-semester courses still need predictions',
        explanation: `There are ${unfinished.length} courses in Semester ${currentSemester} without an expected grade yet.`,
        recommendation: 'Fill them in to get a more accurate projection range and a better at-risk course ranking.',
        metric: `Unfilled: ${unfinished.length}`,
        action: 'Complete predictions',
      }))
    }
  }

  return cards.slice(0, 3)
}
