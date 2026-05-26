import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import AnalyzePage from './pages/AnalyzePage';
import PortfolioPage from './pages/PortfolioPage';
import JournalPage from './pages/JournalPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white">
        <NavigationBar />
        <div className="pt-16"> {/* padding for fixed nav */}
          <Routes>
            <Route path="/" element={<AnalyzePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/journal" element={<JournalPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
