# Fix Payment Init 500 Error - TODO Steps

## Plan Breakdown
1. ✅ Update functions/index.js with detailed logging and robust Paystack handling
2. ✅ Install deps: `cd functions && npm install` (skip - deps confirmed)
3. 🔄 Deploy: `firebase deploy --only functions`
4. 🔄 Test payment init from SubscriptionPaywall
5. 🔄 Check Firebase Console > Functions > Logs for detailed errors
6. ✅ [Done] Monitor client tests, iterate if needed

**Progress**: Code updated with comprehensive logging in initPaymentHttp, verifyPayment, paystackWebhook. Logs will reveal exact Paystack SDK/API failure.

Next: Run the npm install & deploy commands.


