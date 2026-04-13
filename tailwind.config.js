/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#020812",
          900: "#050d1f",
          800: "#091426",
          700: "#0d1e35",
          600: "#122440",
          500: "#183050",
        },
        aqua: {
          400: "#00e5ff",
          500: "#00c8e8",
          600: "#0099cc",
          700: "#0077aa",
        },
        ocean: {
          400: "#4db8ff",
          500: "#1a8fff",
          600: "#0066dd",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "wave-gradient": "linear-gradient(135deg, #050d1f 0%, #091a30 50%, #050d1f 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(13,30,53,0.9) 0%, rgba(9,20,38,0.95) 100%)",
        "aqua-gradient": "linear-gradient(135deg, #00c8e8 0%, #0077aa 100%)",
        "glow-aqua": "radial-gradient(ellipse at center, rgba(0,200,232,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "aqua-glow": "0 0 30px rgba(0,200,232,0.2), 0 0 60px rgba(0,200,232,0.05)",
        "card": "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,200,232,0.1)",
      },
      animation: {
        "wave": "wave 8s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-aqua": "pulseAqua 3s ease-in-out infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-8px) rotate(1deg)" },
          "66%": { transform: "translateY(4px) rotate(-1deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseAqua: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,200,232,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(0,200,232,0.4)" },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
