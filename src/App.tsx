import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import ProfileOnboarding from './ProfileOnboarding';
import QuestionnaireOnboarding from './QuestionnaireOnboarding';
import WelcomePage from './WelcomePage';
import VideoPlayer from './VideoPlayer';
import ConfusedPage from './ConfusedPage';
import ImsgVideo from './ImsgVideo';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join/intro" element={<VideoPlayer src="/loading_screen.mov" nextRoute="/join/1" />} />
        <Route path="/join/faq" element={<ConfusedPage />} />
        <Route path="/join/1" element={<ProfileOnboarding />} />
        <Route path="/join/2" element={<QuestionnaireOnboarding />} />
        <Route path="/join/complete" element={<WelcomePage />} />
        <Route path="/welcome" element={<ImsgVideo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
