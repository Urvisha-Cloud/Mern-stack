
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import { Navigate } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import "./App.css";
import 'react-toastify/dist/ReactToastify.css';
import { Suspense, lazy } from 'react';

const About = lazy(()=> import('./pages/About'));

// const Home = lazy(()=> import('./pages/Home'))

const Protected = ({ children }) => {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    
    <Router>
      <ToastContainer
        position="top-right"
        hideProgressBar
        transition={Slide}
        className="toast"
        draggable
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/home"
          element={
            <Protected>
              {/* <Suspense fallback={<div>Loading Home Page...</div>}> */}
                <Home />
              {/* </Suspense> */}
            </Protected>
          }
        />

        <Route path="/about" element={
          <Suspense>
            <About />
          </Suspense>
        } />
      </Routes>
    </Router>
  );
};

export default App;


