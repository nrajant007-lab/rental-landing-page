import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { OrderInput, orderValues } from './order';
import { money, product } from './product';
import { orderEmail } from './order-email';
import { sheetLayout } from './sheet-layout';
import { createPrivateKey } from 'node:crypto';
const headers = ['Order ID','Created UTC','Name','Email','Phone','Address','Region','Product','Quantity','Monthly rental','Refundable deposit','Delivery','Initial total','Payment','Owner emailed','Customer emailed'];
export function requiredConfig() { const missing = ['GOOGLE_SPREADSHEET_ID','GOOGLE_CLIENT_EMAIL','GOOGLE_PRIVATE_KEY','SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASSWORD','ORDER_NOTIFICATION_EMAIL','EMAIL_FROM','EMAIL_REPLY_TO'].filter(k=>!process.env[k]); if(process.env.GOOGLE_PRIVATE_KEY) {try {createPrivateKey(process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g,'\n'));}catch{missing.push('GOOGLE_PRIVATE_KEY_INVALID');}} return missing; }
export async function fulfill(input: OrderInput) {
 const auth = new google.auth.JWT({ email: process.env.GOOGLE_CLIENT_EMAIL, key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g,'\n'), scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
 const sheets = google.sheets({ version:'v4', auth }); const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
 const title = process.env.GOOGLE_SHEET_TAB || 'Orders';
 const tab = `'${title.replace(/'/g,"''")}'`;
 const metadata = await sheets.spreadsheets.get({spreadsheetId,fields:'sheets(properties,bandedRanges)'});
 let sheet = metadata.data.sheets?.find(s=>s.properties?.title===title);
 if(!sheet) { const created=await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:[{addSheet:{properties:{title}}}]}}); sheet=created.data.replies?.[0].addSheet; }
 const sheetId=sheet?.properties?.sheetId;
 if(sheetId===null || sheetId===undefined) throw new Error('SHEET_UNAVAILABLE');
 const formatting = sheetLayout(sheetId);
 if(!sheet?.bandedRanges?.length) formatting.push({addBanding:{bandedRange:{range:{sheetId,startRowIndex:0,startColumnIndex:0,endColumnIndex:16},rowProperties:{headerColor:{red:0.067,green:0.25,blue:0.23},firstBandColor:{red:1,green:1,blue:1},secondBandColor:{red:0.94,green:0.97,blue:0.94}}}}});
 await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:formatting}});
 const get = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${tab}!A:P` }); const rows = get.data.values || [];
 let rowIndex = rows.findIndex(r=>r[0]===input.id); let row: unknown[];
 const order = orderValues(input);
 if(rowIndex >= 0) { row = rows[rowIndex]; if(row[2]!==input.name || row[3]!==input.email || row[4]!==input.phone || row[5]!==input.address || row[6]!==input.region || Number(row[8])!==input.quantity) throw new Error('ORDER_CONFLICT'); }
 else {
  if(!rows.length) await sheets.spreadsheets.values.update({ spreadsheetId, range:`${tab}!A1:P1`, valueInputOption:'RAW', requestBody:{ values:[headers] } });
  row = [input.id,new Date().toISOString(),input.name,input.email,input.phone,input.address,input.region,product.name,input.quantity,order.rental,order.deposit,order.delivery,order.total,'Cash on delivery','',''];
  const saved = await sheets.spreadsheets.values.append({ spreadsheetId, range:`${tab}!A:P`,valueInputOption:'RAW',insertDataOption:'INSERT_ROWS',requestBody:{values:[row]} });
  const match = saved.data.updates?.updatedRange?.match(/!A(\d+):/); if(!match) throw new Error('SAVE_UNCONFIRMED'); rowIndex = Number(match[1])-1;
 }
 const transport = nodemailer.createTransport({ host:process.env.SMTP_HOST, port:Number(process.env.SMTP_PORT), secure: Number(process.env.SMTP_PORT)===465, auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}, tls:{minVersion:'TLSv1.2'} });
 const summary = `Order: ${input.id}\nProduct: ${product.name}\nMachines: ${input.quantity}\nMonthly rental: ${money(order.rental)}\nRefundable deposit: ${money(order.deposit)}\nDelivery: ${money(order.delivery)}\nInitial cash-on-delivery total: ${money(order.total)}\n\nCustomer: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone}\nAddress: ${input.address}\nDelivery area: ${input.region === 'valley' ? 'Kathmandu Valley' : 'Outside Kathmandu Valley'}`;
 const failures: string[] = [];
 for(const [column,to,subject,text] of [[14,process.env.ORDER_NOTIFICATION_EMAIL,`New rental order — ${input.id}`,summary],[15,input.email,`Order received — VisionAire 5`, `Hello ${input.name},\n\nWe have received your rental order. Our team will contact you to confirm availability and delivery. No online payment is required.\n\n${summary}\n\nYour deposit is refundable when you return the machine.\nUse oxygen only as prescribed by your healthcare professional.\n\nCAIRE Inc. / AirSep rental service`]] as const) {
  if(row[column]==='sent') continue;
  try { const email=orderEmail(input,column===15); const result=await transport.sendMail({from:process.env.EMAIL_FROM,replyTo:process.env.EMAIL_REPLY_TO,to,subject,...email}); if(result.rejected?.length) throw new Error('EMAIL_REJECTED'); await sheets.spreadsheets.values.update({spreadsheetId, range:`${tab}!${column===14?'O':'P'}${rowIndex+1}`,valueInputOption:'RAW',requestBody:{values:[['sent']]}}); } catch { failures.push(column===14?'owner':'customer'); }
 }
 return { id:input.id, total:order.total, notificationsPending: failures.length>0 };
}
