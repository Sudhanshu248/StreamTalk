import './App.css';
import { Route, BrowserRouter as  Router, Routes } from "react-router-dom";
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeet from './pages/videoMeet';
import Home from './pages/dashboard';
import History from './pages/history';
import LandingPage from "./pages/home"

function App() {
  return (
    <>
      <Router>
        <AuthProvider>

        <Routes>
          {/* <Route path='/' element={<LandingPage />} /> */}
          <Route path='/' element={<LandingPage />} />
          <Route path='/auth' element={<Authentication />} />
          <Route path='/:url' element={<VideoMeet/>} />
          <Route path='/dashboard' element={<Home/>} />
          <Route path='/history'element={<History/>} />
        </Routes>

        </AuthProvider>
      </Router>
    </>
  )
}

export default App;