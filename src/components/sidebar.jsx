import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ReactDOM from 'react-dom';
import { 
  FaHome, 
  FaShoppingCart, 
  FaBox, 
  FaTruck, 
  FaUsers, 
  FaFileInvoice, 
  FaChartBar, 
  FaCog, 
  FaUserTie, 
  FaUserFriends,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserCircle
} from "react-icons/fa";
import { useState } from "react";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [employee, setEmployee] = useState(null);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  useEffect(() => {
    const storedEmployee = localStorage.getItem("employeeData");
    if (storedEmployee) {
      const parsedEmployee = JSON.parse(storedEmployee);
      console.log("Parsed employee data:", parsedEmployee); // Debug log
      if (parsedEmployee.employee) {
        setEmployee(parsedEmployee.employee); // Access the nested employee object
      } else {
        setEmployee(parsedEmployee); // Fallback to direct data
      }
    } else {
      console.error("No employee data found in local storage");
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('employeeData');
    localStorage.removeItem('employeeLogin');
    navigate("/");
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const LogoutModal = () => {
    return ReactDOM.createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 99999 }}>
        <div className="bg-white p-6 rounded-md w-96 text-black relative">
          <h2 className="text-lg font-bold mb-4">Confirm Logout</h2>
          <p className="mb-4">Are you sure you want to logout?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={cancelLogout}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={confirmLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div className={`fixed h-screen shadow-xl bg-gradient-to-b from-gray-900 to-black transition-all duration-300 ${
        isMinimized ? 'w-20' : 'w-64'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header - Fixed */}
          <div className="py-6 bg-gradient-to-r from-gray-900 to-black border-b border-gray-700">
            <div className={`flex items-center ${isMinimized ? 'justify-center' : 'justify-between'} px-4`}>
              {!isMinimized && (
                <h1 className="text-2xl text-white">Mandela</h1>
              )}
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors duration-200"
              >
                {isMinimized ? <FaBars size={20} /> : <FaTimes size={20} />}
              </button>
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex flex-col overflow-y-auto">
            <ul className="space-y-1 px-3 py-4">
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className={`flex items-center ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg transition-all duration-200 ${
                    isActive('/admin/dashboard') 
                      ? 'bg-gray-800 text-white border-l-4 border-gray-500' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Dashboard"
                >
                  <FaHome size={20} className={!isMinimized && 'mr-3'} />
                  {!isMinimized && <span className="font-medium">Dashboard</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/orders" 
                  className={`flex items-center ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg transition-all duration-200 ${
                    isActive('/admin/orders') 
                      ? 'bg-gray-800 text-white border-l-4 border-gray-500' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Orders"
                >
                  <FaShoppingCart size={20} className={!isMinimized && 'mr-3'} />
                  {!isMinimized && <span className="font-medium">Orders</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/products" 
                  className={`flex items-center ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg transition-all duration-200 ${
                    isActive('/admin/products') 
                      ? 'bg-gray-800 text-white border-l-4 border-gray-500' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Products"
                >
                  <FaBox size={20} className={!isMinimized && 'mr-3'} />
                  {!isMinimized && <span className="font-medium">Products</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/supplier-orders" 
                  className={`flex items-center ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg transition-all duration-200 ${
                    isActive('/admin/supplier-orders') 
                      ? 'bg-gray-800 text-white border-l-4 border-gray-500' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Supplier Orders"
                >
                  <FaTruck size={20} className={!isMinimized && 'mr-3'} />
                  {!isMinimized && <span className="font-medium">Supplier Orders</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/customer" 
                  className={`flex items-center ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg transition-all duration-200 ${
                    isActive('/admin/customer') 
                      ? 'bg-gray-800 text-white border-l-4 border-gray-500' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Regular Customers"
                >
                  <FaUsers size={20} className={!isMinimized && 'mr-3'} />
                  {!isMinimized && <span className="font-medium">Regular Customers</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/supplier-management" 
                  className={`flex items-center ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg transition-all duration-200 ${
                    isActive('/admin/supplier-management') 
                      ? 'bg-gray-800 text-white border-l-4 border-gray-500' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Supplier Management"
                >
                  <FaUserTie size={20} className={!isMinimized && 'mr-3'} />
                  {!isMinimized && <span className="font-medium">Supplier Management</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/employee-management" 
                  className={`flex items-center ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg transition-all duration-200 ${
                    isActive('/admin/employee-management') 
                      ? 'bg-gray-800 text-white border-l-4 border-gray-500' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Employee Management"
                >
                  <FaUserFriends size={20} className={!isMinimized && 'mr-3'} />
                  {!isMinimized && <span className="font-medium">Employee Management</span>}
                </Link>
              </li>
             
              <li>
                <Link 
                  to="/admin/settings" 
                  className={`flex items-center ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg transition-all duration-200 ${
                    isActive('/admin/settings') 
                      ? 'bg-gray-800 text-white border-l-4 border-gray-500' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Settings"
                >
                  <FaCog size={20} className={!isMinimized && 'mr-3'} />
                  {!isMinimized && <span className="font-medium">Settings</span>}
                </Link>
              </li>
            </ul>

            <div className="w-full border-t border-white px-4 py-4">
              <div className="flex items-center space-x-3">
                <FaUserCircle size={28} className="text-gray-400" />
                <span className="text-white font-medium">{employee ? `${employee.firstName} ${employee.lastName}` : 'Loading...'}</span>
              </div>
            </div>

            {/* Logout Button - Fixed to the bottom */}
            <div className="w-full px-0">
              <button 
                onClick={handleLogout} // Add functionality later
                className="flex items-center justify-center w-full py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
                title="Logout"
              >
                <FaSignOutAlt size={20} />
                <span className="ml-3 font-medium">Logout</span>
              </button>
            </div>
          </nav>

          <style jsx>{`
            .scrollbar-hide {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;  /* Chrome, Safari and Opera */
            }
          `}</style>
        </div>
      </div>
      {isLogoutModalOpen && <LogoutModal />}
    </>
  );
};

export default Sidebar;
