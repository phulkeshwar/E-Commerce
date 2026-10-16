# GaramBazaar - Email Delivery & Bulk Mailing Guide (No-Domain Setup)

If you do not own a custom domain and want to send transactional and bulk emails to buyers for free, this guide outlines your options, limitations, and how to safely send bulk emails (e.g., 100 emails at once) without getting blocked.

---

## 1. The Core Limitation: DMARC & SPF (Why Webmail Senders Fail on Third-Party Relays)
In 2024, Google and Yahoo implemented strict email security policies.
* **The Rule**: If you use a third-party service (like Brevo, Mailjet, Resend, or SendGrid) to send emails where the "From" address ends in `@gmail.com`, **receiving mail servers will block or reject your emails**.
* **Why**: The recipient's mail server checks the SPF/DMARC records of `gmail.com`. Since the email did not originate from Google's servers, it is marked as a spoofing/phishing attempt.
* **The Conclusion**: If you send from a `@gmail.com` address, you **must** route the emails directly through Google's SMTP servers (`smtp.gmail.com`).

---

## 2. The Solution: Gmail SMTP with Google App Password
Since you do not own a custom domain, using **Google SMTP** (which is already configured in your `.env` file) is the best and only reliable free solution.

### Limits & Capacity:
* **Daily Limit**: **500 emails/recipients per 24 hours** (approx. 15,000 emails/month).
* **Monthly Volume**: Easily covers your target of **1,000 emails/month** (average of 33 emails/day).
* **Cost**: 100% Free.

---

## 3. How to Safely Send Bulk Emails (e.g., 100 at a Time)
If you try to send 100 emails simultaneously to 100 different buyers, Google's SMTP servers may throttle the connection or flag your account. There are two developer strategies to send these:

### Strategy A: The BCC Method (Recommended for Broadcasts)
If you are sending the same notification to 100 users, send **one** email and put the 100 recipients in the `bcc` (Blind Carbon Copy) field.
* **Pros**: Only opens one connection. Extremely fast. Buyers won't see each other's email addresses.
* **Nodemailer Code Example**:
  ```javascript
  await transporter.sendMail({
    from: 'GaramBazaar <pkmahto009@gmail.com>',
    to: 'pkmahto009@gmail.com', // Send to yourself
    bcc: ['buyer1@example.com', 'buyer2@example.com', ...], // List of 100 buyers
    subject: 'Special Offer from GaramBazaar',
    html: '<p>Check out our new products!</p>',
  });
  ```
* **Note**: This counts as 100 emails against your 500 daily Gmail limit.

### Strategy B: Sequential Sending with Delay (For Personalized Emails)
If each of the 100 emails has personalized content (e.g., "Hello [Name]"), you must send them individually. To prevent Gmail from rate-limiting you, send them sequentially with a small delay (e.g., 200 milliseconds) instead of all at once.
* **Nodemailer Code Example**:
  ```javascript
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function sendBulkPersonalized(emailsList) {
    for (const recipient of emailsList) {
      try {
        await sendEmail({
          to: recipient.email,
          subject: `Hello ${recipient.name}, order update`,
          text: `Hi ${recipient.name}, your weekly summary is ready...`,
        });
        console.log(`Sent to ${recipient.email}`);
        
        // Wait 200ms before sending the next email
        await delay(200); 
      } catch (err) {
        console.error(`Failed to send to ${recipient.email}:`, err.message);
      }
    }
  }
  ```

---

## 4. Alternative: Transitioning to a Paid/Domain Setup (For 5,000+ Users)
If your website traffic grows and you need to send **5,000+ emails/month**, you will need to buy a domain (e.g., `GaramBazaar.in`, which costs about $5 to $10 per year) and verify it on a dedicated service:

| Provider | Free Tier Limit | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **Resend** | 3,000 emails/month (100/day) | Modern developer-friendly API, excellent deliverability. | Requires custom domain verification. |
| **Brevo** | 9,000 emails/month (300/day) | High daily sending limit for free accounts. | Must turn off IP restrictions in dashboard settings for Render hosting. |
| **Mailjet** | 6,000 emails/month (200/day) | Good statistics and bulk dashboard. | Requires custom domain for deliverability. |

---

## 5. Complete Brevo SMTP Setup Guide (Step-by-Step)

If you decide to register a custom domain later and want to use Brevo's free tier (300 emails/day), follow these steps to set it up:

### Step 1: Sign Up & Create SMTP Key
1. Go to [Brevo.com](https://www.brevo.com/) and sign up for a free account.
2. In the top-right corner, click your organization name and select **SMTP & API**.
3. Select the **SMTP** tab and copy your credentials:
   * **SMTP Server/Host**: `smtp-relay.brevo.com`
   * **Port**: `587` (TLS) or `465` (SSL)
   * **SMTP Username (Login)**: Your Brevo login email address.
4. Click **Generate a new SMTP key**, name it (e.g. `GaramBazaar Production`), and copy the password key shown.

### Step 2: Disable IP Security Blocking (Crucial for Render Hosting)
By default, Brevo rejects connection requests from unknown IPs (like Render's rotated IPs).
1. Click your organization name in the top-right corner and select **Settings**.
2. Click **Security** in the left sidebar, then select the **Authorized IPs** tab.
3. Locate **"Blocking of unknown IP addresses"** (or **"IP Review"**).
4. Turn this setting **OFF** (or set to **"No IP review"**) so that dynamic servers can connect.

### Step 3: Add & Verify Your Custom Domain
To avoid emails landing in the spam folder:
1. In the top-right corner, click your organization name and select **Senders & IPs**.
2. Go to the **Domains** tab and click **Add a domain**.
3. Enter your purchased domain (e.g., `GaramBazaar.in`).
4. Copy the generated TXT and SPF records, log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.), and add them to your DNS settings.
5. Click **Verify & Authenticate** in Brevo.

### Step 4: Configure Your `.env` File

#### Option A: Gmail SMTP with Google App Password (Active / SupportMail)
If using Google Account App Passwords for instant delivery without domain DNS setup:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=garamsoftwares@gmail.com
SMTP_PASS=ibqd nipd piie aprc
MAIL_FROM="SupportMail <garamsoftwares@gmail.com>"
```
*Note: App name registered in Google Account is **SupportMail**.*

#### Option B: Brevo SMTP Relay
Once domain DNS is verified:
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-username-email@example.com
SMTP_PASS=xsmtpsib-your-generated-smtp-key
MAIL_FROM="SupportMail <no-reply@yourdomain.com>"
```

