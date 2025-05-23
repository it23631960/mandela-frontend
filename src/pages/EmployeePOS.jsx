import { useEffect, useState } from "react";
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';


const EmployeePOS = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("View ALL");
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(0); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerError, setCustomerError] = useState("");
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [employee, setEmployee] = useState(null);
    const [newCustomer, setNewCustomer] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      registrationDate: "",
      birthDate: "",
      });
const [transactionId, setTransactionId] = useState('');
const [loading, setLoading] = useState(false);
const [orders, setOrders] = useState([]);
const [filteredOrders, setFilteredOrders] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [showOrders, setShowOrders] = useState(false);
const [sendEmail, setSendEmail] = useState(false);
const [redeemPoints, setRedeemPoints] = useState(false);
const [showSuccess, setShowSuccess] = useState(false); // New state for success message
const [availablePoints, setAvailablePoints] = useState(0); // Add this to state declarations at the top
const [customers, setCustomers] = useState([]); // Add customers state
const subTotal = cart.reduce((sum, item) => sum + item.total, 0);
const [pointsDiscount, setPointsDiscount] = useState(0);

    useEffect(() => {
        axios.get("${import.meta.env.VITE_API_BASE_URL}/products")
          .then(response => setProducts(response.data))
          .catch(error => console.error("Error fetching products:", error));

      }, []);

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

      useEffect(() => {
        axios.get("${import.meta.env.VITE_API_BASE_URL}/customers")
          .then(response => setCustomers(response.data))
          .catch(error => console.error("Error fetching customers:", error));
      }, []);

      const fetchCustomerByPhone = (phone) => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/customers`)
          .then(response => {
            const matchedCustomer = response.data.find(c => c.phoneNumber === phone);
            if (matchedCustomer) {
              setSelectedCustomer(matchedCustomer);
              setCustomerError(""); // clear error
            } else {
              setSelectedCustomer(null);
              setCustomerError("No customer found with this phone number.");
            }
          })
          .catch(error => {
            console.error("Error fetching customers:", error);
            setCustomerError("An error occurred while fetching customers.");
          });
      };
      
      

      const handleAddToCart = (product) => {
        setCart((prevCart) => {
          const existingItem = prevCart.find(item => item.id === product.id);
          if (existingItem) {
            return prevCart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
                : item
            );
          } else {
            return [...prevCart, { ...product, quantity: 1, price: product.price, total: product.price }];
          }
        });
      };

      const handleRemoveFromCart = (productId) => {
        setCart((prevCart) => {
          const existingItem = prevCart.find(item => item.id === productId);
          if (!existingItem) return prevCart;
      
          if (existingItem.quantity === 1) {
            return prevCart.filter(item => item.id !== productId);
          } else {
            return prevCart.map(item =>
              item.id === productId
                ? { ...item, quantity: item.quantity - 1, total: (item.quantity - 1) * item.price }
                : item
            );
          }
        });
      };

  
// Move these calculations before the useEffect
const total = subTotal - (subTotal * (discount / 100));

// Add this effect to handle point redemption
useEffect(() => {
  if (redeemPoints && selectedCustomer) {
    const pointsToRedeem = Math.min(availablePoints, subTotal);
    setPointsDiscount(pointsToRedeem);
    setDiscount(checkBirthdayDiscount(selectedCustomer) + (pointsToRedeem / subTotal * 100));
  } else if (selectedCustomer) {
    setPointsDiscount(0);
    setDiscount(checkBirthdayDiscount(selectedCustomer));
  }
}, [redeemPoints, selectedCustomer, availablePoints, subTotal]);

// Modify handleCharge function
const handleCharge = async () => {
  if (!selectedCustomer) {
    toast.error("Please select a customer first.");
    return;
  }
  if (cart.length === 0) {
    toast.error("Your cart is empty.");
    return;
  }

  setLoading(true);

  try {
    const pointsToEarn = calculateLoyaltyPoints(total);
    const pointsToRedeem = redeemPoints ? pointsDiscount : 0;
    
    // Calculate final points: existing points + earned points - redeemed points
    const finalPoints = selectedCustomer.loyaltyPoints + pointsToEarn - pointsToRedeem;

    const orderRes = await axios.post("${import.meta.env.VITE_API_BASE_URL}/orders", {
      customerId: selectedCustomer.id,
      items: cart.map(item => ({
        productId: item.id,
        unitPrice: item.price,
        quantity: item.quantity
      })),
      loyaltyPointsToRedeem: pointsToRedeem,
      // earnedPoints: pointsToEarn,
      // redeemedPoints: pointsToRedeem,
      // pointsDiscount: pointsToRedeem
    });

    // Update customer's loyalty points
    await axios.put(`${import.meta.env.VITE_API_BASE_URL}/customers/${selectedCustomer.id}`, {
      ...selectedCustomer,
      loyaltyPoints: finalPoints
    });

    // Handle email sending
    if (sendEmail && selectedCustomer?.email) {
      try {
        await axios.post("${import.meta.env.VITE_API_BASE_URL}/email/send", null, {
          params: {
            to: selectedCustomer.email,
            transactionId: orderRes.data.transactionId
          }
        });
        toast.success("📧 Invoice sent to email!");
      } catch (err) {
        toast.error("Failed to send email invoice");
      }
    }

    setTransactionId(orderRes.data.transactionId);
    setShowSuccess(true);

    // Update products quantity
    setProducts(prev =>
      prev.map(p => {
        const sold = cart.find(i => i.productId === p.id);
        return sold ? { ...p, quantity: p.quantity - sold.quantity } : p;
      })
    );

    // Reset UI after delay
    setTimeout(() => {
      setShowSuccess(false);
      setCart([]);
      setSendEmail(false);
      setRedeemPoints(false);
      setSelectedCustomer(null);
      setTransactionId('');
      setPhoneNumber('');
      setAvailablePoints(0);
    }, 3000);

    toast.success(`Order #${orderRes.data.transactionId} saved! Total Rs.${orderRes.data.total.toFixed(2)}`);
    
  } catch (error) {
    console.error("Order error:", error);
    toast.error(error.response?.data?.message || error.message);
  } finally {
    setLoading(false);
  }
};

      
      const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer({ ...newCustomer, [name]: value });
      
        if (name === "phoneNumber") {
          fetchCustomerByPhone(value);
        }
      };

      const handlePhoneChange = (e) => {
        const inputPhone = e.target.value;
        setPhoneNumber(inputPhone);

        axios.get(`${import.meta.env.VITE_API_BASE_URL}/customers`)
          .then(response => {
            const matchedCustomer = response.data.find(c => c.phoneNumber === inputPhone);
            if (matchedCustomer) {
              setSelectedCustomer(matchedCustomer);
              setCustomerError("");
              setAvailablePoints(matchedCustomer.loyaltyPoints || 0);
            } else {
              setSelectedCustomer(null);
              setCustomerError("No customer found with this phone number.");
            }
          })
          .catch(error => {
            console.error("Error fetching customers:", error);
            setCustomerError("An error occurred while fetching customers.");
          });
      };

      const openCustomerModal = () => {
        setNewCustomer({ firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          address: "",
          registrationDate: "",
          birthDate: "" });
        setIsCustomerModalOpen(true);
      };
      
      const closeCustomerModal = () => {
        setIsCustomerModalOpen(false);
        setNewCustomer({ firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          address: "",
          registrationDate: "",
          birthDate: "" });
      };
      
      const handleCustomerInputChange = (e) => {
        setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
      };
      
      const addCustomer = () => {
        axios.post("${import.meta.env.VITE_API_BASE_URL}/customers", newCustomer)
          .then(response => {
            // optionally update any local state or show success
            closeCustomerModal();
          })
          .catch(error => {
            console.error("Error adding customer:", error);
          });
      };


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

      
      
      
      

    

    const handleSendEmail = async () => {
      try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/orders/${transactionId}/send-email`);
        alert("Invoice sent to customer's email!");
      } catch (error) {
        console.error("Error sending email:", error);
        alert("Failed to send invoice email.");
      }
    };
    
    useEffect(() => {
      if (showOrders) {
        axios.get("${import.meta.env.VITE_API_BASE_URL}/orders")
          .then(response => {
            setOrders(response.data);
            setFilteredOrders(response.data);
          })
          .catch(error => console.error("Error fetching orders:", error));
      }
    }, [showOrders]);

    const handleOrderSearch = (e) => {
      const term = e.target.value.toLowerCase();
      setSearchTerm(term);
      const filtered = orders.filter(order =>
        order.transactionId.toLowerCase().includes(term) ||
        order.customerPhone.toLowerCase().includes(term)
      );
      setFilteredOrders(filtered);
    };

    const checkBirthdayDiscount = (customer) => {
      if (!customer || !customer.birthDate) return 0;
      const birthMonth = new Date(customer.birthDate).getMonth();
      const currentMonth = new Date().getMonth();
      return birthMonth === currentMonth ? 20 : 0;
    };

    const handleCustomerSelect = (customer) => {
      setSelectedCustomer(customer);
      setDiscount(checkBirthdayDiscount(customer));
      setAvailablePoints(customer.loyaltyPoints || 0);
      setIsModalOpen(false);
    };

    const calculateLoyaltyPoints = (amount) => {
      if (amount < 500) return 0;
      return Math.floor(amount / 100); // 1 point per Rs.100
    };

    return (
        <div className="h-screen w-full bg-white text-white flex flex-col">
          {/* Top Bar */}
          <div className="bg-white flex justify-between items-center px-6 py-3 shadow-md">
            <div className="flex items-left">
              <img className="h-10" src="/images/user.png" alt="image description" />
              <div className="flex flex-col ml-2">
               <p className="text-black font-semibold text-lg ml-2">
                {employee ? `${employee.firstName} ${employee.lastName}` : 'Loading...'}
              </p>
              <button onClick={() => handleLogout()}
               className="text-red-500 text-sm text-left ml-2 cursor-pointer ">Logout</button>
              </div>
              </div>
            <div className="flex-1 flex justify-center">
              <img className="h-16" src="/images/logo.webp" alt="image description" />
            </div>
            <div className="flex gap-4">
            <button
              onClick={() => setShowOrders(!showOrders)}
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              {showOrders ? "Back to POS" : "History"}
            </button>
            <button 
              onClick={openCustomerModal}
              className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700">+ Add new Loyalty Customer</button>
            </div>
          </div>

          {showOrders ? (
      <div className="p-8 bg-gray-50 flex-1 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Order History</h1>
          <p className="text-sm text-gray-500">Manage and monitor your customer orders</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={handleOrderSearch}
            placeholder="Search by transaction ID or phone..."
            className="w-full md:w-1/3  text-black px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-700 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-black">{filteredOrders.length}</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 border border-gray-200">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3 border">Order ID</th>
                <th className="px-6 py-3 border">Transaction ID</th>
                <th className="px-6 py-3 border">Customer Phone</th>
                <th className="px-6 py-3 border">Total</th>
                <th className="px-6 py-3 border">Discount</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="text-center hover:bg-gray-50">
                  <td className="px-6 py-4 border">{order.id}</td>
                  <td className="px-6 py-4 border">{order.transactionId}</td>
                  <td className="px-6 py-4 border">{order.customerPhone}</td>
                  <td className="px-6 py-4 border">Rs. {order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 border">
                    {order.discountPercent > 0 ? `${order.discountPercent}%` : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : (
      <div className="flex flex-1">
        {/* Left Panel */}
        <div className="w-3/5 p-4 bg-gray-200">
          <div className="flex items-center justify-between mb-4 w-full"> 
          <input
              type="text"
              placeholder="Search product"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-1/4 p-2 rounded-xl bg-gray-700 text-white placeholder-gray-400"
            />

             {/* Category Buttons */}
          <div className=" flex gap-4">
          {["View ALL", "Men's" , "Women's", "Footwear", "Accessories"].map(label => (
            <button
              key={label}
              className={`px-4 py-2 rounded-md ${filter === label ? "bg-black text-white" : "bg-gray-400 text-black"} hover:bg-gray-600`}
              onClick={() => setFilter(label)}
            >
              {label}
            </button>
          ))}

          </div>
          </div>
  
          {/* Product Grid */}
         <div className="grid grid-cols-5 gap-4">
                {products
          .filter(product => product.id.toString().includes(searchQuery) || product.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .filter(product => filter === "View ALL" || product.category === filter)
          .slice(0, 25)
          .map(product => (

    <div key={product.id} className="bg-white rounded-xl shadow p-2">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-32 object-cover rounded-md"
      />
      <p className="text-center text-sm  font-medium">{product.name}</p>
      <button
        disabled={product.quantity <= 0}
        onClick={() => handleAddToCart(product)}
        className={`mt-2 w-full py-1 rounded-md text-sm font-medium ${
          product.quantity <= 0
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-cyan-600 text-white hover:bg-cyan-700"
        }`}
      >
        {product.quantity <= 0 ? "Out of Stock" : "+ Add"}
      </button>


    </div>
  ))}
</div>
  
         
        </div>
  
        {/* Right Panel */}
        <div className="w-2/5 p-4 bg-white text-black flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 bg-gray-800 text-white pl-2">
            <button
                  onClick={() => setIsModalOpen(true)}
                  className="font-semibold border border-white-400 px-4 py-2 cursor-pointer rounded-md hover:bg-gray-700"
                >
                  {selectedCustomer
                    ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                    : "Select Customer"}
                </button>


              <div className="text-sm text-right py-2 px-6">
                <p className="font-bold">
                  {transactionId || (
                    <svg 
                      className="h-5 w-5 inline-block" 
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  )}
                </p>
              </div>
            </div>
  
            {/* Cart List */}
            <div className="space-y-2">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-1"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="text-black  hover:text-red-700 text-2xl"
                    title="Remove one"
                  >
                    ⊖
                  </button>
                  <div>
                    <p className="text-sm ml-2">{item.name}</p>
                    <p className="text-xs text-gray-500 ml-2">{item.quantity} ×</p>
                  </div>
                </div>
                <p className="font-medium">Rs.{item.total.toFixed(2)}</p>
              </div>
            ))}

            </div>
          </div>
  
          {/* Checkout */}
          <div className="pt-4 border-t mt-4">
            <div className="flex justify-between text-sm">
              <p>Sub Total</p>
              <p>Rs.{subTotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p>Discount</p>
              <p>{discount}%</p>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <p>Total</p>
              <p>Rs.{total.toFixed(2)}</p>
            </div>

            <div className="space-y-2 mt-4 mb-4">
              {selectedCustomer && (
                <>
                  <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="rounded border-gray-300 text-cyan-600 shadow-sm focus:border-cyan-300 focus:ring focus:ring-cyan-200 focus:ring-opacity-50"
                    />
                    <span>Send invoice to {selectedCustomer.email}</span>
                  </label>
                  
                  <label className="flex items-center justify-between text-sm text-gray-600 cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={redeemPoints}
                        onChange={(e) => setRedeemPoints(e.target.checked)}
                        disabled={checkBirthdayDiscount(selectedCustomer) > 0}
                        className="rounded border-gray-300 text-cyan-600 shadow-sm focus:border-cyan-300 focus:ring focus:ring-cyan-200 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span>
                        Redeem loyalty points 
                        {checkBirthdayDiscount(selectedCustomer) > 0 && (
                          <span className="text-xs text-red-500 ml-1">
                            (Disabled due to birthday discount)
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="font-medium text-cyan-600">
                      {availablePoints} points available
                    </span>
                  </label>
                </>
              )}
            </div>

            <button
  onClick={handleCharge}
  disabled={loading || cart.length === 0}
  className="w-full py-2 rounded-md text-white bg-black hover:bg-gray-800 disabled:opacity-50 flex justify-center items-center"
>
  {loading ? (
    <>
      <svg
        className="animate-spin h-5 w-5 mr-2"
        viewBox="0 0 24 24"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
      </svg>
      Processing…
    </>
  ) : (
    `CHARGE   Rs.${total.toFixed(2)}`
  )}
</button>

          </div>

        </div>
      </div>
    )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-96">
            <h2 className="text-lg font-bold mb-4 text-black">Enter Customer Phone Number</h2>
            <input
              type="text"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Phone Number"
              className="w-full p-2 border border-gray-500 rounded-md mb-4 text-black"
            />
            {customerError && (
                <p className="text-red-500 text-sm mt-1">{customerError}</p>
              )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                    onClick={() => {
                      axios.get(`${import.meta.env.VITE_API_BASE_URL}/customers`)
                        .then(response => {
                          const matchedCustomer = response.data.find(c => c.phoneNumber === phoneNumber);
                          if (matchedCustomer) {
                            handleCustomerSelect(matchedCustomer);
                            setCustomerError("");
                            setIsModalOpen(false); // ✅ only close if found
                          } else {
                            setSelectedCustomer(null);
                            setCustomerError("No customer found with this phone number.");
                          }
                        })
                        .catch(error => {
                          console.error("Error fetching customers:", error);
                          setCustomerError("An error occurred while fetching customers.");
                        });
                    }}
                    
                    className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                  >
                    Confirm
                  </button>

            </div>
          </div>
        </div>
      )}

{isCustomerModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-black z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h3 className="text-xl font-semibold mb-4">Add New Customer</h3>
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
              <button onClick={closeCustomerModal} className="px-4 py-2 border border-gray-400 rounded-md">Cancel</button>
              <button
          onClick={addCustomer}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
               </div>
          </div>
        </div>
      )}

{isLogoutModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-md w-96 text-black">
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
  </div>
)}

      {showSuccess && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-xl text-center">
      <div className="mb-4">
        <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Successful!</h2>
      <p className="text-gray-600">Transaction ID: {transactionId}</p>
      <p className="text-gray-600 mt-2">Total Amount: Rs.{total.toFixed(2)}</p>
      <p className="text-sm text-gray-500 mt-4">Processing next transaction...</p>
    </div>
  </div>
)}

      </div>
 
    );
  };
  
  export default EmployeePOS;