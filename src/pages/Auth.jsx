import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    navigate(`/login?role=${role}`); // Pass role as query parameter
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div >
        <img class="h-26 w-auto px-14" src="/images/logo.webp" alt="mandela logo"/>  
      <h1 className="text-3xl text-center mb-6 mt-4 font-serif">Select User Type</h1>
      </div>
      <div className="flex flex-row items-center justify-center space-x-10">
        <div className="bg-white border border-black p-6 w-70 h-80 shadow-lg rounded-lg">
        <h2 className="text-2xl text-center mb-6 font-serif">Admin</h2>
        <img class="h-auto w-auto px-14" src="/images/owner.png" alt="admin pic"/>
        <button
          onClick={() => handleRoleSelection("admin")}
          className="px-16 py-3 bg-cyan-600 text-white rounded-lg shadow-lg hover:bg-cyan-500 mt-6 px-14"
        >
          Admin Login
        </button>
        </div>

            <div className="flex flex-row items-center justify-center space-x-4">
        <div className="bg-white border border-black p-6 w-70 h-80 shadow-lg rounded-lg">
        <h2 className="text-2xl text-center mb-6 font-serif">Employee</h2>
        <img class="h-auto w-auto px-14" src="/images/staff.png" alt="admin pic"/>  
        <button
          onClick={() => handleRoleSelection("employee")}
          className="px-10 py-3 bg-cyan-600 text-white rounded-lg shadow-lg hover:bg-cyan-500 mt-6 px-14"
        >
          Employee Login
        </button>
       </div>
       </div>
      </div>
    </div>
  );
};

export default AuthPage;