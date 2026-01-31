import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Row, Col, Card, Table, Badge, Container } from 'react-bootstrap';
// ... (keep middle lines same, so just replacing import and return start)
// Wait, I should not use ... logic in replacement content for separate blocks. 
// I will split this into a multi_replace for safety.
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentLeaves, setRecentLeaves] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, leavesRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/leaves')
                ]);
                setStats(statsRes.data);
                // Get last 5 leaves, reversed (assuming ID order)
                setRecentLeaves(leavesRes.data.slice(-5).reverse());
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            }
        };
        fetchData();
    }, []);

    if (!stats) return <div className="p-5 text-center">Loading Dashboard...</div>;

    // Charts Configuration
    const deptData = {
        labels: Object.keys(stats.departmentDistribution),
        datasets: [{
            data: Object.values(stats.departmentDistribution),
            backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#6366f1'],
            borderWidth: 0,
        }]
    };

    return (
        <Container fluid className="p-0">
            {/* Welcome Banner */}
            <div className="card border-0 mb-4 overflow-hidden position-relative shadow-sm" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)' }}>
                <div className="card-body p-4 p-lg-5 text-white position-relative" style={{ zIndex: 1 }}>
                    <h1 className="display-5 fw-bold mb-2">Good Morning, {stats ? 'Team' : 'Admin'}!</h1>
                    <p className="lead mb-0 opacity-75">Here is what's happening in your organization today.</p>
                </div>
                {/* Decorative Circle */}
                <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
            </div>

            <Row className="mb-4">
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="d-flex align-items-center">
                            <div className="rounded-3 p-3 me-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                <i className="bi bi-people-fill fs-4"></i>
                            </div>
                            <div>
                                <h6 className="text-muted mb-0 small text-uppercase fw-bold">Total Staff</h6>
                                <h3 className="mb-0 fw-bold">{stats.totalStaff}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="d-flex align-items-center">
                            <div className="rounded-3 p-3 me-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                <i className="bi bi-person-dash fs-4"></i>
                            </div>
                            <div>
                                <h6 className="text-muted mb-0 small text-uppercase fw-bold">On Leave</h6>
                                <h3 className="mb-0 fw-bold">{stats.onLeaveToday}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="d-flex align-items-center">
                            <div className="rounded-3 p-3 me-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                <i className="bi bi-clock-history fs-4"></i>
                            </div>
                            <div>
                                <h6 className="text-muted mb-0 small text-uppercase fw-bold">Pending</h6>
                                <h3 className="mb-0 fw-bold">{stats.pendingRequests}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="d-flex align-items-center">
                            <div className="rounded-3 p-3 me-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                <i className="bi bi-currency-rupee fs-4"></i>
                            </div>
                            <div>
                                <h6 className="text-muted mb-0 small text-uppercase fw-bold">Payroll</h6>
                                <h3 className="mb-0 fw-bold">₹{stats.estPayrollCost?.toLocaleString()}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts & Tables */}
            <Row>
                <Col md={5}>
                    <Card className="p-4 shadow-sm h-100 border-0">
                        <h5 className="mb-4">Department Distribution</h5>
                        <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                            <Doughnut data={deptData} options={{ maintainAspectRatio: false, cutout: '70%' }} />
                        </div>
                    </Card>
                </Col>
                <Col md={7}>
                    <Card className="p-4 shadow-sm h-100 border-0">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Recent Leave Requests</h5>
                            <Badge bg="light" text="dark" className="border">Last 5</Badge>
                        </div>
                        <Table hover responsive className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Employee</th>
                                    <th>Dates</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLeaves.length > 0 ? recentLeaves.map(leave => (
                                    <tr key={leave.id}>
                                        <td className="fw-bold">{leave.user?.name || 'Unknown'}</td>
                                        <td className="small text-muted">
                                            {leave.startDate} <i className="bi bi-arrow-right mx-1"></i> {leave.endDate}
                                        </td>
                                        <td><Badge bg="secondary" className="fw-normal">{leave.leaveType}</Badge></td>
                                        <td>
                                            {leave.status === 'APPROVED' && <Badge bg="success-subtle" text="success">Approved</Badge>}
                                            {leave.status === 'REJECTED' && <Badge bg="danger-subtle" text="danger">Rejected</Badge>}
                                            {leave.status === 'PENDING' && <Badge bg="warning-subtle" text="warning">Pending</Badge>}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="text-center text-muted">No recent activity</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
