import type { NewContentSection, NewService, NewSiteSettings } from "@/types/database-types";
import {
  TERMS_ACCEPTANCE_EN,
  TERMS_ACCEPTANCE_TE,
  TERMS_CONDITIONS_EN,
  TERMS_CONDITIONS_TE,
} from "@/db/seed/legal-terms-content";
import { DEFAULT_PAGES } from "@/db/seed/default-pages";
import { DEFAULT_PRICING_PLANS } from "@/db/seed/default-pricing-plans";

export {
  DEFAULT_PAGES,
  DEFAULT_PRICING_PLANS,
  TERMS_ACCEPTANCE_EN,
  TERMS_ACCEPTANCE_TE,
  TERMS_CONDITIONS_EN,
  TERMS_CONDITIONS_TE,
};

export const DEFAULT_SITE_SETTINGS: NewSiteSettings = {
  id: "default",
  businessNameEn: "Capital Chowdary Matrimony",
  businessNameTe: "క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ",
  taglineEn: "Introduction is our part — verification is yours",
  taglineTe: "పరిచయం మా వంతు విచారణ మీ వంతు",
  locationEn: "Narasaraopet, Palnadu District, Andhra Pradesh",
  locationTe: "నరసరావుపేట, పల్నాడు జిల్లా, ఆంధ్రప్రదేశ్",
  addressEn:
    "Door No. 11-31-64/1, Ravipadu Road, Opp. Old TVS Showroom, Narasaraopet – 522601, Andhra Pradesh, India.",
  addressTe: "డోర్ నం. 11-31-64/1, రావిపాడు రోడ్, పాత టీవీఎస్ షోరూమ్ ఎదురుగా, నరసరావుపేట – 522601, ఆంధ్రప్రదేశ్.",
  phoneNumber: "+91 78420 97842",
  whatsappNumber: "+91 78420 97842",
  contactEmail: "capitalmatrimony@gmail.com",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Ravipadu%20Road%20Narasaraopet%20522601",
  defaultSeoTitleEn: "Capital Chowdary Matrimony | Narasaraopet",
  defaultSeoTitleTe: "క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ | నరసరావుపేట",
  defaultSeoDescriptionEn:
    "Matrimonial bureau in Narasaraopet, Palnadu District, Andhra Pradesh offering registration, proposal introductions, and coordination.",
  defaultSeoDescriptionTe: "నరసరావుపేట, పల్నాడు జిల్లా, ఆంధ్రప్రదేశ్‌లో వివాహ రిజిస్ట్రేషన్ మరియు సంబంధాల పరిచయ సేవలు.",
  isContactVerified: true,
};

export const DEFAULT_CONTENT_SECTIONS: readonly NewContentSection[] = [
  {
    id: "sec-home-hero",
    pageId: "page-home",
    sectionKey: "hero",
    titleEn: "Trusted marriage alliances for Kamma families",
    titleTe: "చౌదరి (కమ్మ) కులము వారికి చక్కటి పెళ్ళి సంబంధములు కుదర్చబడును & మ్యారేజ్ ఈవెంట్స్ చేయబడును.",
    subtitleEn: "Kamma Welfare Association · Regd. No: AP-07 91-058-0756579",
    subtitleTe: "నరసరావుపేట, పల్నాడు జిల్లా, ఆంధ్రప్రదేశ్",
    bodyEn:
      "Software employees, doctors, NRIs, business and government employees, divorced and late marriages — alliances across Andhra Pradesh and Telangana from our office in Narasaraopet.",
    bodyTe: "నరసరావుపేట కేంద్రంగా ఆంధ్రప్రదేశ్ మరియు తెలంగాణ రాష్ట్రాలలో వివాహ పరిచయ మరియు మ్యారేజ్ ఈవెంట్స్ సేవలు.",
    metadataJson: JSON.stringify({
      primaryCtaHref: "/register",
      primaryCtaLabelEn: "Register",
      primaryCtaLabelTe: "రిజిస్టర్ అవ్వండి",
      secondaryCtaHref: "/contact",
      secondaryCtaLabelEn: "Contact Us",
      secondaryCtaLabelTe: "సంప్రదించండి",
      associationName: "Kamma Welfare Association",
      associationDetail: "Andhra & Telangana · Regd. No: AP-07 91-058-0756579",
      highlights: [
        {
          title: "Andhra Pradesh & Telangana",
          description: "Alliances across both Telugu states",
        },
        {
          title: "Matrimony + Marriage Events",
          description: "From the first introduction to the wedding",
        },
      ],
      fallbackImageAltEn: "Traditional Telugu wedding ceremony in burgundy and ivory silk attire",
    }),
    sortOrder: 1,
    status: "published",
  },
  {
    id: "sec-how-steps",
    pageId: "page-how-it-works",
    sectionKey: "process_steps",
    titleEn: "Six-Step Matrimonial Process",
    titleTe: "ఆరు దశల పని విధానం",
    subtitleEn: "A clear six-step process from initial inquiry to family-led verification.",
    subtitleTe: "సంప్రదింపు నుండి కుటుంబాల స్వతంత్ర పరిశీలన వరకు 6 దశల విధానం.",
    bodyEn:
      "Follow these steps to work with our bureau. We facilitate introductions and never guarantee a marriage.",
    bodyTe: "మా బ్యూరోతో సంబంధాల ప్రక్రియను ఈ ఆరు దశలలో తెలుసుకోండి.",
    metadataJson: JSON.stringify({
      steps: [
        { step: 1, en: "Contact the bureau.", te: "మ్యారేజ్ బ్యూరోను సంప్రదించండి." },
        { step: 2, en: "Complete registration.", te: "రిజిస్ట్రేషన్ ప్రక్రియను పూర్తి చేయండి." },
        {
          step: 3,
          en: "Provide accurate bride or groom information.",
          te: "వధువు లేదా వరుని నిజమైన మరియు ఖచ్చితమైన వివరాలు అందించండి.",
        },
        {
          step: 4,
          en: "The bureau introduces available proposals.",
          te: "బ్యూరో దృష్టికి వచ్చిన తగిన సంబంధాలను పరిచయం చేస్తుంది.",
        },
        {
          step: 5,
          en: "Families independently verify details.",
          te: "విద్య, ఆరోగ్యం, ఆర్థిక మరియు కుటుంబ వివరాలను కుటుంబాలు స్వతంత్రంగా పరిశీలించుకోవాలి.",
        },
        {
          step: 6,
          en: "Families proceed with discussions and marriage arrangements.",
          te: "కుటుంబాలు పరస్పర చర్చలతో వివాహ ఏర్పాట్లు కొనసాగించాలి.",
        },
      ],
    }),
    sortOrder: 1,
    status: "published",
  },
  {
    id: "sec-terms-conditions",
    pageId: "page-terms",
    sectionKey: "terms_conditions",
    titleEn: "Introduction is our part – Verification is yours",
    titleTe: "పరిచయం మా వంతు – పరిశీలన మీ వంతు",
    subtitleEn:
      "Education, health, financial, and personal weakness checks are your responsibility",
    subtitleTe: "విద్య, ఆరోగ్య, ఆర్థిక, బలహీనతల లోపాలు పరిశీలన మీ వంతు",
    bodyEn: TERMS_CONDITIONS_EN.join("\n\n"),
    bodyTe: TERMS_CONDITIONS_TE.join("\n\n"),
    metadataJson: JSON.stringify({
      conditionsEn: TERMS_CONDITIONS_EN,
      conditionsTe: TERMS_CONDITIONS_TE,
    }),
    sortOrder: 1,
    status: "draft",
  },
  {
    id: "sec-terms-acceptance",
    pageId: "page-terms",
    sectionKey: "terms_acceptance",
    titleEn: "Key Declaration Points",
    titleTe: "అంగీకార పత్రంలో ముఖ్యాంశాలు",
    subtitleEn: "Declaration highlights agreed upon during registration",
    subtitleTe: "రిజిస్ట్రేషన్ సమయంలో అంగీకరించే ముఖ్యాంశాలు",
    bodyEn: TERMS_ACCEPTANCE_EN.join("\n\n"),
    bodyTe: TERMS_ACCEPTANCE_TE.join("\n\n"),
    metadataJson: JSON.stringify({
      pointsEn: TERMS_ACCEPTANCE_EN,
      pointsTe: TERMS_ACCEPTANCE_TE,
    }),
    sortOrder: 2,
    status: "draft",
  },
];

export const DEFAULT_SERVICES: readonly NewService[] = [
  {
    id: "svc-registration",
    slug: "matrimonial-registration",
    titleEn: "Matrimonial Registration",
    titleTe: "వివాహ రిజిస్ట్రేషన్",
    descriptionEn:
      "Structured registration of bride and groom biodata for an 11-month introduction period.",
    descriptionTe: "11 నెలల పరిచయ కాలపరిమితితో వధువు మరియు వరుని బయోడేటా నమోదు.",
    iconName: "ClipboardList",
    sortOrder: 1,
    status: "published",
  },
  {
    id: "svc-introductions",
    slug: "proposal-introductions",
    titleEn: "Bride & Groom Proposal Introductions",
    titleTe: "వధువు మరియు వరుని సంబంధాల పరిచయం",
    descriptionEn:
      "Sharing available bride and groom proposals matching family preferences without guaranteeing a match.",
    descriptionTe: "కుటుంబ ప్రాధాన్యతలకు అనుగుణంగా అందుబాటులో ఉన్న సంబంధాలను పరిచయం చేయడం (వివాహ హామీ లేకుండా).",
    iconName: "Users",
    sortOrder: 2,
    status: "published",
  },
  {
    id: "svc-coordination",
    slug: "proposal-coordination",
    titleEn: "Marriage Proposal Coordination",
    titleTe: "వివాహ సంబంధాల సమన్వయం",
    descriptionEn:
      "Facilitating initial communication and family meeting coordination between interested families.",
    descriptionTe: "ఆసక్తి గల కుటుంబాల మధ్య ప్రాథమిక సంప్రదింపులు మరియు పెళ్ళి చూపుల సమన్వయం.",
    iconName: "Handshake",
    sortOrder: 3,
    status: "published",
  },
  {
    id: "svc-guidance",
    slug: "matrimonial-guidance",
    titleEn: "Marriage Events & Family Guidance",
    titleTe: "మ్యారేజ్ ఈవెంట్స్ మరియు కుటుంబ మార్గదర్శకత్వం",
    descriptionEn:
      "Coordinating marriage events alongside guidance on registration procedures and family-led verification.",
    descriptionTe: "రిజిస్ట్రేషన్ నిబంధనలు, స్వతంత్ర పరిశీలన మరియు మ్యారేజ్ ఈవెంట్స్ సమన్వయ సహకారం.",
    iconName: "Compass",
    sortOrder: 4,
    status: "published",
  },
];
