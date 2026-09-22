/**
 * GaramBazaar Store Knowledge Base Chunks
 * Curated domain knowledge for vector-based semantic RAG retrieval.
 */

export const STORE_KNOWLEDGE_CHUNKS = [
  {
    id: "delivery_timelines",
    category: "delivery",
    title: "Delivery Timelines & Dispatch Speed",
    tags: ["delivery", "transit", "shipping time", "dispatch", "ranchi", "metros", "duration"],
    content: `GaramBazaar orders are processed and dispatched within 24 to 48 hours of order confirmation.
Delivery timelines by location:
- Local Deliveries (Ranchi & Jharkhand regions): Delivered within 1 to 2 business days.
- Metro Cities (Delhi NCR, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Pune): Delivered within 3 to 5 business days.
- Rest of India: Delivered within 5 to 7 business days depending on location accessibility.
Once dispatched, real-time tracking details and courier links are sent via SMS and email. Shoppers can also track order status live anytime under [My Orders](/orders).`
  },
  {
    id: "delivery_charges_threshold",
    category: "delivery",
    title: "Shipping Rates & Free Delivery Threshold",
    tags: ["shipping charges", "delivery fee", "free shipping", "cost", "threshold", "rate"],
    content: `Shipping charges and free delivery rules:
- Standard Shipping Fee: A flat rate of ₹49 is applied to orders below ₹500.
- FREE Delivery: All orders with a subtotal of ₹500 or more automatically qualify for 100% FREE delivery across India.
- Shoppers can easily add small pantry items or snacks to their cart to reach the ₹500 milestone and avoid shipping charges.`
  },
  {
    id: "eco_packaging",
    category: "delivery",
    title: "Packaging Quality & Freshness Guarantee",
    tags: ["packaging", "freshness", "eco friendly", "plastic free", "glass jars", "safety"],
    content: `GaramBazaar uses 100% eco-friendly, carbon-neutral packaging:
- Flours, spices, pulses, and dry items are packaged in food-grade, multi-layer kraft paper bags.
- Wild forest honey, pure cow ghee, and cold-pressed oils are sealed in premium food-grade glass jars.
- Liquid containers are wrapped in biodegradable honeycomb paper cushion to prevent transit breakage without using single-use plastics.`
  },
  {
    id: "return_policy",
    category: "returns",
    title: "7-Day Return and Replacement Policy",
    tags: ["returns", "return policy", "replace", "damaged", "spoiled", "7 days", "broken"],
    content: `GaramBazaar offers a 7-day hassle-free return policy:
- Eligibility: You can request a return or replacement within 7 days of delivery through the [My Orders](/orders) page.
- Food & Perishables: If you receive damaged packaging, leaked oils, or stale/spoiled goods, you do NOT need to physically return the food item. Simply submit a photo of the defect in your return claim for instant approval.
- Crafts & Non-Perishables: Items must be unused and retained with original packaging and tags.
- How to request: Go to [My Orders](/orders) -> Click 'Request Return' on your delivered order -> select reason and upload photos.`
  },
  {
    id: "refund_timeline",
    category: "returns",
    title: "Refund Process & Bank Transfer Timelines",
    tags: ["refund", "money back", "upi refund", "card refund", "bank transfer", "timeline"],
    content: `Refund settlement timelines after admin approval:
- UPI and Digital Wallets: Refunds are credited within 24 hours directly to the original VPA/account.
- Debit / Credit Cards & Net Banking: Refunds take 3 to 5 banking working days, adhering to RBI payment settlement norms.
- Cash on Delivery (COD) returns: Refunds are processed via direct NEFT/IMPS bank transfer or store credit upon verifying customer account details.`
  },
  {
    id: "cancellation_policy",
    category: "orders",
    title: "Order Cancellation Guidelines",
    tags: ["cancel order", "cancellation", "modify order", "stop order"],
    content: `How to cancel an order:
- You can cancel an order free of cost anytime while it is in 'Pending' or 'Processing' status directly from the [My Orders](/orders) page.
- Once an order status updates to 'Shipped' or 'Dispatched', it cannot be cancelled in-flight. However, you may decline the delivery at your doorstep or initiate a 7-day return upon arrival.`
  },
  {
    id: "customer_helpline",
    category: "support",
    title: "Customer Helpline, Contact Details & Support Desk",
    tags: ["helpline", "customer care", "contact", "support", "email", "phone", "help", "ticket"],
    content: `GaramBazaar customer support contact options:
- Official Support Email: support@garambazaar.in
- Online Support Desk: Submit an inquiry or ticket directly at our [Contact Us Page](/contact).
- Working Hours: Support team is available Monday to Saturday, 9:00 AM to 7:00 PM IST.
- Response Time: Tickets and emails are typically answered within 2 to 4 business hours.
- For damaged shipments, missing items, or payment verification issues, include your Order Number (e.g. ORD-XXXXXX-XXX) for fastest resolution.`
  },
  {
    id: "organic_certification_sourcing",
    category: "about",
    title: "Organic Sourcing, Farmer Collectives & Quality",
    tags: ["organic", "sourcing", "farmers", "cooperative", "natural", "chemical free", "shg"],
    content: `GaramBazaar's farm-direct philosophy:
- We partner directly with tribal Self-Help Groups (SHGs) and organic farmer cooperatives in Jharkhand and rural India.
- Over 70% of consumer purchase price goes directly back to local farmer families and artisans, cutting out exploitative middlemen.
- All grains, pulses, cold-pressed oils, and spices are grown using traditional zero-chemical Vedic farming methods without synthetic pesticides or urea.`
  },
  {
    id: "forest_honey_and_a2_ghee",
    category: "products",
    title: "Raw Forest Honey & Pure A2 Desi Cow Ghee Purity",
    tags: ["honey", "raw honey", "ghee", "a2 ghee", "bilona", "unpasteurized", "purity"],
    content: `Purity standards of flagship products:
- Raw Wild Honey: Single-source forest honey gathered sustainably from deep forests. It is never heated, pasteurized, or adulterated with sugar syrup, retaining all natural pollen, enzymes, and medicinal antioxidants.
- A2 Bilona Cow Ghee: Prepared using the traditional wooden Bilona churning method from grass-fed indigenous cows. Rich in healthy fats and free from preservatives or artificial coloring.`
  },
  {
    id: "payment_methods_security",
    category: "payments",
    title: "Payment Methods, Razorpay Security & Tax Invoices",
    tags: ["payment", "razorpay", "upi", "credit card", "security", "gst", "invoice", "safe"],
    content: `Payment security & invoice details:
- Supported Payment Methods: UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit Cards, Debit Cards, Net Banking, and Wallet options via Razorpay.
- Security: 256-bit SSL encryption and full PCI-DSS Level 1 compliance. GaramBazaar never stores your sensitive card CVV or bank passwords.
- Tax Invoices: Itemized GST invoices can be downloaded anytime from the Order Details page after successful purchase.`
  },
  {
    id: "seller_and_affiliate_program",
    category: "partnerships",
    title: "Seller Registration & Affiliate Program",
    tags: ["sell", "seller portal", "vendor", "affiliate", "partner", "earn"],
    content: `Joining the GaramBazaar ecosystem:
- Sell with Us: Farmers, craft makers, and organic producers can register to sell via the [Seller Portal](/seller). List products, track sales analytics, and ship to customers across India.
- Affiliate Program: Earn commission on referrals by joining the GaramBazaar Affiliate network. Contact support@garambazaar.in for merchant and influencer partnerships.`
  }
];
