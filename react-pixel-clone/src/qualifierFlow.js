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
    {
      id: "market-pricing-challenges",
      title: "Market, Pricing & Challenges",
      copy:
        "This section captures your audience, current bottlenecks and growth constraints so strategy can be calibrated to real-world conditions.",
      submitLabel: "Next",
      fields: [
        {
          name: "offerPriceRange",
          label: "What is the price range your offer operates",
          type: "radio",
          required: true,
          fullWidth: true,
          options: [
            { value: "₹0 - ₹1000", label: "₹0 - ₹1000" },
            { value: "₹1000 - ₹25,000", label: "₹1000 - ₹25,000" },
            { value: "₹25,000 - ₹50,000", label: "₹25,000 - ₹50,000" },
            { value: "₹50,000 - ₹1,00,000", label: "₹50,000 - ₹1,00,000" },
            { value: "₹1,00,000 +", label: "₹1,00,000 +", fullWidth: true },
          ],
        },
        {
          name: "idealCustomerProfile",
          label: "What is your ideal customer profile?",
          type: "textarea",
          placeholder: "Example: age, location, profession, pain points",
          required: true,
          fullWidth: true,
        },
        {
          name: "businessChallenges",
          label: "What challenges are you currently facing in your business?",
          type: "checkbox-group",
          required: true,
          fullWidth: true,
          options: [
            { value: "Not getting enough leads", label: "Not getting enough leads" },
            {
              value: "Getting leads but low conversion rate",
              label: "Getting leads but low conversion rate",
            },
            {
              value: "Inconsistent sales / revenue fluctuations",
              label: "Inconsistent sales / revenue fluctuations",
            },
            { value: "Poor social media engagement", label: "Poor social media engagement" },
            { value: "No clear marketing strategy", label: "No clear marketing strategy" },
            { value: "High ad spend but low ROI", label: "High ad spend but low ROI" },
            {
              value: "No proper automation systems",
              label: "No proper automation systems",
            },
            {
              value: "No follow-up system for leads",
              label: "No follow-up system for leads",
            },
            {
              value: "Poor website performance / low conversions",
              label: "Poor website performance / low conversions",
            },
            {
              value: "Scaling issues (operations breaking at growth stage)",
              label: "Scaling issues (operations breaking at growth stage)",
            },
            {
              value: "Lack of clarity on positioning",
              label: "Lack of clarity on positioning",
            },
            {
              value: "No data tracking / analytics setup",
              label: "No data tracking / analytics setup",
            },
            {
              value: "Difficulty retaining customers (High Churn Rate)",
              label: "Difficulty retaining customers (High Churn Rate)",
            },
            { value: "Other", label: "Other", fullWidth: true },
          ],
        },
        {
          name: "runningAdsStatus",
          label: "Do you currently run ads?",
          type: "radio",
          required: true,
          fullWidth: true,
          options: [
            { value: "Yes", label: "Yes" },
            { value: "No, but have tried in the past", label: "No, but have tried in the past" },
            { value: "Never tried running ads", label: "Never tried running ads", fullWidth: true },
          ],
        },
        {
          name: "existingSetups",
          label: "Which of these do you have already setup?",
          type: "checkbox-group",
          fullWidth: true,
          options: [
            { value: "Website/Domain", label: "Website/Domain" },
            {
              value: "Facebook Page (with content)",
              label: "Facebook Page (with content)",
            },
            {
              value: "Instagram connected to Meta",
              label: "Instagram connected to Meta",
            },
            { value: "Meta Business Manager", label: "Meta Business Manager" },
            { value: "RazorPay for Payments", label: "RazorPay for Payments" },
            {
              value: "Active posting on social media pages",
              label: "Active posting on social media pages",
              fullWidth: true,
            },
          ],
        },
      ],
    },
    {
      id: "before-we-begin",
      title: "Before We Begin",
      copy:
        "This ensures we are aligned on expectations, compliance requirements, and key details before execution starts.",
      submitLabel: "Submit Application",
      fields: [
        {
          name: "workExpectations",
          label: "What are your expectations working with us?",
          type: "textarea",
          placeholder: "Share your ideal working style, outcomes and priorities...",
          required: true,
          fullWidth: true,
        },
        {
          name: "legalOrComplianceRequirements",
          label: "Any legal restrictions or compliance requirements in your industry? (Optional)",
          type: "textarea",
          placeholder: "Optional",
          fullWidth: true,
        },
        {
          name: "additionalContext",
          label: "Is there anything else we should know to serve you better? (Optional)",
          type: "textarea",
          placeholder: "Optional",
          fullWidth: true,
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
    if (field.defaultValue !== undefined) {
      formState[field.name] = field.defaultValue;
      return formState;
    }

    if (field.type === "checkbox-group") {
      formState[field.name] = [];
      return formState;
    }

    formState[field.name] = "";
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
