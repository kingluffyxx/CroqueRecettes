import React from "react";
import PropTypes from "prop-types";

export default function Header({ user }) {
  
  const userLetter = user?.charAt(0).toUpperCase();

  return (
    <nav className="top-0 right-0 left-0 z-50 fixed bg-white/80 backdrop-blur-md">
      <div className={`${user ? "px-4 py-4" : "mx-auto px-4 py-4 container"}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-neutral-600 lucide lucide-pen-line"
            >
              <path d="M12 20h9"></path>
              <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"></path>
            </svg>
            <a href="/" className="font-bold text-neutral-600 text-2xl">
              CroqueRecettes
            </a>
          </div>

          <div className="space-x-4">
            {user ? (
              <>
                <a
                  href="/dashboard"
                >
                  <div className="avatar avatar-placeholder">
                    <div className="bg-neutral rounded-full w-12 text-neutral-content">
                      <span className="text-3xl">{userLetter}</span>
                    </div>
                  </div>
                </a>
                <a
                  href="/logout"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Déconnexion
                </a>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Connexion
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 rounded-lg btn btn-primary"
                >
                  Inscription
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

Header.propTypes = {
  user: PropTypes.string,
};