export const product = { name: 'VisionAire 5', brand: 'CAIRE Inc. / AirSep', regular: 6000, price: 5000, deposit: 10000, images: ['/products/customer-visionaire-1.png','/products/customer-visionaire-2.png','/products/customer-visionaire-3.png'] };
export const money = (value: number) => `NPR ${value.toLocaleString('en-NP')}`;
export function totals(quantity: number, region: string) { const rental = product.price * quantity; const deposit = product.deposit * quantity; const delivery = region === 'valley' ? 500 : 1000; return { rental, deposit, delivery, total: rental + deposit + delivery }; }
export const faqs = [
 ['How much does the rental cost?', 'The discounted rental is NPR 5,000 per machine per month (regularly NPR 6,000). A refundable NPR 10,000 deposit per machine is collected with your first month.'],
 ['When is the deposit refunded?', 'The deposit is refundable when you return the machine. Contact us to arrange the return and refund.'],
 ['What does delivery cost?', 'Delivery is NPR 500 inside Kathmandu Valley and NPR 1,000 outside the Valley, per order. We will contact you to confirm availability and delivery timing.'],
 ['How do I pay?', 'Pay on delivery. Your initial amount includes the first month’s rental, refundable deposit, and delivery. No online payment is required.'],
 ['Can I choose my own oxygen setting?', 'Use supplemental oxygen only as prescribed by your healthcare professional. Follow their prescribed flow setting and the device user manual.'],
 ['Does the concentrator work during a power cut?', 'It requires electricity. Keep an appropriate backup oxygen supply available for power outages or equipment failure, as advised by your healthcare professional.'],
 ['Are accessories and an oxygen monitor included?', 'Included accessories and oxygen-monitor availability depend on the unit supplied. Contact us to confirm the configuration and any humidifier or cannula requirements before delivery.']
] as const;

