import React from 'react';
import Hero from './Hero';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';
import PreviewSection from './PreviewSection';
export default function HomePage(props) {
  return (
      <main>
        <Hero />
        <FeaturesSection />
        <PreviewSection />
        <TestimonialsSection />
      </main>
  );
}
