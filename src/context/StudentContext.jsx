import React, { createContext, useState, useEffect } from 'react'

export const StudentContext = createContext()

const INITIAL_STATE = {
  degree: null,
  goalGpa: null,
  currentSemester: null,
  completedGrades: {},
  currentCourses: {},
  onboardingComplete: false,
}

const STORAGE_KEY = 'degreeiq_student'

export function StudentProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setState(parsed)
      }
    } catch (error) {
      console.error('Error loading student data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, isLoading])

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const setDegree = (degree) => {
    updateState({ degree })
  }

  const setGoalGpa = (goalGpa) => {
    updateState({ goalGpa })
  }

  const setCurrentSemester = (semester) => {
    updateState({ currentSemester: semester })
  }

  const addCompletedGrade = (courseCode, grade, gradePoints, credits, courseName) => {
    updateState({
      completedGrades: {
        ...state.completedGrades,
        [courseCode]: { grade, gradePoints, credits, courseName },
      },
    })
  }

  const setCompletedGrades = (grades) => {
    updateState({ completedGrades: grades })
  }

  const setPredictedGrade = (courseCode, predictedGrade, credits, courseName) => {
    updateState({
      currentCourses: {
        ...state.currentCourses,
        [courseCode]: { predictedGrade, credits, courseName },
      },
    })
  }

  const completeOnboarding = () => {
    updateState({ onboardingComplete: true })
  }

  const resetAll = () => {
    setState(INITIAL_STATE)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = {
    ...state,
    isLoading,
    setDegree,
    setGoalGpa,
    setCurrentSemester,
    addCompletedGrade,
    setCompletedGrades,
    setPredictedGrade,
    completeOnboarding,
    resetAll,
  }

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
}
