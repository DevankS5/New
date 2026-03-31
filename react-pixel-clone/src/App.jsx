import { useEffect, useMemo, useState } from "react";
import replicaMarkup from "./replica/replica.html?raw";

const HERO_WISTIA_EMBED_URL =
  "https://fast.wistia.net/embed/iframe/68l35pjer0?seo=true&videoFoam=true";
const APPLY_CTA_PATTERN = /apply to work with us|apply today/i;
const TESTIMONIAL_WISTIA_EMBED_URL =
  "https://fast.wistia.net/embed/iframe/68l35pjer0?seo=true&videoFoam=true";

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
  const [isQualifierOpen, setIsQualifierOpen] = useState(false);
  const [qualifierStep, setQualifierStep] = useState(0);
  const [qualifierError, setQualifierError] = useState("");
  const [qualifierForm, setQualifierForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessType: "",
    monthlyRevenue: "",
    priority: "",
  });

  const cleanedMarkup = useMemo(() => {
    const doc = new DOMParser().parseFromString(replicaMarkup, "text/html");
    const founderKeywords =
      /MEET THE FOUNDER & CEO|Hey, I'm Vinay Jain!|Built By Someone Who's Actually Done It/i;
    const testimonialHeadingPattern = /What Our Clients Are Saying/i;

    const founderSections = Array.from(
      doc.querySelectorAll('[id^="section-"], .c-section'),
    ).filter((section) => founderKeywords.test(section.textContent || ""));

    if (founderSections.length > 0) {
      founderSections.forEach((section) => section.remove());
    } else {
      // Fallback if section wrappers differ in a future snapshot.
      doc.querySelectorAll('[id^="row-"]').forEach((row) => {
        if (founderKeywords.test(row.textContent || "")) {
          row.remove();
        }
      });
    }

    const testimonialHeading = Array.from(doc.querySelectorAll("h1, h2")).find(
      (heading) => testimonialHeadingPattern.test(heading.textContent || ""),
    );
    const testimonialSection = testimonialHeading?.closest('[id^="section-"]');

    if (testimonialSection) {
      const allTestimonialRows = Array.from(
        testimonialSection.querySelectorAll('[id^="row-"]'),
      );
      const videoTemplateRow = allTestimonialRows.find((row) =>
        row.querySelector(".c-video"),
      )?.cloneNode(true);

      allTestimonialRows.forEach((row) => {
        if (row.querySelector(".c-video")) {
          row.remove();
        }
      });

      const testimonialRows = Array.from(
        testimonialSection.querySelectorAll('[id^="row-"]'),
      ).filter((row) => {
        const hasQuote = Array.from(row.querySelectorAll(".c-paragraph p")).some((p) =>
          /["“]/.test(p.textContent || ""),
        );
        const cardCount = row.querySelectorAll('.c-column[id^="col-"]').length;
        return hasQuote && cardCount >= 2;
      });

      const imageRows = testimonialRows.filter((row) =>
        row.querySelector("picture.hl-image-picture"),
      );
      const textRows = testimonialRows.filter(
        (row) => !row.querySelector("picture.hl-image-picture"),
      );

      textRows.slice(1).forEach((row) => row.remove());
      imageRows.slice(1).forEach((row) => row.remove());

      if (videoTemplateRow) {
        videoTemplateRow.id = "row-custom-wistia-testimonials";

        videoTemplateRow
          .querySelectorAll(
            ".c-heading h1, .c-heading h2, .c-heading h3, .c-paragraph p",
          )
          .forEach((node) => {
            node.textContent = "";
          });

        const videoCards = Array.from(videoTemplateRow.querySelectorAll(".c-video"));
        videoCards.slice(0, 2).forEach((videoCard, index) => {
          videoCard.innerHTML = `
            <div class="testimonial-wistia-embed">
              <iframe
                src="${TESTIMONIAL_WISTIA_EMBED_URL}"
                title="Testimonial Video ${index + 1}"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
          `;
        });
        videoCards.slice(2).forEach((videoCard) => videoCard.remove());

        const keptRows = Array.from(testimonialSection.querySelectorAll('[id^="row-"]')).filter(
          (row) => row === textRows[0] || row === imageRows[0],
        );
        const insertionAnchor = keptRows[keptRows.length - 1];

        if (insertionAnchor) {
          insertionAnchor.after(videoTemplateRow);
        } else {
          testimonialSection.append(videoTemplateRow);
        }
      }
    }

    const heroVideoContainer = doc.querySelector(
      "#section-c6yJgt9wX #custom-code-UMFrOApM0E .custom-code-container",
    );

    if (heroVideoContainer) {
      heroVideoContainer.innerHTML = `
        <div class="hero-wistia-embed">
          <iframe
            src="${HERO_WISTIA_EMBED_URL}"
            title="TeachLoop Hero Video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      `;
    }

    return doc.body.innerHTML || replicaMarkup;
  }, []);

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

  useEffect(() => {
    const root = document.getElementById("pixel-root");
    if (!root) return undefined;

    const onApplyClick = (event) => {
      const trigger =
        event.target instanceof Element ? event.target.closest("button") : null;
      if (!trigger) return;

      const triggerLabel = `${trigger.getAttribute("aria-label") || ""} ${
        trigger.textContent || ""
      }`;

      if (!APPLY_CTA_PATTERN.test(triggerLabel)) return;

      event.preventDefault();
      event.stopPropagation();
      setQualifierForm({
        fullName: "",
        email: "",
        phone: "",
        businessType: "",
        monthlyRevenue: "",
        priority: "",
      });
      setQualifierError("");
      setQualifierStep(0);
      setIsQualifierOpen(true);
    };

    root.addEventListener("click", onApplyClick, true);
    return () => root.removeEventListener("click", onApplyClick, true);
  }, [cleanedMarkup]);

  useEffect(() => {
    if (!isQualifierOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setIsQualifierOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [isQualifierOpen]);

  const handleQualifierInput = (event) => {
    const { name, value } = event.target;
    setQualifierForm((prev) => ({ ...prev, [name]: value }));
  };

  const closeQualifier = () => {
    setIsQualifierOpen(false);
  };

  const handleQualifierSubmit = (event) => {
    event.preventDefault();

    const requiredValues = [
      qualifierForm.fullName,
      qualifierForm.email,
      qualifierForm.phone,
      qualifierForm.businessType,
      qualifierForm.monthlyRevenue,
      qualifierForm.priority,
    ];

    if (requiredValues.some((value) => value.trim() === "")) {
      setQualifierError("Please complete all fields to continue.");
      return;
    }

    setQualifierError("");
    setQualifierStep(2);
  };

  const qualifierProgress = qualifierStep === 0 ? 32 : qualifierStep === 1 ? 72 : 100;

  return (
    <>
      <div id="pixel-root" dangerouslySetInnerHTML={{ __html: cleanedMarkup }} />

      {isQualifierOpen ? (
        <div className="qualifier-overlay" onClick={closeQualifier}>
          <section
            className="qualifier-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qualifier-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="qualifier-close"
              aria-label="Close application popup"
              onClick={closeQualifier}
            >
              x
            </button>

            <p className="qualifier-eyebrow">CONSULTANTS & AGENCIES</p>

            <div className="qualifier-progress-shell" aria-hidden="true">
              <div
                className="qualifier-progress-fill"
                style={{ width: `${qualifierProgress}%` }}
              />
            </div>

            {qualifierStep === 0 ? (
              <div className="qualifier-step">
                <h2 id="qualifier-title">Let&apos;s See If You Qualify to Work With Us</h2>
                <p className="qualifier-copy">
                  This application will take 60 seconds.
                  <br />
                  Start below:
                </p>

                <button
                  type="button"
                  className="qualifier-progress-trigger"
                  onClick={() => setQualifierStep(1)}
                >
                  Let&apos;s Start...
                </button>

                <div className="qualifier-preview-box" aria-hidden="true" />
              </div>
            ) : null}

            {qualifierStep === 1 ? (
              <div className="qualifier-step">
                <h2 id="qualifier-title">Quick Qualification</h2>
                <p className="qualifier-copy">
                  Share a few details so our team can confirm fit and reach out quickly.
                </p>

                <form className="qualifier-form" onSubmit={handleQualifierSubmit}>
                  <div className="qualifier-field-grid">
                    <label className="qualifier-field">
                      <span>Full Name</span>
                      <input
                        name="fullName"
                        type="text"
                        placeholder="Your name"
                        value={qualifierForm.fullName}
                        onChange={handleQualifierInput}
                      />
                    </label>

                    <label className="qualifier-field">
                      <span>Email</span>
                      <input
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        value={qualifierForm.email}
                        onChange={handleQualifierInput}
                      />
                    </label>

                    <label className="qualifier-field">
                      <span>WhatsApp Number</span>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="+91"
                        value={qualifierForm.phone}
                        onChange={handleQualifierInput}
                      />
                    </label>

                    <label className="qualifier-field">
                      <span>Business Type</span>
                      <select
                        name="businessType"
                        value={qualifierForm.businessType}
                        onChange={handleQualifierInput}
                      >
                        <option value="">Select</option>
                        <option value="Consultant">Consultant</option>
                        <option value="Agency">Agency</option>
                        <option value="Coach">Coach</option>
                        <option value="Course Creator">Course Creator</option>
                      </select>
                    </label>

                    <label className="qualifier-field">
                      <span>Monthly Revenue</span>
                      <select
                        name="monthlyRevenue"
                        value={qualifierForm.monthlyRevenue}
                        onChange={handleQualifierInput}
                      >
                        <option value="">Select</option>
                        <option value="Below 1L">Below 1L</option>
                        <option value="1L - 5L">1L - 5L</option>
                        <option value="5L - 15L">5L - 15L</option>
                        <option value="15L+">15L+</option>
                      </select>
                    </label>

                    <label className="qualifier-field">
                      <span>Primary Goal</span>
                      <select
                        name="priority"
                        value={qualifierForm.priority}
                        onChange={handleQualifierInput}
                      >
                        <option value="">Select</option>
                        <option value="More qualified calls">More qualified calls</option>
                        <option value="Higher close rates">Higher close rates</option>
                        <option value="Automation">Automation</option>
                        <option value="End-to-end growth system">End-to-end growth system</option>
                      </select>
                    </label>
                  </div>

                  {qualifierError ? <p className="qualifier-error">{qualifierError}</p> : null}

                  <button type="submit" className="qualifier-submit-btn">
                    Submit Application
                  </button>
                </form>
              </div>
            ) : null}

            {qualifierStep === 2 ? (
              <div className="qualifier-step qualifier-step-success">
                <h2 id="qualifier-title">You&apos;re In</h2>
                <p className="qualifier-copy">
                  Thanks, {qualifierForm.fullName.split(" ")[0]}. Your application is received. Our
                  team will contact you within 24 hours.
                </p>

                <button type="button" className="qualifier-submit-btn" onClick={closeQualifier}>
                  Close
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}

export default App;
