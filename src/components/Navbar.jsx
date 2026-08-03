import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaTicketAlt, FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  // Shared "underline on hover" treatment for text links
  const navLinkClasses =
    "relative text-sm font-medium tracking-wide text-neutral-300 transition-colors hover:text-white " +
    "after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-amber-400 " +
    "after:transition-all after:duration-300 hover:after:w-full";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/90 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center gap-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 shadow-lg shadow-amber-500/20 transition-transform duration-300 group-hover:-rotate-6">
              <FaTicketAlt className="text-base" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              Elite<span className="text-amber-400">Tickets</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            <Link to="/" className={navLinkClasses}>
              Events
            </Link>

            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  className={navLinkClasses}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClasses}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition-transform duration-200 hover:scale-[1.03] hover:from-amber-300 hover:to-amber-400"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-200 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          menuOpen ? "max-h-64 border-t border-white/5" : "max-h-0"
        }`}
      >
        <div className="container mx-auto flex flex-col gap-1 px-4 py-4">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Events
          </Link>

          {user ? (
            <>
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="mt-1 rounded-md border border-white/10 px-3 py-2 text-left text-sm font-medium text-neutral-200 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2 text-center text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition-transform duration-200 hover:scale-[1.02]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
