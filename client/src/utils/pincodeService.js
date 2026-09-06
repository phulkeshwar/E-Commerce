/**
 * Indian Pincode Serviceability & Dynamic Delivery Estimation Engine
 */

const METRO_PREFIXES = new Set(["11", "40", "56", "60", "50", "70", "41", "38"]);

const PREFIX_STATE_MAP = {
  "11": { state: "Delhi", region: "Delhi NCR", isMetro: true },
  "12": { state: "Haryana", region: "Gurugram / Faridabad" },
  "13": { state: "Haryana", region: "Ambala / Karnal" },
  "14": { state: "Punjab", region: "Ludhiana / Jalandhar" },
  "15": { state: "Punjab", region: "Bathinda / Ferozepur" },
  "16": { state: "Chandigarh", region: "Chandigarh Tri-city" },
  "17": { state: "Himachal Pradesh", region: "Shimla / Dharamshala" },
  "18": { state: "Jammu & Kashmir", region: "Jammu Region" },
  "19": { state: "Jammu & Kashmir", region: "Srinagar / Kashmir Valley" },
  "20": { state: "Uttar Pradesh", region: "Noida / Ghaziabad / Aligarh" },
  "21": { state: "Uttar Pradesh", region: "Prayagraj / Fatehpur" },
  "22": { state: "Uttar Pradesh", region: "Lucknow / Ayodhya / Barabanki" },
  "23": { state: "Uttar Pradesh", region: "Varanasi / Mirzapur" },
  "24": { state: "Uttarakhand", region: "Dehradun / Haridwar" },
  "25": { state: "Uttar Pradesh", region: "Meerut / Muzaffarnagar" },
  "26": { state: "Uttarakhand", region: "Nainital / Haldwani" },
  "27": { state: "Uttar Pradesh", region: "Gorakhpur / Basti" },
  "28": { state: "Uttar Pradesh", region: "Agra / Jhansi / Mathura" },
  "30": { state: "Rajasthan", region: "Jaipur" },
  "31": { state: "Rajasthan", region: "Udaipur / Kota" },
  "32": { state: "Rajasthan", region: "Bharatpur / Sawai Madhopur" },
  "33": { state: "Rajasthan", region: "Bikaner / Sri Ganganagar" },
  "34": { state: "Rajasthan", region: "Jodhpur / Barmer" },
  "36": { state: "Gujarat", region: "Rajkot / Jamnagar / Saurashtra" },
  "37": { state: "Gujarat", region: "Kutch / Gandhidham" },
  "38": { state: "Gujarat", region: "Ahmedabad / Gandhinagar", isMetro: true },
  "39": { state: "Gujarat", region: "Surat / Vadodara" },
  "40": { state: "Maharashtra", region: "Mumbai Metro", isMetro: true },
  "41": { state: "Maharashtra", region: "Pune / Nashik / Satara", isMetro: true },
  "42": { state: "Maharashtra", region: "Dhule / Jalgaon" },
  "43": { state: "Maharashtra", region: "Chhatrapati Sambhajinagar" },
  "44": { state: "Maharashtra", region: "Nagpur / Amravati" },
  "45": { state: "Madhya Pradesh", region: "Indore / Ujjain" },
  "46": { state: "Madhya Pradesh", region: "Bhopal / Hoshangabad" },
  "47": { state: "Madhya Pradesh", region: "Gwalior / Shivpuri" },
  "48": { state: "Madhya Pradesh", region: "Jabalpur / Chhindwara" },
  "49": { state: "Chhattisgarh", region: "Raipur / Bilaspur" },
  "50": { state: "Telangana", region: "Hyderabad Metro", isMetro: true },
  "51": { state: "Andhra Pradesh", region: "Kurnool / Tirupati / Kadapa" },
  "52": { state: "Andhra Pradesh", region: "Vijayawada / Guntur" },
  "53": { state: "Andhra Pradesh", region: "Visakhapatnam / Kakinada" },
  "56": { state: "Karnataka", region: "Bengaluru Urban", isMetro: true },
  "57": { state: "Karnataka", region: "Mangaluru / Mysuru / Udupi" },
  "58": { state: "Karnataka", region: "Hubballi-Dharwad / Belagavi" },
  "59": { state: "Karnataka", region: "Kalaburagi / Raichur" },
  "60": { state: "Tamil Nadu", region: "Chennai Metro", isMetro: true },
  "61": { state: "Tamil Nadu", region: "Tiruchirappalli / Thanjavur" },
  "62": { state: "Tamil Nadu", region: "Madurai / Dindigul / Tirunelveli" },
  "63": { state: "Tamil Nadu", region: "Coimbatore / Salem / Vellore" },
  "64": { state: "Tamil Nadu", region: "Coimbatore / Nilgiris" },
  "67": { state: "Kerala", region: "Kozhikode / Kannur" },
  "68": { state: "Kerala", region: "Kochi / Ernakulam / Thrissur" },
  "69": { state: "Kerala", region: "Thiruvananthapuram / Kollam" },
  "70": { state: "West Bengal", region: "Kolkata Metro", isMetro: true },
  "71": { state: "West Bengal", region: "Howrah / Hooghly" },
  "72": { state: "West Bengal", region: "Medinipur / Haldia" },
  "73": { state: "West Bengal", region: "Siliguri / Darjeeling / Jalpaiguri" },
  "74": { state: "West Bengal", region: "North 24 Parganas / Nadia" },
  "75": { state: "Odisha", region: "Bhubaneswar / Cuttack / Puri" },
  "76": { state: "Odisha", region: "Rourkela / Sambalpur / Berhampur" },
  "77": { state: "Odisha", region: "Balasore / Koraput" },
  "78": { state: "Assam", region: "Guwahati / Dibrugarh / Silchar" },
  "79": { state: "North East", region: "Meghalaya / Tripura / Nagaland / Manipur / Mizoram / Arunachal" },
  "80": { state: "Bihar", region: "Patna Metro / Nalanda" },
  "81": { state: "Bihar", region: "Bhagalpur / Munger / Gaya" },
  "82": { state: "Jharkhand", region: "Dhanbad / Bokaro" },
  "83": { state: "Jharkhand", region: "Ranchi / Jamshedpur" },
  "84": { state: "Bihar", region: "Muzaffarpur / Darbhanga / Purnia" },
  "85": { state: "Bihar", region: "Saran / Rohtas / Begusarai" },
  "90": { state: "APS", region: "1 Field Post Office (1 FPO)" },
  "99": { state: "APS", region: "2 Field Post Office (2 FPO)" },
};

export function validatePincode(pincode) {
  if (!pincode) return false;
  const cleaned = String(pincode).trim();
  return /^[1-9][0-9]{5}$/.test(cleaned);
}

function addBusinessDays(startDate, daysToAdd) {
  const date = new Date(startDate);
  let added = 0;
  while (added < daysToAdd) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    // Exclude Sunday (0)
    if (day !== 0) {
      added++;
    }
  }
  return date;
}

function formatEstimatedDate(date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function lookupPincode(pincode) {
  if (!validatePincode(pincode)) {
    return {
      valid: false,
      message: "Please enter a valid 6-digit Indian PIN code.",
      serviceable: false,
    };
  }

  const codeStr = String(pincode).trim();
  const prefix2 = codeStr.substring(0, 2);
  const zoneDigit = codeStr[0];

  const info = PREFIX_STATE_MAP[prefix2] || {
    state: getZoneName(zoneDigit),
    region: `Postal Circle ${zoneDigit}`,
    isMetro: false,
  };

  const isMetro = info.isMetro || METRO_PREFIXES.has(prefix2);
  const isRemote = prefix2 === "79" || prefix2 === "19" || prefix2 === "90" || prefix2 === "99";

  const minDays = isMetro ? 1 : isRemote ? 4 : 2;
  const maxDays = isMetro ? 2 : isRemote ? 7 : 4;

  const now = new Date();
  const minDate = addBusinessDays(now, minDays);
  const maxDate = addBusinessDays(now, maxDays);

  const formattedRange =
    minDays === maxDays
      ? formatEstimatedDate(minDate)
      : `${formatEstimatedDate(minDate)} – ${formatEstimatedDate(maxDate)}`;

  return {
    valid: true,
    pincode: codeStr,
    state: info.state,
    region: info.region,
    isMetro,
    serviceable: true,
    deliveryDaysMin: minDays,
    deliveryDaysMax: maxDays,
    deliveryRange: formattedRange,
    estimatedDeliveryText: `Delivery by ${formattedRange}`,
    codAvailable: !isRemote,
    fastestDelivery: isMetro ? "Express Next-Day" : "Standard 2–4 Days",
  };
}

function getZoneName(firstDigit) {
  switch (firstDigit) {
    case "1":
    case "2":
      return "Northern Zone";
    case "3":
    case "4":
      return "Western Zone";
    case "5":
    case "6":
      return "Southern Zone";
    case "7":
    case "8":
      return "Eastern Zone";
    case "9":
      return "Army Postal Service";
    default:
      return "India Post";
  }
}
