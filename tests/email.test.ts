import {test} from 'node:test';
import assert from 'node:assert/strict';
import {orderEmail} from '../lib/order-email';
import {orderSchema} from '../lib/order';
test('customer confirmation safely escapes customer text and includes total',()=>{const input=orderSchema.parse({id:'123e4567-e89b-42d3-a456-426614174000',name:'<script>alert(1)</script>',email:'test@example.com',phone:'9800000000',address:'Samakhushi Kathmandu',region:'valley',quantity:1,consent:true,website:''});const email=orderEmail(input,true);assert.ok(email.html.includes('&lt;script&gt;'));assert.ok(!email.html.includes('<script>'));assert.ok(email.text.includes('NPR 15,500'));assert.ok(email.text.includes('Your order has been received'));assert.ok(orderEmail(input,false).text.includes('A new rental order has arrived'));});
