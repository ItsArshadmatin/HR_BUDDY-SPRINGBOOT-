import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import UserAvatar from '../components/UserAvatar';

const LeaveManage = () => {
    const [leaves, setLeaves] = useState([]);

    const fetchLeaves = async () => {
        try {
            const response = await api.get('/leaves?status=PENDING');
            setLeaves(response.data);
        } catch (e) {
            console.error("Failed to fetch leaves", e);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleAction = async (id, status) => {
        try {
            await api.put(`/leaves/${id}/status?status=${status}`);
            fetchLeaves(); // Refresh list
        } catch (e) {
            alert("Failed to update status");
        }
    };

    return (
        <div>
            <h2>Leave Management</h2>
            <p className="text-muted">Review pending leave requests</p>

            <Table striped bordered hover responsive className="shadow-sm bg-white align-middle mt-3">
                <thead className="bg-light">
                    <tr>
                        <th>Employee</th>
                        <th>Dates</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Balance</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leaves.map(leave => {
                        // Calc duration purely for display (backend does logic)
                        const start = new Date(leave.startDate);
                        const end = new Date(leave.endDate);
                        const days = (end - start) / (1000 * 60 * 60 * 24) + 1;

                        return (
                            <tr key={leave.id}>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <UserAvatar name={leave.user.name} image={leave.user.profileImage} size={32} />
                                        <div className="ms-3">
                                            <div className="fw-bold">{leave.user.name}</div>
                                            <div className="text-muted small">{leave.user.department}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div>{leave.startDate}</div>
                                    <div className="text-muted small">to {leave.endDate}</div>
                                </td>
                                <td>{days} Days</td>
                                <td>{leave.reason}</td>
                                <td><Badge bg="info">{leave.user.leaveBalance} Remaining</Badge></td>
                                <td>
                                    <ButtonGroup>
                                        <Button variant="success" size="sm" onClick={() => handleAction(leave.id, 'APPROVED')}>
                                            <i className="bi bi-check-lg"></i> Approve
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleAction(leave.id, 'REJECTED')}>
                                            <i className="bi bi-x-lg"></i> Reject
                                        </Button>
                                    </ButtonGroup>
                                </td>
                            </tr>
                        );
                    })}
                    {leaves.length === 0 && <tr><td colSpan="6" className="text-center py-4">No pending requests</td></tr>}
                </tbody>
            </Table>
        </div>
    );
};

export default LeaveManage;
