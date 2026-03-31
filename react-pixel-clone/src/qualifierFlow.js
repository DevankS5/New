export const QUALIFIER_FLOW_CONFIG = {
  eyebrowLabel: "CONSULTANTS & AGENCIES",
  intro: {
    title: "Let's See If You Qualify to Work With Us",
    copy: "This application will take 60 seconds. Start below:",
    ctaLabel: "Let's Start...",
  },
  pages: [
    {
      id: "contact-details",
      title: "Quick Qualification",
      copy: "Share your contact details so we can reach out quickly.",
      submitLabel: "Continue",
      fields: [
        {
          name: "fullName",
          label: "Full Name",
          type: "text",
          placeholder: "Your name",
          required: true,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "you@company.com",
          required: true,
        },
        {
          name: "phone",
          label: "WhatsApp Number",
          type: "tel",
          placeholder: "+91",
          required: true,
        },
      ],
    },
    {
      id: "business-fit",
      title: "Business Snapshot",
      copy: "Tell us your business stage and growth priority.",
      submitLabel: "Submit Application",
      fields: [
        {
          name: "businessType",
          label: "Business Type",
          type: "select",
          required: true,
          options: [
            { value: "", label: "Select" },
            { value: "Consultant", label: "Consultant" },
            { value: "Agency", label: "Agency" },
            { value: "Coach", label: "Coach" },
            { value: "Course Creator", label: "Course Creator" },
          ],
        },
        {
          name: "monthlyRevenue",
          label: "Monthly Revenue",
          type: "select",
          required: true,
          options: [
            { value: "", label: "Select" },
            { value: "Below 1L", label: "Below 1L" },
            { value: "1L - 5L", label: "1L - 5L" },
            { value: "5L - 15L", label: "5L - 15L" },
            { value: "15L+", label: "15L+" },
          ],
        },
        {
          name: "priority",
          label: "Primary Goal",
          type: "select",
          required: true,
          options: [
            { value: "", label: "Select" },
            { value: "More qualified calls", label: "More qualified calls" },
            { value: "Higher close rates", label: "Higher close rates" },
            { value: "Automation", label: "Automation" },
            { value: "End-to-end growth system", label: "End-to-end growth system" },
          ],
        },
      ],
    },
  ],
  success: {
    title: "You're In",
    copyTemplate:
      "Thanks, {firstName}. Your application is received. Our team will contact you within 24 hours.",
    ctaLabel: "Close",
  },
};

export function createInitialQualifierFormState(config = QUALIFIER_FLOW_CONFIG) {
  const allFields = config.pages.flatMap((page) => page.fields);
  return allFields.reduce((formState, field) => {
    formState[field.name] = field.defaultValue ?? "";
    return formState;
  }, {});
}

export function getQualifierProgress(screenIndex, config = QUALIFIER_FLOW_CONFIG) {
  const totalScreens = config.pages.length + 2;
  const rawProgress = ((screenIndex + 1) / totalScreens) * 100;
  return Math.round(Math.max(0, Math.min(100, rawProgress)));
}

export function getQualifierSuccessCopy(formState, config = QUALIFIER_FLOW_CONFIG) {
  const firstName = (formState.fullName || "").trim().split(/\s+/)[0] || "there";
  return config.success.copyTemplate.replace("{firstName}", firstName);
}
