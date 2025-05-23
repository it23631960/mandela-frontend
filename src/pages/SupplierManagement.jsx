import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch } from 'react-icons/fa';

const API_URL = '${import.meta.env.VITE_API_BASE_URL}/suppliers';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    contactPerson: {
      firstName: '',
      lastName: '',
      phone: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [editSupplier, setEditSupplier] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    contactPerson: {
      firstName: '',
      lastName: '',
      phone: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  useEffect(() => {
    const res = axios.get(API_URL)
      .then(res => setSuppliers(res.data))
      .catch(() => setSuppliers([]));
    
  }, []);

  console.log('suppliers', suppliers);

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e, formType = 'new') => {
    const { name, value } = e.target;
    const updateSupplier = formType === 'new' ? setNewSupplier : setEditSupplier;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      updateSupplier(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      updateSupplier(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSupplier = async () => {
    try {
      const res = await axios.post(API_URL, newSupplier);
      setSuppliers([...suppliers, res.data]);
      setIsAddModalOpen(false);
      setNewSupplier({
        name: '',
        email: '',
        phone: '',
        contactPerson: { firstName: '', lastName: '', phone: '' },
        address: { street: '', city: '', state: '', zipCode: '', country: '' }
      });
    } catch {
      alert('Failed to add supplier');
    }
  };

  const viewSupplierDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailsModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setEditSupplier({
      id: supplier.id,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      contactPerson: { ...supplier.contactPerson },
      address: { ...supplier.address }
    });
    setIsEditModalOpen(true);
  };

  const updateSupplier = async () => {
    try {
      const res = await axios.put(`${API_URL}/${editSupplier.id}`, editSupplier);
      setSuppliers(suppliers.map(s => s.id === editSupplier.id ? res.data : s));
      setIsEditModalOpen(false);
    } catch {
      alert('Failed to update supplier');
    }
  };

  const deleteSupplier = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await axios.delete(`${API_URL}/${supplierId}`);
        setSuppliers(suppliers.filter(s => s.id !== supplierId));
        if (selectedSupplier && selectedSupplier.id === supplierId) {
          setIsDetailsModalOpen(false);
        }
      } catch {
        alert('Failed to delete supplier');
      }
    }
  };

  const validateForm = (supplier) => {
    const requiredFields = [
      supplier.name,
      supplier.email,
      supplier.phone,
      supplier.contactPerson.firstName,
      supplier.contactPerson.lastName,
      supplier.contactPerson.phone,
      supplier.address.street,
      supplier.address.city,
      supplier.address.state,
      supplier.address.zipCode,
      supplier.address.country
    ];
    return requiredFields.every(field => field && field.trim() !== '');
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Supplier Management</h1>
        <p className="text-gray-600">Manage and monitor your supplier relationships</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search suppliers..."
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
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Suppliers</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">{suppliers.length}</p>
          <div className="text-sm text-green-600 mt-2">↑ 12% from last month</div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">#{supplier.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.phone}</div>
                    <div className="text-sm text-gray-500">{supplier.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => viewSupplierDetails(supplier)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openEditModal(supplier)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteSupplier(supplier.id)}
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
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredSuppliers.length}</span> of{' '}
                  <span className="font-medium">{filteredSuppliers.length}</span> results
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

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Add New Supplier</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  name="name"
                  value={newSupplier.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Contact</label>
                <input
                  type="email"
                  name="email"
                  value={newSupplier.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Email address"
                />
                <input
                  type="tel"
                  name="phone"
                  value={newSupplier.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson.firstName"
                  value={newSupplier.contactPerson.firstName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="First name"
                />
                <input
                  type="text"
                  name="contactPerson.lastName"
                  value={newSupplier.contactPerson.lastName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Last name"
                />
                <input
                  type="tel"
                  name="contactPerson.phone"
                  value={newSupplier.contactPerson.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Contact person phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={newSupplier.address.street}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Street address"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    name="address.city"
                    value={newSupplier.address.city}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="address.state"
                    value={newSupplier.address.state}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="State"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="address.zipCode"
                    value={newSupplier.address.zipCode}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="ZIP code"
                  />
                  <input
                    type="text"
                    name="address.country"
                    value={newSupplier.address.country}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="Country"
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
                  onClick={addSupplier}
                  disabled={!validateForm(newSupplier)}
                  className={`px-4 py-2 rounded w-full sm:w-auto ${
                    validateForm(newSupplier)
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Edit Supplier</h2>
            <div className="space-y-4">
              <div className="mb-4">
                <strong>Supplier ID:</strong> {editSupplier.id}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  name="name"
                  value={editSupplier.name}
                  onChange={(e) => handleInputChange(e, 'edit')}
                  className="w-full p-2 border rounded"
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Contact</label>
                <input
                  type="email"
                  name="email"
                  value={editSupplier.email}
                  onChange={(e) => handleInputChange(e, 'edit')}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Email address"
                />
                <input
                  type="tel"
                  name="phone"
                  value={editSupplier.phone}
                  onChange={(e) => handleInputChange(e, 'edit')}
                  className="w-full p-2 border rounded"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson.firstName"
                  value={editSupplier.contactPerson.firstName}
                  onChange={(e) => handleInputChange(e, 'edit')}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="First name"
                />
                <input
                  type="text"
                  name="contactPerson.lastName"
                  value={editSupplier.contactPerson.lastName}
                  onChange={(e) => handleInputChange(e, 'edit')}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Last name"
                />
                <input
                  type="tel"
                  name="contactPerson.phone"
                  value={editSupplier.contactPerson.phone}
                  onChange={(e) => handleInputChange(e, 'edit')}
                  className="w-full p-2 border rounded"
                  placeholder="Contact person phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={editSupplier.address.street}
                  onChange={(e) => handleInputChange(e, 'edit')}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Street address"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    name="address.city"
                    value={editSupplier.address.city}
                    onChange={(e) => handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="address.state"
                    value={editSupplier.address.state}
                    onChange={(e) => handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="State"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="address.zipCode"
                    value={editSupplier.address.zipCode}
                    onChange={(e) => handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="ZIP code"
                  />
                  <input
                    type="text"
                    name="address.country"
                    value={editSupplier.address.country}
                    onChange={(e) => handleInputChange(e, 'edit')}
                    className="w-full p-2 border rounded"
                    placeholder="Country"
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
                  onClick={updateSupplier}
                  disabled={!validateForm(editSupplier)}
                  className={`px-4 py-2 rounded w-full sm:w-auto ${
                    validateForm(editSupplier)
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

      {/* View Supplier Details Modal */}
      {isDetailsModalOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Supplier Details</h2>
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
                <p className="text-sm text-gray-500">Supplier ID</p>
                <p className="text-lg font-medium">#{selectedSupplier.id}</p>
              </div>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Supplier Name</p>
                <p className="text-lg font-medium">{selectedSupplier.name}</p>
              </div>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Contact Information</p>
                <p className="text-lg font-medium">{selectedSupplier.phone}</p>
                <p className="text-lg font-medium">{selectedSupplier.email}</p>
              </div>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Contact Person</p>
                <p className="text-lg font-medium">
                  {selectedSupplier.contactPerson.firstName} {selectedSupplier.contactPerson.lastName}
                </p>
                <p className="text-lg font-medium">{selectedSupplier.contactPerson.phone}</p>
              </div>
              <div className="pb-4">
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-lg font-medium">{selectedSupplier.address.street}</p>
                <p className="text-lg font-medium">
                  {selectedSupplier.address.city}, {selectedSupplier.address.state} {selectedSupplier.address.zipCode}
                </p>
                <p className="text-lg font-medium">{selectedSupplier.address.country}</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-2 mt-6">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    openEditModal(selectedSupplier);
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 w-full sm:w-auto"
                >
                  Edit Supplier
                </button>
                <button
                  onClick={() => deleteSupplier(selectedSupplier.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full sm:w-auto"
                >
                  Delete Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
