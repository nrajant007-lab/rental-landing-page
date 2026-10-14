import { NextRequest, NextResponse } from 'next/server';
import { orderSchema } from '@/lib/order';
import { fulfill, requiredConfig } from '@/lib/fulfillment';
export const runtime = 'nodejs';
const active = new Map<string, Promise<Awaited<ReturnType<typeof fulfill>>>>();
export async function POST(request: NextRequest) {
 const origin = request.headers.get('origin'); if(origin && origin!==request.nextUrl.origin) return NextResponse.json({error:'Invalid request origin.'},{status:403});
 if(!request.headers.get('content-type')?.includes('application/json')) return NextResponse.json({error:'JSON required.'},{status:415});
 let raw: unknown; try {const text=await request.text(); if(text.length>10000) return NextResponse.json({error:'Request too large.'},{status:413}); raw=JSON.parse(text);} catch {return NextResponse.json({error:'Invalid request.'},{status:400});}
 const parsed=orderSchema.safeParse(raw); if(!parsed.success) return NextResponse.json({error:'Please check your customer details and accept the rental terms.'},{status:400});
 if(requiredConfig().length) return NextResponse.json({error:'Online ordering is temporarily unavailable. Your order has not been submitted. Please contact the supplier to arrange your rental.'},{status:503});
 try { const input=parsed.data; let job=active.get(input.id); if(!job) {job=fulfill(input);active.set(input.id,job);} const result=await job; return NextResponse.json(result); }
 catch(error) { return NextResponse.json({error:error instanceof Error && error.message==='ORDER_CONFLICT' ? 'This order reference is already used with different details. Reload to start a new order.' : 'We could not confirm completion. Please retry with the same details; your order reference will be reused.'},{status:502}); }
 finally {active.delete(parsed.data.id);}
}
