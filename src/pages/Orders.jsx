import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API_BASE_URL + "/orders")
      .then((response) => {
        setOrders(response.data);
        setFilteredOrders(response.data);
      })
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = orders.filter(
      (order) =>
        order.transactionId.toLowerCase().includes(term) ||
        order.customerPhone.toLowerCase().includes(term)
    );
    setFilteredOrders(filtered);
  };

  const handleDownloadInvoice = (orderId) => {
    navigate(`/admin/invoice/${orderId}?download=true`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Order History</h1>
        <p className="text-sm text-gray-500">
          Manage and monitor your customer orders
        </p>
      </div>

      {/* Search + Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by transaction ID or phone..."
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-700 text-sm">Total Orders</p>
          <p className="text-2xl font-bold text-black">
            {filteredOrders.length}
          </p>
          <p className="text-green-600 text-xs mt-1">↑ Active this month</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700 border border-gray-200">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 border">Order ID</th>
              <th className="px-6 py-3 border">Transaction ID</th>
              <th className="px-6 py-3 border">Customer Phone</th>
              <th className="px-6 py-3 border">Total</th>
              <th className="px-6 py-3 border">Discount</th>
              <th className="px-6 py-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No matching orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="text-center hover:bg-gray-50">
                  <td className="px-6 py-4 border">{order.id}</td>
                  <td className="px-6 py-4 border">{order.transactionId}</td>
                  <td className="px-6 py-4 border">{order.customerPhone}</td>
                  <td className="px-6 py-4 border">
                    Rs. {order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 border">
                    {order.discountPercent > 0
                      ? `${order.discountPercent}%`
                      : "No"}
                  </td>
                  <td className="px-6 py-4 border flex justify-center space-x-2">
                    <button
                      onClick={() => navigate(`/admin/invoice/${order.id}`)}
                      className="bg-black text-white px-4 py-1 rounded-md hover:bg-gray-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
