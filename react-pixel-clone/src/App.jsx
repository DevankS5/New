import { useEffect, useMemo, useState } from "react";
import replicaMarkup from "./replica/replica.html?raw";
import {
  QUALIFIER_FLOW_CONFIG,
  createInitialQualifierFormState,
  getQualifierProgress,
} from "./qualifierFlow";

const HERO_WISTIA_EMBED_URL =
  "https://fast.wistia.net/embed/iframe/ihb2ztzkiw?seo=true&videoFoam=true";
const CAL_BOOKING_URL =
  "https://cal.com/orygin.ai/consultation?overlayCalendar=true";
const APPLY_CTA_PATTERN = /apply to work with us|apply today/i;
const TESTIMONIAL_IMAGE_PATHS = [
  "/assets/images/testimonial_1.jpg",
  "/assets/images/testimonial_2.jpg",
  "/assets/images/testimonial_3.jpg",
  "/assets/images/testimonial_4.jpg",
];

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
  const [isQualifierOpen, setIsQualifierOpen] = useState(false);
  const [qualifierScreenIndex, setQualifierScreenIndex] = useState(0);
  const [qualifierError, setQualifierError] = useState("");
  const [qualifierForm, setQualifierForm] = useState(() => createInitialQualifierFormState());
  const [isSubmittingFirstScreen, setIsSubmittingFirstScreen] = useState(false);

  const cleanedMarkup = useMemo(() => {
    const doc = new DOMParser().parseFromString(replicaMarkup, "text/html");
    const founderKeywords =
      /MEET THE FOUNDER(?:\s*&\s*CEO)?|Hey,\s*I'm\s*[^!]{1,60}!|Built By Someone Who's Actually Done It/i;
    const testimonialHeadingPattern =
      /What Our Clients Are Saying|Our Client(?:'|’)?s Result|Client Results?/i;

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

    const testimonialHeading = Array.from(doc.querySelectorAll("h1, h2, h3")).find(
      (heading) => testimonialHeadingPattern.test(heading.textContent || ""),
    );
    const testimonialSection =
      doc.querySelector("#section-NRzzCVGLQv") ||
      testimonialHeading?.closest('[id^="section-"]') ||
      null;

    if (testimonialSection) {
      const allTestimonialRows = Array.from(
        testimonialSection.querySelectorAll('[id^="row-"]'),
      );
      const videoTemplateRow = allTestimonialRows.find((row) =>
        row.querySelector(".c-video"),
      )?.cloneNode(true);

      if (videoTemplateRow) {
        const clearTemplateRow = (row) => {
          row
            .querySelectorAll(
              ".c-heading h1, .c-heading h2, .c-heading h3, .c-sub-heading h1, .c-sub-heading h2, .c-sub-heading h3, .c-sub-heading p, .c-paragraph p",
            )
            .forEach((node) => {
              node.textContent = "";
            });

          row
            .querySelectorAll(".c-heading, .c-sub-heading, .c-paragraph")
            .forEach((block) => {
              const text = (block.textContent || "").replace(/\u00a0/g, " ").trim();
              if (!text) {
                block.remove();
              }
            });

          row.querySelectorAll(".c-image").forEach((imageBlock) => {
            imageBlock.remove();
          });
        };

        const buildScreenshotRow = (rowId, images, startIndex) => {
          const row = videoTemplateRow.cloneNode(true);
          row.id = rowId;
          clearTemplateRow(row);

          const videoCards = Array.from(row.querySelectorAll(".c-video"));
          videoCards.forEach((videoCard, cardIndex) => {
            if (cardIndex >= images.length) {
              videoCard.remove();
              return;
            }

            const testimonialIndex = startIndex + cardIndex;
            videoCard.innerHTML = `
              <div class="testimonial-proof-embed">
                <img
                  src="${images[cardIndex]}"
                  alt="Client testimonial chat screenshot ${testimonialIndex + 1}"
                  loading="lazy"
                />
              </div>
            `;
          });

          return row;
        };

        const isLegacyTestimonialRow = (row) => {
          const hasQuote = Array.from(row.querySelectorAll(".c-paragraph p")).some((p) =>
            /["“]/.test(p.textContent || ""),
          );
          const hasMedia = Boolean(
            row.querySelector(".c-video, picture.hl-image-picture, .testimonial-proof-embed"),
          );

          return hasQuote || hasMedia;
        };

        const rowsToRemove = Array.from(
          testimonialSection.querySelectorAll('[id^="row-"]'),
        ).filter(isLegacyTestimonialRow);

        rowsToRemove.forEach((row) => row.remove());

        const firstRow = buildScreenshotRow(
          "row-custom-image-testimonials",
          TESTIMONIAL_IMAGE_PATHS.slice(0, 2),
          0,
        );
        const secondRow = buildScreenshotRow(
          "row-custom-image-testimonials-2",
          TESTIMONIAL_IMAGE_PATHS.slice(2, 4),
          2,
        );

        const testimonialCtaRow = Array.from(
          testimonialSection.querySelectorAll('[id^="row-"]'),
        ).find((row) => {
          const ctaButton = row.querySelector('button[id$="_btn"]');
          if (!(ctaButton instanceof HTMLButtonElement)) return false;

          const label = `${ctaButton.getAttribute("aria-label") || ""} ${
            ctaButton.textContent || ""
          }`;

          return APPLY_CTA_PATTERN.test(label);
        });

        if (testimonialCtaRow?.parentElement) {
          testimonialCtaRow.parentElement.insertBefore(firstRow, testimonialCtaRow);
          testimonialCtaRow.parentElement.insertBefore(secondRow, testimonialCtaRow);
        } else {
          testimonialSection.append(firstRow, secondRow);
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
        "box-sizing",
        "margin-left",
        "margin-right",
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
        button.style.setProperty("min-width", "0", "important");
        button.style.setProperty("max-width", "100%", "important");
        button.style.setProperty("height", height, "important");
        button.style.setProperty("min-height", height, "important");
        button.style.setProperty("max-height", height, "important");
        button.style.setProperty("padding", sourceComputedStyle.padding, "important");
        button.style.setProperty("font-size", sourceComputedStyle.fontSize, "important");
        button.style.setProperty("line-height", sourceComputedStyle.lineHeight, "important");
        button.style.setProperty("display", "inline-flex", "important");
        button.style.setProperty("align-items", "center", "important");
        button.style.setProperty("justify-content", "center", "important");
        button.style.setProperty("box-sizing", "border-box", "important");
        button.style.setProperty("margin-left", "auto", "important");
        button.style.setProperty("margin-right", "auto", "important");
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
  const isIntroScreen = qualifierScreenIndex === 0;
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

    if (field.type === "checkbox") {
      return value !== true;
    }

    return String(value ?? "").trim() === "";
  };

  const closeQualifier = () => {
    setIsQualifierOpen(false);
  };

  const continueToBookingPage = () => {
    closeQualifier();
    const bookingTab = window.open(CAL_BOOKING_URL, "_blank", "noopener,noreferrer");

    if (bookingTab) {
      bookingTab.opener = null;
    }
  };

  const startQualifierFlow = () => {
    setQualifierError("");
    if (questionPages.length === 0) {
      continueToBookingPage();
      return;
    }

    setQualifierScreenIndex(firstQuestionScreenIndex);
  };

  const goToPreviousQualifierScreen = () => {
    if (isSubmittingFirstScreen) return;
    setQualifierError("");
    setQualifierScreenIndex((prev) => Math.max(0, prev - 1));
  };

  const getFbTracking = () => {
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? match[2] : null;
    };
    const fbp = getCookie("_fbp") || null;
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    const fbc = fbclid ? `fb.1.${Date.now()}.${fbclid}` : null;
    return { fbp, fbc };
  };

  const getQueryParams = () => {
    const params = {};
    new URLSearchParams(window.location.search).forEach((value, key) => {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const existing = params[key];
        params[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
      } else {
        params[key] = value;
      }
    });
    return params;
  };

  const submitFirstScreenDetails = async () => {
    const fullName = String(qualifierForm.fullName ?? "").trim();
    const email = String(qualifierForm.email ?? "").trim();
    const isdCode = String(qualifierForm.isdCode ?? "+91").trim();
    const phone = String(qualifierForm.phone ?? "").trim();
    const userContact = `${isdCode}${phone}`.replace(/\+/g, "").replace(/\s+/g, "");

    const { fbp, fbc } = getFbTracking();

    const additionalInfo = {
      bestDescribes: qualifierForm.bestDescribes ?? "",
      monthlyRevenue: qualifierForm.monthlyRevenue ?? "",
      termsAccepted: qualifierForm.termsAccepted ?? false,
    };

    const response = await fetch("https://ivy.orygin.ai/leads/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_id: crypto.randomUUID(),
        user_name: fullName,
        user_contact: userContact,
        user_email: email,
        lead_source: "lp",
        fbp,
        fbc,
        query_params: getQueryParams(),
        additional_info: additionalInfo,
      }),
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

    const missingRequiredField = activeQuestionPage.fields.find((field) => {
      const value = qualifierForm[field.name];
      return isQualifierFieldMissing(field, value);
    });

    if (missingRequiredField) {
      setQualifierError(
        missingRequiredField.validationMessage ||
          "Please complete all required fields to continue.",
      );
      return;
    }

    const isFirstQuestionPage = activeQuestionPageIndex === 0;
    const shouldSubmitFirstScreen = activeQuestionPage.id === "contact-details";
    const isLastQuestionPage = activeQuestionPageIndex === questionPages.length - 1;
    setQualifierError("");

    if (isFirstQuestionPage && shouldSubmitFirstScreen) {
      setIsSubmittingFirstScreen(true);

      try {
        await submitFirstScreenDetails();
      } catch (error) {
        // Keep the flow non-blocking in development while backend/env is being configured.
        console.warn("Lead submission skipped:", error);
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

          {field.helperText ? (
            <p className="qualifier-helper-text">{field.helperText}</p>
          ) : null}
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

    if (field.type === "checkbox") {
      return (
        <label className={`${fieldClassName} qualifier-single-checkbox`} key={field.name}>
          <input
            id={fieldId}
            type="checkbox"
            name={field.name}
            checked={qualifierForm[field.name] === true}
            onChange={handleQualifierInput}
          />
          <span>{field.label}</span>
        </label>
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

          </section>
        </div>
      ) : null}
    </>
  );
}

export default App;
