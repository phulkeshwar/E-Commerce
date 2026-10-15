import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Product } from "../models/Product.model.js";
import { Category } from "../models/Category.model.js";
import { invalidateCatalogCache } from "../utils/cache.js";
import { AMAZON_SALE_PRODUCTS, AMAZON_SALE_GROUPS } from "../data/amazonSaleData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PARTNER_TAG = process.env.AMAZON_ASSOCIATE_TAG || "ironrites-21";

// ── EXPANDED CATEGORIES / GROUPS ─────────────────────────────────────────────
const NEW_GROUPS = [
  { name: "Budget Phones", emoji: "📱", slug: "budget-phones" },
  { name: "Mid-Range Phones", emoji: "📲", slug: "mid-range-phones" },
  { name: "Flagship Phones", emoji: "💎", slug: "flagship-phones" },
  { name: "Speakers", emoji: "🔊", slug: "speakers" },
  { name: "Tablets & E-Readers", emoji: "📟", slug: "tablets-ereaders" },
  { name: "Audio & Headphones", emoji: "🎧", slug: "audio-headphones" },
  { name: "Laptops & PC Accessories", emoji: "💻", slug: "laptops-computing" },
  { name: "Smart Home & TV", emoji: "📺", slug: "smart-home-tv" },
  { name: "Wearables & Watches", emoji: "⌚", slug: "wearables-watches" },
  { name: "Gaming Gear", emoji: "🎮", slug: "gaming-gear" },
  { name: "Cameras & Creator Tech", emoji: "📸", slug: "cameras-creator-tech" },
  { name: "Home & Kitchen", emoji: "🍳", slug: "home-kitchen" },
  { name: "Personal Care & Tech", emoji: "🪒", slug: "personal-care-tech" },
  { name: "Desk Setup & Office", emoji: "🪑", slug: "desk-setup-office" },
  { name: "Pantry", emoji: "🥫", slug: "pantry" },
  { name: "Beverages", emoji: "🥤", slug: "beverages" },
  { name: "Health", emoji: "🩺", slug: "health" },
  { name: "Home", emoji: "🏠", slug: "home" },
  { name: "Personal Care", emoji: "🧴", slug: "personal-care" }
];

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

// ── NEW PRODUCTS TO ADD ───────────────────────────────────────────────────────
const NEW_PRODUCTS = [
  // ── BUDGET PHONES (Under ₹15,000) ──
  {
    asin: "B0CP97DW83",
    name: "Redmi 13C 5G (Starlight Black, 4GB RAM, 128GB Storage)",
    category: "Budget Phones",
    price: 9499,
    originalPrice: 13999,
    badge: "Budget 5G Pick",
    rating: 4.4,
    reviewCount: 14200,
    imageUrl: "https://m.media-amazon.com/images/I/815K0Ed6ISL._SL1258_.jpg",
    description: "MediaTek Dimensity 6100+ 5G processor, smooth 90Hz 6.74-inch display, 50MP AI dual camera, and massive 5000mAh battery with fast charging.",
    specifications: {
      Brand: "Xiaomi / Redmi",
      Processor: "MediaTek Dimensity 6100+ 5G",
      RAM: "4GB (+4GB Virtual RAM)",
      Storage: "128GB UFS 2.2",
      Display: "6.74-inch 90Hz HD+ Corning Gorilla Glass",
      Battery: "5000mAh with 18W Fast Charging",
      Warranty: "1 Year Manufacturer Warranty"
    },
    tags: ["redmi", "5g phone", "budget phone", "xiaomi", "under 10000"]
  },
  {
    asin: "B0CP97DW84",
    name: "Samsung Galaxy M15 5G (Celestial Blue, 4GB RAM, 128GB Storage)",
    category: "Budget Phones",
    price: 10999,
    originalPrice: 15999,
    badge: "Super AMOLED Deal",
    rating: 4.5,
    reviewCount: 9800,
    imageUrl: "https://m.media-amazon.com/images/I/61k4fZYnYBL._AC_.jpg",
    description: "Segment-leading 6.5-inch FHD+ 90Hz Super AMOLED display, massive 6000mAh battery, 50MP triple camera system, and 4 generations of Android OS upgrades.",
    specifications: {
      Brand: "Samsung",
      Processor: "MediaTek Dimensity 6100+",
      RAM: "4GB RAM",
      Storage: "128GB Storage (expandable to 1TB)",
      Display: "6.5-inch FHD+ Super AMOLED 90Hz",
      Battery: "6000mAh Monster Battery",
      Warranty: "1 Year Samsung Warranty"
    },
    tags: ["samsung", "galaxy m15", "budget phone", "super amoled", "6000mah"]
  },
  {
    asin: "B0CP97DW85",
    name: "POCO M6 5G (Orion Blue, 4GB RAM, 128GB Storage)",
    category: "Budget Phones",
    price: 8999,
    originalPrice: 13999,
    badge: "Lowest Price 5G",
    rating: 4.3,
    reviewCount: 11200,
    imageUrl: "https://m.media-amazon.com/images/I/815K0Ed6ISL._SL1258_.jpg",
    description: "Premium glass back design, Dimensity 6100+ high-speed 5G connectivity, 50MP AI primary camera, 90Hz refresh rate, and Splash resistant IP52 rating.",
    specifications: {
      Brand: "POCO",
      Processor: "Dimensity 6100+ 5G",
      RAM: "4GB RAM",
      Storage: "128GB Storage",
      Display: "6.74-inch 90Hz Dot Drop Display",
      Battery: "5000mAh Battery",
      Warranty: "1 Year Brand Warranty"
    },
    tags: ["poco", "poco m6", "budget 5g", "under 9000", "smartphone"]
  },
  {
    asin: "B0CP97DW86",
    name: "realme Narzo 70x 5G (Ice Blue, 6GB RAM, 128GB Storage)",
    category: "Budget Phones",
    price: 11999,
    originalPrice: 17999,
    badge: "45W Fast Charge",
    rating: 4.4,
    reviewCount: 8400,
    imageUrl: "https://m.media-amazon.com/images/I/61HyiMlCuTL._AC_.jpg",
    description: "Ultra-fast 45W SUPERVOOC charging, 120Hz ultra-smooth dynamic display, dual stereo speakers, 50MP AI primary camera, and IP54 dust & water resistance.",
    specifications: {
      Brand: "realme",
      Processor: "Dimensity 6100+ 6nm 5G",
      RAM: "6GB RAM",
      Storage: "128GB Storage",
      Display: "6.72-inch 120Hz FHD+ Display",
      Charging: "45W SUPERVOOC in-box",
      Warranty: "1 Year realme Warranty"
    },
    tags: ["realme", "narzo 70x", "fast charge", "budget 5g", "120hz"]
  },
  {
    asin: "B0CP97DW87",
    name: "iQOO Z9x 5G (Tornado Green, 6GB RAM, 128GB Storage)",
    category: "Budget Phones",
    price: 12499,
    originalPrice: 17999,
    badge: "Snapdragon 6 Gen 1",
    rating: 4.5,
    reviewCount: 7900,
    imageUrl: "https://m.media-amazon.com/images/I/61SnaL4+EFL._SX679_.jpg",
    description: "Powered by 4nm Snapdragon 6 Gen 1 processor with 560K+ AnTuTu score. Ultra-slim 7.99mm body packing a colossal 6000mAh battery with 44W FlashCharge.",
    specifications: {
      Brand: "iQOO",
      Processor: "Qualcomm Snapdragon 6 Gen 1 (4nm)",
      RAM: "6GB LPDDR4X",
      Storage: "128GB UFS 2.2",
      Display: "6.72-inch 120Hz Ultra Bright FHD+",
      Battery: "6000mAh with 44W FlashCharge",
      Warranty: "1 Year Manufacturer Warranty"
    },
    tags: ["iqoo", "z9x", "snapdragon", "6000mah", "budget gaming"]
  },
  {
    asin: "B0CP97DW88",
    name: "Motorola G34 5G (Ocean Green, 8GB RAM, 128GB Storage)",
    category: "Budget Phones",
    price: 11999,
    originalPrice: 14999,
    badge: "Clean Android 14",
    rating: 4.4,
    reviewCount: 6500,
    imageUrl: "https://m.media-amazon.com/images/I/61k4fZYnYBL._AC_.jpg",
    description: "Premium vegan leather finish, bloatware-free clean My UX Android experience, Snapdragon 695 5G processor, Dolby Atmos stereo speakers, and 50MP Quad Pixel camera.",
    specifications: {
      Brand: "Motorola",
      Processor: "Snapdragon 695 5G",
      RAM: "8GB RAM",
      Storage: "128GB Storage",
      Display: "6.5-inch 120Hz Display",
      Audio: "Stereo Speakers with Dolby Atmos",
      Warranty: "1 Year Motorola Warranty"
    },
    tags: ["moto", "motorola g34", "clean android", "vegan leather", "budget"]
  },
  {
    asin: "B0CP97DW89",
    name: "Lava Blaze Curve 5G (Glass Viridian, 8GB RAM, 128GB Storage)",
    category: "Budget Phones",
    price: 14499,
    originalPrice: 17999,
    badge: "Curved AMOLED",
    rating: 4.5,
    reviewCount: 4200,
    imageUrl: "https://m.media-amazon.com/images/I/71d1ytcCntL._SX679_.jpg",
    description: "First-in-segment 3D 120Hz Curved AMOLED display with Widevine L1, Dimensity 7050 6nm processor, 64MP Sony sensor, stereo speakers with Dolby Atmos, and pure ad-free Android.",
    specifications: {
      Brand: "Lava",
      Processor: "MediaTek Dimensity 7050 (6nm)",
      RAM: "8GB LPDDR5",
      Storage: "128GB UFS 3.1",
      Display: "6.67-inch 120Hz 3D Curved AMOLED",
      Camera: "64MP Sony Primary Sensor",
      Warranty: "1 Year Free at-Home Service"
    },
    tags: ["lava", "curved amoled", "blaze curve", "indian brand", "budget phone"]
  },
  {
    asin: "B0CP97DW90",
    name: "Redmi 12 5G (Jade Black, 6GB RAM, 128GB Storage)",
    category: "Budget Phones",
    price: 11499,
    originalPrice: 15999,
    badge: "Crystal Glass Design",
    rating: 4.3,
    reviewCount: 16800,
    imageUrl: "https://m.media-amazon.com/images/I/815K0Ed6ISL._SL1258_.jpg",
    description: "India's highest selling entry 5G smartphone. Snapdragon 4 Gen 2 4nm architecture, premium crystal glass design, 6.79-inch FHD+ 90Hz adaptive display.",
    specifications: {
      Brand: "Xiaomi / Redmi",
      Processor: "Snapdragon 4 Gen 2 (4nm)",
      RAM: "6GB RAM",
      Storage: "128GB Storage",
      Display: "6.79-inch FHD+ 90Hz AdaptiveSync",
      Battery: "5000mAh with 22.5W in-box charger",
      Warranty: "1 Year Xiaomi Warranty"
    },
    tags: ["redmi 12", "xiaomi", "snapdragon 5g", "bestseller", "budget"]
  },

  // ── MID-RANGE PHONES (₹15,000 to ₹45,000) ──
  {
    asin: "B0CP97DW91",
    name: "Nothing Phone (2a) Plus 5G (Grey, 8GB RAM, 256GB Storage)",
    category: "Mid-Range Phones",
    price: 25999,
    originalPrice: 29999,
    badge: "Glyph Interface Deal",
    rating: 4.6,
    reviewCount: 5200,
    imageUrl: "https://m.media-amazon.com/images/I/71ceEkr+QQL.jpg",
    description: "Custom Dimensity 7350 Pro 5G processor, iconic transparent Glyph design, 50MP Sony main + 50MP ultra-wide + 50MP selfie cameras, and Nothing OS 2.6.",
    specifications: {
      Brand: "Nothing",
      Processor: "MediaTek Dimensity 7350 Pro (4nm)",
      RAM: "8GB RAM",
      Storage: "256GB Storage",
      Display: "6.7-inch Flexible AMOLED 120Hz (1300 nits)",
      Camera: "Dual 50MP OIS + 50MP Front",
      Warranty: "1 Year Brand Warranty"
    },
    tags: ["nothing", "phone 2a plus", "glyph interface", "mid range phone", "clean os"]
  },
  {
    asin: "B0CP97DW92",
    name: "Motorola Edge 50 Fusion 5G (Marshmallow Blue, 8GB RAM, 128GB Storage)",
    category: "Mid-Range Phones",
    price: 21999,
    originalPrice: 25999,
    badge: "IP68 Water Resistant",
    rating: 4.5,
    reviewCount: 4800,
    imageUrl: "https://m.media-amazon.com/images/I/61k4fZYnYBL._AC_.jpg",
    description: "IP68 underwater protection, 144Hz 3D curved pOLED display with Pantone validated colors, 50MP Sony LYTIA 700C OIS sensor, and 68W TurboPower charging.",
    specifications: {
      Brand: "Motorola",
      Processor: "Snapdragon 7s Gen 2 (4nm)",
      RAM: "8GB RAM",
      Storage: "128GB Storage",
      Display: "6.67-inch 144Hz 3D Curved pOLED",
      Protection: "IP68 Submersible Waterproof",
      Warranty: "1 Year Motorola Warranty"
    },
    tags: ["motorola", "edge 50 fusion", "ip68", "curved display", "mid range"]
  },
  {
    asin: "B0CP97DW93",
    name: "OnePlus Nord 4 5G (Oasis Green, 8GB RAM, 256GB Storage)",
    category: "Mid-Range Phones",
    price: 29999,
    originalPrice: 32999,
    badge: "Metal Unibody 5G",
    rating: 4.6,
    reviewCount: 6800,
    imageUrl: "https://m.media-amazon.com/images/I/61nxQ62qglL.jpg",
    description: "Only all-metal unibody 5G phone in the segment. Snapdragon 7+ Gen 3 powerhouse, massive 5500mAh battery with 100W SUPERVOOC charging, and 6 years of software support.",
    specifications: {
      Brand: "OnePlus",
      Processor: "Snapdragon 7+ Gen 3",
      RAM: "8GB LPDDR5X",
      Storage: "256GB UFS 4.0",
      Display: "6.74-inch 120Hz 1.5K AMOLED (2150 nits)",
      Battery: "5500mAh + 100W SUPERVOOC",
      Warranty: "1 Year OnePlus Warranty"
    },
    tags: ["oneplus", "nord 4", "metal unibody", "100w charging", "mid range"]
  },
  {
    asin: "B0CP97DW94",
    name: "Vivo V40 5G (Ganges Blue, 8GB RAM, 128GB Storage - ZEISS Optics)",
    category: "Mid-Range Phones",
    price: 34999,
    originalPrice: 39999,
    badge: "ZEISS Portrait Pro",
    rating: 4.6,
    reviewCount: 3900,
    imageUrl: "https://m.media-amazon.com/images/I/61TLDQrtEOL._SL1500_.jpg",
    description: "Co-engineered with ZEISS. 50MP ZEISS OIS main + 50MP ZEISS ultra wide + 50MP ZEISS group selfie. Ultra-slim 7.58mm body with 5500mAh BlueVolt battery and IP68 rating.",
    specifications: {
      Brand: "Vivo",
      Camera: "50MP ZEISS OIS + 50MP Ultra Wide + 50MP Selfie",
      Processor: "Snapdragon 7 Gen 3 (4nm)",
      Battery: "5500mAh BlueVolt Battery + 80W FlashCharge",
      Durability: "IP68 & IP69 Dust and Water Resistance",
      Warranty: "1 Year Vivo Warranty"
    },
    tags: ["vivo", "v40", "zeiss camera", "portrait phone", "mid range"]
  },
  {
    asin: "B0CP97DW95",
    name: "iQOO Neo 9 Pro 5G (Fiery Red, 8GB RAM, 128GB Storage)",
    category: "Mid-Range Phones",
    price: 34999,
    originalPrice: 39999,
    badge: "Flagship Killer",
    rating: 4.7,
    reviewCount: 7100,
    imageUrl: "https://m.media-amazon.com/images/I/619lW2YtVhL.jpg",
    description: "Powered by flagship Snapdragon 8 Gen 2 processor paired with Supercomputing Chip Q1 for 144FPS gaming. 50MP Sony IMX920 VCS sensor and 120W FlashCharge.",
    specifications: {
      Brand: "iQOO",
      Processor: "Qualcomm Snapdragon 8 Gen 2 (4nm)",
      Chip: "Supercomputing Chip Q1 Dedicated Gaming",
      Display: "6.78-inch 144Hz 1.5K LTPO AMOLED",
      Charging: "120W FlashCharge (0 to 50% in 11 mins)",
      Warranty: "1 Year Manufacturer Warranty"
    },
    tags: ["iqoo", "neo 9 pro", "snapdragon 8 gen 2", "gaming phone", "120w"]
  },

  // ── FLAGSHIP PHONES (₹45,000+) ──
  {
    asin: "B0CP97DW96",
    name: "Apple iPhone 16 Pro (128 GB) - Desert Titanium",
    category: "Flagship Phones",
    price: 119900,
    originalPrice: 119900,
    badge: "Pro Flagship",
    rating: 4.9,
    reviewCount: 2150,
    imageUrl: "https://m.media-amazon.com/images/I/71d7rfSl0wL.jpg",
    description: "Grade 5 titanium design with new Desert Titanium finish. Super-powerful A18 Pro chip, 4K 120 fps Dolby Vision recording, 48MP Fusion camera, 5x Telephoto on both Pro sizes, and Camera Control.",
    specifications: {
      Brand: "Apple",
      Model: "iPhone 16 Pro",
      Chip: "A18 Pro with 6-core GPU",
      Display: "6.3-inch Super Retina XDR with ProMotion 120Hz",
      Material: "Grade 5 Titanium Frame",
      Camera: "48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto",
      Warranty: "1 Year Apple Manufacturer"
    },
    tags: ["apple", "iphone 16 pro", "desert titanium", "a18 pro", "flagship"]
  },
  {
    asin: "B0CP97DW97",
    name: "Google Pixel 9 (Peony, 12GB RAM, 256GB Storage)",
    category: "Flagship Phones",
    price: 74999,
    originalPrice: 79999,
    badge: "Google AI Flagship",
    rating: 4.7,
    reviewCount: 1850,
    imageUrl: "https://m.media-amazon.com/images/I/717Qo4MH97L._SX679_.jpg",
    description: "Powered by Google Tensor G4 with 12GB RAM built for Gemini AI. Features groundbreaking Add Me photo tech, 50MP main + 48MP ultra-wide camera with Macro Focus, and 7 years of Pixel drops.",
    specifications: {
      Brand: "Google",
      Model: "Pixel 9",
      Processor: "Google Tensor G4 with Titan M2",
      Display: "6.3-inch Actua OLED 120Hz (2700 nits)",
      RAM: "12GB RAM",
      Updates: "7 Years of OS & Security Updates",
      Warranty: "1 Year Brand Warranty"
    },
    tags: ["google", "pixel 9", "gemini ai", "flagship phone", "best camera"]
  },
  {
    asin: "B0CP97DW98",
    name: "Vivo X100 Pro 5G (Asteroid Black, 16GB RAM, 512GB - ZEISS APO Telephoto)",
    category: "Flagship Phones",
    price: 89999,
    originalPrice: 96999,
    badge: "Best Camera Phone",
    rating: 4.8,
    reviewCount: 1620,
    imageUrl: "https://m.media-amazon.com/images/I/61TLDQrtEOL._SL1500_.jpg",
    description: "Equipped with 1-inch Sony IMX989 sensor and world-first ZEISS APO Floating Telephoto camera. Dimensity 9300 processor, vivo V3 imaging chip, and 100W Dual-Cell FlashCharge.",
    specifications: {
      Brand: "Vivo",
      Sensor: "1-inch 50MP Sony IMX989 OIS Sensor",
      Telephoto: "50MP ZEISS APO Floating Telephoto (100x zoom)",
      Processor: "MediaTek Dimensity 9300 (All-Big-Core)",
      RAM_Storage: "16GB LPDDR5T + 512GB UFS 4.0",
      Warranty: "1 Year Brand Warranty"
    },
    tags: ["vivo x100 pro", "zeiss camera", "1 inch sensor", "flagship", "photography"]
  },

  // ── SPEAKERS & HOME AUDIO ──
  {
    asin: "B0CP97DW99",
    name: "Marshall Stanmore III Wireless Home Bluetooth Speaker (Iconic Rock Sound)",
    category: "Speakers",
    price: 31999,
    originalPrice: 37999,
    badge: "Iconic Sound",
    rating: 4.8,
    reviewCount: 3100,
    imageUrl: "https://m.media-amazon.com/images/I/815nga8GBqL.jpg",
    description: "Re-engineered for a wider stereo soundstage. Features outward-angled tweeters, updated waveguides, Dynamic Loudness, Bluetooth 5.2, and premium textured vinyl casing with brass knobs.",
    specifications: {
      Brand: "Marshall",
      Audio: "80W Class D Amplifier System",
      Connectivity: "Bluetooth 5.2, 3.5mm AUX, RCA Input",
      Controls: "Analog Bass, Treble & Volume Knobs",
      Design: "Vintage Rock 'n' Roll Vinyl with Brass Accents",
      Warranty: "1 Year Official Brand Warranty"
    },
    tags: ["marshall", "stanmore iii", "home speaker", "bluetooth speaker", "audiophile"]
  },
  {
    asin: "B0CP97E001",
    name: "Bose SoundLink Flex Bluetooth Portable Waterproof Speaker (Deep Clear Audio)",
    category: "Speakers",
    price: 13999,
    originalPrice: 15900,
    badge: "Bose Sound Quality",
    rating: 4.8,
    reviewCount: 8900,
    imageUrl: "https://m.media-amazon.com/images/I/71L9o0-0SML.jpg",
    description: "PositionIQ technology automatically optimizes sound orientation. Rigorously tested to meet IP67 waterproof & dustproof rating. Floats in water and resists drops, rust, and UV rays.",
    specifications: {
      Brand: "Bose",
      Tech: "PositionIQ Orientation Optimization",
      Durability: "IP67 Waterproof, Dustproof & Floats",
      Battery: "Up to 12 Hours per charge",
      Mic: "Built-in Speakerphone for Calls",
      Warranty: "1 Year Bose Manufacturer"
    },
    tags: ["bose", "soundlink flex", "waterproof speaker", "outdoor audio", "premium"]
  },
  {
    asin: "B0CP97E002",
    name: "JBL PartyBox 110 Portable Bluetooth Party Speaker with Built-in Dynamic Lights",
    category: "Speakers",
    price: 24999,
    originalPrice: 35999,
    badge: "160W Party Sound",
    rating: 4.8,
    reviewCount: 4600,
    imageUrl: "https://m.media-amazon.com/images/I/81uJyMRONOL.jpg",
    description: "160 Watts of powerful JBL Original Pro Sound with 2 levels of deep adjustable bass. Dynamic LED light show synced to the beat. Mic and guitar inputs for live karaoke.",
    specifications: {
      Brand: "JBL",
      Output: "160 Watts RMS",
      Lighting: "Dynamic RGB Light Show synced to beat",
      Inputs: "Mic, Guitar, USB, 3.5mm AUX, Bluetooth 5.1",
      Battery: "12 Hours Rechargeable Battery (IPX4 Splashproof)",
      Warranty: "1 Year JBL Brand Warranty"
    },
    tags: ["jbl", "partybox 110", "party speaker", "karaoke", "bluetooth speaker"]
  },
  {
    asin: "B0CP97E003",
    name: "Amazon Echo Dot (5th Gen) Smart Speaker with Alexa (Deeper Bass & Motion Sensor)",
    category: "Speakers",
    price: 44999,
    originalPrice: 5499,
    price: 4499,
    badge: "Smart Alexa Speaker",
    rating: 4.6,
    reviewCount: 24500,
    imageUrl: "https://m.media-amazon.com/images/I/614f5R8ReXL._AC_SL1500_.jpg",
    description: "Best-sounding Echo Dot yet with clearer vocals, deeper bass, and vibrant audio. Control smart lights, ask trivia, stream Spotify & Amazon Music, and trigger routines with motion sensor.",
    specifications: {
      Brand: "Amazon",
      Model: "Echo Dot 5th Gen",
      Voice: "Alexa Built-in (Hindi & English)",
      Sensors: "Motion Sensor + Temperature Sensor",
      Audio: "1.73-inch Front-Firing High-Excursion Driver",
      Warranty: "1 Year Amazon Device Warranty"
    },
    tags: ["amazon echo", "echo dot", "alexa speaker", "smart speaker", "home audio"]
  },
  {
    asin: "B0CP97E004",
    name: "boAt Stone 352 Bluetooth Speaker with 10W RMS Stereo Sound & IPX7",
    category: "Speakers",
    price: 1499,
    originalPrice: 3490,
    badge: "Value Bestseller",
    rating: 4.3,
    reviewCount: 19800,
    imageUrl: "https://m.media-amazon.com/images/I/615Mt56oMuL._SY355_.jpg",
    description: "Punchy 10W RMS stereo sound with True Wireless Stereo (TWS) pairing to double the sound. IPX7 water resistance makes it pool & rain proof. Up to 12 hours playback.",
    specifications: {
      Brand: "boAt",
      Output: "10W RMS boAt Signature Sound",
      Waterproof: "IPX7 Water Resistance",
      Playtime: "Up to 12 Hours",
      TWS: "True Wireless Stereo Pairing Supported",
      Warranty: "1 Year boAt Warranty"
    },
    tags: ["boat", "stone 352", "budget speaker", "bluetooth speaker", "portable audio"]
  }
];

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB:", mongoose.connection.name);

  // ── STEP 1: SYNC CATEGORIES ──
  console.log("\n==========================================");
  console.log("STEP 1: SYNCING EXPANDED CATEGORIES");
  console.log("==========================================");
  for (const group of NEW_GROUPS) {
    await Category.findOneAndUpdate(
      { name: group.name },
      { $set: { emoji: group.emoji, slug: group.slug } },
      { upsert: true, new: true }
    );
    console.log(`✓ Synced Category: ${group.emoji} ${group.name}`);
  }

  // ── STEP 2: RE-ORGANIZE EXISTING PRODUCTS INTO SPECIFIC GROUPS ──
  console.log("\n==========================================");
  console.log("STEP 2: REORGANIZING EXISTING PRODUCTS");
  console.log("==========================================");

  // 2a. Move Tablets to "Tablets & E-Readers"
  const tabletKeywords = ["iPad", "Galaxy Tab", "OnePlus Pad", "Kindle"];
  for (const kw of tabletKeywords) {
    const res = await Product.updateMany(
      { name: { $regex: kw, $options: "i" } },
      { $set: { category: "Tablets & E-Readers" } }
    );
    console.log(`  -> Moved "${kw}" products to Tablets & E-Readers (${res.modifiedCount} updated)`);
  }

  // 2b. Move Speakers from Audio & Headphones to "Speakers"
  const speakerKeywords = ["JBL Flip", "JBL Charge", "Marshall Emberton", "boAt Stone", "Soundbar", "Speaker"];
  for (const kw of speakerKeywords) {
    const res = await Product.updateMany(
      {
        name: { $regex: kw, $options: "i" },
        category: { $in: ["Audio & Headphones", "Mobiles & Tablets"] }
      },
      { $set: { category: "Speakers" } }
    );
    console.log(`  -> Moved "${kw}" to Speakers (${res.modifiedCount} updated)`);
  }

  // 2c. Move Flagship Phones (>= ₹45,000) from Mobiles & Tablets to "Flagship Phones"
  const flagshipUpdate = await Product.updateMany(
    {
      category: "Mobiles & Tablets",
      price: { $gte: 45000 },
      name: { $not: { $regex: "iPad|Tab|Kindle", $options: "i" } }
    },
    { $set: { category: "Flagship Phones" } }
  );
  console.log(`  -> Moved ${flagshipUpdate.modifiedCount} products to Flagship Phones`);

  // 2d. Move Mid-Range Phones (₹15,000 - ₹45,000) from Mobiles & Tablets to "Mid-Range Phones"
  const midRangeUpdate = await Product.updateMany(
    {
      category: "Mobiles & Tablets",
      price: { $lt: 45000 },
      name: { $not: { $regex: "iPad|Tab|Kindle", $options: "i" } }
    },
    { $set: { category: "Mid-Range Phones" } }
  );
  console.log(`  -> Moved ${midRangeUpdate.modifiedCount} products to Mid-Range Phones`);

  // ── STEP 3: INSERT NEW BUDGET, MID-RANGE, FLAGSHIP & SPEAKER PRODUCTS ──
  console.log("\n==========================================");
  console.log(`STEP 3: SEEDING ${NEW_PRODUCTS.length} NEW CURATED PRODUCTS`);
  console.log("==========================================");

  for (const item of NEW_PRODUCTS) {
    const cleanName = item.name.replace(/[()[\]]/g, " ").replace(/,\s*/g, " ").replace(/\s+/g, " ").trim();
    const affiliateLink = `https://www.amazon.in/s?k=${encodeURIComponent(cleanName)}&tag=${PARTNER_TAG}`;
    const baseSlug = slugify(item.name).slice(0, 70);
    const slug = `${baseSlug}-${item.asin.toLowerCase()}`;

    const payload = {
      name: item.name,
      slug,
      category: item.category,
      price: item.price,
      originalPrice: item.originalPrice,
      badge: item.badge,
      rating: item.rating,
      reviewCount: item.reviewCount,
      emoji: "",
      description: item.description,
      images: [
        {
          url: item.imageUrl,
          alt: item.name,
          publicId: "",
        },
      ],
      specifications: {
        ...item.specifications,
        ASIN: item.asin,
        "Deal Tag": "Great Indian Festival 2026",
        Source: "Amazon India",
      },
      tags: item.tags || [item.category.toLowerCase(), "amazon", "festival sale"],
      productType: "affiliate",
      source: "amazon",
      affiliateLink,
      inStock: true,
      stockCount: 999,
      isPublished: true,
    };

    await Product.findOneAndUpdate(
      { name: item.name },
      { $set: payload },
      { upsert: true, new: true }
    );
    console.log(`✓ Seeded [${item.category}]: ${item.name} (₹${item.price.toLocaleString()})`);
  }

  // ── STEP 4: UPDATE amazonSaleData.js FILE FOR PERSISTENCE ──
  console.log("\n==========================================");
  console.log("STEP 4: UPDATING amazonSaleData.js FILE");
  console.log("==========================================");

  const dataFilePath = path.join(__dirname, "../data/amazonSaleData.js");
  const currentContent = fs.readFileSync(dataFilePath, "utf8");

  // Re-write the groups export in amazonSaleData.js
  const groupsJson = JSON.stringify(NEW_GROUPS, null, 2);
  const updatedGroupsCode = `export const AMAZON_SALE_GROUPS = ${groupsJson};\n`;

  // Merge updated products
  const existingProducts = [...AMAZON_SALE_PRODUCTS];
  for (const p of existingProducts) {
    if (tabletKeywords.some(kw => p.name.toLowerCase().includes(kw.toLowerCase()))) {
      p.category = "Tablets & E-Readers";
    } else if (speakerKeywords.some(kw => p.name.toLowerCase().includes(kw.toLowerCase())) && p.category === "Audio & Headphones") {
      p.category = "Speakers";
    } else if (p.category === "Mobiles & Tablets") {
      p.category = p.price >= 45000 ? "Flagship Phones" : "Mid-Range Phones";
    }
  }

  // Add new items if not already present
  for (const np of NEW_PRODUCTS) {
    if (!existingProducts.some(ep => ep.name === np.name)) {
      existingProducts.push(np);
    }
  }

  const newProductsJson = JSON.stringify(existingProducts, null, 2);
  const updatedProductsCode = `export const AMAZON_SALE_PRODUCTS = ${newProductsJson};\n`;

  const newFileContent = `/**
 * Amazon India Great Indian Festival Sale 2026 - Top Products
 * Partner Tag: ironrites-21
 */

${updatedGroupsCode}
${updatedProductsCode}`;

  fs.writeFileSync(dataFilePath, newFileContent, "utf8");
  console.log("✓ Successfully saved updated amazonSaleData.js with new groups and products!");

  // Invalidate cache
  invalidateCatalogCache();
  console.log("✓ Catalog cache invalidated.");

  const totalProds = await Product.countDocuments({ isPublished: true });
  console.log(`\n🎉 Total Published Products in Store: ${totalProds}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
