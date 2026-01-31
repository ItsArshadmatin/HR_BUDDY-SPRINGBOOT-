import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Card, Row, Col, Form, Button, Badge, Tabs, Tab, Alert, Spinner, Modal } from 'react-bootstrap';
import UserAvatar from '../components/UserAvatar';
import Payroll from './Payroll'; // Reuse the Payroll component directly

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ leaveBalance: 0, leavesTaken: 0 });
    const [showEdit, setShowEdit] = useState(false);

    // Edit Form State
    const [formData, setFormData] = useState({
        name: '', phone: '', address: '', bio: ''
    });

    useEffect(() => {
        if (user) {
            // Initialize form with user data 
            // Note: In a real app we might fetch fresh data from /api/users/me or /api/users/{id}
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                bio: user.bio || ''
            });
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/leaves/my');
            setStats({
                leavesTaken: res.data.length,
                leaveBalance: (user.leaveBalance || 20) - res.data.length
            });
        } catch (ignore) { }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${user.id}`, formData);
            alert("Profile Updated! Please re-login to see changes completely.");
            setShowEdit(false);
            // Ideally call a refreshUser() from AuthContext here
        } catch (error) {
            alert("Failed to update profile");
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">My Dashboard</h2>

            <Row>
                {/* Left Column: Avatar & Quick Stats */}
                <Col md={4}>
                    <Card className="shadow-sm border-0 mb-4 text-center p-4">
                        <div className="position-relative d-inline-block mx-auto mb-3">
                            <UserAvatar name={user.name} image={user.profileImage} size={120} />
                        </div>
                        <h4>{user.name}</h4>
                        <p className="text-muted mb-1">{user.role}</p>
                        <p className="small text-muted">{user.bio || "No bio added yet."}</p>

                        <div className="d-grid mt-3">
                            <Button variant="outline-primary" size="sm" onClick={() => setShowEdit(true)}>
                                <i className="bi bi-pencil me-2"></i> Edit Profile
                            </Button>
                        </div>
                    </Card>

                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Body>
                            <h6 className="card-title mb-4">Leave Statistics</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Annual Quota</span>
                                <span className="fw-bold">{user.leaveBalance || 20} Days</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Taken</span>
                                <span className="fw-bold text-warning">{stats.leavesTaken} Days</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between">
                                <span>Balance</span>
                                <span className="fw-bold text-success">{stats.leaveBalance} Days</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column: Tabs */}
                <Col md={8}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <Tabs defaultActiveKey="details" className="mb-4">
                                <Tab eventKey="details" title="My Details">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="text-muted small">Employee ID</label>
                                            <p className="fw-bold">EMS-{String(user.id).padStart(4, '0')}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small">Department</label>
                                            <p className="fw-bold">{user.department}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small">Email</label>
                                            <p className="fw-bold">{user.email}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small">Phone</label>
                                            <p className="fw-bold">{formData.phone || 'Not Set'}</p>
                                        </div>
                                        <div className="col-12">
                                            <label className="text-muted small">Address</label>
                                            <p className="fw-bold">{formData.address || 'Not Set'}</p>
                                        </div>
                                    </div>
                                </Tab>

                                <Tab eventKey="payroll" title="My Salary Slip">
                                    {/* Reusing Payroll Component here inside the Tab */}
                                    <Payroll embedded={true} />
                                </Tab>

                                <Tab eventKey="security" title="Security">
                                    <div className="p-3 bg-light rounded text-center">
                                        <i className="bi bi-shield-check" style={{ fontSize: '2rem' }}></i>
                                        <h6 className="mt-2">Account is Secure</h6>
                                        <p className="small text-muted">Password last changed: 30 days ago.</p>
                                    </div>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Edit Modal */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateProfile}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Bio / About</Form.Label>
                            <Form.Control as="textarea" rows={2} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control as="textarea" rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Save Changes</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Profile;
