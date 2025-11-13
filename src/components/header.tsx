// ...existing code...
import { useState, useRef, useEffect } from "react";
import { CgProfile } from "react-icons/cg";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/DF-Logo.svg";

export default function Header() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const toggleDark = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // adjust to your auth cleanup (tokens, sdk logout, etc.)
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const profileImg = localStorage.getItem("profileImgUrl"); // optional: store user's image URL

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center">
        <img src={logo} alt="Logo" className="h-10" />
      </div>

      {/* Right Side: Profile + Dark Mode Button */}
      <div className="flex items-center gap-3">
        {/* Dark Mode Button */}
        <button
          onClick={toggleDark}
          className={`
            relative px-5 py-2.5 rounded-full font-bold text-sm overflow-hidden
            shadow-md transition-all duration-300 group cursor-pointer
            hover:scale-105 hover:shadow-lg active:scale-95
            focus:outline-none focus:ring-2 focus:ring-offset-2
            flex items-center gap-2

            bg-gradient-to-r from-[#2596be] via-[#1e7fa3] to-[#166f8a] text-white
            focus:ring-[#2596be]/50

            dark:bg-black dark:text-white dark:focus:ring-white/50
          `}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] blur-md transition-all duration-700 ease-out dark:opacity-0" />
          <span className="absolute inset-0 bg-white/10 backdrop-blur-[1px] rounded-full dark:bg-white/5" />
          <span className="relative z-10 flex items-center gap-1.5">
            {dark ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-3.05-.293l-.707-.707a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
            {dark ? "Light" : "Dark"}
          </span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((s) => !s)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
            aria-expanded={open}
            aria-haspopup="true"
          >
            {profileImg ? (
              <img src={profileImg} alt="profile" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <CgProfile size={28} className="text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 overflow-hidden">
              <button
                onClick={() => { setOpen(false); navigate("/MyProfile"); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <CgProfile /> Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-red-600"
              >
                <FaSignOutAlt /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
// ...existing code...