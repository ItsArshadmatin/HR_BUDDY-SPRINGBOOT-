import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userData = await login(email, password); // Make sure login returns user/role
            if (userData?.role?.includes('EMPLOYEE')) {
                navigate('/profile');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (

        <Container fluid className="p-0" style={{ height: '100vh', overflow: 'hidden' }}>
            <Row className="h-100 g-0">
                {/* Left Side: Image (Visible on Md+) */}
                <Col md={6} lg={7} className="d-none d-md-block h-100 position-relative">
                    <div style={{
                        backgroundImage: "url('/login-bg.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        userSelect: 'none',
                        cursor: 'default'
                    }}>
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            padding: '3rem',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                        }}>
                            <h2 className="text-white fw-bold display-6">Manage your workforce with confidence.</h2>
                            <p className="text-white-50 lead">The all-in-one solution for modern HR teams.</p>
                        </div>
                    </div>
                </Col>

                {/* Right Side: Form */}
                <Col md={6} lg={5} className="d-flex align-items-center justify-content-center bg-white">
                    <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                        <div className="mb-5">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '50px', height: '50px' }}>
                                <i className="bi bi-buildings-fill fs-4"></i>
                            </div>
                            <h2 className="fw-bold">Welcome back</h2>
                            <p className="text-muted">Please enter your details to sign in.</p>
                        </div>

                        {error && <Alert variant="danger" className="border-0 bg-danger bg-opacity-10 text-danger">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4" controlId="formBasicEmail">
                                <Form.Label className="small fw-bold text-uppercase text-muted">Email address</Form.Label>
                                <Form.Control
                                    size="lg"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-light border-0"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="formBasicPassword">
                                <Form.Label className="small fw-bold text-uppercase text-muted">Password</Form.Label>
                                <Form.Control
                                    size="lg"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-light border-0"
                                />
                            </Form.Group>

                            <div className="d-grid gap-2 mb-4">
                                <Button variant="primary" size="lg" type="submit" className="py-3 shadow-sm">
                                    Sign In <i className="bi bi-arrow-right ms-2"></i>
                                </Button>
                            </div>

                            <div className="text-center mt-4">
                                <p className="text-muted small">
                                    Demo Credentials:<br />
                                    <strong>Admin:</strong> admin@ems.com / password<br />
                                    <strong>Employee:</strong> employee1@ems.com / password
                                </p>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
