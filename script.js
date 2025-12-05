// ... (Giữ nguyên các phần Security và BankModel từ phiên bản trước) ...
// ... (Chỉ thay thế phần UI CONTROLLER bên dưới) ...

// === UI CONTROLLER ===
const bank = new BankModel();

const app = {
    init: () => {
        app.updateDate();
        app.checkAuth();
        app.bindEvents();
    },

    updateDate: () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').innerText = new Date().toLocaleDateString('vi-VN', options);
    },

    bindEvents: () => {
        document.getElementById('login-form').onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('login-id').value;
            const pass = document.getElementById('login-pass').value;
            const result = await bank.login(id, pass);
            if (result.success) {
                app.notify('Truy cập hệ thống thành công', 'success');
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
                app.notify(`Tạo thẻ thành công! ID: ${result.id}`, 'success');
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
        const card = document.querySelector('.auth-card');
        
        // Simple animation trigger
        card.style.transform = 'scale(0.95)';
        setTimeout(() => card.style.transform = 'scale(1)', 200);

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
        document.getElementById('user-id-display').innerText = `ID: ${user.id}`;
        app.nav('home');
    },

    renderContent: (tab) => {
        const user = bank.getAccount();
        const content = document.getElementById('content-area');
        const title = document.getElementById('page-title');

        if (tab === 'home') {
            title.innerText = 'Tổng quan tài sản';
            // Render thẻ ATM xịn xò thay vì text đơn điệu
            content.innerHTML = `
                <div class="bank-card">
                    <div class="card-top">
                        <div class="chip"></div>
                        <div class="card-logo">QUOCBANK <span style="font-size:0.6em; border:1px solid #fff; padding:2px 4px; border-radius:4px">INFINITE</span></div>
                    </div>
                    <div class="card-number">
                        **** **** **** ${user.id.slice(-4)}
                    </div>
                    <div class="card-bottom">
                        <div>
                            <div class="card-label">Chủ thẻ</div>
                            <div style="text-transform: uppercase; font-weight:600">${user.name}</div>
                        </div>
                        <div style="text-align:right">
                            <div class="card-label">Số dư khả dụng</div>
                            <div class="balance-val">${app.formatMoney(user.balance)}</div>
                        </div>
                    </div>
                </div>

                <div class="section-title">Truy cập nhanh</div>
                <div class="action-grid">
                    <div class="action-card" onclick="app.nav('transfer')">
                        <div class="action-icon"><i class="fa-solid fa-paper-plane"></i></div>
                        <div>Chuyển tiền</div>
                    </div>
                    <div class="action-card" onclick="app.nav('deposit')">
                        <div class="action-icon"><i class="fa-solid fa-wallet"></i></div>
                        <div>Nạp tiền</div>
                    </div>
                    <div class="action-card" onclick="app.nav('withdraw')">
                        <div class="action-icon"><i class="fa-solid fa-money-check-dollar"></i></div>
                        <div>Rút tiền</div>
                    </div>
                    <div class="action-card" onclick="app.nav('history')">
                        <div class="action-icon"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                        <div>Sao kê</div>
                    </div>
                </div>

                <div class="section-title">Giao dịch gần đây</div>
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
                        <label>Tài khoản nhận</label>
                        <input type="text" id="action-dest" placeholder="Nhập ID người nhận">
                        <i class="fa-solid fa-user-tag input-icon"></i>
                    </div>` : ''}
                    <div class="input-group">
                        <label>Số tiền giao dịch</label>
                        <input type="number" id="action-amount" placeholder="0 VNĐ">
                        <i class="fa-solid fa-money-bill-1-wave input-icon"></i>
                    </div>
                    <div class="input-group">
                        <label>Lời nhắn (Tùy chọn)</label>
                        <input type="text" id="action-note" placeholder="Nội dung...">
                        <i class="fa-solid fa-pen-nib input-icon"></i>
                    </div>
                    <button class="btn-primary" onclick="app.handleAction('${tab}')">
                        XÁC NHẬN GIAO DỊCH <i class="fa-solid fa-check"></i>
                    </button>
                </div>
            `;
        } else if (tab === 'history') {
            title.innerText = 'Lịch sử biến động';
            content.innerHTML = `<div class="trans-list">${app.renderHistoryList(user.history)}</div>`;
        }
    },

    renderHistoryList: (list) => {
        if (!list.length) return '<p style="text-align:center; color:var(--text-mute); margin-top:20px">Chưa có phát sinh giao dịch</p>';
        return list.map(item => `
            <div class="trans-item ${item.type}">
                <div style="display:flex; align-items:center; gap:15px">
                    <div class="t-icon">
                        <i class="fa-solid ${item.type === 'income' || item.type === 'create' ? 'fa-arrow-down-long' : 'fa-arrow-up-long'}"></i>
                    </div>
                    <div>
                        <div style="font-weight:600; margin-bottom:4px">${item.desc}</div>
                        <small style="color:var(--text-mute)">${new Date(item.date).toLocaleString('vi-VN')}</small>
                    </div>
                </div>
                <div class="t-amount">
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
        t.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> <span>${msg}</span>`;
        c.appendChild(t);
        setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateX(100%)';
            setTimeout(() => t.remove(), 300);
        }, 3000);
    }
};

// Start App
app.init();