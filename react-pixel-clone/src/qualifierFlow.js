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
            { value: "2-5 lakh", label: "₹2-5 lacs" },
            { value: "5-8 lakh", label: "₹5-8 lacs" },
            { value: "8-12 lakh", label: "₹8-12 lacs" },
            { value: "12+ lakh", label: "₹12+ lacs" },
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
          name: "isdCode",
          label: "Country Code",
          type: "select",
          required: true,
          fullWidth: false,
          defaultValue: "+91",
          options: [
            { value: "+91", label: "🇮🇳 +91 (India)" },
            { value: "+1", label: "🇺🇸 +1 (USA/Canada)" },
            { value: "+44", label: "🇬🇧 +44 (UK)" },
            { value: "+61", label: "🇦🇺 +61 (Australia)" },
            { value: "+971", label: "🇦🇪 +971 (UAE)" },
            { value: "+65", label: "🇸🇬 +65 (Singapore)" },
            { value: "+60", label: "🇲🇾 +60 (Malaysia)" },
            { value: "+27", label: "🇿🇦 +27 (South Africa)" },
            { value: "+49", label: "🇩🇪 +49 (Germany)" },
            { value: "+33", label: "🇫🇷 +33 (France)" },
            { value: "+55", label: "🇧🇷 +55 (Brazil)" },
            { value: "+52", label: "🇲🇽 +52 (Mexico)" },
            { value: "+63", label: "🇵🇭 +63 (Philippines)" },
            { value: "+92", label: "🇵🇰 +92 (Pakistan)" },
            { value: "+880", label: "🇧🇩 +880 (Bangladesh)" },
            { value: "+94", label: "🇱🇰 +94 (Sri Lanka)" },
            { value: "+977", label: "🇳🇵 +977 (Nepal)" },
            { value: "+234", label: "🇳🇬 +234 (Nigeria)" },
            { value: "+254", label: "🇰🇪 +254 (Kenya)" },
            { value: "+other", label: "Other" },
          ],
        },
        {
          name: "phone",
          label: "Phone Number",
          type: "tel",
          placeholder: "Enter phone number",
          required: true,
          fullWidth: false,
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
