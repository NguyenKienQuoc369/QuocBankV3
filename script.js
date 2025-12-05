// script.js

// === SECURITY UTILITIES ===
const Security = {
    // Hash password using SHA-256
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Generate random OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    // Validate password strength
    validatePassword(password) {
        if (password.length < 6) return { valid: false, msg: 'Mật khẩu phải có ít nhất 6 ký tự' };
        return { valid: true };
    },

    // Validate PIN
    validatePIN(pin) {
        if (!/^\d{6}$/.test(pin)) return { valid: false, msg: 'PIN phải là 6 chữ số' };
        return { valid: true };
    }
};

// === BANK DATA LOGIC (MODEL) ===
class BankModel {
    constructor() {
        this.db = JSON.parse(localStorage.getItem('quocbank_v3')) || { accounts: {} };
        this.currentUser = null;
        this.sessionTimeout = null;
        this.SESSION_DURATION = 15 * 60 * 1000; // 15 minutes
        this.LOCK_DURATION = 5 * 60 * 1000; // 5 minutes
        this.initSession();
        this.migrateOldAccounts();
    }

    // Migrate old accounts to new security structure
    async migrateOldAccounts() {
        let needsSave = false;
        for (let id in this.db.accounts) {
            const acc = this.db.accounts[id];
            // Check if password is not hashed (old format)
            if (acc.pass && acc.pass.length < 64) {
                acc.pass = await Security.hashPassword(acc.pass);
                needsSave = true;
            }
            // Add new security fields if missing
            if (!acc.loginAttempts) acc.loginAttempts = 0;
            if (!acc.lockedUntil) acc.lockedUntil = null;
            if (!acc.pin) acc.pin = null;
            if (!acc.dailyLimit) acc.dailyLimit = 50000000;
            if (!acc.dailySpent) acc.dailySpent = 0;
            if (!acc.lastResetDate) acc.lastResetDate = new Date().toDateString();
            if (!acc.email) acc.email = '';
            if (!acc.phone) acc.phone = '';
            if (!acc.address) acc.address = '';
            if (!acc.avatar) acc.avatar = '';
            if (!acc.beneficiaries) acc.beneficiaries = [];
            if (!acc.createdAt) acc.createdAt = new Date().toISOString();
        }
        if (needsSave) this.save();
    }

    // Session management
    initSession() {
        this.resetSessionTimeout();
        // Check for activity
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => this.resetSessionTimeout());
        });
    }

    resetSessionTimeout() {
        if (this.sessionTimeout) clearTimeout(this.sessionTimeout);
        if (this.currentUser) {
            this.sessionTimeout = setTimeout(() => {
                app.notify('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.', 'error');
                app.logout();
            }, this.SESSION_DURATION);
        }
    }

    save() { localStorage.setItem('quocbank_v3', JSON.stringify(this.db)); }

    // Create new account with hashed password
    async createAccount(name, pass, balance) {
        const validation = Security.validatePassword(pass);
        if (!validation.valid) return { success: false, msg: validation.msg };

        const id = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPass = await Security.hashPassword(pass);
        
        this.db.accounts[id] = {
            id, 
            name, 
            pass: hashedPass,
            balance: parseFloat(balance),
            history: [{ 
                type: 'create', 
                amount: parseFloat(balance), 
                desc: 'Khởi tạo tài khoản', 
                date: new Date().toISOString(),
                balance: parseFloat(balance)
            }],
            // Security fields
            pin: null,
            loginAttempts: 0,
            lockedUntil: null,
            // Profile fields
            email: '',
            phone: '',
            address: '',
            avatar: '',
            // Transaction limits
            dailyLimit: 50000000,
            dailySpent: 0,
            lastResetDate: new Date().toDateString(),
            // Beneficiaries
            beneficiaries: [],
            createdAt: new Date().toISOString()
        };
        this.save();
        return { success: true, id };
    }

    // Login with security checks
    async login(id, pass) {
        const acc = this.db.accounts[id];
        if (!acc) return { success: false, msg: 'Tài khoản không tồn tại' };

        // Check if account is locked
        if (acc.lockedUntil && new Date() < new Date(acc.lockedUntil)) {
            const remainingTime = Math.ceil((new Date(acc.lockedUntil) - new Date()) / 1000 / 60);
            return { success: false, msg: `Tài khoản bị khóa. Vui lòng thử lại sau ${remainingTime} phút.` };
        }

        // Hash input password and compare
        const hashedPass = await Security.hashPassword(pass);
        if (acc.pass === hashedPass) {
            // Reset login attempts on successful login
            acc.loginAttempts = 0;
            acc.lockedUntil = null;
            this.currentUser = id;
            this.resetSessionTimeout();
            this.save();
            return { success: true, account: acc };
        } else {
            // Increment login attempts
            acc.loginAttempts = (acc.loginAttempts || 0) + 1;
            
            if (acc.loginAttempts >= 5) {
                acc.lockedUntil = new Date(Date.now() + this.LOCK_DURATION).toISOString();
                this.save();
                return { success: false, msg: 'Sai mật khẩu 5 lần. Tài khoản bị khóa 5 phút.' };
            }
            
            this.save();
            return { success: false, msg: `Sai mật khẩu. Còn ${5 - acc.loginAttempts} lần thử.` };
        }
    }

    // Set PIN for account
    async setPIN(pin) {
        const validation = Security.validatePIN(pin);
        if (!validation.valid) return { success: false, msg: validation.msg };

        const user = this.getAccount();
        if (!user) return { success: false, msg: 'Vui lòng đăng nhập' };

        user.pin = await Security.hashPassword(pin);
        this.save();
        return { success: true, msg: 'Đặt PIN thành công!' };
    }

    // Verify PIN
    async verifyPIN(pin) {
        const user = this.getAccount();
        if (!user) return false;
        if (!user.pin) return { success: false, msg: 'Bạn chưa đặt PIN. Vui lòng đặt PIN trước.' };

        const hashedPin = await Security.hashPassword(pin);
        return user.pin === hashedPin;
    }

    // Change password
    async changePassword(oldPass, newPass) {
        const user = this.getAccount();
        if (!user) return { success: false, msg: 'Vui lòng đăng nhập' };

        const oldHashed = await Security.hashPassword(oldPass);
        if (user.pass !== oldHashed) {
            return { success: false, msg: 'Mật khẩu cũ không đúng' };
        }

        const validation = Security.validatePassword(newPass);
        if (!validation.valid) return { success: false, msg: validation.msg };

        user.pass = await Security.hashPassword(newPass);
        this.save();
        return { success: true, msg: 'Đổi mật khẩu thành công!' };
    }

    logout() { 
        this.currentUser = null;
        if (this.sessionTimeout) clearTimeout(this.sessionTimeout);
    }

    getAccount() { return this.currentUser ? this.db.accounts[this.currentUser] : null; }

    transfer(toId, amount, note = '') {
        const user = this.getAccount();
        const receiver = this.db.accounts[toId];
        amount = parseFloat(amount);

        if (!user || amount <= 0 || user.balance < amount) return { s: false, m: 'Số dư không đủ hoặc số tiền sai' };
        if (!receiver) return { s: false, m: 'Người nhận không tồn tại' };
        if (toId === user.id) return { s: false, m: 'Không thể tự chuyển cho mình' };

        // Check daily limit
        this.resetDailyLimitIfNeeded(user);
        if (user.dailySpent + amount > user.dailyLimit) {
            return { s: false, m: `Vượt hạn mức giao dịch hàng ngày (${app.formatMoney(user.dailyLimit)})` };
        }

        user.balance -= amount;
        receiver.balance += amount;
        user.dailySpent += amount;

        const date = new Date().toISOString();
        const noteText = note ? ` - ${note}` : '';
        
        user.history.unshift({ 
            type: 'expense', 
            amount: amount, 
            desc: `Chuyển đến ${receiver.name} (${toId})${noteText}`, 
            note: note,
            date,
            balance: user.balance
        });
        
        receiver.history.unshift({ 
            type: 'income', 
            amount: amount, 
            desc: `Nhận từ ${user.name} (${user.id})${noteText}`, 
            note: note,
            date,
            balance: receiver.balance
        });
        
        this.save();
        return { s: true, m: 'Chuyển khoản thành công!' };
    }

    // Reset daily spending if new day
    resetDailyLimitIfNeeded(user) {
        const today = new Date().toDateString();
        if (user.lastResetDate !== today) {
            user.dailySpent = 0;
            user.lastResetDate = today;
        }
    }

    updateBalance(type, amount, note = '') {
        const user = this.getAccount();
        amount = parseFloat(amount);
        if (amount <= 0) return { s: false, m: 'Số tiền không hợp lệ' };
        
        if (type === 'withdraw' && user.balance < amount) return { s: false, m: 'Số dư không đủ' };

        // Check daily limit for withdrawals
        if (type === 'withdraw') {
            this.resetDailyLimitIfNeeded(user);
            if (user.dailySpent + amount > user.dailyLimit) {
                return { s: false, m: `Vượt hạn mức giao dịch hàng ngày (${app.formatMoney(user.dailyLimit)})` };
            }
        }

        const noteText = note ? ` - ${note}` : '';

        if (type === 'withdraw') {
            user.balance -= amount;
            user.dailySpent += amount;
            user.history.unshift({ 
                type: 'expense', 
                amount, 
                desc: `Rút tiền mặt${noteText}`, 
                note: note,
                date: new Date().toISOString(),
                balance: user.balance
            });
        } else {
            user.balance += amount;
            user.history.unshift({ 
                type: 'income', 
                amount, 
                desc: `Nạp tiền vào tài khoản${noteText}`, 
                note: note,
                date: new Date().toISOString(),
                balance: user.balance
            });
        }
        this.save();
        return { s: true, m: 'Giao dịch thành công!' };
    }
}

// === UI CONTROLLER ===
const bank = new BankModel();

const app = {
    init: () => {
        app.checkAuth();
        app.bindEvents();
    },

    bindEvents: () => {
        document.getElementById('login-form').onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('login-id').value;
            const pass = document.getElementById('login-pass').value;
            const result = await bank.login(id, pass);
            if (result.success) {
                app.notify('Chào mừng ' + result.account.name + ' quay trở lại!', 'success');
                app.renderDashboard();
            } else {
                app.notify(result.msg, 'error');
            }
        };

        document.getElementById('register-form').onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const pass = document.getElementById('reg-pass').value;
            const bal = document.getElementById('reg-balance').value;
            const result = await bank.createAccount(name, pass, bal);
            if (result.success) {
                app.notify(`Tạo thành công! STK của bạn là: ${result.id}`, 'success');
                app.switchAuth('login');
                document.getElementById('login-id').value = result.id;
            } else {
                app.notify(result.msg, 'error');
            }
        };
    },

    checkAuth: () => {
        if (!bank.currentUser) {
            document.getElementById('auth-screen').classList.add('active');
        } else {
            app.renderDashboard();
        }
    },

    switchAuth: (screen) => {
        const loginForm = document.getElementById('login-form');
        const regForm = document.getElementById('register-form');
        if (screen === 'register') {
            loginForm.classList.add('hidden');
            regForm.classList.remove('hidden');
        } else {
            loginForm.classList.remove('hidden');
            regForm.classList.add('hidden');
        }
    },

    logout: () => {
        bank.logout();
        document.getElementById('auth-screen').classList.add('active');
    },

    nav: (tab) => {
        // Highlight Sidebar
        document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-links li[onclick="app.nav('${tab}')"]`);
        if(activeNav) activeNav.classList.add('active');

        app.renderContent(tab);
    },

    formatMoney: (n) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    },

    renderDashboard: () => {
        document.getElementById('auth-screen').classList.remove('active');
        const user = bank.getAccount();
        document.getElementById('user-name-display').innerText = user.name;
        document.getElementById('user-id-display').innerText = `STK: ${user.id}`;
        app.nav('home');
    },

    renderContent: (tab) => {
        const user = bank.getAccount();
        const content = document.getElementById('content-area');
        const title = document.getElementById('page-title');

        if (tab === 'home') {
            title.innerText = 'Tổng quan tài khoản';
            content.innerHTML = `
                <div class="card-grid">
                    <div class="balance-card">
                        <div class="balance-title">Số dư khả dụng</div>
                        <div class="balance-amount">${app.formatMoney(user.balance)}</div>
                        <small style="color: #ccc;">**** **** ${user.id.slice(-4)}</small>
                    </div>
                </div>
                
                <h3 style="margin: 30px 0 15px 0;">Tiện ích nhanh</h3>
                <div class="action-grid">
                    <div class="action-btn" onclick="app.nav('transfer')"><i class="fa-solid fa-paper-plane"></i> Chuyển tiền</div>
                    <div class="action-btn" onclick="app.nav('deposit')"><i class="fa-solid fa-wallet"></i> Nạp tiền</div>
                    <div class="action-btn" onclick="app.nav('withdraw')"><i class="fa-solid fa-money-bill"></i> Rút tiền</div>
                    <div class="action-btn" onclick="app.nav('history')"><i class="fa-solid fa-file-invoice"></i> Sao kê</div>
                </div>

                <h3 style="margin: 30px 0 15px 0;">Giao dịch gần đây</h3>
                <div class="trans-list">
                    ${app.renderHistoryList(user.history.slice(0, 3))}
                </div>
            `;
        } else if (['transfer', 'deposit', 'withdraw'].includes(tab)) {
            const map = { transfer: 'Chuyển tiền', deposit: 'Nạp tiền', withdraw: 'Rút tiền' };
            title.innerText = map[tab];
            content.innerHTML = `
                <div class="form-box">
                    ${tab === 'transfer' ? `
                    <div class="input-group">
                        <i class="fa-solid fa-user-tag"></i>
                        <input type="text" id="action-dest" placeholder="Nhập STK người nhận">
                    </div>` : ''}
                    <div class="input-group">
                        <i class="fa-solid fa-money-bill-1-wave"></i>
                        <input type="number" id="action-amount" placeholder="Nhập số tiền">
                    </div>
                    <div class="input-group">
                        <i class="fa-solid fa-note-sticky"></i>
                        <input type="text" id="action-note" placeholder="Ghi chú (tùy chọn)">
                    </div>
                    <button class="btn-glow" onclick="app.handleAction('${tab}')">XÁC NHẬN GIAO DỊCH</button>
                </div>
            `;
        } else if (tab === 'history') {
            title.innerText = 'Lịch sử giao dịch';
            content.innerHTML = `<div class="trans-list">${app.renderHistoryList(user.history)}</div>`;
        }
    },

    renderHistoryList: (list) => {
        if (!list.length) return '<p style="text-align:center; color:#666">Chưa có giao dịch</p>';
        return list.map(item => `
            <div class="trans-item ${item.type}">
                <div class="trans-left">
                    <div class="trans-icon"><i class="fa-solid ${item.type === 'income' || item.type === 'create' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i></div>
                    <div>
                        <div style="font-weight:bold">${item.desc}</div>
                        <small style="color:#aaa">${new Date(item.date).toLocaleString()}</small>
                    </div>
                </div>
                <div style="font-weight:bold; color: ${item.type === 'income' || item.type === 'create' ? 'var(--success)' : 'var(--danger)'}">
                    ${item.type === 'income' || item.type === 'create' ? '+' : '-'}${app.formatMoney(item.amount)}
                </div>
            </div>
        `).join('');
    },

    handleAction: (type) => {
        const amt = document.getElementById('action-amount').value;
        const note = document.getElementById('action-note')?.value || '';
        let res;
        if (type === 'transfer') {
            const dest = document.getElementById('action-dest').value;
            res = bank.transfer(dest, amt, note);
        } else {
            res = bank.updateBalance(type, amt, note);
        }

        if (res.s) {
            app.notify(res.m, 'success');
            app.nav('home');
        } else {
            app.notify(res.m, 'error');
        }
    },

    notify: (msg, type) => {
        const c = document.getElementById('toast-container');
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> ${msg}`;
        c.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }
};

// Start App
app.init();
