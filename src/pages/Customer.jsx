import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch } from 'react-icons/fa';

const Customer = () => {
  const [customers, setCustomer] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState([]);
  const [filter, setFilter] = useState("All");
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    registrationDate: "",
    birthDate: "",
  });

  useEffect(() => {
    axios.get("${import.meta.env.VITE_API_BASE_URL}/customers")
      .then(response => setCustomer(response.data))
      .catch(error => console.error("Error fetching customers:", error));
  }, []);

  const openModal = (customer = null) => {
    if (customer) {
      setIsEditMode(true);
      setCurrentCustomer(customer);
      setNewCustomer(customer);
    } else {
      setIsEditMode(false);
      setNewCustomer({  id: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        registrationDate: "",
        birthDate: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCustomer({  
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        registrationDate: "",
        birthDate: "" });
    setCurrentCustomer(null);
  };

  const handleChange = (e) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
  };

  const addCustomer = () => {
    axios.post("${import.meta.env.VITE_API_BASE_URL}/customers", newCustomer)
      .then(response => setCustomer([...customers, response.data]))
      .catch(error => console.error("Error adding customer:", error));
    closeModal();
  };

  const updateCustomer = () => {
    axios.put(`${import.meta.env.VITE_API_BASE_URL}/customers/${currentCustomer.id}`, newCustomer)
      .then(response => {
        setCustomer(customers.map(customer => customer.id === currentCustomer.id ? response.data : customer));
      })
      .catch(error => console.error("Error updating customer:", error));
    closeModal();
  };

  const deleteCustomer = (id) => {
    axios.delete(`${import.meta.env.VITE_API_BASE_URL}/customers/${id}`)
      .then(() => setCustomer(customers.filter(customer => customer.id !== id)))
      .catch(error => console.error("Error deleting customer:", error));
  };



  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  

  const filteredCustomer = customers.filter(customer =>
  `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
);


  const handleSelectCustomer = (id) => {
    setSelectedCustomer(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };



  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Regular Customer List</h2>
        <div className="relative ">
            <input
              type="text"
              placeholder="Search by Customer Name"
              value={searchQuery}
              onChange={handleSearchChange}
              className="px-4 py-2 pr-10 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        <button onClick={() => openModal()} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700">
          + Add Customer
        </button>
      </div>

      <div className="p-6">
      <div className="flex space-x-4 mb-4">
      </div>
        <table className="w-full text-left bg-white border-collapse rounded-lg">
          <thead className="bg-gray-50">
            <tr className="px-6 py-3 text-justify text-sm font-medium text-gray-500 uppercase tracking-wider ">
              <th className="p-4"><input type="checkbox" /></th>
              <th className="p-4">ID</th>
              <th className="p-4">First Name</th>
              <th className="p-4">Last Name</th>
              <th className="p-4 max-w-48 text-wrap">E-mail </th>
              <th className="p-4">Phone Number</th>
              <th className="p-4">Address</th>
              <th className="p-4">Registered Date</th>
              <th className="p-4">DOB</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead >
          <tbody>
          {filteredCustomer.length > 0 ? (
            filteredCustomer.map(customer => (
              <tr key={customer.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedCustomer.includes(customer.id)}
                    onChange={() => handleSelectCustomer(customer.id)}
                  />
                </td>
                <td className="p-4">{customer.id}</td>
                <td className="p-4 ">{customer.firstName}</td>
                <td className="p-4">{customer.lastName}</td>
                <td className="p-4 max-w-48 break-all">{customer.email}</td>
                <td className="p-4">{customer.phoneNumber}</td>
                <td className="p-4">{customer.address}</td>
                <td className="p-4">{customer.registrationDate}</td>
                <td className="p-4">{customer.birthDate}</td>
                <td className="p-4">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => openModal(customer)}
                    className="text-yellow-600 hover:text-yellow-900"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteCustomer(customer.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
              </tr>
            ))): (
              <tr>
                <td colSpan="8" className="text-center py-4">No customers found</td>
              </tr> 
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">{isEditMode ? "Update Customer" : "Add New Customer"}</h3>
            <div className="space-y-2">
              <input type="text" name="firstName" placeholder="First Name" value={newCustomer.fname} onChange={handleChange} className="w-full p-2 border rounded-md" />
                <input type="text" name="lastName" placeholder="Last Name" value={newCustomer.lname} onChange={handleChange} className="w-full p-2 border rounded-md" />
                <input type="email" name="email" placeholder="Email" value={newCustomer.email} onChange={handleChange} className="w-full p-2 border rounded-md" />
                <input type="text" name="phoneNumber" placeholder="Phone Number" value={newCustomer.phoneNumber} onChange={handleChange} className="w-full p-2 border rounded-md" />
                <input type="text" name="address" placeholder="Address" value={newCustomer.address} onChange={handleChange} className="w-full p-2 border rounded-md" />
                <div>
                  <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700">
                    Registration Date
                  </label>
                <input type="date" name="registrationDate" placeholder="Registration Date" value={newCustomer.registrationDate} onChange={handleChange} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                    Birth Date
                  </label>
                  </div>                
                <input type="date" name="birthDate" placeholder="Birth Date" value={newCustomer.birthDate} onChange={handleChange} className="w-full p-2 border rounded-md" />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={closeModal} className="px-4 py-2 border border-gray-400 rounded-md">Cancel</button>
              <button onClick={isEditMode ? updateCustomer : addCustomer} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700">{isEditMode ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;