# 📦 Software Products Archive (Hidden Catalog)

> **Archived on:** 2026-10-09T19:39:56.811Z
> **Total Products:** 31
> **Status:** Hidden (`isPublished: false`)

This markdown document archives all software tools and digital products from GaramBazaar so they can be reviewed and unhidden at any time.

## 🚀 How to Unhide / Restore These Products

To unhide all software products and bring them back to the live store at any time:

```bash
# Option 1: Via npm script (inside server/ folder):
npm run software:unhide

# Option 2: Or directly with Node from workspace root:
node server/scripts/restoreSoftwareProducts.js
```

Or via MongoDB Shell / Node:
```javascript
await Product.updateMany(
  { $or: [{ category: "Software" }, { source: { $in: ["web-app", "chrome-extension"] } }] },
  { $set: { isPublished: true, category: "Software" } }
);
await Category.findOneAndUpdate(
  { slug: "software" },
  { name: "Software", slug: "software", emoji: "⚡" },
  { upsert: true }
);
```

## 📋 Overview Table

| # | Product Name | Type | Price | Original Price | Direct / App Link |
|---|---|---|---|---|---|
| 1 | **FocusLog - Developer Productivity Time Tracker** | `web-app` | ₹499 | ₹499 | [Launch App](https://focuslogger.vercel.app/) |
| 2 | **Google Maps Photo Grabber - Bulk Media Downloader** | `chrome-extension` | ₹299 | ₹299 | [Launch App](https://reviewphotograbber.com) |
| 3 | **JD Saver - LinkedIn Job Description Exporter** | `chrome-extension` | ₹399 | ₹399 | [Launch App](https://chromewebstore.google.com/detail/jd-saver-%E2%80%94-linkedin-job-d/oeaimphcdoejljoagbeedpekgachmlpd) |
| 4 | **Call.io - Anonymous WebRTC Video Calling** | `web-app` | ₹199 | ₹199 | [Launch App](https://callrandom.vercel.app/) |
| 5 | **MedScribe AI - Intelligent Clinical Assistant** | `web-app` | ₹1299 | ₹1299 | [Launch App](https://medscribe-ai-ruby.vercel.app/) |
| 6 | **KisanSathi - Smart Farmer Advisor Platform** | `web-app` | ₹0 | ₹0 | [Launch App](https://kisansathi.pages.dev/) |
| 7 | **CrossPostly - Multi-Platform Content Publisher** | `web-app` | ₹799 | ₹799 | [Launch App](https://crosspostly.pages.dev/) |
| 8 | **Garam Softwares - Indie Product Suite** | `web-app` | ₹1499 | ₹1499 | [Launch App](https://garamsoftwares.vercel.app/) |
| 9 | **Garam JSON Formatter & Parser** | `web-app` | ₹99 | ₹99 | [Launch App](https://jso-nformatter-ebon.vercel.app/) |
| 10 | **Garam Resume Builder - Professional Templates** | `web-app` | ₹249 | ₹249 | [Launch App](https://resume-builder-fawn-two.vercel.app/) |
| 11 | **Garam GST Calculator - Instant Tax Estimation** | `web-app` | ₹0 | ₹0 | [Launch App](https://gs-tcalculator.vercel.app/) |
| 12 | **Garam EMI Calculator - Loan Amortization** | `web-app` | ₹0 | ₹0 | [Launch App](https://emicalculator-vert.vercel.app/) |
| 13 | **NIAMT Racing - Institutional Sports Portal** | `web-app` | ₹0 | ₹0 | [Launch App](https://niamtracing.vercel.app/) |
| 14 | **Garam Secure Password Generator** | `web-app` | ₹0 | ₹0 | [Launch App](https://password-generator-tau-sooty.vercel.app/) |
| 15 | **AutoSessionLogger - Automated Coding Logs** | `web-app` | ₹199 | ₹199 | [Launch App](https://github.com/phulkeshwar/AutoSessionLogger) |
| 16 | **RemoveBG Web - High-Speed Background Remover** | `web-app` | ₹299 | ₹299 | [Launch App](https://github.com/phulkeshwar/RemoveBG_Web) |
| 17 | **RenewRadar - Subscription Tracker & Alerts** | `web-app` | ₹149 | ₹149 | [Launch App](https://github.com/phulkeshwar/RenewRadar) |
| 18 | **TrackTix - Smart Event Ticketing System** | `web-app` | ₹599 | ₹599 | [Launch App](https://github.com/phulkeshwar/TrackTix) |
| 19 | **Google Map Review Extractor - Lead Gen Tool** | `chrome-extension` | ₹799 | ₹799 | [Launch App](https://github.com/phulkeshwar/GoogleMapReviewPostExtratorprj) |
| 20 | **Image Extractor Pro - Bulk Image Downloader** | `chrome-extension` | ₹199 | ₹199 | [Launch App](https://mediaextractorpro.vercel.app/) |
| 21 | **Aura Habit Tracker - Mindful Routine Planner** | `web-app` | ₹99 | ₹99 | [Launch App](https://github.com/phulkeshwar/Aura-Habit-Tracker) |
| 22 | **ReliefLink AI - Natural Disaster Aid Router** | `web-app` | ₹0 | ₹0 | [Launch App](https://github.com/phulkeshwar/ReliefLink-AI) |
| 23 | **GaramBites - Local Food Delivery Engine** | `web-app` | ₹499 | ₹499 | [Launch App](https://github.com/phulkeshwar/FoodDeleveryApp) |
| 24 | **CortexAI - Dynamic LLM Chat Client** | `web-app` | ₹399 | ₹399 | [Launch App](https://github.com/phulkeshwar/CortexAI) |
| 25 | **AllInOneMall - Supermarket Multi-Storefront** | `web-app` | ₹899 | ₹899 | [Launch App](https://github.com/phulkeshwar/AllInOneMall) |
| 26 | **ConflictScan - Git Merge Conflict Checker** | `web-app` | ₹299 | ₹299 | [Launch App](https://github.com/phulkeshwar/ConflictScan) |
| 27 | **Skillmart - Freelancer Gigs Marketplace** | `web-app` | ₹699 | ₹699 | [Launch App](https://github.com/phulkeshwar/Skillmart) |
| 28 | **GoLex - Smart Legal Document Scaffolder** | `web-app` | ₹999 | ₹999 | [Launch App](https://github.com/phulkeshwar/SIH-UIP-golex-main) |
| 29 | **YTDL Max - High-Speed Video Downloader** | `web-app` | ₹199 | ₹199 | [Launch App](https://github.com/phulkeshwar/ytdl-max-downloader) |
| 30 | **DSA Tracker Modern - LeetCode & Coding Progress Tracker** | `web-app` | ₹499 | ₹499 | [Launch App](https://github.com/phulkeshwar/DSA-Trackers-Modern) |
| 31 | **LearnOne - Interactive Learning Hub** | `web-app` | ₹0 | ₹0 | [Launch App](https://github.com/phulkeshwar/LearnOne) |

---

## 🔍 Detailed Product Specifications

### 1. FocusLog - Developer Productivity Time Tracker

- **Slug:** `focuslog-developer-productivity-time-tracker`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹499 *(MRP: ₹499)*
- **App / Access URL:** [https://focuslogger.vercel.app/](https://focuslogger.vercel.app/)
- **Preview Image:** ![FocusLog - Developer Productivity Time Tracker](https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80)
- **Description:** Automatic time tracker for developers and freelancers. Privacy first: zero timers to start, all data stored locally on your device.
- **Tags:** software, web-app, gadgets

### 2. Google Maps Photo Grabber - Bulk Media Downloader

- **Slug:** `google-maps-photo-grabber-bulk-media-downloader`
- **Category:** `Software`
- **Product Type:** `chrome-extension`
- **Price:** ₹299 *(MRP: ₹299)*
- **App / Access URL:** [https://reviewphotograbber.com](https://reviewphotograbber.com)
- **Preview Image:** ![Google Maps Photo Grabber - Bulk Media Downloader](https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80)
- **Description:** Extract and bulk-download high-resolution photos and reviews from any Google Maps place list with a single click.
- **Tags:** software, chrome-extension, gadgets

### 3. JD Saver - LinkedIn Job Description Exporter

- **Slug:** `jd-saver-linkedin-job-description-exporter`
- **Category:** `Software`
- **Product Type:** `chrome-extension`
- **Price:** ₹399 *(MRP: ₹399)*
- **App / Access URL:** [https://chromewebstore.google.com/detail/jd-saver-%E2%80%94-linkedin-job-d/oeaimphcdoejljoagbeedpekgachmlpd](https://chromewebstore.google.com/detail/jd-saver-%E2%80%94-linkedin-job-d/oeaimphcdoejljoagbeedpekgachmlpd)
- **Preview Image:** ![JD Saver - LinkedIn Job Description Exporter](https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80)
- **Description:** Save LinkedIn job descriptions as PDF or Markdown with one click. Features an integrated job application tracker.
- **Tags:** software, chrome-extension, gadgets

### 4. Call.io - Anonymous WebRTC Video Calling

- **Slug:** `callio-anonymous-webrtc-video-calling`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹199 *(MRP: ₹199)*
- **App / Access URL:** [https://callrandom.vercel.app/](https://callrandom.vercel.app/)
- **Preview Image:** ![Call.io - Anonymous WebRTC Video Calling](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80)
- **Description:** Fully anonymous WebRTC video and audio calling. No registration, no user accounts, no tracking. Just generate a secure link and share it.
- **Tags:** software, web-app, gadgets

### 5. MedScribe AI - Intelligent Clinical Assistant

- **Slug:** `medscribe-ai-intelligent-clinical-assistant`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹1299 *(MRP: ₹1299)*
- **App / Access URL:** [https://medscribe-ai-ruby.vercel.app/](https://medscribe-ai-ruby.vercel.app/)
- **Preview Image:** ![MedScribe AI - Intelligent Clinical Assistant](https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80)
- **Description:** AI-powered medical scribe assistant built for medical practitioners. Listens to consultations and generates structured clinical summaries.
- **Tags:** software, web-app, gadgets

### 6. KisanSathi - Smart Farmer Advisor Platform

- **Slug:** `kisansathi-smart-farmer-advisor-platform`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹0 *(MRP: ₹0)*
- **App / Access URL:** [https://kisansathi.pages.dev/](https://kisansathi.pages.dev/)
- **Preview Image:** ![KisanSathi - Smart Farmer Advisor Platform](https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80)
- **Description:** An agricultural intelligence portal helping local farmers identify plant diseases, get weather advisories, and track market crop rates.
- **Tags:** software, web-app, gadgets

### 7. CrossPostly - Multi-Platform Content Publisher

- **Slug:** `crosspostly-multi-platform-content-publisher`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹799 *(MRP: ₹799)*
- **App / Access URL:** [https://crosspostly.pages.dev/](https://crosspostly.pages.dev/)
- **Preview Image:** ![CrossPostly - Multi-Platform Content Publisher](https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80)
- **Description:** Write once, publish everywhere. Post your updates, blogs, and articles to LinkedIn, X (Twitter), Dev.to, and Medium simultaneously.
- **Tags:** software, web-app, gadgets

### 8. Garam Softwares - Indie Product Suite

- **Slug:** `garam-softwares-indie-product-suite`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹1499 *(MRP: ₹1499)*
- **App / Access URL:** [https://garamsoftwares.vercel.app/](https://garamsoftwares.vercel.app/)
- **Preview Image:** ![Garam Softwares - Indie Product Suite](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80)
- **Description:** The centralized administrative hub and digital product showcase for premium tools shipped by Garam Softwares.
- **Tags:** software, web-app, gadgets

### 9. Garam JSON Formatter & Parser

- **Slug:** `garam-json-formatter-parser`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹99 *(MRP: ₹99)*
- **App / Access URL:** [https://jso-nformatter-ebon.vercel.app/](https://jso-nformatter-ebon.vercel.app/)
- **Preview Image:** ![Garam JSON Formatter & Parser](https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80)
- **Description:** Clean, lightning-fast JSON formatter, validator, and tree-viewer built for developers.
- **Tags:** software, web-app, gadgets

### 10. Garam Resume Builder - Professional Templates

- **Slug:** `garam-resume-builder-professional-templates`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹249 *(MRP: ₹249)*
- **App / Access URL:** [https://resume-builder-fawn-two.vercel.app/](https://resume-builder-fawn-two.vercel.app/)
- **Preview Image:** ![Garam Resume Builder - Professional Templates](https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80)
- **Description:** Build high-impact, ATS-friendly professional resumes in minutes. Export cleanly to PDF.
- **Tags:** software, web-app, gadgets

### 11. Garam GST Calculator - Instant Tax Estimation

- **Slug:** `garam-gst-calculator-instant-tax-estimation`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹0 *(MRP: ₹0)*
- **App / Access URL:** [https://gs-tcalculator.vercel.app/](https://gs-tcalculator.vercel.app/)
- **Preview Image:** ![Garam GST Calculator - Instant Tax Estimation](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80)
- **Description:** Calculate Goods and Services Tax (GST) instantly with customizable percentage slabs for businesses.
- **Tags:** software, web-app, gadgets

### 12. Garam EMI Calculator - Loan Amortization

- **Slug:** `garam-emi-calculator-loan-amortization`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹0 *(MRP: ₹0)*
- **App / Access URL:** [https://emicalculator-vert.vercel.app/](https://emicalculator-vert.vercel.app/)
- **Preview Image:** ![Garam EMI Calculator - Loan Amortization](https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80)
- **Description:** Plan your loans smarter. Calculate Equated Monthly Installments (EMI) and view full interest schedules.
- **Tags:** software, web-app, gadgets

### 13. NIAMT Racing - Institutional Sports Portal

- **Slug:** `niamt-racing-institutional-sports-portal`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹0 *(MRP: ₹0)*
- **App / Access URL:** [https://niamtracing.vercel.app/](https://niamtracing.vercel.app/)
- **Preview Image:** ![NIAMT Racing - Institutional Sports Portal](https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80)
- **Description:** Official web portal for NIAMT's Formula Student team. Features race statistics, engineering telemetry, and sponsor details.
- **Tags:** software, web-app, gadgets

### 14. Garam Secure Password Generator

- **Slug:** `garam-secure-password-generator`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹0 *(MRP: ₹0)*
- **App / Access URL:** [https://password-generator-tau-sooty.vercel.app/](https://password-generator-tau-sooty.vercel.app/)
- **Preview Image:** ![Garam Secure Password Generator](https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80)
- **Description:** Generate cryptographically secure, high-entropy random passwords to protect your digital accounts.
- **Tags:** software, web-app, gadgets

### 15. AutoSessionLogger - Automated Coding Logs

- **Slug:** `autosessionlogger-automated-coding-logs`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹199 *(MRP: ₹199)*
- **App / Access URL:** [https://github.com/phulkeshwar/AutoSessionLogger](https://github.com/phulkeshwar/AutoSessionLogger)
- **Preview Image:** ![AutoSessionLogger - Automated Coding Logs](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80)
- **Description:** Automate your session logging and activity tracking with simple background hooks.
- **Tags:** software, web-app, gadgets

### 16. RemoveBG Web - High-Speed Background Remover

- **Slug:** `removebg-web-high-speed-background-remover`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹299 *(MRP: ₹299)*
- **App / Access URL:** [https://github.com/phulkeshwar/RemoveBG_Web](https://github.com/phulkeshwar/RemoveBG_Web)
- **Preview Image:** ![RemoveBG Web - High-Speed Background Remover](https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=600&q=80)
- **Description:** Upload any image and remove its background instantly using local WebGL-powered edge detection.
- **Tags:** software, web-app, gadgets

### 17. RenewRadar - Subscription Tracker & Alerts

- **Slug:** `renewradar-subscription-tracker-alerts`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹149 *(MRP: ₹149)*
- **App / Access URL:** [https://github.com/phulkeshwar/RenewRadar](https://github.com/phulkeshwar/RenewRadar)
- **Preview Image:** ![RenewRadar - Subscription Tracker & Alerts](https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80)
- **Description:** Keep track of your SaaS subscriptions and domain renewals. Get automated reminder digests.
- **Tags:** software, web-app, gadgets

### 18. TrackTix - Smart Event Ticketing System

- **Slug:** `tracktix-smart-event-ticketing-system`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹599 *(MRP: ₹599)*
- **App / Access URL:** [https://github.com/phulkeshwar/TrackTix](https://github.com/phulkeshwar/TrackTix)
- **Preview Image:** ![TrackTix - Smart Event Ticketing System](https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80)
- **Description:** Secure, lightweight event ticket booking and verification dashboard using QR codes.
- **Tags:** software, web-app, gadgets

### 19. Google Map Review Extractor - Lead Gen Tool

- **Slug:** `google-map-review-extractor-lead-gen-tool`
- **Category:** `Software`
- **Product Type:** `chrome-extension`
- **Price:** ₹799 *(MRP: ₹799)*
- **App / Access URL:** [https://github.com/phulkeshwar/GoogleMapReviewPostExtratorprj](https://github.com/phulkeshwar/GoogleMapReviewPostExtratorprj)
- **Preview Image:** ![Google Map Review Extractor - Lead Gen Tool](https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80)
- **Description:** Extract reviews, ratings, and contact info from Google Maps places automatically into CSV reports.
- **Tags:** software, chrome-extension, gadgets

### 20. Image Extractor Pro - Bulk Image Downloader

- **Slug:** `image-extractor-pro-bulk-image-downloader`
- **Category:** `Software`
- **Product Type:** `chrome-extension`
- **Price:** ₹199 *(MRP: ₹199)*
- **App / Access URL:** [https://mediaextractorpro.vercel.app/](https://mediaextractorpro.vercel.app/)
- **Preview Image:** ![Image Extractor Pro - Bulk Image Downloader](https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80)
- **Description:** Inspect websites, extract all image assets, filter by size, and batch-download them as a single ZIP file.
- **Tags:** software, chrome-extension, gadgets

### 21. Aura Habit Tracker - Mindful Routine Planner

- **Slug:** `aura-habit-tracker-mindful-routine-planner`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹99 *(MRP: ₹99)*
- **App / Access URL:** [https://github.com/phulkeshwar/Aura-Habit-Tracker](https://github.com/phulkeshwar/Aura-Habit-Tracker)
- **Preview Image:** ![Aura Habit Tracker - Mindful Routine Planner](https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80)
- **Description:** Track your habits, view streak analytics, and build long-term positive routines.
- **Tags:** software, web-app, gadgets

### 22. ReliefLink AI - Natural Disaster Aid Router

- **Slug:** `relieflink-ai-natural-disaster-aid-router`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹0 *(MRP: ₹0)*
- **App / Access URL:** [https://github.com/phulkeshwar/ReliefLink-AI](https://github.com/phulkeshwar/ReliefLink-AI)
- **Preview Image:** ![ReliefLink AI - Natural Disaster Aid Router](https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80)
- **Description:** Disaster relief router that automatically coordinates emergency supplies and volunteer allocations.
- **Tags:** software, web-app, gadgets

### 23. GaramBites - Local Food Delivery Engine

- **Slug:** `garambites-local-food-delivery-engine`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹499 *(MRP: ₹499)*
- **App / Access URL:** [https://github.com/phulkeshwar/FoodDeleveryApp](https://github.com/phulkeshwar/FoodDeleveryApp)
- **Preview Image:** ![GaramBites - Local Food Delivery Engine](https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80)
- **Description:** Full-stack food ordering application with live driver location tracking and multi-restaurant menus.
- **Tags:** software, web-app, gadgets

### 24. CortexAI - Dynamic LLM Chat Client

- **Slug:** `cortexai-dynamic-llm-chat-client`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹399 *(MRP: ₹399)*
- **App / Access URL:** [https://github.com/phulkeshwar/CortexAI](https://github.com/phulkeshwar/CortexAI)
- **Preview Image:** ![CortexAI - Dynamic LLM Chat Client](https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80)
- **Description:** Beautiful, markdown-supported chatbot UI supporting model swapping across OpenAI, Claude, and Gemini APIs.
- **Tags:** software, web-app, gadgets

### 25. AllInOneMall - Supermarket Multi-Storefront

- **Slug:** `allinonemall-supermarket-multi-storefront`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹899 *(MRP: ₹899)*
- **App / Access URL:** [https://github.com/phulkeshwar/AllInOneMall](https://github.com/phulkeshwar/AllInOneMall)
- **Preview Image:** ![AllInOneMall - Supermarket Multi-Storefront](https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80)
- **Description:** E-commerce directory allowing local supermarkets to launch online branches instantly.
- **Tags:** software, web-app, gadgets

### 26. ConflictScan - Git Merge Conflict Checker

- **Slug:** `conflictscan-git-merge-conflict-checker`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹299 *(MRP: ₹299)*
- **App / Access URL:** [https://github.com/phulkeshwar/ConflictScan](https://github.com/phulkeshwar/ConflictScan)
- **Preview Image:** ![ConflictScan - Git Merge Conflict Checker](https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80)
- **Description:** Scan your repositories for unresolved merge conflicts and format-broken diff tags before committing.
- **Tags:** software, web-app, gadgets

### 27. Skillmart - Freelancer Gigs Marketplace

- **Slug:** `skillmart-freelancer-gigs-marketplace`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹699 *(MRP: ₹699)*
- **App / Access URL:** [https://github.com/phulkeshwar/Skillmart](https://github.com/phulkeshwar/Skillmart)
- **Preview Image:** ![Skillmart - Freelancer Gigs Marketplace](https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80)
- **Description:** Indie marketplace connecting student engineers and designers with real client contracts.
- **Tags:** software, web-app, gadgets

### 28. GoLex - Smart Legal Document Scaffolder

- **Slug:** `golex-smart-legal-document-scaffolder`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹999 *(MRP: ₹999)*
- **App / Access URL:** [https://github.com/phulkeshwar/SIH-UIP-golex-main](https://github.com/phulkeshwar/SIH-UIP-golex-main)
- **Preview Image:** ![GoLex - Smart Legal Document Scaffolder](https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80)
- **Description:** AI legal assistant designed for Smart India Hackathon. Generates and validates contracts.
- **Tags:** software, web-app, gadgets

### 29. YTDL Max - High-Speed Video Downloader

- **Slug:** `ytdl-max-high-speed-video-downloader`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹199 *(MRP: ₹199)*
- **App / Access URL:** [https://github.com/phulkeshwar/ytdl-max-downloader](https://github.com/phulkeshwar/ytdl-max-downloader)
- **Preview Image:** ![YTDL Max - High-Speed Video Downloader](https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80)
- **Description:** High-speed audio/video downloader for web publishers. Supports multi-threading and MP3 extraction.
- **Tags:** software, web-app, gadgets

### 30. DSA Tracker Modern - LeetCode & Coding Progress Tracker

- **Slug:** `dsa-tracker-modern-leetcode-coding-progress-tracker`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹499 *(MRP: ₹499)*
- **App / Access URL:** [https://github.com/phulkeshwar/DSA-Trackers-Modern](https://github.com/phulkeshwar/DSA-Trackers-Modern)
- **Preview Image:** ![DSA Tracker Modern - LeetCode & Coding Progress Tracker](https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80)
- **Description:** Modern developer analytics dashboard to track Data Structures & Algorithms problem solving streaks.
- **Tags:** software, web-app, gadgets

### 31. LearnOne - Interactive Learning Hub

- **Slug:** `learnone-interactive-learning-hub`
- **Category:** `Software`
- **Product Type:** `web-app`
- **Price:** ₹0 *(MRP: ₹0)*
- **App / Access URL:** [https://github.com/phulkeshwar/LearnOne](https://github.com/phulkeshwar/LearnOne)
- **Preview Image:** ![LearnOne - Interactive Learning Hub](https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80)
- **Description:** Interactive computer science learning platform with structured course modules and code sandboxes.
- **Tags:** software, web-app, gadgets


---

## 💾 Full Raw Data (JSON Backup)

```json
[
  {
    "_id": "6ab22f64df69731f24029184",
    "affiliateLink": "https://focuslogger.vercel.app/",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:57.007Z",
    "deliveryFee": 0,
    "description": "Automatic time tracker for developers and freelancers. Privacy first: zero timers to start, all data stored locally on your device.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "FocusLog - Developer Productivity Time Tracker"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "FocusLog - Developer Productivity Time Tracker",
    "originalPrice": null,
    "price": 499,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 144,
    "sku": "",
    "slug": "focuslog-developer-productivity-time-tracker",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:38:59.442Z",
    "variants": []
  },
  {
    "_id": "6ab22f64df69731f24029185",
    "affiliateLink": "https://reviewphotograbber.com",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:57.119Z",
    "deliveryFee": 0,
    "description": "Extract and bulk-download high-resolution photos and reviews from any Google Maps place list with a single click.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "Google Maps Photo Grabber - Bulk Media Downloader"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "Google Maps Photo Grabber - Bulk Media Downloader",
    "originalPrice": null,
    "price": 299,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 239,
    "sku": "",
    "slug": "google-maps-photo-grabber-bulk-media-downloader",
    "source": "chrome-extension",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "chrome-extension",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:38:59.622Z",
    "variants": []
  },
  {
    "_id": "6ab22f64df69731f24029186",
    "affiliateLink": "https://chromewebstore.google.com/detail/jd-saver-%E2%80%94-linkedin-job-d/oeaimphcdoejljoagbeedpekgachmlpd",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:57.220Z",
    "deliveryFee": 0,
    "description": "Save LinkedIn job descriptions as PDF or Markdown with one click. Features an integrated job application tracker.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "JD Saver - LinkedIn Job Description Exporter"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "JD Saver - LinkedIn Job Description Exporter",
    "originalPrice": null,
    "price": 399,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 98,
    "sku": "",
    "slug": "jd-saver-linkedin-job-description-exporter",
    "source": "chrome-extension",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "chrome-extension",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:38:59.785Z",
    "variants": []
  },
  {
    "_id": "6ab22f64df69731f24029187",
    "affiliateLink": "https://callrandom.vercel.app/",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:57.321Z",
    "deliveryFee": 0,
    "description": "Fully anonymous WebRTC video and audio calling. No registration, no user accounts, no tracking. Just generate a secure link and share it.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "Call.io - Anonymous WebRTC Video Calling"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "Call.io - Anonymous WebRTC Video Calling",
    "originalPrice": null,
    "price": 199,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 161,
    "sku": "",
    "slug": "callio-anonymous-webrtc-video-calling",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:38:59.950Z",
    "variants": []
  },
  {
    "_id": "6ab22f65df69731f24029188",
    "affiliateLink": "https://medscribe-ai-ruby.vercel.app/",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:57.421Z",
    "deliveryFee": 0,
    "description": "AI-powered medical scribe assistant built for medical practitioners. Listens to consultations and generates structured clinical summaries.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "MedScribe AI - Intelligent Clinical Assistant"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "MedScribe AI - Intelligent Clinical Assistant",
    "originalPrice": null,
    "price": 1299,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 178,
    "sku": "",
    "slug": "medscribe-ai-intelligent-clinical-assistant",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:00.115Z",
    "variants": []
  },
  {
    "_id": "6ab22f65df69731f24029189",
    "affiliateLink": "https://kisansathi.pages.dev/",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:57.522Z",
    "deliveryFee": 0,
    "description": "An agricultural intelligence portal helping local farmers identify plant diseases, get weather advisories, and track market crop rates.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "KisanSathi - Smart Farmer Advisor Platform"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "KisanSathi - Smart Farmer Advisor Platform",
    "originalPrice": null,
    "price": 0,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 103,
    "sku": "",
    "slug": "kisansathi-smart-farmer-advisor-platform",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:00.280Z",
    "variants": []
  },
  {
    "_id": "6ab22f65df69731f2402918a",
    "affiliateLink": "https://crosspostly.pages.dev/",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:57.622Z",
    "deliveryFee": 0,
    "description": "Write once, publish everywhere. Post your updates, blogs, and articles to LinkedIn, X (Twitter), Dev.to, and Medium simultaneously.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "CrossPostly - Multi-Platform Content Publisher"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "CrossPostly - Multi-Platform Content Publisher",
    "originalPrice": null,
    "price": 799,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 210,
    "sku": "",
    "slug": "crosspostly-multi-platform-content-publisher",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:00.443Z",
    "variants": []
  },
  {
    "_id": "6ab22f65df69731f2402918b",
    "affiliateLink": "https://garamsoftwares.vercel.app/",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:57.721Z",
    "deliveryFee": 0,
    "description": "The centralized administrative hub and digital product showcase for premium tools shipped by Garam Softwares.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "Garam Softwares - Indie Product Suite"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "Garam Softwares - Indie Product Suite",
    "originalPrice": null,
    "price": 1499,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 41,
    "sku": "",
    "slug": "garam-softwares-indie-product-suite",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:00.604Z",
    "variants": []
  },
  {
    "_id": "6ab22f65df69731f2402918c",
    "affiliateLink": "https://jso-nformatter-ebon.vercel.app/",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:57.822Z",
    "deliveryFee": 0,
    "description": "Clean, lightning-fast JSON formatter, validator, and tree-viewer built for developers.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "Garam JSON Formatter & Parser"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "Garam JSON Formatter & Parser",
    "originalPrice": null,
    "price": 99,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 56,
    "sku": "",
    "slug": "garam-json-formatter-parser",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:00.766Z",
    "variants": []
  },
  {
    "_id": "6ab22f65df69731f2402918d",
    "affiliateLink": "https://resume-builder-fawn-two.vercel.app/",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:57.923Z",
    "deliveryFee": 0,
    "description": "Build high-impact, ATS-friendly professional resumes in minutes. Export cleanly to PDF.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "Garam Resume Builder - Professional Templates"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "Garam Resume Builder - Professional Templates",
    "originalPrice": null,
    "price": 249,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 231,
    "sku": "",
    "slug": "garam-resume-builder-professional-templates",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:00.936Z",
    "variants": []
  },
  {
    "_id": "6ab22f65df69731f2402918e",
    "affiliateLink": "https://gs-tcalculator.vercel.app/",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:58.027Z",
    "deliveryFee": 0,
    "description": "Calculate Goods and Services Tax (GST) instantly with customizable percentage slabs for businesses.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "Garam GST Calculator - Instant Tax Estimation"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "Garam GST Calculator - Instant Tax Estimation",
    "originalPrice": null,
    "price": 0,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 210,
    "sku": "",
    "slug": "garam-gst-calculator-instant-tax-estimation",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:01.098Z",
    "variants": []
  },
  {
    "_id": "6ab22f65df69731f2402918f",
    "affiliateLink": "https://emicalculator-vert.vercel.app/",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:58.142Z",
    "deliveryFee": 0,
    "description": "Plan your loans smarter. Calculate Equated Monthly Installments (EMI) and view full interest schedules.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "Garam EMI Calculator - Loan Amortization"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "Garam EMI Calculator - Loan Amortization",
    "originalPrice": null,
    "price": 0,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 54,
    "sku": "",
    "slug": "garam-emi-calculator-loan-amortization",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:01.260Z",
    "variants": []
  },
  {
    "_id": "6ab22f65df69731f24029190",
    "affiliateLink": "https://niamtracing.vercel.app/",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:58.256Z",
    "deliveryFee": 0,
    "description": "Official web portal for NIAMT's Formula Student team. Features race statistics, engineering telemetry, and sponsor details.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "NIAMT Racing - Institutional Sports Portal"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "NIAMT Racing - Institutional Sports Portal",
    "originalPrice": null,
    "price": 0,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 77,
    "sku": "",
    "slug": "niamt-racing-institutional-sports-portal",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:01.422Z",
    "variants": []
  },
  {
    "_id": "6ab22f65df69731f24029191",
    "affiliateLink": "https://password-generator-tau-sooty.vercel.app/",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:58.358Z",
    "deliveryFee": 0,
    "description": "Generate cryptographically secure, high-entropy random passwords to protect your digital accounts.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "Garam Secure Password Generator"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "Garam Secure Password Generator",
    "originalPrice": null,
    "price": 0,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 117,
    "sku": "",
    "slug": "garam-secure-password-generator",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:01.583Z",
    "variants": []
  },
  {
    "_id": "6ab22f66df69731f24029192",
    "affiliateLink": "https://github.com/phulkeshwar/AutoSessionLogger",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:58.459Z",
    "deliveryFee": 0,
    "description": "Automate your session logging and activity tracking with simple background hooks.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "AutoSessionLogger - Automated Coding Logs"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "AutoSessionLogger - Automated Coding Logs",
    "originalPrice": null,
    "price": 199,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 174,
    "sku": "",
    "slug": "autosessionlogger-automated-coding-logs",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:01.746Z",
    "variants": []
  },
  {
    "_id": "6ab22f66df69731f24029193",
    "affiliateLink": "https://github.com/phulkeshwar/RemoveBG_Web",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:58.560Z",
    "deliveryFee": 0,
    "description": "Upload any image and remove its background instantly using local WebGL-powered edge detection.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "RemoveBG Web - High-Speed Background Remover"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "RemoveBG Web - High-Speed Background Remover",
    "originalPrice": null,
    "price": 299,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 210,
    "sku": "",
    "slug": "removebg-web-high-speed-background-remover",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:01.905Z",
    "variants": []
  },
  {
    "_id": "6ab22f66df69731f24029194",
    "affiliateLink": "https://github.com/phulkeshwar/RenewRadar",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:58.658Z",
    "deliveryFee": 0,
    "description": "Keep track of your SaaS subscriptions and domain renewals. Get automated reminder digests.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "RenewRadar - Subscription Tracker & Alerts"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "RenewRadar - Subscription Tracker & Alerts",
    "originalPrice": null,
    "price": 149,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 107,
    "sku": "",
    "slug": "renewradar-subscription-tracker-alerts",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:02.068Z",
    "variants": []
  },
  {
    "_id": "6ab22f66df69731f24029195",
    "affiliateLink": "https://github.com/phulkeshwar/TrackTix",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:58.757Z",
    "deliveryFee": 0,
    "description": "Secure, lightweight event ticket booking and verification dashboard using QR codes.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "TrackTix - Smart Event Ticketing System"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "TrackTix - Smart Event Ticketing System",
    "originalPrice": null,
    "price": 599,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 223,
    "sku": "",
    "slug": "tracktix-smart-event-ticketing-system",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:02.234Z",
    "variants": []
  },
  {
    "_id": "6ab22f66df69731f24029196",
    "affiliateLink": "https://github.com/phulkeshwar/GoogleMapReviewPostExtratorprj",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:58.856Z",
    "deliveryFee": 0,
    "description": "Extract reviews, ratings, and contact info from Google Maps places automatically into CSV reports.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "Google Map Review Extractor - Lead Gen Tool"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "Google Map Review Extractor - Lead Gen Tool",
    "originalPrice": null,
    "price": 799,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 97,
    "sku": "",
    "slug": "google-map-review-extractor-lead-gen-tool",
    "source": "chrome-extension",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "chrome-extension",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:02.396Z",
    "variants": []
  },
  {
    "_id": "6ab22f66df69731f24029197",
    "affiliateLink": "https://mediaextractorpro.vercel.app/",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:58.953Z",
    "deliveryFee": 0,
    "description": "Inspect websites, extract all image assets, filter by size, and batch-download them as a single ZIP file.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "Image Extractor Pro - Bulk Image Downloader"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "Image Extractor Pro - Bulk Image Downloader",
    "originalPrice": null,
    "price": 199,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 61,
    "sku": "",
    "slug": "image-extractor-pro-bulk-image-downloader",
    "source": "chrome-extension",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "chrome-extension",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:02.605Z",
    "variants": []
  },
  {
    "_id": "6ab22f66df69731f24029198",
    "affiliateLink": "https://github.com/phulkeshwar/Aura-Habit-Tracker",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:59.060Z",
    "deliveryFee": 0,
    "description": "Track your habits, view streak analytics, and build long-term positive routines.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "Aura Habit Tracker - Mindful Routine Planner"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "Aura Habit Tracker - Mindful Routine Planner",
    "originalPrice": null,
    "price": 99,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 120,
    "sku": "",
    "slug": "aura-habit-tracker-mindful-routine-planner",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:02.773Z",
    "variants": []
  },
  {
    "_id": "6ab22f66df69731f24029199",
    "affiliateLink": "https://github.com/phulkeshwar/ReliefLink-AI",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:59.158Z",
    "deliveryFee": 0,
    "description": "Disaster relief router that automatically coordinates emergency supplies and volunteer allocations.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "ReliefLink AI - Natural Disaster Aid Router"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "ReliefLink AI - Natural Disaster Aid Router",
    "originalPrice": null,
    "price": 0,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 216,
    "sku": "",
    "slug": "relieflink-ai-natural-disaster-aid-router",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:02.934Z",
    "variants": []
  },
  {
    "_id": "6ab22f66df69731f2402919a",
    "affiliateLink": "https://github.com/phulkeshwar/FoodDeleveryApp",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:59.256Z",
    "deliveryFee": 0,
    "description": "Full-stack food ordering application with live driver location tracking and multi-restaurant menus.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "GaramBites - Local Food Delivery Engine"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "GaramBites - Local Food Delivery Engine",
    "originalPrice": null,
    "price": 499,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 197,
    "sku": "",
    "slug": "garambites-local-food-delivery-engine",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:03.098Z",
    "variants": []
  },
  {
    "_id": "6ab22f66df69731f2402919b",
    "affiliateLink": "https://github.com/phulkeshwar/CortexAI",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:59.369Z",
    "deliveryFee": 0,
    "description": "Beautiful, markdown-supported chatbot UI supporting model swapping across OpenAI, Claude, and Gemini APIs.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "CortexAI - Dynamic LLM Chat Client"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "CortexAI - Dynamic LLM Chat Client",
    "originalPrice": null,
    "price": 399,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 104,
    "sku": "",
    "slug": "cortexai-dynamic-llm-chat-client",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:03.261Z",
    "variants": []
  },
  {
    "_id": "6ab22f67df69731f2402919c",
    "affiliateLink": "https://github.com/phulkeshwar/AllInOneMall",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:59.471Z",
    "deliveryFee": 0,
    "description": "E-commerce directory allowing local supermarkets to launch online branches instantly.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "AllInOneMall - Supermarket Multi-Storefront"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "AllInOneMall - Supermarket Multi-Storefront",
    "originalPrice": null,
    "price": 899,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 162,
    "sku": "",
    "slug": "allinonemall-supermarket-multi-storefront",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:03.420Z",
    "variants": []
  },
  {
    "_id": "6ab22f67df69731f2402919d",
    "affiliateLink": "https://github.com/phulkeshwar/ConflictScan",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:59.574Z",
    "deliveryFee": 0,
    "description": "Scan your repositories for unresolved merge conflicts and format-broken diff tags before committing.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "ConflictScan - Git Merge Conflict Checker"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "ConflictScan - Git Merge Conflict Checker",
    "originalPrice": null,
    "price": 299,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 96,
    "sku": "",
    "slug": "conflictscan-git-merge-conflict-checker",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:03.580Z",
    "variants": []
  },
  {
    "_id": "6ab22f67df69731f2402919e",
    "affiliateLink": "https://github.com/phulkeshwar/Skillmart",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:59.675Z",
    "deliveryFee": 0,
    "description": "Indie marketplace connecting student engineers and designers with real client contracts.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "Skillmart - Freelancer Gigs Marketplace"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "Skillmart - Freelancer Gigs Marketplace",
    "originalPrice": null,
    "price": 699,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 174,
    "sku": "",
    "slug": "skillmart-freelancer-gigs-marketplace",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:03.743Z",
    "variants": []
  },
  {
    "_id": "6ab22f67df69731f2402919f",
    "affiliateLink": "https://github.com/phulkeshwar/SIH-UIP-golex-main",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:59.775Z",
    "deliveryFee": 0,
    "description": "AI legal assistant designed for Smart India Hackathon. Generates and validates contracts.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "GoLex - Smart Legal Document Scaffolder"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "GoLex - Smart Legal Document Scaffolder",
    "originalPrice": null,
    "price": 999,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 56,
    "sku": "",
    "slug": "golex-smart-legal-document-scaffolder",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:03.906Z",
    "variants": []
  },
  {
    "_id": "6ab22f67df69731f240291a0",
    "affiliateLink": "https://github.com/phulkeshwar/ytdl-max-downloader",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-09-22T07:33:59.881Z",
    "deliveryFee": 0,
    "description": "High-speed audio/video downloader for web publishers. Supports multi-threading and MP3 extraction.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "YTDL Max - High-Speed Video Downloader"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "YTDL Max - High-Speed Video Downloader",
    "originalPrice": null,
    "price": 199,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 195,
    "sku": "",
    "slug": "ytdl-max-high-speed-video-downloader",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:04.067Z",
    "variants": []
  },
  {
    "_id": "6ac93b8b7ea5980540a9cc7e",
    "affiliateLink": "https://github.com/phulkeshwar/DSA-Trackers-Modern",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-10-09T19:07:55.216Z",
    "deliveryFee": 0,
    "description": "Modern developer analytics dashboard to track Data Structures & Algorithms problem solving streaks.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "DSA Tracker Modern - LeetCode & Coding Progress Tracker"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "DSA Tracker Modern - LeetCode & Coding Progress Tracker",
    "originalPrice": null,
    "price": 499,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 41,
    "sku": "",
    "slug": "dsa-tracker-modern-leetcode-coding-progress-tracker",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:04.229Z",
    "variants": []
  },
  {
    "_id": "6ac93b8b7ea5980540a9cc7f",
    "affiliateLink": "https://github.com/phulkeshwar/LearnOne",
    "__v": 0,
    "badge": null,
    "barcode": "",
    "category": "Software",
    "createdAt": "2026-10-09T19:07:55.353Z",
    "deliveryFee": 0,
    "description": "Interactive computer science learning platform with structured course modules and code sandboxes.",
    "emoji": "📦",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80",
        "publicId": "",
        "alt": "LearnOne - Interactive Learning Hub"
      }
    ],
    "inStock": true,
    "isFeatured": false,
    "isPublished": true,
    "name": "LearnOne - Interactive Learning Hub",
    "originalPrice": null,
    "price": 0,
    "productType": "affiliate",
    "quantityDiscounts": [],
    "rating": 4.6,
    "reviewCount": 182,
    "sku": "",
    "slug": "learnone-interactive-learning-hub",
    "source": "web-app",
    "specifications": {},
    "stockCount": 999,
    "tags": [
      "software",
      "web-app",
      "gadgets"
    ],
    "updatedAt": "2026-10-09T19:39:04.392Z",
    "variants": []
  }
]
```
