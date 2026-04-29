import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function Protected({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role==="admin"?"/admin":user.role==="company"?"/company":"/student"}/> : <Login />} />
      <Route path="/student" element={<Protected role="student"><StudentDashboard /></Protected>} />
      <Route path="/company" element={<Protected role="company"><CompanyDashboard /></Protected>} />
      <Route path="/admin"   element={<Protected role="admin"><AdminDashboard /></Protected>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return <AuthProvider><BrowserRouter><AppRoutes /></BrowserRouter></AuthProvider>;
}
