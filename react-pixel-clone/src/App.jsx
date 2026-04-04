import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
const TESTIMONIAL_IMAGE_PATHS = [
  "/assets/images/testimonial_1.jpg",
  "/assets/images/testimonial_4.jpg",
];
const BOOKING_PREFILL_STORAGE_KEY = "qualifierBookingPrefill";

function getTimeLeft() {
  const secondMs = 1000;
  const minuteMs = 60 * secondMs;
  const hourMs = 60 * minuteMs;
  const now = new Date();

  // Keep a visible zero state at the local 12:00 AM boundary.
  if (
    now.getHours() === 0 &&
    now.getMinutes() === 0 &&
    now.getSeconds() === 0
  ) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const safeLeft = Math.max(0, nextMidnight.getTime() - now.getTime());

  return {
    hours: Math.floor(safeLeft / hourMs),
    minutes: Math.floor((safeLeft % hourMs) / minuteMs),
    seconds: Math.floor((safeLeft % minuteMs) / secondMs),
  };
}

function App() {
  const navigate = useNavigate();
  const [isQualifierOpen, setIsQualifierOpen] = useState(false);
  const [qualifierScreenIndex, setQualifierScreenIndex] = useState(0);
  const [qualifierError, setQualifierError] = useState("");
  const [qualifierForm, setQualifierForm] = useState(() => createInitialQualifierFormState());
  const [isSubmittingFirstScreen, setIsSubmittingFirstScreen] = useState(false);

  const cleanedMarkup = useMemo(() => {
    const doc = new DOMParser().parseFromString(replicaMarkup, "text/html");
    const founderKeywords =
      /MEET THE FOUNDER(?:\s*&\s*CEO)?|Hey,\s*I'm\s*[^!]{1,60}!|Built By Someone Who's Actually Done It/i;
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
        videoTemplateRow.id = "row-custom-image-testimonials";

        videoTemplateRow
          .querySelectorAll(
            ".c-heading h1, .c-heading h2, .c-heading h3, .c-sub-heading h1, .c-sub-heading h2, .c-sub-heading h3, .c-sub-heading p, .c-paragraph p",
          )
          .forEach((node) => {
            node.textContent = "";
          });

        // Remove now-empty wrappers from the cloned row to prevent large blank gaps.
        videoTemplateRow
          .querySelectorAll(".c-heading, .c-sub-heading, .c-paragraph")
          .forEach((block) => {
            const text = (block.textContent || "").replace(/\u00a0/g, " ").trim();
            if (!text) {
              block.remove();
            }
          });

        // The cloned template includes star-rating image blocks we don't want
        // in screenshot testimonials.
        videoTemplateRow.querySelectorAll(".c-image").forEach((imageBlock) => {
          imageBlock.remove();
        });

        const videoCards = Array.from(videoTemplateRow.querySelectorAll(".c-video"));
        videoCards.slice(0, 2).forEach((videoCard, index) => {
          videoCard.innerHTML = `
            <div class="testimonial-proof-embed">
              <img
                src="${TESTIMONIAL_IMAGE_PATHS[index]}"
                alt="Client testimonial chat screenshot ${index + 1}"
                loading="lazy"
              />
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
            title="Orygin Hero Video"
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
      setIsSubmittingFirstScreen(false);
      setQualifierScreenIndex(0);
      setIsQualifierOpen(true);
    };

    root.addEventListener("click", onApplyClick, true);
    return () => root.removeEventListener("click", onApplyClick, true);
  }, [cleanedMarkup]);

  useEffect(() => {
    const root = document.getElementById("pixel-root");
    if (!root) return undefined;

    const isStickyBottomBarButton = (button) =>
      Boolean(button.closest("#section-5oa_veNL0R"));

    const resetSyncedButtonSize = (button) => {
      [
        "width",
        "min-width",
        "max-width",
        "height",
        "min-height",
        "max-height",
        "padding",
        "font-size",
        "line-height",
        "display",
        "align-items",
        "justify-content",
      ].forEach((property) => {
        button.style.removeProperty(property);
      });
    };

    const matchesApplyCta = (button) => {
      if (!(button instanceof HTMLButtonElement)) return false;

      const label = `${button.getAttribute("aria-label") || ""} ${
        button.textContent || ""
      }`;

      return APPLY_CTA_PATTERN.test(label);
    };

    const isMeasurable = (button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const getApplyButtons = () =>
      Array.from(root.querySelectorAll('button[id$="_btn"]')).filter(matchesApplyCta);

    const getHeroSourceButton = () => {
      const heroButtons = Array.from(
        root.querySelectorAll('#section-c6yJgt9wX button[id$="_btn"]'),
      ).filter(matchesApplyCta);

      return heroButtons.find(isMeasurable) || heroButtons[0] || null;
    };

    const syncApplyCtaSize = () => {
      const applyButtons = getApplyButtons();
      if (applyButtons.length === 0) return;

      const sourceButton =
        getHeroSourceButton() || applyButtons.find(isMeasurable) || applyButtons[0];
      if (!sourceButton) return;

      const sourceRect = sourceButton.getBoundingClientRect();

      if (sourceRect.width === 0 || sourceRect.height === 0) return;

      const sourceComputedStyle = window.getComputedStyle(sourceButton);
      const width = `${Math.round(sourceRect.width)}px`;
      const height = `${Math.round(sourceRect.height)}px`;

      applyButtons.forEach((button) => {
        if (button === sourceButton) return;

        if (isStickyBottomBarButton(button)) {
          // Keep the sticky bar CTA on its original responsive sizing.
          resetSyncedButtonSize(button);
          return;
        }

        button.style.setProperty("width", width, "important");
        button.style.setProperty("min-width", width, "important");
        button.style.setProperty("max-width", width, "important");
        button.style.setProperty("height", height, "important");
        button.style.setProperty("min-height", height, "important");
        button.style.setProperty("max-height", height, "important");
        button.style.setProperty("padding", sourceComputedStyle.padding, "important");
        button.style.setProperty("font-size", sourceComputedStyle.fontSize, "important");
        button.style.setProperty("line-height", sourceComputedStyle.lineHeight, "important");
        button.style.setProperty("display", "inline-flex", "important");
        button.style.setProperty("align-items", "center", "important");
        button.style.setProperty("justify-content", "center", "important");
      });
    };

    syncApplyCtaSize();

    const rafId = window.requestAnimationFrame(syncApplyCtaSize);
    const timeoutId = window.setTimeout(syncApplyCtaSize, 250);
    const lateTimeoutId = window.setTimeout(syncApplyCtaSize, 1000);
    window.addEventListener("resize", syncApplyCtaSize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      window.clearTimeout(lateTimeoutId);
      window.removeEventListener("resize", syncApplyCtaSize);
    };
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
  const displayedProgress = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        typeof activeQuestionPage?.progressValue === "number"
          ? activeQuestionPage.progressValue
          : qualifierProgress,
      ),
    ),
  );
  const shouldShowProgressMeta = Boolean(activeQuestionPage?.showProgressMeta);
  const progressMetaLabel = activeQuestionPage?.progressLabel || "Progress";
  const isFirstScreenSubmissionPending =
    isSubmittingFirstScreen && activeQuestionPageIndex === 0;

  const handleQualifierInput = (event) => {
    const { name, value, type, checked } = event.target;
    setQualifierForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleQualifierOptionToggle = (fieldName, optionValue) => {
    setQualifierForm((prev) => {
      const currentValues = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
      const isSelected = currentValues.includes(optionValue);
      const nextValues = isSelected
        ? currentValues.filter((value) => value !== optionValue)
        : [...currentValues, optionValue];

      return {
        ...prev,
        [fieldName]: nextValues,
      };
    });
  };

  const isQualifierFieldMissing = (field, value) => {
    if (!field.required) return false;

    if (field.type === "checkbox-group") {
      return !Array.isArray(value) || value.length === 0;
    }

    return String(value ?? "").trim() === "";
  };

  const closeQualifier = () => {
    setIsQualifierOpen(false);
  };

  const continueToBookingPage = () => {
    const bookingPrefill = {
      fullName: String(qualifierForm.fullName ?? "").trim(),
      email: String(qualifierForm.email ?? "").trim(),
    };

    try {
      window.sessionStorage.setItem(
        BOOKING_PREFILL_STORAGE_KEY,
        JSON.stringify(bookingPrefill),
      );
    } catch {
      // Booking should still work even if storage is unavailable.
    }

    setIsQualifierOpen(false);
    navigate("/book-call");
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
    if (isSubmittingFirstScreen) return;
    setQualifierError("");
    setQualifierScreenIndex((prev) => Math.max(0, prev - 1));
  };

  const submitFirstScreenDetails = async () => {
    const payload = {
      fullName: String(qualifierForm.fullName ?? "").trim(),
      emailAddress: String(qualifierForm.email ?? "").trim(),
      whatsAppNumber: String(qualifierForm.phone ?? "").trim(),
      designationInCompany: String(qualifierForm.designation ?? "").trim(),
      comfortableTimeForCommunication: String(qualifierForm.communicationTime ?? "").trim(),
    };

    const response = await fetch("/api/qualifier/first-screen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) return;

    let message = "Unable to save your details right now. Please try again.";

    try {
      const responseBody = await response.json();
      if (responseBody?.error) {
        message = responseBody.error;
      }
    } catch {
      // Keep fallback error message.
    }

    throw new Error(message);
  };

  const handleQualifierPageSubmit = async (event) => {
    event.preventDefault();
    if (!activeQuestionPage || isSubmittingFirstScreen) return;

    const hasMissingRequiredField = activeQuestionPage.fields.some((field) => {
      const value = qualifierForm[field.name];
      return isQualifierFieldMissing(field, value);
    });

    if (hasMissingRequiredField) {
      setQualifierError("Please complete all required fields to continue.");
      return;
    }

    const isFirstQuestionPage = activeQuestionPageIndex === 0;
    const isLastQuestionPage = activeQuestionPageIndex === questionPages.length - 1;
    setQualifierError("");

    if (isFirstQuestionPage) {
      setIsSubmittingFirstScreen(true);

      try {
        await submitFirstScreenDetails();
      } catch (error) {
        // Keep the flow non-blocking in development while backend/env is being configured.
        console.warn("First-screen Mongo save skipped:", error);
      } finally {
        setIsSubmittingFirstScreen(false);
      }
    }

    if (isLastQuestionPage) {
      continueToBookingPage();
      return;
    }

    setQualifierScreenIndex((prev) => prev + 1);
  };

  const renderQualifierField = (field) => {
    const fieldId = `qualifier-field-${field.name}`;
    const fieldClassName = `qualifier-field${field.fullWidth ? " qualifier-field--full" : ""}`;
    const labelText = (
      <span>
        {field.label}
        {field.required ? (
          <span className="qualifier-required-indicator" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
    );

    if (field.type === "radio") {
      const isScaleVariant = field.variant === "scale";
      const radioGridClassName = `qualifier-radio-grid${
        isScaleVariant ? " qualifier-radio-grid--scale" : ""
      }`;

      return (
        <fieldset className={`${fieldClassName} qualifier-fieldset`} key={field.name}>
          <legend>{labelText}</legend>

          <div className={radioGridClassName}>
            {(field.options || []).map((option) => {
              const normalizedOptionValue = String(option.value || "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
              const optionId = `${fieldId}-${normalizedOptionValue || "option"}`;
              const isSelected = (qualifierForm[field.name] ?? "") === option.value;
              const optionClassName = `qualifier-radio-option${
                isScaleVariant ? " qualifier-radio-option--scale" : ""
              }${isSelected ? " is-selected" : ""}${
                option.fullWidth ? " qualifier-option--full" : ""
              }`;

              return (
                <label
                  className={optionClassName}
                  htmlFor={optionId}
                  key={`${field.name}-${option.value}`}
                >
                  <input
                    id={optionId}
                    type="radio"
                    name={field.name}
                    value={option.value}
                    checked={isSelected}
                    onChange={handleQualifierInput}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      );
    }

    if (field.type === "checkbox-group") {
      const selectedValues = Array.isArray(qualifierForm[field.name])
        ? qualifierForm[field.name]
        : [];

      return (
        <fieldset className={`${fieldClassName} qualifier-fieldset`} key={field.name}>
          <legend>{labelText}</legend>

          <div className="qualifier-checkbox-grid">
            {(field.options || []).map((option) => {
              const normalizedOptionValue = String(option.value || "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
              const optionId = `${fieldId}-${normalizedOptionValue || "option"}`;
              const isSelected = selectedValues.includes(option.value);
              const optionClassName = `qualifier-checkbox-option${isSelected ? " is-selected" : ""}${option.fullWidth ? " qualifier-option--full" : ""}`;

              return (
                <label
                  className={optionClassName}
                  htmlFor={optionId}
                  key={`${field.name}-${option.value}`}
                >
                  <input
                    id={optionId}
                    type="checkbox"
                    name={field.name}
                    value={option.value}
                    checked={isSelected}
                    onChange={() => handleQualifierOptionToggle(field.name, option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      );
    }

    if (field.type === "select") {
      return (
        <label className={fieldClassName} key={field.name}>
          {labelText}
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

    if (field.type === "textarea") {
      return (
        <label className={fieldClassName} key={field.name}>
          {labelText}
          <textarea
            id={fieldId}
            name={field.name}
            placeholder={field.placeholder || ""}
            value={qualifierForm[field.name] ?? ""}
            onChange={handleQualifierInput}
            rows={field.rows || 4}
          />
        </label>
      );
    }

    return (
      <label className={fieldClassName} key={field.name}>
        {labelText}
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

            {activeQuestionPage && shouldShowProgressMeta ? (
              <div className="qualifier-progress-meta" aria-hidden="true">
                <span>{progressMetaLabel}</span>
                <span>{displayedProgress}%</span>
              </div>
            ) : null}

            <div className="qualifier-progress-shell" aria-hidden="true">
              <div
                className="qualifier-progress-fill"
                style={{ width: `${displayedProgress}%` }}
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
              </div>
            ) : null}

            {activeQuestionPage ? (
              <div className="qualifier-step">
                <div className="qualifier-heading-row">
                  <h2 id="qualifier-title">{activeQuestionPage.title}</h2>
                  {activeQuestionPage.titleBadge ? (
                    <span className="qualifier-title-badge">{activeQuestionPage.titleBadge}</span>
                  ) : null}
                </div>
                <p className="qualifier-copy">{activeQuestionPage.copy}</p>

                {activeQuestionPage.messagePanel ? (
                  <div className="qualifier-message-panel">
                    {(activeQuestionPage.messagePanel.lines || []).map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    {activeQuestionPage.messagePanel.emphasis ? (
                      <p className="qualifier-message-panel-emphasis">
                        {activeQuestionPage.messagePanel.emphasis}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <form className="qualifier-form" onSubmit={handleQualifierPageSubmit}>
                  <div className="qualifier-field-grid">
                    {activeQuestionPage.fields.map((field) => renderQualifierField(field))}
                  </div>

                  {qualifierError ? <p className="qualifier-error">{qualifierError}</p> : null}

                  <div className="qualifier-actions">
                    <button
                      type="button"
                      className="qualifier-back-btn"
                      disabled={isFirstScreenSubmissionPending}
                      onClick={goToPreviousQualifierScreen}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="qualifier-submit-btn"
                      disabled={isFirstScreenSubmissionPending}
                    >
                      {isFirstScreenSubmissionPending
                        ? "Saving..."
                        : activeQuestionPage.submitLabel || "Continue"}
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

                <button
                  type="button"
                  className="qualifier-submit-btn"
                  onClick={continueToBookingPage}
                >
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
