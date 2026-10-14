# VisionAire 5 rental funnel

Next.js App Router + Tailwind CSS + Google Sheets + Gmail SMTP. Routes: `/`, `/checkout`, `/thank-you`, `/api/order`. No online payments or reels.

## Run

Use Node.js 22 or newer. Run `npm install`, copy `.env.example` to `.env.local`, then run `npm run dev`. Production: `npm run build` followed by `npm start`. Deploy to a Node.js host supporting Next.js server routes and outbound SMTP. A static-only host cannot process orders.

## Google Sheets setup

Create a Google Cloud project, enable the Google Sheets API, and create a service account with a JSON key. Set `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` from that key, and `GOOGLE_SPREADSHEET_ID` from the spreadsheet URL. Never commit the key file. A quoted environment value with escaped `\n` in the private key is supported.

Create an empty tab named **Orders** and share the spreadsheet with the service account email as Editor. The application initializes the header row. If using another tab, change `GOOGLE_SHEET_TAB`. Leave the A:P column order unchanged. Customer values are written as RAW to prevent spreadsheet formula injection.

## Gmail setup

Enable 2-Step Verification on the sending Google account and generate an App Password (where supported). Set `SMTP_PASSWORD` to the App Password, not the normal Gmail password. `SMTP_USER` and `EMAIL_FROM` should match the authenticated Gmail account unless you configure an authorized Gmail sending alias. Defaults in `.env.example` use metsnepal.services@gmail.com for owner notifications and reply-to. All keys stay on the server.

## Product assets and copy

The supplied conversation contained no accessible image files. Add genuine high-quality PNG images as `public/products/visionaire-1.png` through `visionaire-4.png`. Visible placeholders are intentional until images are added. Optimize source photos without upscaling; preserve aspect ratio. Product content, prices, FAQs, and paths are in `lib/product.ts`; page copy is in `app/page.tsx`. No product imagery or reviews have been invented. Confirm permission to publish the supplied testimonials and manufacturer branding before public launch.

Pricing is NPR 5,000 per machine per month (regular NPR 6,000), plus NPR 10,000 refundable deposit per machine. Delivery is charged once per order: NPR 500 inside Kathmandu Valley or NPR 1,000 outside. Checkout collects the first month only; subsequent monthly billing is handled by the rental provider. Manufacturer specifications: https://www.caireinc.com/product/airsep-visionaire/ . Follow the applicable unit manual and prescription.

## Order behavior and recovery

The server validates input and calculates prices independently of the browser. Missing credentials return HTTP 503 and never a success screen. A successful sheet append saves customer details, totals, and payment method before either notification. The customer gets an order-received email; the owner gets the order details. Email statuses are recorded in O:P. If email fails after saving, the order remains saved and the thank-you page explicitly reports pending notification. Filter the sheet for blank notification columns and follow up; there is no background retry worker in this project.

Order UUIDs are reused during retries in the open checkout. An existing matching sheet row is reused and already marked emails are skipped. Different customer details with the same UUID are rejected. Same-process concurrent submissions share a promise. Google Sheets offers no transactional uniqueness: multi-instance concurrent retries can still duplicate rows, and an SMTP success followed by a sheet-status failure can repeat an email. For strict production exactly-once guarantees, add a transactional database/outbox and durable worker before scaling to multiple instances. Do not describe Google Sheets or SMTP as providing exactly-once delivery.

Basic spam protections include a honeypot, input validation, request size check, and same-origin browser submission check. Add host-level rate limiting or CAPTCHA for public traffic. Restrict spreadsheet access; it contains customer contact and delivery details. No private data is placed in the thank-you URL.

## Validate before accepting live orders

Run `npm test`, `npx tsc --noEmit`, and `npm run build`. Then add credentials, run a real test order using an inbox you control, confirm the row and both delivered emails, and verify the thank-you reference and amount. Test retrying a saved order, outside-Valley pricing, multiple machines, missing credentials, and an SMTP failure. Real Sheets/Gmail delivery cannot be verified without credentials. Images must be supplied before the intended product gallery is complete.

## Official manufacturer logos
Original unmodified PNG logos are saved in public/brand from https://www.caireinc.com/wp-content/uploads/CAIRE-Niterra-Logo.png and https://www.airsep.com/wp-content/uploads/AirSep-A-CAIRE-Inc-Company-Logo.png .


## Product photograph sources
The four product PNG files now use original CAIRE product and lifestyle photographs from https://www.caireinc.com/product/airsep-visionaire/ . Source JPEGs are retained alongside them. Images are losslessly converted to PNG at their native 371 x 318 resolution; larger source photos would improve sharpness on large screens. These manufacturer photos replace the initial placeholders.


## Customer-supplied photos
The active hero and gallery now use the three customer-supplied photos, saved as customer-visionaire-1.png through customer-visionaire-3.png. WebP sources were converted to PNG without resizing; the first image retains its transparency. Previous manufacturer photos remain available but are no longer in the active gallery.


## Spreadsheet and email presentation
The order handler now initializes the Orders tab when absent and applies a teal header, alternating row bands, a frozen heading row, filters, wrapped text, column widths, and NPR number formats. Owner and customer messages include escaped HTML order summaries and plain-text alternatives. Gmail authentication has been verified, but the Google private key supplied in chat could not be parsed; replace it before live testing. Credentials are stored only in git-ignored .env.local. Revoke and replace credentials exposed in chat.

