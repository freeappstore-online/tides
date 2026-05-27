import { useEffect, useState } from "react";
import { LocationBar } from "./components/LocationBar";
import { MoonToday } from "./components/MoonToday";
import { UpcomingEvents } from "./components/UpcomingEvents";
import { RiseSet } from "./components/RiseSet";
import { TideChart } from "./components/TideChart";
import { MoonCalendar } from "./components/MoonCalendar";
import { PhaseCalculator } from "./components/PhaseCalculator";
import { DayLengthChart } from "./components/DayLengthChart";
import { EclipseList } from "./components/EclipseList";
import { Constellations } from "./components/Constellations";
import { loadLocation, type Location } from "./lib/location";

export default function App() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [location, setLocation] = useState<Location>(() => loadLocation());

  // Tick the clock every minute so all derived data stays fresh.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 pb-16 space-y-8">
        <LocationBar location={location} onChange={setLocation} />
        <MoonToday now={now} />
        <div className="grid lg:grid-cols-2 gap-6">
          <RiseSet now={now} location={location} />
          <UpcomingEvents now={now} />
        </div>
        <TideChart now={now} location={location} />
        <div className="grid lg:grid-cols-2 gap-6">
          <MoonCalendar />
          <PhaseCalculator />
        </div>
        <DayLengthChart location={location} year={now.getFullYear()} />
        <EclipseList now={now} />
        <Constellations now={now} location={location} />
        <Footer />
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 pb-6">
      <div className="flex items-center gap-3">
        <Logo />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            Moon &amp; Tides
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Lunar phases, sun &amp; moon rise/set, and tide estimates — all computed locally.
          </p>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        background: "linear-gradient(135deg, var(--accent), var(--cosmic))",
        boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width={24} height={24} fill="none">
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
          fill="white"
        />
      </svg>
    </div>
  );
}

function Footer() {
  return (
    <footer className="pt-6 text-center text-xs" style={{ color: "var(--muted)" }}>
      Astronomical calculations performed locally in your browser. No tracking,
      no network calls. Tide estimates are derived from lunar position only and
      are not suitable for navigation or safety-of-life use.
    </footer>
  );
}
