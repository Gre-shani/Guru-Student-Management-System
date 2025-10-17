import React, { useState, useEffect } from "react";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../services/studentService";
import {
  Table,
  Button,
  Modal,
  Form,
  Container,
  Row,
  Col,
  Badge,
  Toast,
  ToastContainer,
} from "react-bootstrap";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({
    name: "",
    email: "",
    contact: "",
    department: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", variant: "" });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await getStudents();
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!currentStudent.name.trim()) newErrors.name = "Name is required";
    else if (currentStudent.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";
    else if (!/^[a-zA-Z\s]+$/.test(currentStudent.name))
      newErrors.name = "Name should contain only letters";

    if (!currentStudent.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentStudent.email))
      newErrors.email = "Invalid email format";

    if (!currentStudent.contact.trim()) newErrors.contact = "Contact is required";
    else if (!/^\d{10}$/.test(currentStudent.contact.replace(/[-\s]/g, "")))
      newErrors.contact = "Contact must be 10 digits";

    if (!currentStudent.department.trim())
      newErrors.department = "Department is required";
    else if (currentStudent.department.trim().length < 2)
      newErrors.department = "Department must be at least 2 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentStudent({ ...currentStudent, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please fix the errors in the form", "warning");
      return;
    }
    try {
      if (isEditing) {
        await updateStudent(currentStudent._id, currentStudent);
        showToast("Student updated successfully ✅", "success");
      } else {
        await addStudent(currentStudent);
        showToast("Student added successfully 🎉", "success");
      }
      setShowModal(false);
      resetForm();
      fetchStudents();
    } catch {
      showToast("Error saving student ❌", "danger");
    }
  };

  const handleEdit = (student) => {
    setCurrentStudent(student);
    setIsEditing(true);
    setShowModal(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id);
        showToast("Student deleted successfully 🗑️", "success");
        fetchStudents();
      } catch {
        showToast("Error deleting student ❌", "danger");
      }
    }
  };

  const resetForm = () => {
    setCurrentStudent({ name: "", email: "", contact: "", department: "" });
    setIsEditing(false);
    setErrors({});
  };

  const showToast = (message, variant) => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ show: false, message: "", variant: "" }), 2500);
  };

  const filteredStudents = students.filter((student) =>
    Object.values(student).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #49b486, #6a8fa8)",
        padding: "50px 0",
      }}
    >
      <Container>
        <h2 className="text-white text-center fw-bold mb-2">
          🎓 Student Management System
        </h2>
        <p className="text-center text-white mb-5 opacity-75">
          Manage your student records efficiently
        </p>

        <div className="bg-white shadow-lg rounded-4 p-4">
          <Row className="justify-content-between align-items-center mb-4">
            <Col md={6}>
              <h5 className="fw-bold mb-1">Student Records</h5>
              <Badge bg="secondary">Total: {students.length}</Badge>
            </Col>
            <Col md={6} className="d-flex justify-content-md-end mt-3 mt-md-0 gap-2">
              <Form.Control
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: "250px" }}
              />
              <Button
                variant="primary"
                onClick={() => {
                  setShowModal(true);
                  resetForm();
                }}
              >
                ➕ Add Student
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover bordered className="align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="align-middle">
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.contact}</td>
                      <td>
                        <Badge bg="info">{student.department}</Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(student)}
                          className="me-2"
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(student._id)}
                        >
                          🗑️ Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-muted py-5">
                      <div>No students found.</div>
                      <div className="mt-2">Add your first student to get started!</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </Container>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setIsEditing(false);
          resetForm();
        }}
        centered
        size="lg"
      >
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #49b486, #6a8fa8)",
            color: "white",
          }}
        >
          <Modal.Title className="fw-bold">
            {isEditing ? "✏️ Edit Student" : "➕ Add New Student"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={currentStudent.name}
                    onChange={handleChange}
                    isInvalid={!!errors.name}
                    placeholder="Enter full name"
                  />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={currentStudent.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    placeholder="student@example.com"
                  />
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="contact"
                    value={currentStudent.contact}
                    onChange={handleChange}
                    isInvalid={!!errors.contact}
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                  <Form.Control.Feedback type="invalid">{errors.contact}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    value={currentStudent.department}
                    onChange={handleChange}
                    isInvalid={!!errors.department}
                    placeholder="e.g., Computer Science"
                  />
                  <Form.Control.Feedback type="invalid">{errors.department}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setIsEditing(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? "💾 Update Student" : "➕ Add Student"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Toast */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          bg={toast.variant}
          onClose={() => setToast({ show: false })}
          show={toast.show}
          delay={2500}
          autohide
        >
          <Toast.Body className="text-white fw-semibold">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <style jsx>{`
        .rounded-4 {
          border-radius: 1rem !important;
        }
        .hover-row:hover {
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default StudentManagement;
