export interface IndianCityOption {
  name: string;
  state: string;
}

/**
 * Curated catalog of Andhra Pradesh, Telangana, and major Indian cities
 * used for searchable registration autocomplete without external paid APIs.
 */
export const INDIAN_CITY_OPTIONS: readonly IndianCityOption[] = [
  // Andhra Pradesh (Palnadu, Guntur, Krishna & Coastal Belt first)
  { name: "Narasaraopet", state: "Andhra Pradesh" },
  { name: "Guntur", state: "Andhra Pradesh" },
  { name: "Vijayawada", state: "Andhra Pradesh" },
  { name: "Tenali", state: "Andhra Pradesh" },
  { name: "Chilakaluripet", state: "Andhra Pradesh" },
  { name: "Sattenapalle", state: "Andhra Pradesh" },
  { name: "Mangalagiri", state: "Andhra Pradesh" },
  { name: "Amaravati", state: "Andhra Pradesh" },
  { name: "Ongole", state: "Andhra Pradesh" },
  { name: "Chirala", state: "Andhra Pradesh" },
  { name: "Bapatla", state: "Andhra Pradesh" },
  { name: "Piduguralla", state: "Andhra Pradesh" },
  { name: "Macherla", state: "Andhra Pradesh" },
  { name: "Vinukonda", state: "Andhra Pradesh" },
  { name: "Repalle", state: "Andhra Pradesh" },
  { name: "Ponnur", state: "Andhra Pradesh" },
  { name: "Gudivada", state: "Andhra Pradesh" },
  { name: "Machilipatnam", state: "Andhra Pradesh" },
  { name: "Eluru", state: "Andhra Pradesh" },
  { name: "Bhimavaram", state: "Andhra Pradesh" },
  { name: "Tanuku", state: "Andhra Pradesh" },
  { name: "Tadepalligudem", state: "Andhra Pradesh" },
  { name: "Palakollu", state: "Andhra Pradesh" },
  { name: "Narsapur", state: "Andhra Pradesh" },
  { name: "Rajahmundry", state: "Andhra Pradesh" },
  { name: "Kakinada", state: "Andhra Pradesh" },
  { name: "Amalapuram", state: "Andhra Pradesh" },
  { name: "Visakhapatnam", state: "Andhra Pradesh" },
  { name: "Vizianagaram", state: "Andhra Pradesh" },
  { name: "Srikakulam", state: "Andhra Pradesh" },
  { name: "Nellore", state: "Andhra Pradesh" },
  { name: "Kavali", state: "Andhra Pradesh" },
  { name: "Gudur", state: "Andhra Pradesh" },
  { name: "Tirupati", state: "Andhra Pradesh" },
  { name: "Chittoor", state: "Andhra Pradesh" },
  { name: "Madanapalle", state: "Andhra Pradesh" },
  { name: "Sri City", state: "Andhra Pradesh" },
  { name: "Kadapa", state: "Andhra Pradesh" },
  { name: "Proddatur", state: "Andhra Pradesh" },
  { name: "Kurnool", state: "Andhra Pradesh" },
  { name: "Nandyal", state: "Andhra Pradesh" },
  { name: "Anantapur", state: "Andhra Pradesh" },
  { name: "Hindupur", state: "Andhra Pradesh" },
  { name: "Tadipatri", state: "Andhra Pradesh" },
  { name: "Markapur", state: "Andhra Pradesh" },
  { name: "Kandukur", state: "Andhra Pradesh" },
  { name: "East Godavari", state: "Andhra Pradesh" },
  { name: "West Godavari", state: "Andhra Pradesh" },

  // Telangana
  { name: "Hyderabad", state: "Telangana" },
  { name: "Secunderabad", state: "Telangana" },
  { name: "Khammam", state: "Telangana" },
  { name: "Warangal", state: "Telangana" },
  { name: "Hanamkonda", state: "Telangana" },
  { name: "Karimnagar", state: "Telangana" },
  { name: "Nizamabad", state: "Telangana" },
  { name: "Nalgonda", state: "Telangana" },
  { name: "Suryapet", state: "Telangana" },
  { name: "Miryalaguda", state: "Telangana" },
  { name: "Kodad", state: "Telangana" },
  { name: "Kothagudem", state: "Telangana" },
  { name: "Sathupalli", state: "Telangana" },
  { name: "Madhira", state: "Telangana" },
  { name: "Mahbubnagar", state: "Telangana" },
  { name: "Siddipet", state: "Telangana" },
  { name: "Mancherial", state: "Telangana" },
  { name: "Ramagundam", state: "Telangana" },
  { name: "Adilabad", state: "Telangana" },
  { name: "Sangareddy", state: "Telangana" },
  { name: "Nirmal", state: "Telangana" },

  // Major Pan-India Cities
  { name: "Bengaluru", state: "Karnataka" },
  { name: "Chennai", state: "Tamil Nadu" },
  { name: "Coimbatore", state: "Tamil Nadu" },
  { name: "Mumbai", state: "Maharashtra" },
  { name: "Pune", state: "Maharashtra" },
  { name: "New Delhi", state: "Delhi NCR" },
  { name: "Noida", state: "Uttar Pradesh" },
  { name: "Gurugram", state: "Haryana" },
  { name: "Kolkata", state: "West Bengal" },
  { name: "Ahmedabad", state: "Gujarat" },
  { name: "Surat", state: "Gujarat" },
  { name: "Kochi", state: "Kerala" },
  { name: "Thiruvananthapuram", state: "Kerala" },
  { name: "Bhubaneswar", state: "Odisha" },
  { name: "Nagpur", state: "Maharashtra" },
  { name: "Jaipur", state: "Rajasthan" },
  { name: "Chandigarh", state: "Chandigarh" },
  { name: "Indore", state: "Madhya Pradesh" },
  { name: "Mysuru", state: "Karnataka" },
  { name: "Hubballi", state: "Karnataka" },
] as const;

// Deduplicate case-insensitively without artificial composite rows
const DEDUPED_CITIES: IndianCityOption[] = INDIAN_CITY_OPTIONS.filter(
  (option, index, list) =>
    !option.name.includes("/") &&
    list.findIndex((item) => item.name.toLowerCase() === option.name.toLowerCase()) === index,
);

/**
 * Filters known Indian cities for searchable autocomplete, prioritizing prefix matches.
 */
export function filterIndianCities(query: string, limit = 8): IndianCityOption[] {
  const normalized = query.trim().replace(/\s+/g, " ").toLowerCase();
  if (!normalized) {
    return DEDUPED_CITIES.slice(0, limit);
  }

  const prefixMatches: IndianCityOption[] = [];
  const substringMatches: IndianCityOption[] = [];

  for (const option of DEDUPED_CITIES) {
    const cityLower = option.name.toLowerCase();
    const stateLower = option.state.toLowerCase();
    if (cityLower.startsWith(normalized)) {
      prefixMatches.push(option);
    } else if (cityLower.includes(normalized) || stateLower.includes(normalized)) {
      substringMatches.push(option);
    }
  }

  return [...prefixMatches, ...substringMatches].slice(0, limit);
}
