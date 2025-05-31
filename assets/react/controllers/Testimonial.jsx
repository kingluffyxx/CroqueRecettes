import React, { useState, useEffect } from "react";

export default function Testimonial({ quote, job, author }) {
      const [visible, setVisible] = useState(false);
      
        useEffect(() => {
          setVisible(true);
        }, []);
  return (
    <blockquote className="bg-white shadow p-6 rounded-lg hover:scale-105 transition-all duration-500 transform">
      <p className="text-gray-600 italic">“{quote}”</p>
      <p className="mt-4 text-gray-500 text-sm">
        — {author}, <cite>{job}</cite>
      </p>
    </blockquote>
  );
}
