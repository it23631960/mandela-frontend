import React, { useState, useEffect } from "react";
import axios from "axios";

const SupplierOrders = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [items, setItems] = useState([
    { itemName: "", quantity: "", price: "" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    fetchSuppliersAndOrders();
  }, []);

  const fetchSuppliersAndOrders = async () => {
    try {
      const supplierRes = await axios.get(
        import.meta.env.VITE_API_BASE_URL + "/suppliers"
      );
      const supplierList = supplierRes.data.map((s) => ({
        id: s.id,
        companyName: s.name,
        companyContactNo: s.phone,
      }));
      setSuppliers(supplierList);

      const orderRes = await axios.get(
        import.meta.env.VITE_API_BASE_URL + "/supplier-orders"
      );
      const ordersWithSupplierInfo = orderRes.data.map((order) => {
        const supplier = supplierList.find((s) => s.id === order.supplier.id);
        return {
          ...order,
          supplierName: supplier?.companyName || "Unknown Supplier",
          supplierPhone: supplier?.companyContactNo || "N/A",
        };
      });

      setOrders(ordersWithSupplierInfo);
    } catch (error) {
      console.error("Failed to fetch data", error);
      setSuppliers([]);
      setOrders([]);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { itemName: "", quantity: "", price: "" }]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] =
      field === "quantity" || field === "price"
        ? value === ""
          ? ""
          : Number(value)
        : value;
    setItems(updated);
  };

  const calculateTotal = () =>
    items.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2);

  const handleSaveOrder = async () => {
    const supplier = suppliers.find((s) => s.id === parseInt(selectedSupplier));
    if (!supplier || items.length === 0 || !items[0].itemName) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const newOrder = {
        supplier: { id: supplier.id },
        items: JSON.stringify(items),
        total: calculateTotal(),
      };

      await axios.post(
        import.meta.env.VITE_API_BASE_URL + "/supplier-orders",
        newOrder
      );
      await fetchSuppliersAndOrders();

      setShowCreateModal(false);
      setSelectedSupplier("");
      setItems([{ itemName: "", quantity: 1, price: 0 }]);
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Failed to save order. Please try again.");
    }
  };

  const handleView = (order) => {
    setViewOrder(order);
    setShowViewModal(true);
  };

  const handleDelete = async (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/supplier-orders/${orderId}`
        );
        await fetchSuppliersAndOrders();
      } catch (error) {
        console.error("Failed to delete order:", error);
        alert("Failed to delete order. Please try again.");
      }
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.supplierPhone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log("Suppliers in dropdown:", suppliers);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Supplier Orders</h1>
          <p className="text-sm text-gray-500">
            Track and manage orders efficiently.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow"
        >
          + Create Order
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by supplier name or phone..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full max-w-md mb-6 p-2 border border-gray-300 rounded"
      />

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="p-4 text-left">Supplier</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Items</th>
              <th className="p-4 text-right">Total (Rs.)</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="p-4">{order.supplierName}</td>
                  <td className="p-4">{order.supplierPhone}</td>
                  <td className="p-4">
                    {JSON.parse(order.items).map((item, i) => (
                      <div key={i}>
                        {item.itemName} × {item.quantity} @ Rs.{item.price}
                      </div>
                    ))}
                  </td>
                  <td className="p-4 text-right font-semibold">
                    {order.total}
                  </td>
                  <td className="p-4 text-center space-x-4">
                    <button
                      onClick={() => handleView(order)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View"
                    >
                      👁
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center" colSpan="5">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
            <h2 className="text-xl font-semibold mb-4">Create New Order</h2>

            <label className="block mb-2 text-sm font-medium">Supplier</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.companyName} ({s.companyContactNo})
                </option>
              ))}
            </select>

            <h3 className="text-lg font-semibold mb-2">Items</h3>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.itemName}
                  onChange={(e) =>
                    handleItemChange(i, "itemName", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(i, "quantity", e.target.value)
                  }
                  className="w-24 border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => handleItemChange(i, "price", e.target.value)}
                  className="w-28 border p-2 rounded"
                />
              </div>
            ))}
            <button
              onClick={handleAddItem}
              className="text-blue-600 text-sm mb-4 hover:underline"
            >
              + Add more item
            </button>

            <div className="text-right font-medium mb-4">
              Total: Rs. {calculateTotal()}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOrder}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Order
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && viewOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <p className="mb-2">
              <strong>Supplier:</strong> {viewOrder.supplierName}
            </p>
            <p className="mb-4">
              <strong>Phone:</strong> {viewOrder.supplierPhone}
            </p>
            <h3 className="font-semibold mb-2">Items:</h3>
            <ul className="list-disc list-inside mb-4">
              {JSON.parse(viewOrder.items).map((item, i) => (
                <li key={i}>
                  {item.itemName} - {item.quantity} × Rs.{item.price}
                </li>
              ))}
            </ul>
            <p className="text-right font-bold">Total: Rs. {viewOrder.total}</p>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierOrders;
