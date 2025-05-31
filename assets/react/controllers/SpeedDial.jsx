import React, { useState, useEffect } from "react";

export default function SpeedDial({idModal}) {
  useEffect(() => {  
      const modal = document.getElementById(idModal);
      const onRecipeCreated = () => {
          modal.close();
      };
      window.addEventListener("recipe:created", onRecipeCreated);
  
      return () => {
        window.removeEventListener("recipe:created", onRecipeCreated);
      };
    }, [idModal]);

  return (
    <>
      {/* Speed Dial Button */}
      <div className="right-6 bottom-22 fixed">
        <button
          type="button"
          onClick={() => {
            document.getElementById(idModal).showModal();
          }}
          data-dial-toggle="speed-dial-menu-click" data-dial-trigger="click" aria-controls="speed-dial-menu-click"
          className="flex justify-center items-center bg-blue-700 hover:bg-blue-800 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-300 w-14 h-14 text-white"
        >
          <svg
            className="w-5 h-5 group-hover:rotate-45 transition-transform"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 1v16M1 9h16"
            />
          </svg>
          <span className="sr-only">Open actions menu</span>
        </button>
      </div>
    </>
  );
}
