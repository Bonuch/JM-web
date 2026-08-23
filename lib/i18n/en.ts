import type { Dictionary } from "./ru";

export const en: Dictionary = {
  nav: {
    home: "Home",
    portfolio: "Portfolio",
    services: "Services",
    contacts: "Contact",
    cta: "Start a project",
    menu: "Menu",
    close: "Close",
  },
  hero: {
    scroll: "Scroll",
    cta: "View work",
    secondary: "Get a quote",
  },
  common: {
    viewProject: "View case",
    allProjects: "All projects",
    backToPortfolio: "Back to portfolio",
    nextProject: "Next project",
    prevProject: "Previous project",
    close: "Close",
    year: "Year",
    area: "Area",
    style: "Style",
    location: "Location",
    category: "Type",
    images: "Frames",
    more: "Learn more",
    langSwitch: "RU",
  },
  categories: {
    all: "All",
    apartment: "Apartments",
    house: "Houses",
    commercial: "Commercial",
    furniture: "Product visualization",
  },
  featured: {
    label: "Selected",
    title: "Renders that sell the idea",
    subtitle:
      "Every frame is composed so the client sees the finished interior long before the first wall goes up.",
  },
  portfolio: {
    label: "Portfolio",
    title: "Work",
    subtitle:
      "Photorealistic interior visualization: apartments, private houses, commercial spaces and product shots.",
    empty: "No projects in this category yet.",
    countOne: "project",
    countFew: "projects",
    countMany: "projects",
  },
  services: {
    label: "Services & pricing",
    title: "What the work includes",
    subtitle:
      "Transparent rates with no hidden extras. The final quote is fixed before the project starts.",
    includes: "Included",
    duration: "Timeline",
    order: "Request",
    priceNote:
      "Pricing depends on the number of camera angles, scene complexity and deadline. I send an exact quote after a short brief.",
  },
  about: {
    label: "About",
  },
  faq: {
    label: "FAQ",
    title: "Frequently asked",
  },
  cta: {
    label: "Enquiry",
    title: "Tell me about your project",
    text: "Send the floor plan and references — you will get a quote and a timeline within one business day.",
  },
  form: {
    name: "Your name",
    namePlaceholder: "Name",
    contact: "Phone, email or Telegram",
    contactPlaceholder: "+1 000 000-00-00 / @nickname",
    topic: "What you need",
    topicPlaceholder: "Choose a service",
    topicOther: "Something else / not sure yet",
    message: "Project details",
    messagePlaceholder:
      "Area, number of camera angles, deadline, whether you already have a floor plan and a design project",
    submit: "Send enquiry",
    sending: "Sending…",
    success: "Enquiry sent",
    successText: "Thank you! I will get back to you within one business day.",
    error: "Something went wrong. Please write to me on Telegram or by email.",
    required: "This field is required",
    invalidContact: "Leave a phone, email or username so I can reply",
    consent: "By submitting the form you consent to the processing of your personal data under the",
    consentPolicy: "personal data policy",
  },
  contacts: {
    label: "Contact",
    title: "Get in touch",
    subtitle: "Available on weekdays, 10:00–19:00.",
    write: "Message",
    social: "Social",
    directContact: "Direct contact",
  },
  footer: {
    rights: "All rights reserved.",
    nav: "Navigation",
    contacts: "Contact",
    policy: "Personal data policy",
  },
  privacy: {
    label: "Legal",
    title: "Personal data policy",
    updated: "Version of 23 August 2026",
    intro:
      "What data this site collects, why it is needed, where it is kept and how to have it deleted. The policy covers this site only and does not extend to third-party resources linked from it.",
    sections: [
      {
        title: "1. Operator",
        body: [
          // {operator} is filled in from the LEGAL_OPERATOR variable — see ru.ts
          "The personal data operator is {operator}.",
          "The policy follows Russian Federal Law No. 152-FZ of 27 July 2006 “On Personal Data”.",
        ],
      },
      {
        title: "2. What is collected",
        body: [
          "Through the enquiry form: the name you provide; a contact for the reply — phone, email or messenger handle; the message itself; the selected service; the address of the page the enquiry was sent from and the interface language.",
          "Automatically: your IP address — only at the moment the form is submitted, and only to limit how often one address can send enquiries. It is not stored with the enquiry.",
          "The site never asks for identity documents, payment details or anything else not needed to discuss a project.",
        ],
      },
      {
        title: "3. Why it is needed",
        body: [
          "The only purpose is to answer you: clarify the brief, prepare a quote and a schedule, agree on the work.",
          "The data is never used for mailings, never sold and never passed to advertising networks.",
        ],
      },
      {
        title: "4. Legal basis",
        body: [
          "Processing is based on your consent. You give it by pressing the submit button — this is stated next to the button.",
          "Filling in the form is optional. If you would rather not, write directly by email or messenger — the addresses are in the Contact section.",
        ],
      },
      {
        title: "5. How the data is stored",
        body: [
          "Enquiries are stored encrypted: the file is sealed with AES-256-GCM and the key is kept apart from the data, in environment variables. Direct access to the file alone does not make it readable.",
          "Only the operator can work with enquiries, through a password-protected admin panel.",
          "Data is kept until consent is withdrawn. The store holds the 500 most recent enquiries; older ones are removed automatically.",
        ],
      },
      {
        title: "6. Who it is shared with",
        body: [
          "Hosting and storage — Vercel Inc. (USA). The site and the encrypted enquiry file run on its infrastructure.",
          "If notifications are enabled, the operator receives a message about a new enquiry in Telegram (Telegram FZ-LLC, UAE), containing the name, contact, message text, selected service, page address and interface language.",
          "Both companies are outside Russia, so the transfer is cross-border. By submitting the form you consent to that transfer as well.",
          "The data goes to no one else, except where the law explicitly requires it.",
        ],
      },
      {
        title: "7. Cookies and statistics",
        body: [
          "The site sets one cookie of its own — the chosen interface language. It does not identify the visitor.",
          "Traffic and loading speed are measured by Vercel Analytics and Speed Insights: anonymised page-view data, without cookies.",
          "If a Yandex.Metrica counter is connected, it sets cookies of its own and collects anonymised visit data: pages viewed, referrer, device type, a click map and a recording of on-page actions (Webvisor).",
          "You can opt out through browser settings or a blocker.",
        ],
      },
      {
        title: "8. Your rights",
        body: [
          "You may ask what data about you is processed, have it corrected or deleted, stop the processing and withdraw your consent.",
          "An email to the contact address is enough — the operator will reply and act on it within ten working days at most.",
        ],
      },
      {
        title: "9. Changes",
        body: [
          "The policy may be updated. The current version is always published on this page, with its date shown above.",
        ],
      },
    ],
    contactsTitle: "Where to write",
  },
  notFound: {
    title: "Page not found",
    text: "This page does not exist or has been moved.",
    button: "Go home",
  },
  meta: {
    titleTemplate: "%s — Interior 3D visualization",
    homeTitle: "Interior 3D visualization",
    homeDescription:
      "Photorealistic interior 3D visualization: apartments, private houses, commercial spaces. Portfolio, pricing and timelines.",
    portfolioTitle: "Portfolio",
    portfolioDescription:
      "Interior visualization portfolio: apartments, houses, commercial spaces and product shots.",
    servicesTitle: "Services & pricing",
    servicesDescription:
      "Interior 3D visualization pricing: rates, what is included, delivery times.",
    privacyTitle: "Personal data policy",
    privacyDescription:
      "What data this site collects, why it is needed, where it is kept and how to have it deleted.",
    contactsTitle: "Contact",
    contactsDescription:
      "Contact the interior 3D visualization studio: email, phone, Telegram, WhatsApp.",
  },
};
