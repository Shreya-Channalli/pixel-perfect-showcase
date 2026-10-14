import { useEffect, useState } from "react";

export type SiloTheme = "og" | "light";
const KEY = "siloverse-theme";

/** Inline script for <head>: applies stored theme before paint. */
export const themeInitScript = `try{if(localStorage.getItem("${KEY}")==="light")document.documentElement.classList.add("light")}catch(e){}`;

export function ThemeToggle() {
  const [theme, setTheme] = useState<SiloTheme>("og");
  useEffect(() => {
    setTheme(document.documentElement.classList.contains("light") ? "light" : "og");
  }, []);
  const apply = (t: SiloTheme) => {
    setTheme(t);
    document.documentElement.classList.toggle("light", t === "light");
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* storage unavailable */
    }
  };
  return (
    <div role="radiogroup" aria-label="Theme" className="flex border border-border rounded-sm overflow-hidden">
      {(["og", "light"] as const).map((t) => (
        <button
          key={t}
          role="radio"
          aria-checked={theme === t}
          onClick={() => apply(t)}
          className={`metadata px-2.5 py-1.5 transition-colors duration-200 ${
            theme === t ? "bg-accent !text-silo" : "hover:!text-foreground"
          }`}
        >
          {t === "og" ? "☾ OG" : "☀ Light"}
        </button>
      ))}
    </div>
  );
}
