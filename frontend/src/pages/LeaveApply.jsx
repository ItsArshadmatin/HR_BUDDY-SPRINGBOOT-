import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Card, Form, Button, Table, Badge, Alert } from 'react-bootstrap';

const LeaveApply = () => {
    const [myLeaves, setMyLeaves] = useState([]);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        leaveType: '',
        reason: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchLeaves = async () => {
        try {
            const response = await api.get('/leaves/my');
            setMyLeaves(response.data);
        } catch (e) {
            console.error("Failed to fetch leaves", e);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            await api.post('/leaves', formData);
            setSuccess("Leave applied successfully!");
            setFormData({ startDate: '', endDate: '', leaveType: '', reason: '' });
            fetchLeaves();
        } catch (e) {
            setError(e.response?.data?.message || "Failed to apply for leave");
        }
    };

    return (
        <div>
            <h2>My Leaves</h2>
            <div className="row mt-4">
                <div className="col-md-4">
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white">Apply for Leave</Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Leave Type</Form.Label>
                                    <Form.Select name="leaveType" value={formData.leaveType} onChange={handleChange} required>
                                        <option value="">Select Type</option>
                                        <option value="CASUAL_LEAVE">Casual Leave</option>
                                        <option value="SICK_LEAVE">Sick Leave</option>
                                        <option value="EARNED_LEAVE">Earned Leave</option>
                                        <option value="UNPAID_LEAVE">Unpaid Leave</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Reason</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="reason" value={formData.reason} onChange={handleChange} required />
                                </Form.Group>
                                <Button variant="primary" type="submit" className="w-100">Submit Request</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-8">
                    <Card className="shadow-sm">
                        <Card.Header>Request History</Card.Header>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Date(s)</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Applied On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myLeaves.map(leave => (
                                        <tr key={leave.id}>
                                            <td>{leave.startDate} to {leave.endDate}</td>
                                            <td>{leave.reason}</td>
                                            <td>
                                                <Badge bg={leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'danger' : 'warning'}>
                                                    {leave.status}
                                                </Badge>
                                            </td>
                                            <td>{new Date(leave.appliedAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {myLeaves.length === 0 && <tr><td colSpan="4" className="text-center">No leave requests found</td></tr>}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LeaveApply;
