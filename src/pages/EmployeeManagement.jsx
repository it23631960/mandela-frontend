import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/employees';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    role: 'employee',
    nicNumber: '',
    dob: '',
    hireDate: '',
    salary: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [editEmployee, setEditEmployee] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    role: '',
    nicNumber: '',
    dob: '',
    hireDate: '',
    salary: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const departments = [
    "Sales",
    "Marketing",
    "Human Resources",
    "IT",
    "Finance",
    "Operations"
  ];

  const roles = [
    "admin",
    "employee"
  ];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(API_URL);
        console.log('Fetched employees:', response.data);
        setEmployees(response.data);
      } catch (error) {
        setEmployees([]);
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(employee => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      employee.firstName.toLowerCase().includes(term) ||
      employee.lastName.toLowerCase().includes(term) ||
      employee.email.toLowerCase().includes(term) ||
      employee.position.toLowerCase().includes(term) ||
      employee.department.toLowerCase().includes(term)
    );
  });

  const handleInputChange = (e, formType = 'new') => {
    const { name, value } = e.target;
    const updateEmployee = formType === 'new' ? setNewEmployee : setEditEmployee;

    if (name === 'dob') {
      // Convert the date string to proper format for backend
      updateEmployee(prev => ({
        ...prev,
        dob: value, // Keep the original date string for the input field
        dateOfBirth: value // This will be used by the backend
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      updateEmployee(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      updateEmployee(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // ADD employee (POST to backend)
  const addEmployee = async () => {
    console.log('Adding employee:', newEmployee);
    try {
      if (!newEmployee.id) {
        alert('Please enter an Employee ID');
        return;
      }
      if (employees.some(emp => emp.id === newEmployee.id)) {
        alert('Employee ID already exists');
        return;
      }

      const employeeData = {
        ...newEmployee,
        dateOfBirth: newEmployee.dob // Ensure dateOfBirth is set
      };

      const response = await axios.post(API_URL, employeeData);
      setEmployees([...employees, response.data]);
      setIsAddModalOpen(false);
      setNewEmployee({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        role: 'employee',
        nicNumber: '',
        dob: '',
        hireDate: '',
        salary: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });
    } catch (error) {
      alert('Failed to add employee');
      console.error('Error adding employee:', error);
    }
  };

  const viewEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
    setIsDetailsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditEmployee({
      ...employee,
      dob: employee.dateOfBirth || '', // Use dateOfBirth from backend
      dateOfBirth: employee.dateOfBirth || '', // Keep the backend format
      address: {
        street: employee.address?.street || '',
        city: employee.address?.city || '',
        state: employee.address?.state || '',
        zipCode: employee.address?.zipCode || '',
        country: employee.address?.country || ''
      }
    });
    setIsEditModalOpen(true);
  };

  const updateEmployee = async () => {
    try {
      const updatedEmployee = {
        ...editEmployee,
        dateOfBirth: editEmployee.dob // Ensure dateOfBirth is set for update
      };

      const response = await axios.put(`${API_URL}/${editEmployee.id}`, updatedEmployee);
      setEmployees(employees.map(e => e.id === editEmployee.id ? response.data : e));
      setIsEditModalOpen(false);
    } catch (error) {
      alert('Failed to update employee');
      console.error('Error updating employee:', error);
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      await axios.delete(`${API_URL}/${employeeId}`);
      setEmployees(employees.filter(e => e.id !== employeeId));
      if (selectedEmployee && selectedEmployee.id === employeeId) {
        setIsDetailsModalOpen(false);
      }
    } catch (error) {
      alert('Failed to delete employee');
      console.error('Error deleting employee:', error);
    }
  };

  const validateForm = (employee) => {
    const requiredFields = [
      employee.id,
      employee.firstName,
      employee.lastName,
      employee.email,
      employee.phone,
      employee.position,
      employee.department,
      employee.role,
      employee.nicNumber,
      employee.dob,
      employee.hireDate,
      employee.salary,
      employee.address.street,
      employee.address.city,
      employee.address.state,
      employee.address.zipCode,
      employee.address.country
    ];
    return requiredFields.every(field =>
      typeof field === 'string' ? field.trim() !== '' : field !== null && field !== undefined
    );
  };    

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Employee Management</h1>
        <p className="text-gray-600">Manage and monitor your employee information</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Employees</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">{employees.length}</p>
          <div className="text-sm text-green-600 mt-2">↑ 8% from last month</div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">#{employee.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.phone}</div>
                    <div className="text-sm text-gray-500">{employee.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => viewEmployeeDetails(employee)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openEditModal(employee)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteEmployee(employee.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{employees.length}</span> of{' '}
                  <span className="font-medium">{employees.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Add New Employee</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={newEmployee.firstName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={newEmployee.lastName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                <input
                  type="email"
                  name="email"
                  value={newEmployee.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Email address"
                />
                <input
                  type="tel"
                  name="phone"
                  value={newEmployee.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Phone number"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={newEmployee.position}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="Position"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={newEmployee.department}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="Department"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={newEmployee.hireDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="text"
                    name="salary"
                    value={newEmployee.salary}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="Salary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={newEmployee.address.street}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Street address"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    name="address.city"
                    value={newEmployee.address.city}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="address.state"
                    value={newEmployee.address.state}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="State"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="address.zipCode"
                    value={newEmployee.address.zipCode}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="ZIP code"
                  />
                  <input
                    type="text"
                    name="address.country"
                    value={newEmployee.address.country}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="Country"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    name="id"
                    value={newEmployee.id}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="Employee ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={newEmployee.role}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label>
                  <input
                    type="text"
                    name="nicNumber"
                    value={newEmployee.nicNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="NIC Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={newEmployee.dob}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={addEmployee}
                  disabled={!validateForm(newEmployee)}
                  className={`px-4 py-2 rounded w-full sm:w-auto ${
                    validateForm(newEmployee)
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Edit Employee</h2>
            <div className="space-y-4">
              <div className="mb-4">
                <strong>Employee ID:</strong> {editEmployee.id}
              </div>

            
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editEmployee.firstName}
                    onChange={(e) =>handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editEmployee.lastName}
                    onChange={(e) =>handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                <input
                  type="email"
                  name="email"
                  value={editEmployee.email}
                  onChange={(e) =>handleInputChange(e, 'edit')}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Email address"
                />
                <input
                  type="tel"
                  name="phone"
                  value={editEmployee.phone}
                  onChange={(e) =>handleInputChange(e, 'edit')}
                  className="w-full p-2 border rounded"
                  placeholder="Phone number"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={editEmployee.position}
                    onChange={(e) =>handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="Position"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={editEmployee.department}
                    onChange={(e) =>handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="Department"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={editEmployee.hireDate}
                    onChange={(e) =>handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="text"
                    name="salary"
                    value={editEmployee.salary}
                    onChange={(e) =>handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="Salary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={editEmployee.address.street}
                  onChange={(e) =>handleInputChange(e, 'edit')}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Street address"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    name="address.city"
                    value={editEmployee.address.city}
                    onChange={(e) =>handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="address.state"
                    value={editEmployee.address.state}
                    onChange={(e) =>handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="State"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="address.zipCode"
                    value={editEmployee.address.zipCode}
                    onChange={(e) =>handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="ZIP code"
                  />
                  <input
                    type="text"
                    name="address.country"
                    value={editEmployee.address.country}
                    onChange={(e) =>handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="Country"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    name="id"
                    value={editEmployee.id}
                    onChange={(e) =>handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="Employee ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={editEmployee.role}
                    onChange={(e) =>handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label>
                  <input
                    type="text"
                    name="nicNumber"
                    value={editEmployee.nicNumber || ''}
                    onChange={(e) => handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="NIC Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={editEmployee.dob ? editEmployee.dob.split('T')[0] : ''}
                    onChange={(e) => handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border rounded w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={updateEmployee}
                  disabled={!validateForm(editEmployee)}
                  className={`px-4 py-2 rounded w-full sm:w-auto ${
                    validateForm(editEmployee)
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Employee Details Modal */}
      {isDetailsModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Employee Details</h2>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="text-lg font-medium">#{selectedEmployee.id}</p>
              </div>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-lg font-medium">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </p>
              </div>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Position</p>
                <p className="text-lg font-medium">{selectedEmployee.position}</p>
                <p className="text-sm text-gray-500 mt-1">Department</p>
                <p className="text-lg font-medium">{selectedEmployee.department}</p>
              </div>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Contact Information</p>
                <p className="text-lg font-medium">{selectedEmployee.phone}</p>
                <p className="text-lg font-medium">{selectedEmployee.email}</p>
              </div>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Employment Details</p>
                <p className="text-lg font-medium">Hire Date: {selectedEmployee.hireDate}</p>
                <p className="text-lg font-medium">Salary: ${selectedEmployee.salary}</p>
              </div>
              <div className="pb-4">
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-lg font-medium">{selectedEmployee.address.street}</p>
                <p className="text-lg font-medium">
                  {selectedEmployee.address.city}, {selectedEmployee.address.state} {selectedEmployee.address.zipCode}
                </p>
                <p className="text-lg font-medium">{selectedEmployee.address.country}</p>
              </div>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-lg font-medium">
                  {selectedEmployee.role.charAt(0).toUpperCase() + selectedEmployee.role.slice(1)}
                </p>
              </div>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">NIC Number</p>
                <p className="text-lg font-medium">{selectedEmployee.nicNumber}</p>
              </div>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="text-lg font-medium">
                  {selectedEmployee.dateOfBirth ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-2 mt-6">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    openEditModal(selectedEmployee);
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 w-full sm:w-auto"
                >
                  Edit Employee
                </button>
                <button
                  onClick={() => deleteEmployee(selectedEmployee.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full sm:w-auto"
                >
                  Delete Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
