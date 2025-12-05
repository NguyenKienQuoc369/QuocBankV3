// QUOCBANK V3 - COMPREHENSIVE TEST SUITE
// Copy and paste this into browser console at http://localhost:8080

console.log('🧪 QUOCBANK V3 - TEST SUITE STARTING...\n');

// Test utilities
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

function assert(condition, testName) {
    if (condition) {
        testResults.passed++;
        testResults.tests.push({ name: testName, status: '✅ PASS' });
        console.log(`✅ PASS: ${testName}`);
    } else {
        testResults.failed++;
        testResults.tests.push({ name: testName, status: '❌ FAIL' });
        console.error(`❌ FAIL: ${testName}`);
    }
}

async function runTests() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('PHASE 1: SECURITY UTILITIES TESTS');
    console.log('═══════════════════════════════════════════════════════\n');

    // Test 1: Password Hashing
    console.log('Test 1: Password hashing works correctly');
    const password = 'test123';
    const hash1 = await Security.hashPassword(password);
    const hash2 = await Security.hashPassword(password);
    assert(hash1 === hash2, 'Same password produces same hash');
    assert(hash1.length === 64, 'Hash is 64 characters (SHA-256)');
    assert(hash1 !== password, 'Hash is different from original password');

    // Test 2: Password Validation
    console.log('\nTest 2: Password validation');
    const shortPass = Security.validatePassword('12345');
    const validPass = Security.validatePassword('123456');
    assert(!shortPass.valid, 'Short password (< 6 chars) is rejected');
    assert(validPass.valid, 'Valid password (>= 6 chars) is accepted');

    // Test 3: PIN Validation
    console.log('\nTest 3: PIN validation');
    const invalidPin1 = Security.validatePIN('12345');
    const invalidPin2 = Security.validatePIN('abc123');
    const validPin = Security.validatePIN('123456');
    assert(!invalidPin1.valid, 'PIN with 5 digits is rejected');
    assert(!invalidPin2.valid, 'PIN with letters is rejected');
    assert(validPin.valid, 'PIN with 6 digits is accepted');

    // Test 4: OTP Generation
    console.log('\nTest 4: OTP generation');
    const otp = Security.generateOTP();
    assert(otp.length === 6, 'OTP is 6 digits');
    assert(/^\d{6}$/.test(otp), 'OTP contains only digits');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('PHASE 2: ACCOUNT CREATION & LOGIN TESTS');
    console.log('═══════════════════════════════════════════════════════\n');

    // Clear localStorage for fresh tests
    localStorage.removeItem('quocbank_v3');
    const testBank = new BankModel();

    // Test 5: Create Account with Invalid Password
    console.log('Test 5: Create account with short password');
    const invalidAccount = await testBank.createAccount('Test User', '12345', 1000000);
    assert(!invalidAccount.success, 'Account creation fails with short password');

    // Test 6: Create Account with Valid Password
    console.log('\nTest 6: Create account with valid password');
    const validAccount = await testBank.createAccount('Test User', 'password123', 1000000);
    assert(validAccount.success, 'Account creation succeeds with valid password');
    assert(validAccount.id.length === 6, 'Account ID is 6 digits');
    const accountId = validAccount.id;

    // Test 7: Check Account Structure
    console.log('\nTest 7: Check account data structure');
    const account = testBank.db.accounts[accountId];
    assert(account.pass.length === 64, 'Password is hashed (64 chars)');
    assert(account.balance === 1000000, 'Initial balance is correct');
    assert(account.loginAttempts === 0, 'Login attempts initialized to 0');
    assert(account.dailyLimit === 50000000, 'Daily limit set to 50M');
    assert(account.pin === null, 'PIN is null initially');
    assert(Array.isArray(account.beneficiaries), 'Beneficiaries array exists');

    // Test 8: Login with Correct Password
    console.log('\nTest 8: Login with correct password');
    const loginSuccess = await testBank.login(accountId, 'password123');
    assert(loginSuccess.success, 'Login succeeds with correct password');
    assert(testBank.currentUser === accountId, 'Current user is set');

    // Test 9: Login with Wrong Password
    console.log('\nTest 9: Login with wrong password');
    testBank.logout();
    const loginFail1 = await testBank.login(accountId, 'wrongpass');
    assert(!loginFail1.success, 'Login fails with wrong password');
    assert(loginFail1.msg.includes('Còn 4 lần thử'), 'Shows remaining attempts');

    // Test 10: Multiple Failed Login Attempts
    console.log('\nTest 10: Multiple failed login attempts');
    await testBank.login(accountId, 'wrong2');
    await testBank.login(accountId, 'wrong3');
    await testBank.login(accountId, 'wrong4');
    const loginFail5 = await testBank.login(accountId, 'wrong5');
    assert(!loginFail5.success, 'Login fails after 5 attempts');
    assert(loginFail5.msg.includes('khóa'), 'Account is locked');
    assert(testBank.db.accounts[accountId].lockedUntil !== null, 'Lock timestamp is set');

    // Test 11: Login to Locked Account
    console.log('\nTest 11: Try to login to locked account');
    const loginLocked = await testBank.login(accountId, 'password123');
    assert(!loginLocked.success, 'Cannot login to locked account');
    assert(loginLocked.msg.includes('khóa'), 'Shows lock message');

    // Unlock account for further tests
    testBank.db.accounts[accountId].lockedUntil = null;
    testBank.db.accounts[accountId].loginAttempts = 0;
    testBank.save();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('PHASE 3: PIN SYSTEM TESTS');
    console.log('═══════════════════════════════════════════════════════\n');

    // Login first
    await testBank.login(accountId, 'password123');

    // Test 12: Set PIN with Invalid Format
    console.log('Test 12: Set PIN with invalid format');
    const invalidPinSet = await testBank.setPIN('12345');
    assert(!invalidPinSet.success, 'Cannot set PIN with 5 digits');

    // Test 13: Set PIN with Valid Format
    console.log('\nTest 13: Set PIN with valid format');
    const validPinSet = await testBank.setPIN('123456');
    assert(validPinSet.success, 'PIN set successfully');
    assert(testBank.db.accounts[accountId].pin !== null, 'PIN is stored');
    assert(testBank.db.accounts[accountId].pin.length === 64, 'PIN is hashed');

    // Test 14: Verify Correct PIN
    console.log('\nTest 14: Verify correct PIN');
    const pinCorrect = await testBank.verifyPIN('123456');
    assert(pinCorrect === true, 'Correct PIN is verified');

    // Test 15: Verify Wrong PIN
    console.log('\nTest 15: Verify wrong PIN');
    const pinWrong = await testBank.verifyPIN('654321');
    assert(pinWrong === false, 'Wrong PIN is rejected');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('PHASE 4: TRANSACTION TESTS');
    console.log('═══════════════════════════════════════════════════════\n');

    // Create second account for transfer tests
    const account2 = await testBank.createAccount('Receiver', 'password456', 500000);
    const receiverId = account2.id;

    // Test 16: Transfer with Sufficient Balance
    console.log('Test 16: Transfer with sufficient balance');
    const transferSuccess = testBank.transfer(receiverId, 100000, 'Test transfer');
    assert(transferSuccess.s, 'Transfer succeeds with sufficient balance');
    assert(testBank.db.accounts[accountId].balance === 900000, 'Sender balance decreased');
    assert(testBank.db.accounts[receiverId].balance === 600000, 'Receiver balance increased');

    // Test 17: Transfer with Note
    console.log('\nTest 17: Transfer with note');
    const senderHistory = testBank.db.accounts[accountId].history[0];
    assert(senderHistory.note === 'Test transfer', 'Note is saved in sender history');
    assert(senderHistory.desc.includes('Test transfer'), 'Note appears in description');

    // Test 18: Transfer to Self
    console.log('\nTest 18: Transfer to self');
    const transferSelf = testBank.transfer(accountId, 50000);
    assert(!transferSelf.s, 'Cannot transfer to self');

    // Test 19: Transfer with Insufficient Balance
    console.log('\nTest 19: Transfer with insufficient balance');
    const transferInsufficient = testBank.transfer(receiverId, 10000000);
    assert(!transferInsufficient.s, 'Transfer fails with insufficient balance');

    // Test 20: Transfer to Non-existent Account
    console.log('\nTest 20: Transfer to non-existent account');
    const transferInvalid = testBank.transfer('999999', 50000);
    assert(!transferInvalid.s, 'Transfer fails to non-existent account');

    // Test 21: Deposit Money
    console.log('\nTest 21: Deposit money');
    const depositResult = testBank.updateBalance('deposit', 200000, 'Salary');
    assert(depositResult.s, 'Deposit succeeds');
    assert(testBank.db.accounts[accountId].balance === 1100000, 'Balance increased after deposit');

    // Test 22: Withdraw with Sufficient Balance
    console.log('\nTest 22: Withdraw with sufficient balance');
    const withdrawSuccess = testBank.updateBalance('withdraw', 100000, 'ATM withdrawal');
    assert(withdrawSuccess.s, 'Withdrawal succeeds');
    assert(testBank.db.accounts[accountId].balance === 1000000, 'Balance decreased after withdrawal');

    // Test 23: Withdraw with Insufficient Balance
    console.log('\nTest 23: Withdraw with insufficient balance');
    const withdrawFail = testBank.updateBalance('withdraw', 2000000);
    assert(!withdrawFail.s, 'Withdrawal fails with insufficient balance');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('PHASE 5: DAILY LIMIT TESTS');
    console.log('═══════════════════════════════════════════════════════\n');

    // Reset daily spent
    testBank.db.accounts[accountId].dailySpent = 0;
    testBank.save();

    // Test 24: Transaction Under Daily Limit
    console.log('Test 24: Transaction under daily limit');
    const underLimit = testBank.transfer(receiverId, 10000000);
    assert(underLimit.s, 'Transaction under 50M succeeds');
    assert(testBank.db.accounts[accountId].dailySpent === 10000000, 'Daily spent tracked');

    // Test 25: Transaction Exceeding Daily Limit
    console.log('\nTest 25: Transaction exceeding daily limit');
    const overLimit = testBank.transfer(receiverId, 45000000);
    assert(!overLimit.s, 'Transaction exceeding 50M fails');
    assert(overLimit.m.includes('hạn mức'), 'Shows limit exceeded message');

    // Test 26: Daily Limit Reset
    console.log('\nTest 26: Daily limit reset on new day');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    testBank.db.accounts[accountId].lastResetDate = yesterday.toDateString();
    testBank.resetDailyLimitIfNeeded(testBank.db.accounts[accountId]);
    assert(testBank.db.accounts[accountId].dailySpent === 0, 'Daily spent reset to 0');
    assert(testBank.db.accounts[accountId].lastResetDate === new Date().toDateString(), 'Reset date updated');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('PHASE 6: PASSWORD CHANGE TESTS');
    console.log('═══════════════════════════════════════════════════════\n');

    // Test 27: Change Password with Wrong Old Password
    console.log('Test 27: Change password with wrong old password');
    const changePassWrong = await testBank.changePassword('wrongold', 'newpass123');
    assert(!changePassWrong.success, 'Password change fails with wrong old password');

    // Test 28: Change Password with Correct Old Password
    console.log('\nTest 28: Change password with correct old password');
    const changePassSuccess = await testBank.changePassword('password123', 'newpass123');
    assert(changePassSuccess.success, 'Password change succeeds');

    // Test 29: Login with New Password
    console.log('\nTest 29: Login with new password');
    testBank.logout();
    const loginNewPass = await testBank.login(accountId, 'newpass123');
    assert(loginNewPass.success, 'Can login with new password');

    // Test 30: Cannot Login with Old Password
    console.log('\nTest 30: Cannot login with old password');
    testBank.logout();
    const loginOldPass = await testBank.login(accountId, 'password123');
    assert(!loginOldPass.success, 'Cannot login with old password');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('PHASE 7: HISTORY & DATA PERSISTENCE TESTS');
    console.log('═══════════════════════════════════════════════════════\n');

    // Login again
    await testBank.login(accountId, 'newpass123');

    // Test 31: Transaction History Structure
    console.log('Test 31: Transaction history structure');
    const history = testBank.db.accounts[accountId].history;
    assert(Array.isArray(history), 'History is an array');
    assert(history.length > 0, 'History has transactions');
    const lastTx = history[0];
    assert(lastTx.hasOwnProperty('type'), 'Transaction has type');
    assert(lastTx.hasOwnProperty('amount'), 'Transaction has amount');
    assert(lastTx.hasOwnProperty('desc'), 'Transaction has description');
    assert(lastTx.hasOwnProperty('date'), 'Transaction has date');
    assert(lastTx.hasOwnProperty('balance'), 'Transaction has balance snapshot');

    // Test 32: LocalStorage Persistence
    console.log('\nTest 32: LocalStorage persistence');
    const savedData = localStorage.getItem('quocbank_v3');
    assert(savedData !== null, 'Data is saved in localStorage');
    const parsedData = JSON.parse(savedData);
    assert(parsedData.accounts[accountId] !== undefined, 'Account data is persisted');

    // Test 33: Data Reload
    console.log('\nTest 33: Data reload from localStorage');
    const newBankInstance = new BankModel();
    assert(newBankInstance.db.accounts[accountId] !== undefined, 'Account loaded from storage');
    assert(newBankInstance.db.accounts[accountId].balance === testBank.db.accounts[accountId].balance, 'Balance matches');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('PHASE 8: MIGRATION TESTS');
    console.log('═══════════════════════════════════════════════════════\n');

    // Test 34: Old Account Migration
    console.log('Test 34: Old account migration');
    // Create an old-style account
    const oldAccount = {
        id: '888888',
        name: 'Old User',
        pass: 'plaintext', // Not hashed
        balance: 500000,
        history: []
    };
    testBank.db.accounts['888888'] = oldAccount;
    testBank.save();

    // Create new instance to trigger migration
    const migratedBank = new BankModel();
    await migratedBank.migrateOldAccounts();
    
    const migratedAccount = migratedBank.db.accounts['888888'];
    assert(migratedAccount.pass.length === 64, 'Old password is hashed during migration');
    assert(migratedAccount.hasOwnProperty('loginAttempts'), 'New security fields added');
    assert(migratedAccount.hasOwnProperty('dailyLimit'), 'New limit fields added');
    assert(migratedAccount.hasOwnProperty('beneficiaries'), 'New feature fields added');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);

    console.log('\n📋 DETAILED RESULTS:\n');
    testResults.tests.forEach((test, index) => {
        console.log(`${index + 1}. ${test.status} - ${test.name}`);
    });

    if (testResults.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! 🎉');
        console.log('✅ Phase 1.1 implementation is working correctly!');
    } else {
        console.log('\n⚠️ SOME TESTS FAILED');
        console.log('Please review the failed tests above.');
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('NEXT STEPS:');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('1. Open http://localhost:8080 in your browser');
    console.log('2. Test the UI manually:');
    console.log('   - Register a new account');
    console.log('   - Login and test transactions');
    console.log('   - Try wrong password 5 times');
    console.log('   - Test session timeout (wait 15 min)');
    console.log('3. Check browser console for any errors');
    console.log('4. Verify localStorage data');
    console.log('\n═══════════════════════════════════════════════════════\n');

    return testResults;
}

// Run all tests
runTests().then(results => {
    console.log('✅ Test suite completed!');
    console.log('You can now test the UI at http://localhost:8080');
}).catch(error => {
    console.error('❌ Test suite failed with error:', error);
});
