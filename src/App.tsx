import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Disclaimer } from './components/Disclaimer';
import NavigationBar from './components/NavigationBar';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import AnalyzePage from './pages/AnalyzePage';
import PortfolioPage from './pages/PortfolioPage';
import JournalPage from './pages/JournalPage';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white">
        <NavigationBar />
        <div className="pt-16">
          {children}
        </div>
        <Disclaimer />
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected routes */}
          <Route
            path="/analyze"
            element={
              <ProtectedLayout>
                <AnalyzePage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedLayout>
                <PortfolioPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/journal"
            element={
              <ProtectedLayout>
                <JournalPage />
              </ProtectedLayout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
