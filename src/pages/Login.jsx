import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const role = new URLSearchParams(location.search).get("role");
  const [employeeEmails, setEmployeeEmails] = useState([]);

  const [email, setEmail] = useState("");
  const [nic, setNic] = useState("");

  useEffect(() => {
    if (!role) {
      navigate("/auth");
    }
    const fetchEmails = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_API_BASE_URL + "/api/employees"
        );
        const filtered = response.data.filter(
          (emp) => emp.role.toLowerCase() === role.toLowerCase()
        );
        setEmployeeEmails(filtered.map((emp) => emp.email));
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    fetchEmails();
  }, [role, navigate]);

  if (!role) return null;

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !nic) {
      alert("Email and NIC are required!");
      return;
    }

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_BASE_URL + "/api/employees/login",
        {
          email,
          nic,
          role,
        }
      );

      login({
        email,
        nic,
        role,
      }); // Use the login function from context instead of localStorage

      localStorage.setItem("employeeData", JSON.stringify(response.data));

      alert("Login successful");

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/employeePOS");
      }
    } catch (error) {
      alert("Login failed: " + (error.response?.data || "Unknown error"));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">
          Login as {role === "admin" ? "Admin" : "Employee"}
        </h2>
        <form onSubmit={handleLogin}>
          <div className="space-y-4">
            <select
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Email</option>
              {employeeEmails.map((email, index) => (
                <option key={index} value={email}>
                  {email}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              placeholder="NIC Number"
              className="w-full p-2 border rounded-md"
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
