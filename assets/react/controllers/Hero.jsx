import React, { useState, useEffect } from "react";

export default function Hero() {

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
      <div
          className={`hero max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 transition-all duration-1000 transform ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
      <div className="lg:flex-row-reverse flex-col hero-content">
        <img
          src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445"
          alt="Hero Illustration"
          className="shadow-2xl rounded-2xl sm:max-w-sm hover:scale-105 transition-all duration-500 transform"
        />
        <div className="lg:text-left text-center">
          <h1 className="font-bold text-5xl">
            Découvrez des recettes simples et savoureuses
          </h1>
          <p className="py-6">
            Partagez vos plats préférés et explorez des idées gourmandes en quelques minutes.
          </p>
          <a href="/login" className="hover:scale-105 transition-all btn btn-xl btn-primary transform">Voir les recettes</a>
        </div>
      </div>
    </div>
  );
}
