import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Table, Form, Button, FormControl, InputGroup, Badge, Modal, Row, Col } from 'react-bootstrap';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';

const EmployeeList = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', department: '', role: 'EMPLOYEE', salary: '', file: null
    });

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const fetchEmployees = async (query = '') => {
        try {
            const url = query ? `/employees?search=${query}` : '/employees';
            const response = await api.get(url);
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees", error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEmployees(search);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ name: '', email: '', password: '', department: '', role: 'EMPLOYEE', salary: '', file: null });
        setShowModal(true);
    };

    const openEditModal = (emp) => {
        setIsEditing(true);
        setCurrentId(emp.id);
        setFormData({
            name: emp.name,
            email: emp.email,
            password: '', // Leave blank unless changing
            department: emp.department,
            role: emp.role,
            salary: emp.salary,
            file: null
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let userId = currentId;

            // 1. Create or Update User
            const payload = {
                name: formData.name,
                email: formData.email,
                department: formData.department,
                role: formData.role,
                salary: formData.salary,
                password: formData.password || undefined // Only send if set
            };

            if (isEditing) {
                await api.put(`/employees/${currentId}`, payload);
            } else {
                const response = await api.post('/employees', payload);
                userId = response.data.id;
            }

            // 2. Upload Image if selected
            if (formData.file && userId) {
                const imageData = new FormData();
                imageData.append('file', formData.file);
                await api.post(`/employees/${userId}/image`, imageData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setShowModal(false);
            fetchEmployees(search);
        } catch (error) {
            console.error("Error saving employee", error);
            alert("Failed to save employee. " + (error.response?.data?.message || ""));
        }
    };

    const confirmDelete = async () => {
        if (!selectedEmployee) return;
        try {
            await api.put(`/employees/${selectedEmployee.id}/soft-delete`);
            setShowDeleteModal(false);
            fetchEmployees(search);
        } catch (error) {
            console.error("Error deleting employee", error);
        }
    };

    const exportCSV = () => {
        const headers = ['ID,Name,Email,Department,Role,Salary'];
        const rows = employees.map(e =>
            `${e.id},${e.name},${e.email},${e.department},${e.role},${e.salary}`
        );
        const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "employees.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>User Management</h2>
                <div>
                    <Button variant="primary" className="me-2" onClick={openAddModal}>
                        <i className="bi bi-person-plus"></i> Add Employee
                    </Button>
                    <Button variant="success" onClick={exportCSV}>
                        <i className="bi bi-file-earmark-spreadsheet"></i> Export CSV
                    </Button>
                </div>
            </div>

            <Form onSubmit={handleSearch} className="mb-4">
                <InputGroup>
                    <FormControl
                        placeholder="Search by Name or Department"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button variant="primary" type="submit"><i className="bi bi-search"></i> Search</Button>
                </InputGroup>
            </Form>

            <Table striped bordered hover responsive className="shadow-sm bg-white align-middle">
                <thead className="bg-light">
                    <tr>
                        <th>ID</th>
                        <th>Employee</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Salary</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.length > 0 ? employees.map(emp => (
                        <tr key={emp.id}>
                            <td>{emp.id}</td>
                            <td>
                                <div className="d-flex align-items-center">
                                    <UserAvatar name={emp.name} image={emp.profileImage} size={40} />
                                    <span className="ms-3 fw-bold">{emp.name}</span>
                                </div>
                            </td>
                            <td>{emp.email}</td>
                            <td><Badge bg="info">{emp.department}</Badge></td>
                            <td><Badge bg="secondary">{emp.role}</Badge></td>
                            <td>₹{emp.salary?.toLocaleString()}</td>
                            <td>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => openEditModal(emp)}
                                >
                                    <i className="bi bi-pencil"></i>
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => { setSelectedEmployee(emp); setShowDeleteModal(true); }}
                                    disabled={emp.role === 'ADMIN'}
                                >
                                    <i className="bi bi-trash"></i>
                                </Button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="6" className="text-center">No employees found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{isEditing ? 'Edit Employee' : 'Add New Employee'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control name="name" value={formData.name} onChange={handleInputChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Department</Form.Label>
                                    <Form.Select name="department" value={formData.department} onChange={handleInputChange} required>
                                        <option value="">Select...</option>
                                        <option value="IT">IT</option>
                                        <option value="HR">HR</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Administration">Administration</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Role</Form.Label>
                                    <Form.Select name="role" value={formData.role} onChange={handleInputChange} required>
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="HR">HR</option>
                                        <option value="ADMIN">Admin</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Salary</Form.Label>
                                    <Form.Control type="number" name="salary" value={formData.salary} onChange={handleInputChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                {(!isEditing || user?.role === 'ADMIN') && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Password {isEditing && '(Leave blank to keep current)'}</Form.Label>
                                        <Form.Control type="password" name="password" value={formData.password} onChange={handleInputChange} required={!isEditing} />
                                    </Form.Group>
                                )}
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Profile Picture</Form.Label>
                            <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Save Changes</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to deactivate <strong>{selectedEmployee?.name}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDelete}>Deactivate</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EmployeeList;
