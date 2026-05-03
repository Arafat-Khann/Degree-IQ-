import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StudentProvider, StudentContext } from './context/StudentContext'
import { LandingPage } from './pages/Landing'
import { OnboardingPage } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { useContext, useEffect } from 'react'
import { ScrollToTop } from './components/ScrollToTop'

function AppRoutes() {
  const { onboardingComplete, isLoading, degree } = useContext(StudentContext)

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/" element={onboardingComplete ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={onboardingComplete && degree ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <StudentProvider>
        <AppRoutes />
      </StudentProvider>
    </BrowserRouter>
  )
}
