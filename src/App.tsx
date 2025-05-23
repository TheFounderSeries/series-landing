import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import ProfileOnboarding from './ProfileOnboarding';
import QuestionnaireOnboarding from './QuestionnaireOnboarding';
import WelcomePage from './WelcomePage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join/1" element={<ProfileOnboarding />} />
        <Route path="/join/2" element={<QuestionnaireOnboarding />} />
        <Route path="/join/complete" element={<WelcomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
