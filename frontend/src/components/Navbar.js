import React from "react";
import { Link } from "react-router-dom";

function Navbar({ account }) {
  return (
    <nav className="navbar navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">🏠 Immo DApp</Link>
        <div className="d-flex">
          <Link className="btn btn-outline-light mx-2" to="/">Propriétés</Link>
          <Link className="btn btn-outline-light" to="/owned">Mes propriétés</Link>
        </div>
        <span className="text-light">
          {account ? `🟢 Connecté: ${account.substring(0, 6)}...${account.slice(-4)}` : "🔴 Non connecté"}
        </span>
      </div>
    </nav>
  );
}

export default Navbar;
