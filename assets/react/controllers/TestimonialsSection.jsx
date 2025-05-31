import React from "react";
import Testimonial from "./Testimonial";

const testimonials = [
  {
    quote: "Recettes simples et délicieuses, site très intuitif ! ",
    author: "Alice L",
    job: "Développeuse",
  },
  {
    quote: "Idéal pour trouver des idées et partager ses astuces.",
    author: "Bob",
    job: "Designer",
  },
  {
    quote: "Super pratique et une vraie communauté de passionnés !",
    author: "Caroline",
    job: "Chef de projet",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-base-100 mx-auto px-6 py-12 container">
      <h2 className="mb-8 font-bold text-gray-800 text-2xl text-center">
        Ce que disent nos utilisateurs
      </h2>
      <div className="gap-6 grid md:grid-cols-3">
        {testimonials.map((t) => (
          <Testimonial key={t.author} {...t} />
        ))}
      </div>
    </section>
  );
}
