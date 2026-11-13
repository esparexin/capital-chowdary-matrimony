import type { NewPricingPlan } from "@/types/database-types";

export const DEFAULT_PRICING_PLANS: readonly NewPricingPlan[] = [
  {
    id: "plan-software",
    slug: "software-employees",
    categoryEn: "Software Employees",
    categoryTe: "సాఫ్ట్‌వేర్ ఉద్యోగులు",
    registrationFeeInr: 5000,
    maleCommissionInr: 75000,
    femaleCommissionInr: 60000,
    validityMonths: 11,
    termsEn:
      "Registration fee is non-refundable and valid for 11 months. Commission is payable 50% five days before engagement and 50% five days before marriage.",
    termsTe:
      "రిజిస్ట్రేషన్ ఫీజు వాపస్ ఇవ్వబడదు మరియు 11 నెలలు వర్తిస్తుంది. కమీషన్ నిశ్చితార్థానికి 5 రోజుల ముందు 50%, వివాహానికి 5 రోజుల ముందు 50% చెల్లించాలి.",
    verificationStatus: "pending_review",
    sortOrder: 1,
    status: "draft",
  },
  {
    id: "plan-mbbs",
    slug: "mbbs-doctors",
    categoryEn: "MBBS Doctors",
    categoryTe: "ఎంబీబీఎస్ డాక్టర్లు",
    registrationFeeInr: 7500,
    maleCommissionInr: 175000,
    femaleCommissionInr: 150000,
    validityMonths: 11,
    termsEn:
      "Registration fee is non-refundable and valid for 11 months. Commission is payable 50% five days before engagement and 50% five days before marriage.",
    termsTe:
      "రిజిస్ట్రేషన్ ఫీజు వాపస్ ఇవ్వబడదు మరియు 11 నెలలు వర్తిస్తుంది. కమీషన్ నిశ్చితార్థానికి 5 రోజుల ముందు 50%, వివాహానికి 5 రోజుల ముందు 50% చెల్లించాలి.",
    verificationStatus: "pending_review",
    sortOrder: 2,
    status: "draft",
  },
  {
    id: "plan-nri",
    slug: "nri-abroad",
    categoryEn: "NRI / Abroad",
    categoryTe: "ఎన్ఆర్ఐ / విదేశీ సంబంధాలు",
    registrationFeeInr: 7500,
    maleCommissionInr: 150000,
    femaleCommissionInr: 125000,
    validityMonths: 11,
    termsEn:
      "Registration fee is non-refundable and valid for 11 months. Commission is payable 50% five days before engagement and 50% five days before marriage.",
    termsTe:
      "రిజిస్ట్రేషన్ ఫీజు వాపస్ ఇవ్వబడదు మరియు 11 నెలలు వర్తిస్తుంది. కమీషన్ నిశ్చితార్థానికి 5 రోజుల ముందు 50%, వివాహానికి 5 రోజుల ముందు 50% చెల్లించాలి.",
    verificationStatus: "pending_review",
    sortOrder: 3,
    status: "draft",
  },
  {
    id: "plan-other",
    slug: "divorced-late-business-govt",
    categoryEn: "Divorced / Late Marriage / Business / Government",
    categoryTe: "విడాకులు / ఆలస్య వివాహం / వ్యాపారం / ప్రభుత్వ ఉద్యోగులు",
    registrationFeeInr: 6000,
    maleCommissionInr: 90000,
    femaleCommissionInr: 75000,
    validityMonths: 11,
    termsEn:
      "Registration fee is non-refundable and valid for 11 months. Commission is payable 50% five days before engagement and 50% five days before marriage.",
    termsTe:
      "రిజిస్ట్రేషన్ ఫీజు వాపస్ ఇవ్వబడదు మరియు 11 నెలలు వర్తిస్తుంది. కమీషన్ నిశ్చితార్థానికి 5 రోజుల ముందు 50%, వివాహానికి 5 రోజుల ముందు 50% చెల్లించాలి.",
    verificationStatus: "pending_review",
    sortOrder: 4,
    status: "draft",
  },
];
