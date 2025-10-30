import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Specimens from './pages/Specimens';
import SpecimenDetail from './pages/SpecimenDetail';
import Slides from './pages/Slides';
import SlideDetail from './pages/SlideDetail';
import Bookmarks from './pages/Bookmarks';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import QuestionDetail from './components/discussion/QuestionDetail';
import QuestionForm from './components/discussion/QuestionForm';
import QuestionList from './components/discussion/QuestionList';
import AllDiscussions from './pages/AllDiscussions';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "specimens",
        element: <Specimens />,
      },
      {
        path: "specimens/:id",
        element: <SpecimenDetail />,
      },
      {
        path: "slides",
        element: <Slides />,
      },
      {
        path: "slides/:id",
        element: <SlideDetail />,
      },
      {
        path: "questions/:id",
        element: <QuestionDetail />,
      },
      {
        path: "specimens/:id/ask",
        element: <QuestionForm />,
      },
      {
        path: "specimens/:id/discussions",
        element: <QuestionList />,
      },
      {
        path: "bookmarks",
        element: <Bookmarks />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "privacy",
        element: <Privacy />,
      },
      {
        path: "admin",
        element: <AdminPanel />,
      },
      {
        path: "discussions",
        element: <AllDiscussions />,
      },
      {
        path: "profile", 
        element: <Profile />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
    ],
  },
]);

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
