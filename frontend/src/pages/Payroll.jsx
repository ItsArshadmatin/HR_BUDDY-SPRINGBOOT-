import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Container, Row, Col, Form, Button, Table, Badge, Card, Spinner, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Payroll = () => {
    const { user } = useAuth();
    const isAdmin = user?.role?.includes('ADMIN') || user?.role?.includes('HR');
    const isHR = user?.role?.includes('HR');

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);

    // Payment Gateway State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStep, setPaymentStep] = useState('IDLE'); // IDLE, AUTH, CONNECTING, PROCESSING, SUCCESS, ERROR
    const [paymentLog, setPaymentLog] = useState([]);
    const [paymentMode, setPaymentMode] = useState('BATCH'); // BATCH or SINGLE
    const [transactionPin, setTransactionPin] = useState('');

    const fetchPayroll = async () => {
        setLoading(true);
        setError(null);
        try {
            if (isAdmin) {
                const res = await api.get(`/payroll`, { params: { month, year } });
                setPayrolls(res.data);
            } else {
                // Employee view could be handled here or separate component
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) fetchPayroll();
    }, [month, year, isAdmin]);

    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);
        setSuccess(null);
        try {
            await api.post(`/payroll/generate`, null, { params: { month, year } });
            setSuccess("Payroll generated successfully.");
            fetchPayroll();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate payroll. Check if attendance is finalized.");
        } finally {
            setGenerating(false);
        }
    };

    const handleDisburse = () => {
        if (payrolls.filter(p => p.status !== 'PAID').length === 0) {
            alert("All records are already paid!");
            return;
        }
        setPaymentMode('BATCH');
        setPaymentStep('AUTH');
        setTransactionPin('');
        setShowPaymentModal(true);
    };

    const handleMarkPaid = (p) => {
        setSelectedPayroll(p);
        setPaymentMode('SINGLE');
        setPaymentStep('AUTH');
        setTransactionPin('');
        setShowPaymentModal(true);
    };

    const handleAuthorize = async () => {
        if (!transactionPin) {
            alert("Please enter your password.");
            return;
        }

        try {
            await api.post('/auth/verify-password', { password: transactionPin });
            startPaymentSimulation();
        } catch (err) {
            alert("Invalid Password! Authorization Failed.");
        }
    };

    const addLog = (msg) => setPaymentLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const startPaymentSimulation = async () => {
        setPaymentStep('CONNECTING');
        setPaymentLog([]);

        // Step 1: Connecting
        addLog("Initializing Secure Connection...");
        await new Promise(r => setTimeout(r, 1000));
        addLog("Connecting to HDFC Corporate Banking Gateway...");
        await new Promise(r => setTimeout(r, 1500));
        addLog("Handshake Successful. Verifying Merchant Credentials...");
        await new Promise(r => setTimeout(r, 1000));

        // Step 2: Processing
        setPaymentStep('PROCESSING');
        addLog(paymentMode === 'BATCH' ? "Authenticated. Batch Processing Initiated..." : "Authenticated. Single Transfer Initiated...");

        try {
            if (paymentMode === 'BATCH') {
                await api.post(`/payroll/process`, null, { params: { month, year } });
                addLog("Batch Transaction Verified by Bank.");
            } else {
                await api.post(`/payroll/${selectedPayroll.id}/mark-paid`);
                addLog(`Transfer to ${selectedPayroll.employee.name} Verified.`);
            }

            addLog("Funds Debited: YES");
            addLog("Disbursement Status: COMPLETE");

            setPaymentStep('SUCCESS');
            setTimeout(() => {
                setShowPaymentModal(false);
                setPaymentStep('IDLE');
                fetchPayroll();
                setSuccess(paymentMode === 'BATCH' ? "✅ Salaries Disbursed Successfully!" : "✅ Payment Successful!");
            }, 2500);

        } catch (err) {
            setPaymentStep('ERROR');
            addLog("ERROR: Transaction Failed. " + (err.response?.data?.message || "Time out"));
        }
    };

    const handleDownloadPayslip = async (id) => {
        try {
            const response = await api.get(`/payroll/payslip/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payslip_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Failed to download payslip.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!isAdmin) {
        return <Container className="mt-5"><Alert variant="info">Employee Payroll View Under Maintenance. Please contact HR.</Alert></Container>;
    }

    return (
        <Container fluid>
            <h2 className="mb-4">💰 Payroll Management</h2>

            <Card className="mb-4 shadow-sm border-0 no-print">
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
                        <Col md={8} className="text-end">
                            <Button
                                variant="primary"
                                onClick={handleGenerate}
                                className="me-2"
                                disabled={generating || payrolls.length > 0}
                            >
                                {generating ? <Spinner size="sm" /> : <><i className="bi bi-gear-fill me-1"></i> Generate Payroll</>}
                            </Button>
                            {isHR && (
                                <Button
                                    variant="success"
                                    onClick={handleDisburse}
                                    disabled={processing || payrolls.length === 0}
                                >
                                    {processing ? <Spinner size="sm" /> : <><i className="bi bi-cash-stack me-1"></i> Disburse Salaries</>}
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

            <Card className="shadow-sm border-0 no-print">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Employee</th>
                            <th>Base Salary</th>
                            <th>Payable Days</th>
                            <th>Deductions</th>
                            <th>Net Salary</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="text-center p-4"><Spinner /></td></tr>
                        ) : payrolls.length === 0 ? (
                            <tr><td colSpan="7" className="text-center p-4 text-muted">No payroll records found. Generate to create.</td></tr>
                        ) : (
                            payrolls.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="fw-bold">{p.employee.name}</div>
                                        <small className="text-muted">{p.employee.department || 'General'}</small>
                                    </td>
                                    <td>₹{p.baseSalary.toLocaleString()}</td>
                                    <td>{p.payableDays}</td>
                                    <td className="text-danger">-₹{p.deductionAmount.toLocaleString()}</td>
                                    <td className="fw-bold text-success">₹{p.netSalary.toLocaleString()}</td>
                                    <td>
                                        <Badge bg={p.status === 'PAID' ? 'success' : 'warning'} className="fw-normal">
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        {p.status === 'PAID' ? (
                                            <Button variant="outline-dark" size="sm" onClick={() => handleDownloadPayslip(p.id)}>
                                                <i className="bi bi-file-earmark-pdf me-1"></i> Payslip
                                            </Button>
                                        ) : (
                                            isHR && (
                                                <Button variant="outline-success" size="sm" onClick={() => handleMarkPaid(p)}>
                                                    <i className="bi bi-check-lg"></i> Pay
                                                </Button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            {/* Payslip Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="no-print">
                    <Modal.Title>Payslip View</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedPayroll && (
                        <div id="payslip-content">
                            <div className="text-center mb-4 border-bottom pb-3">
                                <h3 className="fw-bold text-primary">EMS Corp.</h3>
                                <p className="mb-0">Payslip for {new Date(0, selectedPayroll.month - 1).toLocaleString('default', { month: 'long' })} {selectedPayroll.year}</p>
                            </div>
                            <Row className="mb-3">
                                <Col xs={6}>
                                    <strong>Name:</strong> {selectedPayroll.employee.name}<br />
                                    <strong>ID:</strong> EMS-{selectedPayroll.employee.id}<br />
                                    <strong>Dept:</strong> {selectedPayroll.employee.department}
                                </Col>
                                <Col xs={6} className="text-end">
                                    <strong>Generated:</strong> {new Date(selectedPayroll.generatedAt).toLocaleDateString()}
                                </Col>
                            </Row>
                            <Table bordered size="sm">
                                <tbody>
                                    <tr>
                                        <td>Base Salary</td>
                                        <td className="text-end">₹{selectedPayroll.baseSalary.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td>Payable Days</td>
                                        <td className="text-end">{selectedPayroll.payableDays}</td>
                                    </tr>
                                    <tr>
                                        <td>Deductions</td>
                                        <td className="text-end text-danger">-₹{selectedPayroll.deductionAmount.toLocaleString()}</td>
                                    </tr>
                                    <tr className="table-active fw-bold">
                                        <td>Net Payable</td>
                                        <td className="text-end">₹{selectedPayroll.netSalary.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </Table>
                            <div className="text-center mt-4 no-print">
                                <Button variant="primary" onClick={handlePrint}>
                                    <i className="bi bi-printer me-2"></i> Print Payslip
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            {/* Simulated Payment Gateway Modal */}
            <Modal show={showPaymentModal} onHide={() => { }} backdrop="static" centered>
                <Modal.Body className="text-center p-5">
                    {paymentStep === 'AUTH' && (
                        <>
                            <div className="mb-4">
                                <i className="bi bi-shield-lock-fill text-primary" style={{ fontSize: '3rem' }}></i>
                            </div>
                            <h4 className="mb-3">Secure Transaction Authorization</h4>
                            <p className="text-muted mb-4">
                                {paymentMode === 'BATCH'
                                    ? "You are about to disburse salaries for ALL employees."
                                    : `You are about to transfer salary to ${selectedPayroll?.employee?.name}.`
                                }
                                <br />Please enter your Transaction PIN.
                            </p>
                            <Form.Control
                                type="password"
                                placeholder="Enter your Login Password"
                                className="mb-3 text-center"
                                value={transactionPin}
                                onChange={(e) => setTransactionPin(e.target.value)}
                            />
                            <div className="d-flex justify-content-center gap-2">
                                <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handleAuthorize}>Authorize Payment</Button>
                            </div>
                        </>
                    )}

                    {paymentStep === 'CONNECTING' && (
                        <>
                            <Spinner animation="grow" variant="primary" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
                            <h4 className="text-primary mt-2">Connecting to Secure Gateway...</h4>
                            <p className="text-muted">Establishing encrypted channel with bank.</p>
                        </>
                    )}
                    {paymentStep === 'PROCESSING' && (
                        <>
                            <Spinner animation="border" variant="warning" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
                            <h4 className="text-warning mt-2">Processing Payments...</h4>
                            <p className="text-muted">Please do not close this window.</p>
                        </>
                    )}
                    {paymentStep === 'SUCCESS' && (
                        <>
                            <div className="mb-3 display-1 text-success">
                                <i className="bi bi-check-circle-fill"></i>
                            </div>
                            <h4 className="text-success">Payment Successful!</h4>
                            <p className="text-muted">All salaries have been disbursed.</p>
                        </>
                    )}
                    {paymentStep === 'ERROR' && (
                        <>
                            <div className="mb-3 display-1 text-danger">
                                <i className="bi bi-x-circle-fill"></i>
                            </div>
                            <h4 className="text-danger">Transaction Failed</h4>
                            <p className="text-muted">Connection interrupted. Please try again.</p>
                            <Button variant="danger" onClick={() => setShowPaymentModal(false)}>Close</Button>
                        </>
                    )}

                    {/* Fake Terminal Logs */}
                    <div className="mt-4 p-2 bg-black text-start text-monospace rounded" style={{ height: '150px', overflowY: 'auto', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {paymentLog.map((log, i) => (
                            <div key={i} className="text-success">{log}</div>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>

            <style>
                {`
                    @media print {
                        .no-print { display: none !important; }
                        .modal-content { border: none !important; shadow: none !important; }
                        .modal-header { display: none !important; }
                        body { visibility: hidden; }
                        #payslip-content { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
                    }
                `}
            </style>
        </Container>
    );
};

export default Payroll;
