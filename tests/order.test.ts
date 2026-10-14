import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orderSchema,orderValues } from '../lib/order';
const valid={id:'123e4567-e89b-42d3-a456-426614174000',name:'Test Customer',email:'test@example.com',phone:'9800000000',address:'Samakhushi, Kathmandu',region:'valley',quantity:1,consent:true,website:''};
test('initial Valley price includes monthly rental and refundable deposit',()=>{const order=orderValues(orderSchema.parse({...valid,total:1}));assert.equal(order.total,15500);assert.equal(order.rental,5000);assert.equal(order.deposit,10000);});
test('multiple machines and outside delivery',()=>{const order=orderValues(orderSchema.parse({...valid,region:'outside',quantity:2}));assert.equal(order.total,31000);});
test('invalid or abusive input rejected',()=>{for(const patch of [{quantity:-1},{quantity:1.5},{quantity:11},{region:'free'},{email:'bad'},{consent:false},{website:'spam'}])assert.equal(orderSchema.safeParse({...valid,...patch}).success,false);});
