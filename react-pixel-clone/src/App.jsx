import { useEffect } from "react";
import replicaMarkup from "./replica/replica.html?raw";

function getTimeLeft() {
  const now = new Date();
  const anchor = new Date(2025, 0, 1);
  const dayMs = 24 * 60 * 60 * 1000;
  const cycleMs = 5 * dayMs;
  const elapsed = now - anchor;
  const cycleProgress = ((elapsed % cycleMs) + cycleMs) % cycleMs;
  const left = cycleMs - cycleProgress;

  return {
    days: Math.floor(left / dayMs),
    hours: Math.floor((left % dayMs) / (1000 * 60 * 60)),
    minutes: Math.floor((left % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((left % (1000 * 60)) / 1000),
  };
}

function App() {
  useEffect(() => {
    const updateCountdown = () => {
      const time = getTimeLeft();
      document.querySelectorAll(".countdown-section").forEach((section) => {
        const d = section.querySelector(".cd-days");
        const h = section.querySelector(".cd-hours");
        const m = section.querySelector(".cd-minutes");
        const s = section.querySelector(".cd-seconds");
        if (d) d.textContent = String(time.days).padStart(2, "0");
        if (h) h.textContent = String(time.hours).padStart(2, "0");
        if (m) m.textContent = String(time.minutes).padStart(2, "0");
        if (s) s.textContent = String(time.seconds).padStart(2, "0");
      });
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timerId);
  }, []);

  return <div id="pixel-root" dangerouslySetInnerHTML={{ __html: replicaMarkup }} />;
}

export default App;
