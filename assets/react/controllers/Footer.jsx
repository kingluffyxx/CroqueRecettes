import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white mt-auto py-6 text-gray-500 text-sm text-center">
      <p>&copy; {new Date().getFullYear()} CroqueRecettes. Tous droits réservés.</p>
    </footer>
  );
}
