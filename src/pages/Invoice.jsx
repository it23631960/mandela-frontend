import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from 'react-icons/fa';

const Invoice = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order ID");
      return;
    }

    axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}`)
      .then(response => {
        if (response.data) {
          setOrder(response.data);
          setError(null);
        } else {
          setError("Order not found");
        }
      })
      .catch(error => {
        console.error("Error fetching invoice:", error);
        setError("Failed to load invoice");
      });
  }, [orderId]);

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => navigate('/admin/orders')}
          className="mt-4 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return <div className="p-6 text-center text-gray-600">Loading invoice...</div>;
  }

  return (
    <div className="p-9 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/orders')}
        className="mb-2 text-sm flex items-center text-gray-600 hover:text-gray-900"
      >
        <FaArrowLeft className="mr-2" /> Back to Orders
      </button>

      <div className="bg-white shadow-xl rounded-xl border border-gray-300 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black uppercase tracking-wide">Mandela Factory Outlet</h1>
          <p className="text-sm text-gray-500">Official Sales Invoice</p>
        </div>

        {/* Customer & Order Info */}
        <div className="grid grid-cols-2 gap-6 text-sm text-gray-800 mb-6">
          <div>
            <p><span className="font-semibold">Customer:</span> {order.customerName}</p>
            <p><span className="font-semibold">Phone:</span> {order.customerPhone}</p>
          </div>
          <div className="text-right">
            <p><span className="font-semibold">Transaction ID:</span> {order.transactionId}</p>
            <p><span className="font-semibold">Order Date:</span> {new Date(order.orderDate).toLocaleString()}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-black mb-2">Purchased Items</h2>
          <table className="w-full border border-gray-400 text-sm text-gray-800">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="border px-4 py-2 text-left">Product</th>
                <th className="border px-4 py-2">Qty</th>
                <th className="border px-4 py-2">Unit Price</th>
                <th className="border px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} className="text-center hover:bg-gray-100">
                  <td className="border px-4 py-2 text-left">{item.productName}</td>
                  <td className="border px-4 py-2">{item.quantity}</td>
                  <td className="border px-4 py-2">Rs. {item.unitPrice.toFixed(2)}</td>
                  <td className="border px-4 py-2 font-medium">Rs. {item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="text-right text-gray-800 space-y-1">
          <p><span className="font-semibold">Subtotal:</span> Rs. {order.subtotal.toFixed(2)}</p>
          {order.discountPercent > 0 && (
            <>
              <p><span className="font-semibold">Birthday Discount ({order.discountPercent}%):</span> -Rs. {((order.subtotal * order.discountPercent) / 100).toFixed(2)}</p>
              <p><span className="font-semibold">After Discount:</span> Rs. {(order.subtotal - (order.subtotal * order.discountPercent / 100)).toFixed(2)}</p>
            </>
          )}
          {order.redeemedPoints > 0 && (
            <>
              <p><span className="font-semibold">Loyalty Points Redeemed:</span> {order.redeemedPoints} points</p>
              <p><span className="font-semibold">Points Value Deducted:</span> -Rs. {order.redeemedPoints.toFixed(2)}</p>
            </>
          )}
          {order.earnedPoints > 0 && (
            <p><span className="font-semibold">Loyalty Points Earned:</span> {order.earnedPoints} points</p>
          )}
          <p className="text-xl font-bold text-black">
            Total: Rs. {order.total.toFixed(2)}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-gray-500 border-t pt-4">
          Thank you for shopping with Mandela Factory Outlet!
        </div>
      </div>
    </div>
  );
};

export default Invoice;
