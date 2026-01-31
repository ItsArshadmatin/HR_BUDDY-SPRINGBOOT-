import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { Container, Row, Col, Form, Button, Table, Badge, Card, Spinner, Alert } from 'react-bootstrap';

const Attendance = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());
    const [records, setRecords] = useState([]);

    const displayedRecords = useMemo(() => {
        if (selectedDay === 'ALL') return records;
        return records.filter(r => new Date(r.date).getDate() == selectedDay);
    }, [records, selectedDay]);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch Attendance
    const fetchAttendance = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/attendance`, { params: { month, year } });
            setRecords(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch attendance records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [month, year]);

    // Initialize Month
    const handleInitialize = async () => {
        setInitializing(true);
        setError(null);
        setSuccess(null);
        try {
            await api.post(`/attendance/init`, null, { params: { month, year } });
            setSuccess(`Attendance initialized for ${month}/${year}`);
            fetchAttendance();
        } catch (err) {
            setError("Failed to initialize attendance.");
        } finally {
            setInitializing(false);
        }
    };

    // Finalize Month
    const handleFinalize = async () => {
        if (!window.confirm("Are you sure? Once finalized, records cannot be edited.")) return;
        try {
            await api.post(`/attendance/finalize`, null, { params: { month, year } });
            setSuccess("Month finalized successfully.");
            fetchAttendance();
        } catch (err) {
            setError("Failed to finalize month.");
        }
    };

    const handleSeedData = async () => {
        if (window.confirm("Generate Dummy Data? This will overwrite un-finalized records.")) {
            try {
                await api.post('/seed/attendance', null, { params: { month, year } });
                setSuccess('Dummy Data Generated!');
                fetchAttendance();
            } catch (err) {
                setError('Failed to seed data.');
            }
        }
    };

    // Update Record
    const handleUpdate = async (id, status, remarks) => {
        try {
            await api.put(`/attendance/${id}`, { status, remarks });
            // Optimistic Update
            setRecords(records.map(r => r.id === id ? { ...r, status, remarks } : r));
        } catch (err) {
            alert("Failed to update record: " + (err.response?.data?.message || err.message));
        }
    };

    const isFinalized = records.length > 0 && records[0].finalized;

    return (
        <Container fluid>
            <h2 className="mb-4">📅 Attendance Management</h2>

            {/* Filters & Actions */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body>
                    <Row className="align-items-end">
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Month</Form.Label>
                                <Form.Select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Year</Form.Label>
                                <Form.Control type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Day</Form.Label>
                                <Form.Select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                                    <option value="ALL">Show Whole Month</option>
                                    {Array.from({ length: 31 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6} className="text-end">
                            <Button
                                variant="outline-secondary"
                                className="me-2"
                                onClick={handleSeedData}
                                disabled={isFinalized}
                            >
                                <i className="bi bi-database-add me-1"></i> Seed Dummy Data
                            </Button>
                            <Button
                                variant="outline-primary"
                                className="me-2"
                                onClick={handleInitialize}
                                disabled={initializing || isFinalized}
                            >
                                {initializing ? <Spinner size="sm" /> : <><i className="bi bi-arrow-clockwise me-1"></i> Initialize Month</>}
                            </Button>

                            <Button
                                variant={isFinalized ? "secondary" : "success"}
                                onClick={handleFinalize}
                                disabled={isFinalized || records.length === 0}
                            >
                                {isFinalized ? <><i className="bi bi-lock-fill me-1"></i> Finalized</> : <><i className="bi bi-check-circle me-1"></i> Finalize Month</>}
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Messages */}
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

            {/* Table */}
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 text-primary">
                        {selectedDay === 'ALL'
                            ? `All Records for ${new Date(0, month - 1).toLocaleString('default', { month: 'long' })} ${year}`
                            : `Attendance for ${new Date(0, month - 1).toLocaleString('default', { month: 'short' })} ${selectedDay}, ${year}`
                        }
                    </h5>
                </Card.Header>
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Employee</th>
                            <th>Role</th>
                            {selectedDay === 'ALL' && <th>Date</th>}
                            <th>Status</th>
                            <th>Remarks</th>
                            <th>Synced Leave</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center p-4"><Spinner /></td></tr>
                        ) : displayedRecords.length === 0 ? (
                            <tr><td colSpan="6" className="text-center p-4 text-muted">No records found for this selection.</td></tr>
                        ) : (
                            displayedRecords.map(record => (
                                <tr key={record.id} className={record.status === 'ABSENT' ? 'table-danger' : ''}>
                                    <td>
                                        <div className="fw-bold">{record.employee.name}</div>
                                        <small className="text-muted">{record.employee.email}</small>
                                    </td>
                                    <td><Badge bg="secondary" className="fw-normal">{record.employee.role}</Badge></td>
                                    {selectedDay === 'ALL' && (
                                        <td>
                                            <div className="fw-bold">{record.date}</div>
                                            <small className="text-muted">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}</small>
                                        </td>
                                    )}
                                    <td>
                                        <Form.Select
                                            size="sm"
                                            value={record.status}
                                            onChange={(e) => handleUpdate(record.id, e.target.value, record.remarks)}
                                            disabled={record.finalized || record.status === 'LEAVE'}
                                            style={{ width: '130px', fontWeight: 'bold', color: record.status === 'PRESENT' ? 'green' : record.status === 'ABSENT' ? 'red' : 'black' }}
                                        >
                                            <option value="PRESENT">Present</option>
                                            <option value="ABSENT">Absent</option>
                                            <option value="HALF_DAY">Half Day</option>
                                            <option value="LEAVE" disabled>On Leave</option>
                                        </Form.Select>
                                    </td>
                                    <td>
                                        <Form.Control
                                            size="sm"
                                            defaultValue={record.remarks}
                                            onBlur={(e) => handleUpdate(record.id, record.status, e.target.value)}
                                            disabled={record.finalized}
                                            placeholder="Add remarks..."
                                        />
                                    </td>
                                    <td>
                                        {record.leaveRequest ? (
                                            <Badge bg="info">{record.leaveRequest.leaveType}</Badge>
                                        ) : (
                                            <span className="text-muted small">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>
        </Container>
    );
};

export default Attendance;
