import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        tajawal: ["Tajawal", "sans-serif"],
        amiri: ["Amiri", "serif"],
        ruqaa: ["Aref Ruqaa", "serif"],
        naskh: ["Noto Naskh Arabic", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
          light: "hsl(var(--gold-light))",
        },
        emerald: {
          light: "hsl(var(--emerald-light))",
          glow: "hsl(var(--emerald-glow))",
        },
        heading: "hsl(var(--heading))",
        "body-blue": "hsl(var(--body-blue))",
        "royal-blue": {
          DEFAULT: "hsl(var(--royal-blue))",
          foreground: "hsl(var(--royal-blue-foreground))",
        },
        "matte-gold": {
          DEFAULT: "hsl(var(--matte-gold))",
          foreground: "hsl(var(--matte-gold-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "logo-pulse": {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.08)" },
        },
        "logo-soft-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        "logo-tap": {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "40%": { transform: "scale(1.18) rotate(-8deg)" },
          "70%": { transform: "scale(0.96) rotate(6deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        "logo-bounce": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "30%": { transform: "translateY(-14px) scale(1.1)" },
          "60%": { transform: "translateY(0) scale(0.97)" },
          "80%": { transform: "translateY(-4px) scale(1.03)" },
        },
        "neon-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "neon-shimmer": {
          "0%, 100%": { opacity: "0.75", filter: "drop-shadow(0 0 6px hsl(var(--matte-gold)))" },
          "50%": { opacity: "1", filter: "drop-shadow(0 0 14px hsl(var(--matte-gold)))" },
        },
        "spark-fly": {
          "0%": { transform: "translate(0,0) scale(0.6)", opacity: "0" },
          "20%": { opacity: "1" },
          "100%": { transform: "translate(var(--sx), var(--sy)) scale(1.2)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "logo-pulse": "logo-pulse 2.6s ease-in-out infinite",
        "logo-soft-pulse": "logo-soft-pulse 2.6s ease-in-out infinite",
        "logo-tap": "logo-tap 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "logo-bounce": "logo-bounce 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "neon-spin": "neon-spin 6s linear infinite",
        "neon-shimmer": "neon-shimmer 2.4s ease-in-out infinite",
        "spark-fly": "spark-fly 1.2s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
