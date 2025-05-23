import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";  
import Login from "./pages/Login";
import AuthPage from "./pages/Auth";
import EmployeePOS from "./pages/EmployeePOS";
import Invoice from "./pages/Invoice";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>  
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            } 
          />

          {/* Protected Employee Route */}
          <Route 
            path="/employeePOS" 
            element={
              <ProtectedRoute requireAdmin={false}>
                <EmployeePOS />
              </ProtectedRoute>
            } 
          />

          {/* Redirect root to auth page */}
          <Route path="/" element={<AuthPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
