import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [newLoyaltyCustomers, setNewLoyaltyCustomers] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [monthlyOrderCount, setMonthlyOrderCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedView, setSelectedView] = useState("weekly");
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const weeklySalesData = [
    { day: "Mon", orders: 10, income: 4000 },
    { day: "Tue", orders: 12, income: 5200 },
    { day: "Wed", orders: 9, income: 3800 },
    { day: "Thu", orders: 15, income: 6000 },
    { day: "Fri", orders: 8, income: 3000 },
    { day: "Sat", orders: 18, income: 7500 },
    { day: "Sun", orders: 7, income: 2700 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  useEffect(() => {
    // Fetch all products from the backend API
    axios
      .get(import.meta.env.VITE_API_BASE_URL + "/products")
      .then((response) => {
        setProducts(response.data);

        // Calculate category quantities
        const categoryQuantities = response.data.reduce((acc, product) => {
          const category = product.category || "Uncategorized";
          acc[category] = (acc[category] || 0) + (product.quantity || 0);
          return acc;
        }, {});

        // Convert to array format for PieChart
        const categoryArray = Object.entries(categoryQuantities).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

        setCategoryData(categoryArray);

        // Filter products with quantity less than 5 (low stock)
        const lowStock = response.data.filter(
          (product) => product.quantity < 5
        );
        setLowStockItems(lowStock);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });

    // Fetch orders and calculate monthly income, average order value, and monthly order count
    axios
      .get(import.meta.env.VITE_API_BASE_URL + "/orders")
      .then((response) => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyOrders = response.data.filter((order) => {
          const orderDate = new Date(order.orderDate);
          return (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear
          );
        });

        // Calculate other stats
        const monthlyTotal = monthlyOrders.reduce(
          (total, order) => total + (order.total || 0),
          0
        );

        const average =
          monthlyOrders.length > 0 ? monthlyTotal / monthlyOrders.length : 0;

        setMonthlyIncome(monthlyTotal);
        setAverageOrderValue(average);
        setMonthlyOrderCount(monthlyOrders.length);

        // Process weekly data
        const last7Days = [...Array(7)]
          .map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d;
          })
          .reverse();

        const weeklyStats = last7Days.map((date) => {
          const dayOrders = response.data.filter(
            (order) =>
              new Date(order.orderDate).toDateString() === date.toDateString()
          );
          return {
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            orders: dayOrders.length,
            income: dayOrders.reduce((sum, order) => sum + order.total, 0),
          };
        });
        setWeeklyData(weeklyStats);

        // Process monthly data
        const last12Months = [...Array(12)]
          .map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return d;
          })
          .reverse();

        const monthlyStats = last12Months.map((date) => {
          const monthOrders = response.data.filter((order) => {
            const orderDate = new Date(order.orderDate);
            return (
              orderDate.getMonth() === date.getMonth() &&
              orderDate.getFullYear() === date.getFullYear()
            );
          });
          return {
            month: date.toLocaleDateString("en-US", { month: "short" }),
            orders: monthOrders.length,
            income: monthOrders.reduce((sum, order) => sum + order.total, 0),
          };
        });
        setMonthlyData(monthlyStats);

        // Get last 3 orders sorted by date
        const sortedOrders = [...response.data]
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
          .slice(0, 3);
        setRecentOrders(sortedOrders);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
      });

    // Fetch new loyalty customers registered this week
    axios
      .get(
        import.meta.env.VITE_API_BASE_URL + "/customers/new-loyalty-customers"
      )
      .then((response) => {
        setNewLoyaltyCustomers(response.data); // Assuming the response is just the count of new customers
      })
      .catch((error) => {
        console.error("Error fetching new loyalty customers:", error);
      });
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Top Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Sale",
            value: `Rs. ${monthlyIncome.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`,
          },
          {
            label: "Average Order Value",
            value: `Rs. ${averageOrderValue.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`,
          },
          { label: "New Orders", value: monthlyOrderCount },
          { label: "New Loyalty Customers", value: newLoyaltyCustomers },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-2xl shadow-md border-2 border-gray-800 flex justify-between items-center transform transition-transform duration-200 hover:-translate-y-1"
          >
            <p className="text-white text-left w-22">{item.label}</p>
            <p className="text-white text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue & Category Distribution */}
      <div className="grid grid-cols-5 gap-6 ">
        {/* Weekly Revenue Chart */}
        <div className="bg-white text-black p-5 rounded-2xl shadow-md pt-0 pr-0 pl-0 border-2 border-gray-200 flex flex-col items-center col-span-3">
          <div className="w-full bg-gray-300 rounded-t-xl">
            <div className="flex">
              <button
                className={`flex-1 p-5 text-xl font-serif text-center transition-colors ${
                  selectedView === "weekly" ? "bg-gray-400 text-white" : ""
                }`}
                onClick={() => setSelectedView("weekly")}
              >
                Weekly Revenue
              </button>
              <button
                className={`flex-1 p-5 text-xl font-serif text-center transition-colors ${
                  selectedView === "monthly" ? "bg-gray-400 text-white" : ""
                }`}
                onClick={() => setSelectedView("monthly")}
              >
                Monthly Revenue
              </button>
            </div>
          </div>
          <div className="w-full flex justify-center items-center">
            <ResponsiveContainer width="90%" height={200}>
              <ComposedChart
                data={selectedView === "weekly" ? weeklyData : monthlyData}
              >
                <XAxis
                  dataKey={selectedView === "weekly" ? "day" : "month"}
                  stroke="#ccc"
                />
                <YAxis yAxisId="left" stroke="#00BFFF" />
                <YAxis yAxisId="right" orientation="right" stroke="#32CD32" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#333",
                    borderColor: "#555",
                    color: "#fff",
                  }}
                />
                <Legend />
                <CartesianGrid stroke="#f5f5f5" />

                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  name="Total Orders"
                  barSize={20}
                  fill="#00BFFF"
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="income"
                  name="Total Income"
                  stroke="#32CD32"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white text-black p-5 rounded-2xl shadow-md pt-0 pr-0 pl-0 border-2 border-gray-200 flex flex-col col-span-2">
          <h2 className="bg-gray-300 text-gray-700 p-5 rounded-t-xl text-xl mb-3 text-center h-14 font-serif w-full">
            Category Distribution
          </h2>
          <div className="flex justify-center items-center h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock Items */}
      <div className="grid grid-cols-6 gap-6 mt-6">
        {/* Low Stock Items */}
        <div className="col-span-2">
          <h2 className="text-xl font-semibold mb-2">Low Stock Items</h2>
          <div className="bg-white p-4 rounded-2xl shadow-md ">
            <table className="w-full text-center">
              <thead>
                <tr className="border-b">
                  {["ID", "Name", "Quantity"].map((heading) => (
                    <th key={heading} className="py-2">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.id}</td>
                      <td>{item.name}</td>
                      <td className="text-red-500">{item.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-2">
                      No low stock items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="col-span-4">
          <div>
            <h2 className="text-xl font-semibold mb-2 ">Recent Orders</h2>
            <div className="bg-white p-4 rounded-2xl shadow-md col-span-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b ">
                    {["Invoice", "Amount", "Date", "Phone no", "Cashier"].map(
                      (heading) => (
                        <th key={heading} className="py-2">
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{order.transactionId}</td>
                      <td>Rs. {order.total.toFixed(2)}</td>
                      <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td>{order.customerPhone}</td>
                      <td>{order.cashierName || "System"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
