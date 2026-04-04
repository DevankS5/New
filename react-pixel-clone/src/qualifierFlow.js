export const QUALIFIER_FLOW_CONFIG = {
  eyebrowLabel: "CONSULTANTS & AGENCIES",
  intro: {
    title: "Let's See If You Qualify to Work With Us",
    copy: "This application will take 60 seconds. Start below:",
    ctaLabel: "Let's Start...",
  },
  pages: [
    {
      id: "personal-information",
      title: "Personal Information",
      copy: "This section helps us keep communication smooth and maintain accurate records for our partnership.",
      submitLabel: "Continue",
      fields: [
        {
          name: "fullName",
          label: "Full Name",
          type: "text",
          placeholder: "John Doe",
          required: true,
          fullWidth: true,
        },
        {
          name: "email",
          label: "Email Address",
          type: "email",
          placeholder: "you@company.com",
          required: true,
          fullWidth: true,
        },
        {
          name: "phone",
          label: "WhatsApp Number",
          type: "tel",
          placeholder: "+91 98765 43210",
          required: true,
          fullWidth: true,
        },
        {
          name: "designation",
          label: "Designation in the company",
          type: "text",
          placeholder: "Founder",
          fullWidth: true,
        },
        {
          name: "communicationTime",
          label: "Comfortable time for communication",
          type: "radio",
          fullWidth: true,
          options: [
            { value: "Morning", label: "Morning" },
            { value: "Afternoon", label: "Afternoon" },
            { value: "Evening", label: "Evening" },
            { value: "Late Night", label: "Late Night" },
          ],
        },
      ],
    },
    {
      id: "business-overview",
      title: "Business Overview",
      copy:
        "Help us understand your business, offer, and target audience so we can build a strategy aligned with your market and growth goals.",
      submitLabel: "Next",
      fields: [
        {
          name: "businessName",
          label: "Business Name",
          type: "text",
          required: true,
          fullWidth: true,
        },
        {
          name: "registeredBusinessType",
          label: "Registered Business Type",
          type: "radio",
          required: true,
          fullWidth: true,
          options: [
            { value: "Private Limited", label: "Private Limited" },
            { value: "LLP", label: "LLP" },
            { value: "Proprietorship", label: "Proprietorship" },
            { value: "Not Govt. Registered", label: "Not Govt. Registered" },
            { value: "Other", label: "Other" },
          ],
        },
        {
          name: "officialBusinessAddress",
          label: "Official Business Address (for contract)",
          type: "textarea",
          placeholder: "Full business address",
          required: true,
          fullWidth: true,
        },
        {
          name: "websiteOrSocialLink",
          label: "Website/Social Media Link",
          type: "text",
          placeholder: "https://",
          fullWidth: true,
        },
        {
          name: "businessDescription",
          label: "Describe your business in brief",
          type: "textarea",
          placeholder: "What your business does, why it matters and who it serves",
          required: true,
          fullWidth: true,
        },
        {
          name: "productOrService",
          label: "What is the product/service you sell?",
          type: "textarea",
          placeholder: "Explain your core offering",
          required: true,
          fullWidth: true,
        },
        {
          name: "productOrServiceModel",
          label: "Is your product/service a",
          type: "radio",
          required: true,
          fullWidth: true,
          options: [
            { value: "One time purchase", label: "One time purchase" },
            { value: "Subscription / Retainer", label: "Subscription / Retainer" },
            { value: "Consultation Service", label: "Consultation Service" },
            { value: "Multiple Offers", label: "Multiple Offers" },
            { value: "Other", label: "Other" },
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
