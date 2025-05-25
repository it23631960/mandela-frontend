import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const [isDownloading, setIsDownloading] = useState(false);

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
  const handleDownloadInvoice = async (order) => {
    setViewOrder(order);
    setIsDownloading(true);
    setShowViewModal(true);

    // Allow time for the modal to render
    setTimeout(async () => {
      try {
        const invoiceElement = document.getElementById("supplier-invoice");
        if (!invoiceElement) {
          alert("Invoice element not found");
          setIsDownloading(false);
          return;
        }

        // Create a completely new container for the PDF content
        const container = document.createElement("div");
        container.style.backgroundColor = "#ffffff";
        container.style.padding = "20px";
        container.style.width = "800px";
        container.style.fontFamily = "Arial, sans-serif";
        container.style.position = "absolute";
        container.style.left = "-9999px";
        document.body.appendChild(container);

        // Create a clean version with basic HTML and inline styles
        const invoiceHeader = document.createElement("div");
        invoiceHeader.style.textAlign = "center";
        invoiceHeader.style.marginBottom = "20px";

        const title = document.createElement("h2");
        title.textContent = "Supplier Order Invoice";
        title.style.fontSize = "24px";
        title.style.fontWeight = "bold";
        title.style.color = "#000000";
        title.style.marginBottom = "5px";
        invoiceHeader.appendChild(title);

        container.appendChild(invoiceHeader);

        // Order Info
        const infoSection = document.createElement("div");
        infoSection.style.marginBottom = "20px";
        infoSection.style.padding = "10px 0";
        infoSection.style.borderBottom = "1px solid #eee";

        const orderId = document.createElement("p");
        orderId.innerHTML = `<strong>Order ID:</strong> ${order.id}`;
        orderId.style.margin = "5px 0";
        infoSection.appendChild(orderId);

        const orderDate = document.createElement("p");
        orderDate.innerHTML = `<strong>Date:</strong> ${new Date().toLocaleDateString()}`;
        orderDate.style.margin = "5px 0";
        infoSection.appendChild(orderDate);

        container.appendChild(infoSection);

        // Supplier Info
        const supplierSection = document.createElement("div");
        supplierSection.style.marginBottom = "20px";

        const supplierName = document.createElement("p");
        supplierName.innerHTML = `<strong>Supplier:</strong> ${order.supplierName}`;
        supplierName.style.margin = "5px 0";
        supplierSection.appendChild(supplierName);

        const supplierPhone = document.createElement("p");
        supplierPhone.innerHTML = `<strong>Phone:</strong> ${order.supplierPhone}`;
        supplierPhone.style.margin = "5px 0";
        supplierSection.appendChild(supplierPhone);

        container.appendChild(supplierSection);

        // Items Section
        const itemsSection = document.createElement("div");
        itemsSection.style.marginBottom = "20px";

        const itemsTitle = document.createElement("h3");
        itemsTitle.textContent = "Items:";
        itemsTitle.style.fontSize = "16px";
        itemsTitle.style.fontWeight = "bold";
        itemsTitle.style.margin = "10px 0";
        itemsSection.appendChild(itemsTitle);

        // Create table
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.border = "1px solid #ddd";

        // Table header
        const thead = document.createElement("thead");
        thead.style.backgroundColor = "#f0f0f0";

        const headerRow = document.createElement("tr");
        ["Item", "Qty", "Price (Rs.)", "Total (Rs.)"].forEach((text) => {
          const th = document.createElement("th");
          th.textContent = text;
          th.style.padding = "8px";
          th.style.border = "1px solid #ddd";
          th.style.textAlign = text === "Item" ? "left" : "center";
          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement("tbody");

        // Parse items and create rows
        const items = JSON.parse(order.items);
        items.forEach((item) => {
          const tr = document.createElement("tr");

          // Item name
          const tdName = document.createElement("td");
          tdName.textContent = item.itemName;
          tdName.style.padding = "8px";
          tdName.style.border = "1px solid #ddd";
          tr.appendChild(tdName);

          // Quantity
          const tdQty = document.createElement("td");
          tdQty.textContent = item.quantity;
          tdQty.style.padding = "8px";
          tdQty.style.border = "1px solid #ddd";
          tdQty.style.textAlign = "center";
          tr.appendChild(tdQty);

          // Price
          const tdPrice = document.createElement("td");
          tdPrice.textContent = item.price;
          tdPrice.style.padding = "8px";
          tdPrice.style.border = "1px solid #ddd";
          tdPrice.style.textAlign = "right";
          tr.appendChild(tdPrice);

          // Total
          const tdTotal = document.createElement("td");
          tdTotal.textContent = (item.quantity * item.price).toFixed(2);
          tdTotal.style.padding = "8px";
          tdTotal.style.border = "1px solid #ddd";
          tdTotal.style.textAlign = "right";
          tr.appendChild(tdTotal);

          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        itemsSection.appendChild(table);

        container.appendChild(itemsSection);

        // Total
        const totalSection = document.createElement("div");
        totalSection.style.textAlign = "right";
        totalSection.style.marginBottom = "20px";

        const total = document.createElement("p");
        total.innerHTML = `<strong style="font-size:16px;">Total: Rs. ${order.total}</strong>`;
        totalSection.appendChild(total);

        container.appendChild(totalSection);

        // Footer
        const footer = document.createElement("div");
        footer.style.textAlign = "center";
        footer.style.marginTop = "30px";
        footer.style.borderTop = "1px solid #eee";
        footer.style.paddingTop = "10px";

        const footerText1 = document.createElement("p");
        footerText1.textContent = "Mandela Factory Outlet";
        footerText1.style.margin = "5px 0";
        footerText1.style.color = "#666";
        footer.appendChild(footerText1);

        const footerText2 = document.createElement("p");
        footerText2.textContent = "Official Supplier Order Invoice";
        footerText2.style.margin = "5px 0";
        footerText2.style.color = "#666";
        footer.appendChild(footerText2);

        container.appendChild(footer);

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        // Clean up the temporary elements
        document.body.removeChild(container);

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save(`supplier_order_${order.id}.pdf`);

        setIsDownloading(false);
        setShowViewModal(false);
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
        setIsDownloading(false);
      }
    }, 500);
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
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => handleView(order)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                      title="View"
                    >
                      👁
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="text-green-600 hover:text-green-800 mr-2"
                      title="Download Invoice"
                    >
                      📥
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
            <div id="supplier-invoice">
              <h2 className="text-xl font-bold mb-4">Supplier Order Invoice</h2>
              <div className="border-b pb-2 mb-4">
                <p className="text-gray-800 mb-1">
                  <strong>Order ID:</strong> {viewOrder.id}
                </p>
                <p className="text-gray-800 mb-1">
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </p>
              </div>
              <p className="mb-2">
                <strong>Supplier:</strong> {viewOrder.supplierName}
              </p>
              <p className="mb-4">
                <strong>Phone:</strong> {viewOrder.supplierPhone}
              </p>
              <h3 className="font-semibold mb-2">Items:</h3>
              <table className="w-full mb-4 border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Item</th>
                    <th className="border p-2 text-center">Qty</th>
                    <th className="border p-2 text-right">Price (Rs.)</th>
                    <th className="border p-2 text-right">Total (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {JSON.parse(viewOrder.items).map((item, i) => (
                    <tr key={i}>
                      <td className="border p-2">{item.itemName}</td>
                      <td className="border p-2 text-center">
                        {item.quantity}
                      </td>
                      <td className="border p-2 text-right">{item.price}</td>
                      <td className="border p-2 text-right">
                        {(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right mb-4">
                <p className="font-bold text-lg">
                  Total: Rs. {viewOrder.total}
                </p>
              </div>
              <div className="mt-6 text-center text-gray-500 text-sm">
                <p>Mandela Factory Outlet</p>
                <p>Official Supplier Order Invoice</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              {isDownloading ? (
                <button
                  disabled
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Downloading...
                </button>
              ) : (
                <button
                  onClick={() => setShowViewModal(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierOrders;
