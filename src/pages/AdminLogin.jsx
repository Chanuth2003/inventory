// // src/pages/AdminLogin.jsx
// import { useNavigate } from 'react-router-dom';

// export default function AdminLogin() {
//   const navigate = useNavigate();

//   const handleLogin = (e) => {
//     e.preventDefault();
//     const username = e.target.username.value;
//     const password = e.target.password.value;
//     if (username === 'admin' && password === 'admin123') {
//       navigate('/dashboard');
//     } else {
//       alert('Invalid credentials');
//     }
//   };

//   return (
//     <div className="container">
//       <h2>Admin Login</h2>
//       <form onSubmit={handleLogin}>
//         <input name="username" type="text" placeholder="Username" />
//         <input name="password" type="password" placeholder="Password" />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }
















// // src/pages/AdminLogin.jsx
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// export default function AdminLogin() {
//   const navigate = useNavigate();
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     const password = e.target.password.value.trim(); // username removed – only password needed

//     try {
//       const response = await fetch('http://localhost:5000/login', {  // ← adjust URL to match your setup
//         method: 'POST',
//         credentials: 'include',           // needed for PHP session cookie
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ password }),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         throw new Error(data.message || 'Login failed');
//       }

//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.message || 'Connection error – is backend running?');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto max-w-sm mt-20 p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

//       {error && (
//         <p className="text-red-600 bg-red-50 p-3 rounded mb-4 text-center">
//           {error}
//         </p>
//       )}

//       <form onSubmit={handleLogin}>
//         {/* Username removed – single user, only password needed */}
//         <div className="mb-5">
//           <label className="block text-gray-700 mb-2 font-medium">Password</label>
//           <input
//             name="password"
//             type="password"
//             placeholder="Enter password"
//             required
//             autoFocus
//             className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className={`w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition
//             ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
//         >
//           {loading ? 'Checking...' : 'Login'}
//         </button>
//       </form>
//     </div>
//   );
// }




























import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const password = e.target.password.value.trim();

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || "Login failed");

      setIsLoggedIn(true);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-sm mt-20 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

      {error && (
        <p className="text-red-600 bg-red-50 p-3 rounded mb-4 text-center">{error}</p>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-5">
          <label className="block text-gray-700 mb-2 font-medium">Password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter password"
            required
            autoFocus
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition
            ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {loading ? "Checking..." : "Login"}
        </button>
      </form>
    </div>
  );
}







