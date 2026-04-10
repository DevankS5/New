import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./booking.css";

const BOOKING_PREFILL_STORAGE_KEY = "qualifierBookingPrefill";
const DEFAULT_CAL_NAMESPACE = "orygin-strategy-call";

function normalizeCalEmbedInput(rawCalLink, rawCalOrigin) {
  const cleanedCalLink = String(rawCalLink ?? "").trim();
  const explicitCalOrigin = String(rawCalOrigin ?? "").trim();

  if (!cleanedCalLink) {
    return {
      calLink: "",
      calOrigin: explicitCalOrigin || undefined,
    };
  }

  if (/^https?:\/\//i.test(cleanedCalLink)) {
    try {
      const parsedUrl = new URL(cleanedCalLink);
      const normalizedPath = `${parsedUrl.pathname}${parsedUrl.search}`
        .replace(/^\/+/, "")
        .replace(/\/+$/, "");

      return {
        calLink: normalizedPath,
        calOrigin: explicitCalOrigin || `${parsedUrl.protocol}//${parsedUrl.host}`,
      };
    } catch {
      // Fall back to raw value if URL parsing fails.
    }
  }

  return {
    calLink: cleanedCalLink.replace(/^\/+/, ""),
    calOrigin: explicitCalOrigin || undefined,
  };
}

function readBookingPrefill() {
  if (typeof window === "undefined") {
    return {
      fullName: "",
      email: "",
    };
  }

  try {
    const rawValue = window.sessionStorage.getItem(BOOKING_PREFILL_STORAGE_KEY);
    if (!rawValue) {
      return {
        fullName: "",
        email: "",
      };
    }

    const parsedValue = JSON.parse(rawValue);
    return {
      fullName: String(parsedValue?.fullName ?? "").trim(),
      email: String(parsedValue?.email ?? "").trim(),
    };
  } catch {
    return {
      fullName: "",
      email: "",
    };
  }
}

function BookingPage() {
  const [prefill, setPrefill] = useState({ fullName: "", email: "" });
  const [isCompactViewport, setIsCompactViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 900px)").matches;
  });
  const { calLink, calOrigin } = useMemo(
    () =>
      normalizeCalEmbedInput(
        import.meta.env.VITE_CAL_LINK,
        import.meta.env.VITE_CAL_ORIGIN,
      ),
    [],
  );
  const calNamespace =
    String(import.meta.env.VITE_CAL_NAMESPACE ?? "").trim() || DEFAULT_CAL_NAMESPACE;

  useEffect(() => {
    setPrefill(readBookingPrefill());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const onViewportChange = (event) => {
      setIsCompactViewport(event.matches);
    };

    setIsCompactViewport(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onViewportChange);
      return () => mediaQuery.removeEventListener("change", onViewportChange);
    }

    mediaQuery.addListener(onViewportChange);
    return () => mediaQuery.removeListener(onViewportChange);
  }, []);

  useEffect(() => {
    if (!calLink) return;

    (async function configureCalEmbedUi() {
      const cal = await getCalApi({ namespace: calNamespace });
      cal("ui", {
        theme: "dark",
        layout: isCompactViewport ? "column_view" : "month_view",
        hideEventTypeDetails: false,
        styles: {
          body: {
            background: "#0b0b0b",
          },
          branding: {
            brandColor: "#ffc107",
            lightColor: "#1d1d1d",
            lighterColor: "#2a2a2a",
            lightestColor: "#353535",
          },
        },
      });
    })();
  }, [calLink, calNamespace, isCompactViewport]);

  const calConfig = useMemo(() => {
    const config = {
      theme: "dark",
      layout: isCompactViewport ? "column_view" : "month_view",
      useSlotsViewOnSmallScreen: true,
      "cal.embed.pageType": "user.event.booking.slots",
      notes: "Lead from ORYGIN.AI qualification flow",
    };

    if (prefill.fullName) {
      config.name = prefill.fullName;
    }

    if (prefill.email) {
      config.email = prefill.email;
    }

    return config;
  }, [prefill, isCompactViewport]);

  return (
    <main className="booking-page">
      <div className="booking-page__container">
        <div className="booking-progress-head" aria-hidden="true">
          <span>Almost Done...</span>
          <div className="booking-progress-track">
            <div className="booking-progress-fill" />
          </div>
        </div>

        <header className="booking-page__header">
          <h1>You&apos;re One Step Away. </h1>
          <p>
            In 30 minutes, the Orygin AI team will map out exactly how to get you qualified
            calls each month and tell you honestly if we&apos;re the right fit.
          </p>
        </header>

        <ul className="booking-benefits" aria-label="Call benefits">
          <li>Normally Rs. 1500, today Rs. 0 (Free)</li>
          <li>You leave with a clear action plan either way</li>
          <li>No pitch pressure</li>
        </ul>

        <section className="booking-scheduler-card">
          <aside className="booking-scheduler-info">
            <div className="booking-brand-mark" aria-hidden="true">
              Orygin AI
            </div>
            <h2>Book Orygin AI Strategy Call</h2>
            <p className="booking-scheduler-info__meta">45 mins</p>
            <p className="booking-scheduler-info__meta">
              One-to-one with an Orygin AI growth strategist
            </p>
            <p className="booking-scheduler-info__copy">
              We will audit your positioning, identify revenue leaks, and give you a practical
              roadmap you can execute immediately.
            </p>
            {prefill.fullName || prefill.email ? (
              <p className="booking-scheduler-info__prefill">
                Booking as: {[prefill.fullName, prefill.email].filter(Boolean).join(" | ")}
              </p>
            ) : null}
          </aside>

          <div className="booking-scheduler-embed">
            {calLink ? (
              <Cal
                namespace={calNamespace}
                calOrigin={calOrigin}
                calLink={calLink}
                className="booking-cal-frame"
                config={calConfig}
              />
            ) : (
              <div className="booking-missing-cal-link" role="status">
                <h3>Cal.com is almost ready</h3>
                <p>
                  Add your event link in the environment file to enable live booking on this page.
                </p>
                <p className="booking-missing-cal-link__code">
                  VITE_CAL_LINK=your-username/your-event-slug or full booking URL
                </p>
                <Link className="booking-back-home" to="/">
                  Back to home page
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default BookingPage;
