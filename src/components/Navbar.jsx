import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaTicketAlt } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-16 flex flex-wrap items-center justify-between gap-4 py-3">

          {/* Logo */}
          <Link
            to="/"
            className="text-slate-900 text-2xl font-bold flex items-center gap-2"
          >
            <FaTicketAlt className="text-blue-600" />

            <span>
              Elite<span className="text-blue-600">Tickets</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">

            <Link
              to="/home"
              className="text-slate-600 hover:text-blue-600 transition font-medium"
            >
              Events
            </Link>

            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="text-slate-600 hover:text-blue-600 transition font-medium"
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-semibold shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-blue-600 transition font-medium"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;