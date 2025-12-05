// script.js

// === BANK DATA LOGIC (MODEL) ===
class BankModel {
    constructor() {
        this.db = JSON.parse(localStorage.getItem('quocbank_v3')) || { accounts: {} };
        this.currentUser = null;
    }

    save() { localStorage.setItem('quocbank_v3', JSON.stringify(this.db)); }

    createAccount(name, pass, balance) {
        const id = Math.floor(100000 + Math.random() * 900000).toString();
        this.db.accounts[id] = {
            id, name, pass, // Lưu ý: Demo nên chưa hash kỹ
            balance: parseFloat(balance),
            history: [{ type: 'create', amount: parseFloat(balance), desc: 'Khởi tạo tài khoản', date: new Date().toISOString() }]
        };
        this.save();
        return id;
    }

    login(id, pass) {
        const acc = this.db.accounts[id];
        if (acc && acc.pass === pass) {
            this.currentUser = id;
            return acc;
        }
        return null;
    }

    logout() { this.currentUser = null; }

    getAccount() { return this.currentUser ? this.db.accounts[this.currentUser] : null; }

    transfer(toId, amount) {
        const user = this.getAccount();
        const receiver = this.db.accounts[toId];
        amount = parseFloat(amount);

        if (!user || amount <= 0 || user.balance < amount) return { s: false, m: 'Số dư không đủ hoặc số tiền sai' };
        if (!receiver) return { s: false, m: 'Người nhận không tồn tại' };
        if (toId === user.id) return { s: false, m: 'Không thể tự chuyển cho mình' };

        user.balance -= amount;
        receiver.balance += amount;

        const date = new Date().toISOString();
        user.history.unshift({ type: 'expense', amount: amount, desc: `Chuyển đến ${receiver.name} (${toId})`, date });
        receiver.history.unshift({ type: 'income', amount: amount, desc: `Nhận từ ${user.name} (${user.id})`, date });
        
        this.save();
        return { s: true, m: 'Chuyển khoản thành công!' };
    }

    updateBalance(type, amount) {
        const user = this.getAccount();
        amount = parseFloat(amount);
        if (amount <= 0) return { s: false, m: 'Số tiền không hợp lệ' };
        
        if (type === 'withdraw' && user.balance < amount) return { s: false, m: 'Số dư không đủ' };

        if (type === 'withdraw') {
            user.balance -= amount;
            user.history.unshift({ type: 'expense', amount, desc: 'Rút tiền mặt', date: new Date().toISOString() });
        } else {
            user.balance += amount;
            user.history.unshift({ type: 'income', amount, desc: 'Nạp tiền vào tài khoản', date: new Date().toISOString() });
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
        document.getElementById('login-form').onsubmit = (e) => {
            e.preventDefault();
            const id = document.getElementById('login-id').value;
            const pass = document.getElementById('login-pass').value;
            const acc = bank.login(id, pass);
            if (acc) {
                app.notify('Chào mừng ' + acc.name + ' quay trở lại!', 'success');
                app.renderDashboard();
            } else {
                app.notify('Sai thông tin đăng nhập!', 'error');
            }
        };

        document.getElementById('register-form').onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const pass = document.getElementById('reg-pass').value;
            const bal = document.getElementById('reg-balance').value;
            const id = bank.createAccount(name, pass, bal);
            app.notify(`Tạo thành công! STK của bạn là: ${id}`, 'success');
            app.switchAuth('login');
            document.getElementById('login-id').value = id;
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
                    <button class="btn-glow" onclick="app.handleAction('${tab}')">XÁC NHAN GIAO DỊCH</button>
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
        let res;
        if (type === 'transfer') {
            const dest = document.getElementById('action-dest').value;
            res = bank.transfer(dest, amt);
        } else {
            res = bank.updateBalance(type, amt);
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