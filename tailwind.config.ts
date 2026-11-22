import type { Config } from "tailwindcss";

const c = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const travel = (px: number) => `calc(${px}px * var(--travel, 1))`;

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: { relative: true, files: ["./index.html", "./src/**/*.{ts,tsx}"] },
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1600px",
    },
    extend: {
      colors: {
        bg: c("bg"),
        surface: c("surface"),
        field: c("field"),
        sunken: c("sunken"),
        rule: { DEFAULT: c("rule"), strong: c("rule-strong") },
        ink: { DEFAULT: c("ink"), 2: c("ink-2"), 3: c("ink-3") },
        action: { DEFAULT: c("action"), on: c("on-action") },
        hot: { DEFAULT: c("hot"), ink: c("hot-ink"), soft: c("hot-soft") },
        focus: c("focus"),
        enc: {
          current: c("enc-current"),
          heap: c("enc-heap"),
          done: c("enc-done"),
          path: c("enc-path"),
          wall: c("enc-wall"),
          cost: c("enc-cost"),
          a: c("enc-a"),
          b: c("enc-b"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        "2xs": ["12px", { lineHeight: "16px" }],
        xs: ["13px", { lineHeight: "18px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["15px", { lineHeight: "22px" }],
        md: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "26px" }],
        xl: ["22px", { lineHeight: "28px", letterSpacing: "-0.01em" }],
        "2xl": ["28px", { lineHeight: "34px", letterSpacing: "-0.015em" }],
        "3xl": ["40px", { lineHeight: "44px", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        none: "0",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        full: "9999px",
      },
      boxShadow: {
        pop: "var(--shadow-pop)",
        inset: "inset 0 0 0 1px rgb(var(--rule) / 1)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        inout: "var(--ease-inout)",
        drawer: "var(--ease-drawer)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        med: "var(--dur-med)",
        slow: "var(--dur-slow)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "rise-in": {
          from: {
            opacity: "0",
            transform: `translateY(${travel(4)}) scale(calc(1 - 0.03 * var(--travel, 1)))`,
          },
          to: { opacity: "1", transform: "none" },
        },
        "sheet-in": {
          from: { transform: `translateY(${travel(12)})`, opacity: "0" },
          to: { transform: "none", opacity: "1" },
        },
        "slide-in-left": {
          from: { transform: `translateX(calc(-100% * var(--travel, 1)))`, opacity: "0" },
          to: { transform: "none", opacity: "1" },
        },
        "entry-in": {
          from: { opacity: "0", transform: `translateX(${travel(6)})` },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "fade-in": "fade-in 160ms var(--ease-out)",
        "rise-in": "rise-in 180ms var(--ease-out)",
        "sheet-in": "sheet-in 240ms var(--ease-out)",
        "slide-in-left": "slide-in-left 280ms var(--ease-drawer)",
        "entry-in": "entry-in 180ms var(--ease-out)",
      },
    },
  },
  plugins: [],
};

export default config;
