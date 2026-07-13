import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AllRoutes from "./components/allRoutes/AllRoutes";
import ToastProvider from "./components/toast/ToastProvider";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("pos-user");
    const storedToken = localStorage.getItem("pos-token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <ToastProvider>
      <Router>
        <AllRoutes 
          isAuthenticated={isAuthenticated} 
          setIsAuthenticated={setIsAuthenticated} 
          user={user} 
          setUser={setUser} 
        />
      </Router>
    </ToastProvider>
  );
}

export default App;