import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import SupplierOrders from "../pages/SupplierOrders";
import Orders from "../pages/Orders";
import Customer from "../pages/Customer";
import Invoice from "../pages/Invoice";
import Reports from "../pages/Reports";
import Products from "../pages/products";
import Settings from "../pages/Settings";
import Sidebar from "../components/sidebar";
import SupplierManagement from "../pages/SupplierManagement";
import EmployeeManagement from "../pages/EmployeeManagement";


function AdminLayout() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <div className="flex-none">
        <Sidebar />
      </div> 
      <div className="ml-64 p-4 w-full min-h-screen grow">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/supplier-orders" element={<SupplierOrders />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/invoice/:orderId" element={<Invoice />} />  {/* Add this line */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/products" element={<Products />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/supplier-management" element={<SupplierManagement />} />
          <Route path="/employee-management" element={<EmployeeManagement />} />

        </Routes>
      </div>
      
    </div>
  );
}

export default AdminLayout;
