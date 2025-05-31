import React, { useState, useEffect } from "react";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: "icon-[solar--pen-bold-duotone]",
    title: "Création de recettes",
    description: "Publiez vos propres recettes facilement.",
  },
  {
    icon: "icon-[solar--accessibility-bold]",
    title: "Accès instantané",
    description: "Consultez vos recettes partout, à tout moment.",
  },
  {
    icon: "icon-[solar--users-group-two-rounded-bold-duotone]",
    title: "Communauté",
    description: "Partagez vos astuces et découvrez celles des autres cuisiniers.",
  },
];

export default function FeaturesSection() {

  return (
    <section className="gap-6 grid grid-cols-1 md:grid-cols-3 mx-auto px-4 py-16 container">
      {features.map((f, index) => (
        <FeatureCard key={f.title} index={index}
        {...f} />
      ))}
    </section>
  );
}
