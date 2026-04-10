export const QUALIFIER_FLOW_CONFIG = {
  eyebrowLabel: "CONSULTANTS & AGENCIES",
  intro: {
    title: "Let's See If You Qualify to Work With Us",
    copy: "This application will take 60 seconds. Start below:",
    ctaLabel: "Let's Start...",
  },
  pages: [
    {
      id: "quick-qualification",
      title: "Quick Qualification Check",
      copy: "Answer these two questions to continue.",
      submitLabel: "Continue",
      fields: [
        {
          name: "bestDescribes",
          label: "Q1. What best describes you?",
          type: "radio",
          required: true,
          fullWidth: true,
          options: [
            { value: "Agency Owner", label: "Agency Owner" },
            { value: "Coach", label: "Coach" },
            { value: "Consultant", label: "Consultant" },
          ],
        },
        {
          name: "monthlyRevenue",
          label: "Q2. Your Current Monthly Revenue",
          type: "radio",
          required: true,
          fullWidth: true,
          helperText: "If you earn less than 2 lakh, do not fill this form.",
          options: [
            { value: "2-5 lakh", label: "2-5 lacs" },
            { value: "5-8 lakh", label: "5-8 lacs" },
            { value: "8-12 lakh", label: "8-12 lacs" },
            { value: "12+ lakh", label: "12+ lacs" },
          ],
        },
      ],
    },
    {
      id: "contact-details",
      title: "Contact Details",
      copy: "Please fill in your details to continue.",
      submitLabel: "Continue to Booking",
      fields: [
        {
          name: "fullName",
          label: "Full Name",
          type: "text",
          placeholder: "Enter your full name",
          required: true,
          fullWidth: true,
        },
        {
          name: "phone",
          label: "Phone",
          type: "tel",
          placeholder: "98765 43219",
          required: true,
          fullWidth: true,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "you@gmail.com",
          required: true,
          fullWidth: true,
        },
        {
          name: "termsAccepted",
          label:
            "I agree to terms & conditions provided by the company. By providing my phone number, I agree to receive text messages from the business.",
          type: "checkbox",
          required: true,
          fullWidth: true,
          validationMessage: "Please accept the terms and conditions",
        },
      ],
    },
  ],
  success: {
    title: "Application Received",
    copyTemplate:
      "Thanks, {firstName}. Your application is received. Continue below to book your free strategy call.",
    ctaLabel: "Continue to Booking",
  },
};

export function createInitialQualifierFormState(config = QUALIFIER_FLOW_CONFIG) {
  const allFields = config.pages.flatMap((page) => page.fields);
  return allFields.reduce((formState, field) => {
    if (field.defaultValue !== undefined) {
      formState[field.name] = field.defaultValue;
      return formState;
    }

    if (field.type === "checkbox-group") {
      formState[field.name] = [];
      return formState;
    }

    if (field.type === "checkbox") {
      formState[field.name] = false;
      return formState;
    }

    formState[field.name] = "";
    return formState;
  }, {});
}

export function getQualifierProgress(screenIndex, config = QUALIFIER_FLOW_CONFIG) {
  const totalScreens = config.pages.length + 1;
  const rawProgress = ((screenIndex + 1) / totalScreens) * 100;
  return Math.round(Math.max(0, Math.min(100, rawProgress)));
}

export function getQualifierSuccessCopy(formState, config = QUALIFIER_FLOW_CONFIG) {
  const firstName = (formState.fullName || "").trim().split(/\s+/)[0] || "there";
  return config.success.copyTemplate.replace("{firstName}", firstName);
}
