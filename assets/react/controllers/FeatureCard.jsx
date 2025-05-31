import React, { useState, useEffect } from "react";

export default function FeatureCard({ icon, title, description, index }) {
    const [visible, setVisible] = useState(false);
    
      useEffect(() => {
        setVisible(true);
      }, []);
  return (
    <div className={`p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}>
      <span className={`w-[2.2em] h-[2.2em] ${icon}`}></span>
      <h3 className="mb-2 font-semibold text-xl">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
