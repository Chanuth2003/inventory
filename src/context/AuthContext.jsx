import React, { createContext, useState, useEffect } from "react";

// Create Auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Optional: check session on page reload
  useEffect(() => {
    fetch("http://localhost:5000/check-session", {
      method: "GET",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) setIsLoggedIn(true);
      })
      .catch(console.error);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};