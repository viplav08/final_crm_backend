// index.js – right after your `require(…)`s:
console.log('customerRoutes         →', typeof customerRoutes);
console.log('dashboardSummary       →', typeof dashboardSummary);
console.log('pendingPayments        →', typeof pendingPayments);
console.log('approvePayment         →', typeof approvePayment);
console.log('rejectPayment          →', typeof rejectPayment);
console.log('submitPayment          →', typeof submitPayment);
console.log('assignedClients        →', typeof assignedClients);
console.log('executiveFollowUps     →', typeof executiveFollowUps);
console.log('paymentRoutes          →', typeof paymentRoutes);
console.log('packageRoutes          →', typeof packageRoutes);
console.log('authRoutes             →', typeof authRoutes);
console.log('trialFollowups         →', typeof trialFollowups);
console.log('mainDashboard          →', typeof mainDashboard);

app.use('/api/customer',           customerRoutes);
// …etc
