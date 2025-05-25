import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Invoice = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceRef = useRef(null);

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order ID");
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}`)
      .then((response) => {
        if (response.data) {
          setOrder(response.data);
          setError(null);

          // Check if we should automatically download the invoice
          const searchParams = new URLSearchParams(location.search);
          if (searchParams.get("download") === "true") {
            setTimeout(() => {
              handleDownloadPdf();
            }, 1000); // Give some time for the invoice to render
          }
        } else {
          setError("Order not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching invoice:", error);
        setError("Failed to load invoice");
      });
  }, [orderId, location.search]);
  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;

    setIsDownloading(true);

    try {
      // Create a completely new container for the PDF content
      const container = document.createElement("div");
      container.style.backgroundColor = "#ffffff";
      container.style.padding = "20px";
      container.style.width = "800px";
      container.style.fontFamily = "Arial, sans-serif";
      container.style.position = "absolute";
      container.style.left = "-9999px";
      document.body.appendChild(container);

      // Instead of cloning the element with its problematic styling,
      // let's create a clean version with basic HTML and inline styles
      const invoiceHeader = document.createElement("div");
      invoiceHeader.style.textAlign = "center";
      invoiceHeader.style.marginBottom = "20px";

      const title = document.createElement("h1");
      title.textContent = "Mandela Factory Outlet";
      title.style.fontSize = "28px";
      title.style.fontWeight = "bold";
      title.style.color = "#000000";
      title.style.marginBottom = "5px";
      invoiceHeader.appendChild(title);

      const subtitle = document.createElement("p");
      subtitle.textContent = "Official Sales Invoice";
      subtitle.style.fontSize = "14px";
      subtitle.style.color = "#666666";
      subtitle.style.margin = "0";
      invoiceHeader.appendChild(subtitle);

      container.appendChild(invoiceHeader);

      // Customer & Order Info
      const infoSection = document.createElement("div");
      infoSection.style.display = "flex";
      infoSection.style.justifyContent = "space-between";
      infoSection.style.marginBottom = "20px";
      infoSection.style.padding = "10px 0";
      infoSection.style.borderBottom = "1px solid #eee";

      const customerInfo = document.createElement("div");
      customerInfo.style.textAlign = "left";

      const customerName = document.createElement("p");
      customerName.innerHTML = `<strong>Customer:</strong> ${order.customerName}`;
      customerName.style.margin = "5px 0";
      customerInfo.appendChild(customerName);

      const customerPhone = document.createElement("p");
      customerPhone.innerHTML = `<strong>Phone:</strong> ${order.customerPhone}`;
      customerPhone.style.margin = "5px 0";
      customerInfo.appendChild(customerPhone);

      infoSection.appendChild(customerInfo);

      const orderInfo = document.createElement("div");
      orderInfo.style.textAlign = "right";

      const transactionId = document.createElement("p");
      transactionId.innerHTML = `<strong>Transaction ID:</strong> ${order.transactionId}`;
      transactionId.style.margin = "5px 0";
      orderInfo.appendChild(transactionId);

      const orderDate = document.createElement("p");
      orderDate.innerHTML = `<strong>Order Date:</strong> ${new Date(
        order.orderDate
      ).toLocaleString()}`;
      orderDate.style.margin = "5px 0";
      orderInfo.appendChild(orderDate);

      infoSection.appendChild(orderInfo);
      container.appendChild(infoSection);

      // Items Table
      const itemsSection = document.createElement("div");
      itemsSection.style.marginBottom = "20px";

      const itemsTitle = document.createElement("h2");
      itemsTitle.textContent = "Purchased Items";
      itemsTitle.style.fontSize = "18px";
      itemsTitle.style.fontWeight = "bold";
      itemsTitle.style.margin = "10px 0";
      itemsSection.appendChild(itemsTitle);

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.border = "1px solid #ddd";

      // Table header
      const thead = document.createElement("thead");
      thead.style.backgroundColor = "#444";
      thead.style.color = "white";

      const headerRow = document.createElement("tr");
      ["Product", "Qty", "Unit Price", "Total"].forEach((text) => {
        const th = document.createElement("th");
        th.textContent = text;
        th.style.padding = "8px";
        th.style.textAlign = text === "Product" ? "left" : "center";
        th.style.border = "1px solid #ddd";
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Table body
      const tbody = document.createElement("tbody");

      order.items.forEach((item) => {
        const tr = document.createElement("tr");
        tr.style.backgroundColor = "white";

        // Product name
        const tdProduct = document.createElement("td");
        tdProduct.textContent = item.productName;
        tdProduct.style.padding = "8px";
        tdProduct.style.border = "1px solid #ddd";
        tdProduct.style.textAlign = "left";
        tr.appendChild(tdProduct);

        // Quantity
        const tdQty = document.createElement("td");
        tdQty.textContent = item.quantity;
        tdQty.style.padding = "8px";
        tdQty.style.border = "1px solid #ddd";
        tdQty.style.textAlign = "center";
        tr.appendChild(tdQty);

        // Unit price
        const tdUnitPrice = document.createElement("td");
        tdUnitPrice.textContent = `Rs. ${item.unitPrice.toFixed(2)}`;
        tdUnitPrice.style.padding = "8px";
        tdUnitPrice.style.border = "1px solid #ddd";
        tdUnitPrice.style.textAlign = "center";
        tr.appendChild(tdUnitPrice);

        // Total
        const tdTotal = document.createElement("td");
        tdTotal.textContent = `Rs. ${item.lineTotal.toFixed(2)}`;
        tdTotal.style.padding = "8px";
        tdTotal.style.border = "1px solid #ddd";
        tdTotal.style.textAlign = "center";
        tdTotal.style.fontWeight = "500";
        tr.appendChild(tdTotal);

        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      itemsSection.appendChild(table);
      container.appendChild(itemsSection);

      // Summary section
      const summarySection = document.createElement("div");
      summarySection.style.textAlign = "right";
      summarySection.style.marginBottom = "20px";

      // Subtotal
      const subtotal = document.createElement("p");
      subtotal.innerHTML = `<span style="font-weight: bold;">Subtotal:</span> Rs. ${order.subtotal.toFixed(
        2
      )}`;
      subtotal.style.margin = "5px 0";
      summarySection.appendChild(subtotal);

      // Discount if applicable
      if (order.discountPercent > 0) {
        const discount = document.createElement("p");
        const discountAmount = (order.subtotal * order.discountPercent) / 100;
        discount.innerHTML = `<span style="font-weight: bold;">Birthday Discount (${
          order.discountPercent
        }%):</span> -Rs. ${discountAmount.toFixed(2)}`;
        discount.style.margin = "5px 0";
        summarySection.appendChild(discount);

        const afterDiscount = document.createElement("p");
        afterDiscount.innerHTML = `<span style="font-weight: bold;">After Discount:</span> Rs. ${(
          order.subtotal - discountAmount
        ).toFixed(2)}`;
        afterDiscount.style.margin = "5px 0";
        summarySection.appendChild(afterDiscount);
      }

      // Loyalty points if applicable
      if (order.redeemedPoints > 0) {
        const redeemedPoints = document.createElement("p");
        redeemedPoints.innerHTML = `<span style="font-weight: bold;">Loyalty Points Redeemed:</span> ${order.redeemedPoints} points`;
        redeemedPoints.style.margin = "5px 0";
        summarySection.appendChild(redeemedPoints);

        const pointsValue = document.createElement("p");
        pointsValue.innerHTML = `<span style="font-weight: bold;">Points Value Deducted:</span> -Rs. ${order.redeemedPoints.toFixed(
          2
        )}`;
        pointsValue.style.margin = "5px 0";
        summarySection.appendChild(pointsValue);
      }

      if (order.earnedPoints > 0) {
        const earnedPoints = document.createElement("p");
        earnedPoints.innerHTML = `<span style="font-weight: bold;">Loyalty Points Earned:</span> ${order.earnedPoints} points`;
        earnedPoints.style.margin = "5px 0";
        summarySection.appendChild(earnedPoints);
      }

      // Total
      const total = document.createElement("p");
      total.innerHTML = `<span style="font-weight: bold; font-size: 18px;">Total: Rs. ${order.total.toFixed(
        2
      )}</span>`;
      total.style.margin = "10px 0";
      summarySection.appendChild(total);

      container.appendChild(summarySection);

      // Footer
      const footer = document.createElement("div");
      footer.style.textAlign = "center";
      footer.style.marginTop = "30px";
      footer.style.paddingTop = "15px";
      footer.style.borderTop = "1px solid #eee";
      footer.style.color = "#666";
      footer.style.fontSize = "12px";
      footer.textContent =
        "Thank you for shopping with Mandela Factory Outlet!";
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
      pdf.save(`invoice_${order.transactionId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);

      // If this was triggered by URL parameter, navigate back to the orders page
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get("download") === "true") {
        navigate("/admin/orders");
      }
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate("/admin/orders")}
          className="mt-4 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center text-gray-600">Loading invoice...</div>
    );
  }

  return (
    <div className="p-9 max-w-4xl mx-auto">
      {/* Back and Download Buttons */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate("/admin/orders")}
          className="text-sm flex items-center text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" /> Back to Orders
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className={`flex items-center gap-2 ${
            isDownloading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          } text-white px-4 py-2 rounded-md`}
        >
          <FaDownload /> {isDownloading ? "Downloading..." : "Download PDF"}
        </button>
      </div>

      <div
        ref={invoiceRef}
        className="bg-white shadow-xl rounded-xl border border-gray-300 p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black uppercase tracking-wide">
            Mandela Factory Outlet
          </h1>
          <p className="text-sm text-gray-500">Official Sales Invoice</p>
        </div>

        {/* Customer & Order Info */}
        <div className="grid grid-cols-2 gap-6 text-sm text-gray-800 mb-6">
          <div>
            <p>
              <span className="font-semibold">Customer:</span>{" "}
              {order.customerName}
            </p>
            <p>
              <span className="font-semibold">Phone:</span>{" "}
              {order.customerPhone}
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold">Transaction ID:</span>{" "}
              {order.transactionId}
            </p>
            <p>
              <span className="font-semibold">Order Date:</span>{" "}
              {new Date(order.orderDate).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-black mb-2">
            Purchased Items
          </h2>
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
                  <td className="border px-4 py-2 text-left">
                    {item.productName}
                  </td>
                  <td className="border px-4 py-2">{item.quantity}</td>
                  <td className="border px-4 py-2">
                    Rs. {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="border px-4 py-2 font-medium">
                    Rs. {item.lineTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="text-right text-gray-800 space-y-1">
          <p>
            <span className="font-semibold">Subtotal:</span> Rs.{" "}
            {order.subtotal.toFixed(2)}
          </p>
          {order.discountPercent > 0 && (
            <>
              <p>
                <span className="font-semibold">
                  Birthday Discount ({order.discountPercent}%):
                </span>{" "}
                -Rs.{" "}
                {((order.subtotal * order.discountPercent) / 100).toFixed(2)}
              </p>
              <p>
                <span className="font-semibold">After Discount:</span> Rs.{" "}
                {(
                  order.subtotal -
                  (order.subtotal * order.discountPercent) / 100
                ).toFixed(2)}
              </p>
            </>
          )}
          {order.redeemedPoints > 0 && (
            <>
              <p>
                <span className="font-semibold">Loyalty Points Redeemed:</span>{" "}
                {order.redeemedPoints} points
              </p>
              <p>
                <span className="font-semibold">Points Value Deducted:</span>{" "}
                -Rs. {order.redeemedPoints.toFixed(2)}
              </p>
            </>
          )}
          {order.earnedPoints > 0 && (
            <p>
              <span className="font-semibold">Loyalty Points Earned:</span>{" "}
              {order.earnedPoints} points
            </p>
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
