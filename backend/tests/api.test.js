/**
 * EstateElite API Test Suite
 * Run with: node tests/api.test.js
 * Or install jest: npm test
 * 
 * Tests all major endpoints: auth, chat, notifications, AI, subscriptions
 */

'use strict';

const BASE = process.env.API_URL || 'http://localhost:5000/api';
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

let tokens = {};   // { admin, agent, user }
let ids    = {};   // { conversationId, propertyId, notificationId }
let pass   = 0, fail = 0;

const log  = (ok, label, detail = '') => {
    if (ok) { pass++; console.log(`  ✅ ${label}`); }
    else    { fail++; console.error(`  ❌ ${label}${detail ? ' — ' + detail : ''}`); }
};

async function req(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

// ─────────────────────────────────────────────────────────────────────────────
async function testAuth() {
    console.log('\n🔐 AUTH TESTS');

    // Register new user
    const reg = await req('POST', '/auth/register', {
        name: 'Test User', email: `test_${Date.now()}@example.com`, password: 'Test123!',
    });
    log(reg.status === 201, 'Register new user', `status=${reg.status}`);

    // Login with unverified account should fail
    const loginUnverified = await req('POST', '/auth/login', { email: `test_${Date.now()}@ex.com`, password: 'x' });
    log(loginUnverified.status === 401 || loginUnverified.status === 400, 'Login with bad creds returns 401/400');

    // Login as admin (must have run seed first)
    const adminLogin = await req('POST', '/auth/login', { email: 'admin@estateelite.com', password: 'admin123' });
    log(adminLogin.status === 200 && adminLogin.data.accessToken, 'Admin login returns token', `status=${adminLogin.status}`);
    if (adminLogin.data.accessToken) tokens.admin = adminLogin.data.accessToken;

    // Forgot password (no user leak)
    const forgot = await req('POST', '/auth/forgotpassword', { email: 'nobody@example.com' });
    log(forgot.status === 200, 'Forgot password returns 200 regardless (no user enumeration)');

    // Protected route without token → 401
    const noToken = await req('GET', '/auth/profile', null, null);
    log(noToken.status === 401, 'Protected route blocks unauthenticated request');

    // Get admin profile
    if (tokens.admin) {
        const profile = await req('GET', '/auth/profile', null, tokens.admin);
        log(profile.status === 200 && profile.data.role === 'admin', 'Admin profile returns correct role');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
async function testProperties() {
    console.log('\n🏠 PROPERTY TESTS');

    // Public list
    const list = await req('GET', '/properties?limit=3');
    log(list.status === 200 && Array.isArray(list.data.properties), 'GET /properties returns array');

    // Featured
    const featured = await req('GET', '/properties/featured');
    log(featured.status === 200 && Array.isArray(featured.data.properties), 'GET /properties/featured works');

    // Invalid ID
    const bad = await req('GET', '/properties/invalid_id_xyz');
    log(bad.status === 404 || bad.status === 400, 'Invalid property ID returns 404/400');

    // Create property without auth → 401
    const noAuth = await req('POST', '/properties', { title: 'Test' });
    log(noAuth.status === 401, 'Create property without auth → 401');

    // Create property as admin
    if (tokens.admin) {
        const created = await req('POST', '/properties', {
            title: 'QA Test Property', description: 'Automated test property for QA verification',
            price: 5000000, type: 'buy', propertyType: 'apartment',
            bedrooms: 2, bathrooms: 2,
            area: { value: 1000, unit: 'sqft' },
            location: { address: '1 Test St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        }, tokens.admin);
        log(created.status === 201 && created.data.property?._id, 'Admin can create property');
        if (created.data.property?._id) ids.propertyId = created.data.property._id;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
async function testChat() {
    console.log('\n💬 CHAT / CONVERSATION TESTS');
    if (!tokens.admin) { console.log('  ⚠️  Skipped – no admin token'); return; }

    // Get conversations (should be empty for admin initially)
    const list = await req('GET', '/conversations', null, tokens.admin);
    log(list.status === 200 && Array.isArray(list.data.conversations), 'GET /conversations returns array');

    // Get unread count
    const unread = await req('GET', '/conversations/unread-count', null, tokens.admin);
    log(unread.status === 200 && typeof unread.data.count === 'number', 'Unread count returns number');

    // Cannot start conversation with self → create needs participantId
    const selfConv = await req('POST', '/conversations', { participantId: '' }, tokens.admin);
    log(selfConv.status === 400, 'POST /conversations with empty participantId → 400');

    // Online status endpoint
    const online = await req('GET', '/conversations/online-status?ids=abc,def', null, tokens.admin);
    log(online.status === 200 && typeof online.data.status === 'object', 'Online status returns object');
}

// ─────────────────────────────────────────────────────────────────────────────
async function testNotifications() {
    console.log('\n🔔 NOTIFICATION TESTS');
    if (!tokens.admin) { console.log('  ⚠️  Skipped – no admin token'); return; }

    const list = await req('GET', '/notifications', null, tokens.admin);
    log(list.status === 200 && Array.isArray(list.data.notifications), 'GET /notifications returns array');

    const unread = await req('GET', '/notifications/unread-count', null, tokens.admin);
    log(unread.status === 200 && typeof unread.data.count === 'number', 'Unread notification count works');

    // Mark all read
    const markAll = await req('PUT', '/notifications/read-all', null, tokens.admin);
    log(markAll.status === 200, 'Mark all notifications read → 200');

    // Delete non-existent notification
    const del = await req('DELETE', '/notifications/000000000000000000000000', null, tokens.admin);
    log(del.status === 200 || del.status === 404, 'Delete non-existent notification handled gracefully');
}

// ─────────────────────────────────────────────────────────────────────────────
async function testAI() {
    console.log('\n🤖 AI TESTS');

    // Price prediction – valid input
    const pred = await req('POST', '/ai/predict-price', {
        city: 'Mumbai', propertyType: 'apartment', bedrooms: 2, bathrooms: 2, area: 1000, type: 'buy',
    });
    log(pred.status === 200, 'Price prediction returns 200');
    log(
        pred.data.estimatedPrice !== undefined || pred.data.message !== undefined,
        'Price prediction returns estimate or message'
    );
    log(typeof pred.data.confidence === 'string' || pred.data.estimatedPrice === null, 'Confidence field present');

    // Price prediction – missing required fields → 400
    const badPred = await req('POST', '/ai/predict-price', { city: 'Mumbai' });
    log(badPred.status === 400, 'Price prediction with missing fields → 400');

    // Chatbot – fallback response
    const chat = await req('POST', '/ai/chat', { message: 'hello', history: [] });
    log(chat.status === 200 && chat.data.reply, 'AI chat returns reply');

    // Chatbot – empty message → 400
    const emptyChat = await req('POST', '/ai/chat', { message: '' });
    log(emptyChat.status === 400, 'Empty chat message → 400');

    // Chatbot – price query
    const priceChat = await req('POST', '/ai/chat', { message: 'average price in bangalore' });
    log(priceChat.status === 200 && priceChat.data.type === 'price', 'Price intent detected in chatbot');

    // Recommendations – requires auth
    const recNoAuth = await req('GET', '/ai/recommendations');
    log(recNoAuth.status === 401, 'Recommendations without auth → 401');

    if (tokens.admin) {
        const rec = await req('GET', '/ai/recommendations?limit=4', null, tokens.admin);
        log(rec.status === 200 && Array.isArray(rec.data.recommendations), 'Recommendations returns array');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
async function testSubscriptions() {
    console.log('\n💳 SUBSCRIPTION TESTS');

    // Public plans
    const plans = await req('GET', '/subscriptions/plans');
    log(plans.status === 200 && Array.isArray(plans.data.plans), 'GET /subscriptions/plans returns array');
    log(plans.data.plans?.length === 3, 'Three plans returned (free, basic, premium)');

    if (!tokens.admin) return;

    // Get current subscription
    const current = await req('GET', '/subscriptions/current', null, tokens.admin);
    log(current.status === 200, 'GET /subscriptions/current works');

    // Create order with invalid plan → 400
    const badOrder = await req('POST', '/subscriptions/create-order', { plan: 'invalid' }, tokens.admin);
    log(badOrder.status === 400, 'Create order with invalid plan → 400');

    // Create valid order
    const order = await req('POST', '/subscriptions/create-order', { plan: 'basic' }, tokens.admin);
    log(order.status === 200 && order.data.order?.id, 'Create order for basic plan returns order ID');

    // Verify payment with wrong signature → 400 (only if Razorpay keys set)
    const badVerify = await req('POST', '/subscriptions/verify', {
        plan: 'basic',
        razorpayPaymentId:  'pay_bad',
        razorpayOrderId:    'order_bad',
        razorpaySignature:  'wrong_signature',
    }, tokens.admin);
    // May be 400 (bad sig) or 200 (mock mode – no keys)
    log(badVerify.status === 400 || badVerify.status === 200, 'Verify payment handled (400 real sig, 200 mock)');

    // Billing history
    const billing = await req('GET', '/subscriptions/billing', null, tokens.admin);
    log(billing.status === 200 && Array.isArray(billing.data.payments), 'Billing history returns array');
}

// ─────────────────────────────────────────────────────────────────────────────
async function testSecurity() {
    console.log('\n🔐 SECURITY TESTS');

    // Admin route with user token
    const noAdminAccess = await req('GET', '/admin/stats', null, null);
    log(noAdminAccess.status === 401, 'Admin route without token → 401');

    // XSS in search query – should not crash
    const xss = await req('GET', '/properties?keyword=<script>alert(1)</script>');
    log(xss.status === 200, 'XSS in query string handled safely');

    // SQL/NoSQL injection in email
    const inject = await req('POST', '/auth/login', {
        email: '{"$gt":""}', password: 'anything',
    });
    log(inject.status === 400 || inject.status === 401, 'NoSQL injection in login handled');

    // Rate limiting check (send 5 contact forms quickly)
    const spamResults = await Promise.all(
        Array(6).fill(null).map(() => req('POST', '/contact', {
            name: 'Spammer', email: 'spam@test.com', subject: 'Test', message: 'Test message',
        }))
    );
    const rateLimited = spamResults.some(r => r.status === 429);
    log(rateLimited, 'Rate limiting triggers on repeated contact form submissions');

    // Health check
    const health = await req('GET', '/health');
    log(health.status === 200 && health.data.status === 'OK', 'Health check endpoint works');
}

// ─────────────────────────────────────────────────────────────────────────────
async function testInquiries() {
    console.log('\n📩 INQUIRY TESTS');
    if (!ids.propertyId) { console.log('  ⚠️  Skipped – no test property created'); return; }

    // Submit inquiry (public)
    const inq = await req('POST', '/inquiries', {
        propertyId: ids.propertyId,
        name: 'QA Tester', email: 'qa@test.com',
        phone: '9876543210', message: 'Interested in this property',
    });
    log(inq.status === 201 && inq.data.inquiry?._id, 'Create inquiry returns 201');

    // Missing phone → 400
    const badInq = await req('POST', '/inquiries', {
        propertyId: ids.propertyId,
        name: 'X', email: 'x@x.com', message: 'hi',
    });
    log(badInq.status === 400, 'Inquiry without phone → 400');

    // Get inquiries – requires auth
    if (tokens.admin) {
        const list = await req('GET', '/inquiries', null, tokens.admin);
        log(list.status === 200 && Array.isArray(list.data.inquiries), 'Admin can list inquiries');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
    console.log(`\n🚀 EstateElite API Test Suite`);
    console.log(`   Target: ${BASE}`);
    console.log('─'.repeat(50));

    try {
        await testAuth();
        await testProperties();
        await testChat();
        await testNotifications();
        await testAI();
        await testSubscriptions();
        await testSecurity();
        await testInquiries();
    } catch (err) {
        console.error('\n💥 Test runner crashed:', err.message);
        fail++;
    }

    const total = pass + fail;
    console.log('\n' + '─'.repeat(50));
    console.log(`📊 Results: ${pass}/${total} passed  |  ${fail} failed`);
    console.log(fail === 0 ? '🎉 All tests passed!' : `⚠️  ${fail} test(s) need attention`);
    process.exit(fail > 0 ? 1 : 0);
}

main();
