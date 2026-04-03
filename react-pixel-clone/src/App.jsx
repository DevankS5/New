import { useEffect, useMemo, useState } from "react";
import replicaMarkup from "./replica/replica.html?raw";
import {
  QUALIFIER_FLOW_CONFIG,
  createInitialQualifierFormState,
  getQualifierProgress,
  getQualifierSuccessCopy,
} from "./qualifierFlow";

const HERO_WISTIA_EMBED_URL =
  "https://fast.wistia.net/embed/iframe/68l35pjer0?seo=true&videoFoam=true";
const APPLY_CTA_PATTERN = /apply to work with us|apply today/i;
const TESTIMONIAL_WISTIA_EMBED_URL =
  "https://fast.wistia.net/embed/iframe/68l35pjer0?seo=true&videoFoam=true";

function getTimeLeft() {
  const secondMs = 1000;
  const minuteMs = 60 * secondMs;
  const hourMs = 60 * minuteMs;
  const cycleMs = 24 * hourMs;
  const anchorMs = Date.UTC(2025, 0, 1, 0, 0, 0);
  const elapsed = Date.now() - anchorMs;
  const cycleProgress = ((elapsed % cycleMs) + cycleMs) % cycleMs;
  const left = cycleMs - cycleProgress;
  const safeLeft = left === cycleMs ? cycleMs - secondMs : left;

  return {
    hours: Math.floor(safeLeft / hourMs),
    minutes: Math.floor((safeLeft % hourMs) / minuteMs),
    seconds: Math.floor((safeLeft % minuteMs) / secondMs),
  };
}

function App() {
  const [isQualifierOpen, setIsQualifierOpen] = useState(false);
  const [qualifierScreenIndex, setQualifierScreenIndex] = useState(0);
  const [qualifierError, setQualifierError] = useState("");
  const [qualifierForm, setQualifierForm] = useState(() => createInitialQualifierFormState());

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

    const onboardingLockPattern = /🔒\s*Onboarding Closes In:/i;
    doc.querySelectorAll("strong, p").forEach((node) => {
      const text = node.textContent || "";
      if (onboardingLockPattern.test(text)) {
        node.textContent = text.replace(/🔒\s*/g, "").trim();
      }
    });

    doc.querySelectorAll(".countdown-section").forEach((section) => {
      const dayUnit = section.querySelector(".cd-days")?.closest(".timer-unit");
      if (dayUnit) {
        dayUnit.remove();
      }
    });

    return doc.body.innerHTML || replicaMarkup;
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const time = getTimeLeft();
      document.querySelectorAll(".countdown-section").forEach((section) => {
        const h = section.querySelector(".cd-hours");
        const m = section.querySelector(".cd-minutes");
        const s = section.querySelector(".cd-seconds");
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
      setQualifierForm(createInitialQualifierFormState());
      setQualifierError("");
      setQualifierScreenIndex(0);
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

  const questionPages = QUALIFIER_FLOW_CONFIG.pages;
  const firstQuestionScreenIndex = 1;
  const successScreenIndex = questionPages.length + 1;
  const isIntroScreen = qualifierScreenIndex === 0;
  const isSuccessScreen = qualifierScreenIndex === successScreenIndex;
  const activeQuestionPageIndex = qualifierScreenIndex - 1;
  const activeQuestionPage = questionPages[activeQuestionPageIndex] ?? null;
  const qualifierProgress = getQualifierProgress(qualifierScreenIndex, QUALIFIER_FLOW_CONFIG);

  const handleQualifierInput = (event) => {
    const { name, value, type, checked } = event.target;
    setQualifierForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const closeQualifier = () => {
    setIsQualifierOpen(false);
  };

  const startQualifierFlow = () => {
    setQualifierError("");
    if (questionPages.length === 0) {
      setQualifierScreenIndex(successScreenIndex);
      return;
    }

    setQualifierScreenIndex(firstQuestionScreenIndex);
  };

  const goToPreviousQualifierScreen = () => {
    setQualifierError("");
    setQualifierScreenIndex((prev) => Math.max(0, prev - 1));
  };

  const handleQualifierPageSubmit = (event) => {
    event.preventDefault();
    if (!activeQuestionPage) return;

    const hasMissingRequiredField = activeQuestionPage.fields.some((field) => {
      if (!field.required) return false;
      const value = qualifierForm[field.name];
      return String(value ?? "").trim() === "";
    });

    if (hasMissingRequiredField) {
      setQualifierError("Please complete all required fields to continue.");
      return;
    }

    const isLastQuestionPage = activeQuestionPageIndex === questionPages.length - 1;
    setQualifierError("");

    if (isLastQuestionPage) {
      setQualifierScreenIndex(successScreenIndex);
      return;
    }

    setQualifierScreenIndex((prev) => prev + 1);
  };

  const renderQualifierField = (field) => {
    const fieldId = `qualifier-field-${field.name}`;
    const fieldClassName = `qualifier-field${field.fullWidth ? " qualifier-field--full" : ""}`;

    if (field.type === "select") {
      return (
        <label className={fieldClassName} key={field.name}>
          <span>{field.label}</span>
          <select
            id={fieldId}
            name={field.name}
            value={qualifierForm[field.name] ?? ""}
            onChange={handleQualifierInput}
          >
            {(field.options || []).map((option) => (
              <option key={`${field.name}-${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    return (
      <label className={fieldClassName} key={field.name}>
        <span>{field.label}</span>
        <input
          id={fieldId}
          name={field.name}
          type={field.type || "text"}
          placeholder={field.placeholder || ""}
          value={qualifierForm[field.name] ?? ""}
          onChange={handleQualifierInput}
        />
      </label>
    );
  };

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

            <p className="qualifier-eyebrow">{QUALIFIER_FLOW_CONFIG.eyebrowLabel}</p>

            <div className="qualifier-progress-shell" aria-hidden="true">
              <div
                className="qualifier-progress-fill"
                style={{ width: `${qualifierProgress}%` }}
              />
            </div>

            {isIntroScreen ? (
              <div className="qualifier-step">
                <h2 id="qualifier-title">{QUALIFIER_FLOW_CONFIG.intro.title}</h2>
                <p className="qualifier-copy">{QUALIFIER_FLOW_CONFIG.intro.copy}</p>

                <button
                  type="button"
                  className="qualifier-progress-trigger"
                  onClick={startQualifierFlow}
                >
                  {QUALIFIER_FLOW_CONFIG.intro.ctaLabel}
                </button>

                <div className="qualifier-preview-box" aria-hidden="true" />
              </div>
            ) : null}

            {activeQuestionPage ? (
              <div className="qualifier-step">
                <h2 id="qualifier-title">{activeQuestionPage.title}</h2>
                <p className="qualifier-copy">{activeQuestionPage.copy}</p>

                <form className="qualifier-form" onSubmit={handleQualifierPageSubmit}>
                  <div className="qualifier-field-grid">
                    {activeQuestionPage.fields.map((field) => renderQualifierField(field))}
                  </div>

                  {qualifierError ? <p className="qualifier-error">{qualifierError}</p> : null}

                  <div className="qualifier-actions">
                    <button
                      type="button"
                      className="qualifier-back-btn"
                      onClick={goToPreviousQualifierScreen}
                    >
                      Back
                    </button>

                    <button type="submit" className="qualifier-submit-btn">
                      {activeQuestionPage.submitLabel || "Continue"}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {isSuccessScreen ? (
              <div className="qualifier-step qualifier-step-success">
                <h2 id="qualifier-title">{QUALIFIER_FLOW_CONFIG.success.title}</h2>
                <p className="qualifier-copy">
                  {getQualifierSuccessCopy(qualifierForm, QUALIFIER_FLOW_CONFIG)}
                </p>

                <button type="button" className="qualifier-submit-btn" onClick={closeQualifier}>
                  {QUALIFIER_FLOW_CONFIG.success.ctaLabel}
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
