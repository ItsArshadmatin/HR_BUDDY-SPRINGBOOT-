import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import LeaveApply from './pages/LeaveApply';
import LeaveManage from './pages/LeaveManage';
import Payroll from './pages/Payroll';
import AtsScan from './pages/AtsScan';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="leaves/apply" element={<LeaveApply />} />
        <Route path="leaves/manage" element={<LeaveManage />} />
        <Route path="attendance" element={<Attendance />} /> {/* Added Attendance Route */}
        <Route path="payroll" element={<Payroll />} />
        <Route path="ats" element={<AtsScan />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;
