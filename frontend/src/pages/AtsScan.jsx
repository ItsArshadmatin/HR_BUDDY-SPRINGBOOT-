import { useState } from 'react';
import api from '../api/axios';
import { Card, Button, Form, ProgressBar, Badge, Alert, Spinner } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const AtsScan = () => {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [role, setRole] = useState("Software Engineer"); // Default role

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
        setError(null);
    };

    const handleScan = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("role", role); // Send selected role

        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/ats/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to analyze resume. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#198754'; // Success Green
        if (score >= 50) return '#ffc107'; // Warning Yellow
        return '#dc3545'; // Danger Red
    };

    const chartData = (score) => ({
        labels: ['Match', 'Gap'],
        datasets: [{
            data: [score, 100 - score],
            backgroundColor: [getScoreColor(score), '#e9ecef'],
            borderWidth: 0,
        }]
    });

    return (
        <div className="container mt-4">
            <h2 className="mb-4">🤖 AI Resume Scanner</h2>
            <div className="row">
                <div className="col-md-5">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>Configuration</Card.Title>
                            <Form onSubmit={handleScan}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Target Role</Form.Label>
                                    <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                                        <option value="Software Engineer">Software Engineer</option>
                                        <option value="Data Scientist">Data Scientist</option>
                                        <option value="Product Manager">Product Manager</option>
                                        <option value="DevOps Engineer">DevOps Engineer</option>
                                        <option value="HR Specialist">HR Specialist</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Upload Resume (PDF)</Form.Label>
                                    <Form.Control type="file" accept=".pdf" onChange={handleFileChange} />
                                </Form.Group>

                                <Button variant="primary" type="submit" disabled={loading || !file} className="w-100">
                                    {loading ? <><Spinner as="span" animation="border" size="sm" /> Analyzing...</> : `Scan for ${role}`}
                                </Button>
                            </Form>
                            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                        </Card.Body>
                    </Card>

                    <Card className="mt-3 shadow-sm bg-light">
                        <Card.Body>
                            <h6>Target Profile: {role}</h6>
                            <p className="small text-muted mb-0">AI will evaluate skills relevant to {role}. Ensure keywords match standard JDs.</p>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-md-7">
                    {result && (
                        <Card className="shadow-lg border-0 h-100">
                            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 text-center">
                                {result.summary.includes("Simulated") && (
                                    <Badge bg="warning" text="dark" className="mb-3">
                                        <i className="bi bi-exclamation-triangle me-1"></i> Mock Mode (Restart Backend to Activate AI)
                                    </Badge>
                                )}
                            </Card.Header>
                            <Card.Body className="text-center px-4">
                                {/* Score Circle */}
                                <div className="position-relative mx-auto mb-4" style={{ width: '160px', height: '160px' }}>
                                    <Doughnut
                                        data={chartData(result.score)}
                                        options={{
                                            cutout: '80%',
                                            plugins: { tooltip: { enabled: false }, legend: { display: false } }
                                        }}
                                    />
                                    <div className="position-absolute top-50 start-50 translate-middle">
                                        <h1 className="display-4 fw-bold mb-0" style={{ color: getScoreColor(result.score) }}>
                                            {result.score}%
                                        </h1>
                                        <small className="text-muted fw-bold">MATCH</small>
                                    </div>
                                </div>

                                <h3 className="fw-bold mb-2">{result.recommendation}</h3>
                                <p className="text-muted mb-4">{result.summary}</p>

                                <Card className="bg-light border-0 mb-3 text-start">
                                    <Card.Body>
                                        <h6 className="fw-bold mb-3"><i className="bi bi-list-check me-2"></i>Skill Gap Analysis</h6>
                                        {result.missingKeywords && result.missingKeywords.length > 0 ? (
                                            <div>
                                                <p className="small text-muted mb-2">Consider acquiring these skills:</p>
                                                {result.missingKeywords.map((keyword, index) => (
                                                    <Badge key={index} bg="danger" className="me-2 mb-2 px-3 py-2 fw-normal">
                                                        {keyword}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-success">
                                                <i className="bi bi-check-circle-fill me-2"></i>
                                                <strong>Perfect Match!</strong> No missing keywords found.
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Card.Body>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AtsScan;
