const flowbite = require("flowbite/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./assets/**/*.{js,jsx,ts,tsx}", // fichiers React UX
    "./node_modules/flowbite/**/*.js", // core flowbite
    "./node_modules/flowbite-react/**/*.js", // composants react
  ],
  theme: {
    extend: {},
  },
  plugins: [flowbite],
};
