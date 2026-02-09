/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Safelist for dynamic classes used in category cards
  // These are generated dynamically based on category.color (blue, orange, green, red)
  safelist: [
    // Background colors with opacity for category cards
    { pattern: /bg-(blue|orange|green|red)-(800|900)\/(40|50|60)/ },
    // Border colors for category cards
    { pattern: /border-(blue|orange|green|red)-(400|500|600)/ },
    // Text colors for category cards
    { pattern: /text-(blue|orange|green|red)-(200|300|400|500)/ },
    // Ring colors for focus states
    { pattern: /ring-(blue|orange|green|red)-(400|500)/ },
    // Hover background colors
    { pattern: /hover:bg-(blue|orange|green|red)-(700|800)\/(50|60)/ },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
