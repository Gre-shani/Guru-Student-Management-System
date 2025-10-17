import React, { useState, useEffect } from 'react';
import { getStudents, addStudent, updateStudent, deleteStudent } from '../services/studentService';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({ name: '', email: '', contact: '', department: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const res = await getStudents();
    setStudents(res.data);
  };

  const handleChange = (e) => {
    setCurrentStudent({ ...currentStudent, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await updateStudent(currentStudent._id, currentStudent);
    } else {
      await addStudent(currentStudent);
    }
    setShowModal(false);
    setCurrentStudent({ name: '', email: '', contact: '', department: '' });
    setIsEditing(false);
    fetchStudents();
  };

  const handleEdit = (student) => {
    setCurrentStudent(student);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await deleteStudent(id);
      fetchStudents();
    }
  };

  return (
    <div className="container mt-5">
      <h2>Student Management</h2>
      <Button className="mb-3" onClick={() => setShowModal(true)}>Add Student</Button>
      
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.contact}</td>
              <td>{student.department}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEdit(student)}>Edit</Button>{' '}
                <Button variant="danger" size="sm" onClick={() => handleDelete(student._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => { setShowModal(false); setIsEditing(false); }}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Student' : 'Add Student'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={currentStudent.name} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={currentStudent.email} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Contact</Form.Label>
              <Form.Control type="text" name="contact" value={currentStudent.contact} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Department</Form.Label>
              <Form.Control type="text" name="department" value={currentStudent.department} onChange={handleChange} required />
            </Form.Group>
            <Button type="submit" className="mt-2">{isEditing ? 'Update' : 'Add'}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StudentManagement;
