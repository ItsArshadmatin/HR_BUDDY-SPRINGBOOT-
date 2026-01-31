import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Helper to check active state
    const isActive = (path) => location.pathname === path;

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white"
            style={{
                width: '280px',
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',
                boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
            }}>
            <Link to="/dashboard" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <div className="bg-primary rounded-3 p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-buildings-fill fs-5"></i>
                </div>
                <span className="fs-5 fw-bold">EMS Corp</span>
            </Link>
            <hr />
            <Nav variant="pills" className="flex-column mb-auto">
                {(user?.role?.includes('ADMIN') || user?.role?.includes('HR')) && (
                    <Nav.Item>
                        <Link to="/dashboard" className={`nav-link text-white ${isActive('/dashboard') ? 'active' : ''}`}>
                            <i className="bi bi-speedometer2 me-2"></i> Dashboard
                        </Link>
                    </Nav.Item>
                )}

                {/* Admin/HR Only Links */}
                {(user?.role?.includes('ADMIN') || user?.role?.includes('HR')) && (
                    <Nav.Item>
                        <Link to="/employees" className={`nav-link text-white ${isActive('/employees') ? 'active' : ''}`}>
                            <i className="bi bi-people me-2"></i> Employees
                        </Link>
                    </Nav.Item>
                )}

                <Nav.Item>
                    <Link to="/leaves/apply" className={`nav-link text-white ${isActive('/leaves/apply') ? 'active' : ''}`}>
                        <i className="bi bi-calendar-plus me-2"></i> Apply Leave
                    </Link>
                </Nav.Item>

                {(user?.role?.includes('ADMIN') || user?.role?.includes('HR')) && (
                    <Nav.Item>
                        <Link to="/payroll" className={`nav-link text-white ${isActive('/payroll') ? 'active' : ''}`}>
                            <i className="bi bi-cash-coin me-2"></i> Payroll
                        </Link>
                    </Nav.Item>
                )}

                {(user?.role?.includes('ADMIN') || user?.role?.includes('HR')) && (
                    <Nav.Item>
                        <Link to="/leaves/manage" className={`nav-link text-white ${isActive('/leaves/manage') ? 'active' : ''}`}>
                            <i className="bi bi-calendar-check me-2"></i> Manage Leaves
                        </Link>
                    </Nav.Item>
                )}

                {(user?.role?.includes('ADMIN') || user?.role?.includes('HR')) && (
                    <Nav.Item>
                        <Link to="/attendance" className={`nav-link text-white ${isActive('/attendance') ? 'active' : ''}`}>
                            <i className="bi bi-clock-history me-2"></i> Attendance
                        </Link>
                    </Nav.Item>
                )}

                {(user?.role?.includes('ADMIN') || user?.role?.includes('HR')) && (
                    <Nav.Item>
                        <Link to="/ats" className={`nav-link text-white ${isActive('/ats') ? 'active' : ''}`}>
                            <i className="bi bi-robot me-2"></i> AI ATS
                        </Link>
                    </Nav.Item>
                )}

                <Nav.Item>
                    <Link to="/profile" className={`nav-link text-white ${isActive('/profile') ? 'active' : ''}`}>
                        <i className="bi bi-person-circle me-2"></i> My Profile
                    </Link>
                </Nav.Item>
            </Nav>
            <hr />
            <div className="dropdown">
                <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                    <UserAvatar name={user?.name || user?.email} image={user?.profileImage} size={32} />
                    <strong className="ms-2">{user?.name || user?.email}</strong>
                </a>
                <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                    <li><button className="dropdown-item" onClick={logout}>Sign out</button></li>
                </ul>
            </div>

            {/* Explicit Logout for easier access */}
            <div className="mt-2">
                <button onClick={logout} className="btn btn-outline-danger w-100">
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
