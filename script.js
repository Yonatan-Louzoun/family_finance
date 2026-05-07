// --- נתונים ראשוניים (יועלו רק בשימוש הראשון) ---
const initialBudget = [
    { id: 1, name: 'מזון וסופר', budget: 2500, spent: 0 },
    { id: 2, name: 'פארם ותינוק (הלל ישראל)', budget: 800, spent: 0 },
    { id: 3, name: 'בילויים', budget: 500, spent: 0 }
];

const initialSavings = [
    { id: 1, goal: 'דירה', fund: 'מיטב כספית שקלית ללא קונצרני', percent: 32.5 },
    { id: 2, goal: 'רכב', fund: 'הראל כספית שקלית', percent: 27.1 },
    { id: 3, goal: 'אירועים (חדוה)', fund: 'אלטשולר שחם כספית (5140918)', percent: 11.6 },
    { id: 4, goal: 'חופשות', fund: 'אזימוט כספית', percent: 9.9 },
    { id: 5, goal: 'מעבר דירה', fund: 'פורסט כספית (5141353)', percent: 9.9 },
    { id: 6, goal: 'חירום', fund: 'מור כספית ניהול נזילות', percent: 9.0 }
];

let categories = JSON.parse(localStorage.getItem('louzounCategories')) || initialBudget;
let savingsRules = JSON.parse(localStorage.getItem('louzounSavings')) || initialSavings;

// --- אתחול ---
function init() {
    renderBudget();
    renderSavingsRules();
    renderCategorySelect();
}

// --- ניהול תקציב (הוצאות) ---
function renderCategorySelect() {
    const select = document.getElementById('expenseCategory');
    select.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function renderBudget() {
    const list = document.getElementById('budgetList');
    const mngList = document.getElementById('categoriesList');
    
    list.innerHTML = categories.map(cat => {
        const p = Math.min((cat.spent / cat.budget) * 100, 100);
        return `
            <div style="margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between;">
                    <strong>${cat.name}</strong>
                    <span>₪${cat.spent} / ₪${cat.budget}</span>
                </div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${p}%;"></div></div>
            </div>`;
    }).join('');

    mngList.innerHTML = categories.map(cat => `
        <div class="list-item">
            <span>${cat.name} (₪${cat.budget})</span>
            <button class="delete-btn" onclick="deleteItem('cat', ${cat.id})">מחק</button>
        </div>`).join('');
}

function addCategory() {
    const name = document.getElementById('newCatName').value;
    const budget = parseFloat(document.getElementById('newCatBudget').value);
    if (name && budget) {
        categories.push({ id: Date.now(), name, budget, spent: 0 });
        saveAndRefresh();
    }
}

function addExpense() {
    const id = parseInt(document.getElementById('expenseCategory').value);
    const amt = parseFloat(document.getElementById('expenseAmount').value);
    if (amt) {
        const cat = categories.find(c => c.id === id);
        cat.spent += amt;
        saveAndRefresh();
        document.getElementById('expenseAmount').value = '';
    }
}

// --- ניהול חיסכון (מטרות ואחוזים) ---
function renderSavingsRules() {
    const list = document.getElementById('savingsRulesList');
    let totalP = 0;

    list.innerHTML = savingsRules.map(rule => {
        totalP += rule.percent;
        return `
            <div class="list-item">
                <div style="flex:2"><strong>${rule.goal}</strong> <br> <small>${rule.fund}</small></div>
                <div style="flex:1; display:flex; align-items:center; justify-content:center; gap:5px;">
                    <input type="number" step="0.1" value="${rule.percent}" 
                           style="width: 70px; padding: 5px; text-align: center; border: 1px solid #ccc; border-radius: 4px;"
                           onchange="updateSavingsPercent(${rule.id}, this.value)"> %
                </div>
                <button class="delete-btn" onclick="deleteItem('savings', ${rule.id})">מחק</button>
            </div>`;
    }).join('');

    const warn = document.getElementById('totalPercentWarn');
    const displayTotal = Math.round(totalP * 10) / 10;
    warn.textContent = `סה"כ אחוזים: ${displayTotal}%`;
    warn.style.color = Math.abs(displayTotal - 100) < 0.1 ? 'var(--success)' : 'var(--danger)';
}

function updateSavingsPercent(id, newPercent) {
    const percent = parseFloat(newPercent);
    if (!isNaN(percent)) {
        const rule = savingsRules.find(r => r.id === id);
        if (rule) {
            rule.percent = percent;
            saveAndRefresh();
        }
    }
}

function addSavingsRule() {
    const goal = document.getElementById('newGoalName').value;
    const fund = document.getElementById('newGoalFund').value;
    const percent = parseFloat(document.getElementById('newGoalPercent').value);

    if (goal && fund && percent) {
        savingsRules.push({ id: Date.now(), goal, fund, percent });
        saveAndRefresh();
        document.getElementById('newGoalName').value = '';
        document.getElementById('newGoalFund').value = '';
        document.getElementById('newGoalPercent').value = '';
    }
}

function calculateSavings() {
    const total = parseFloat(document.getElementById('totalSavingsInput').value);
    if (!total) return;

    const tbody = document.getElementById('savingsTableBody');
    tbody.innerHTML = savingsRules.map(rule => {
        const amount = Math.round(total * (rule.percent / 100));
        return `<tr><td>${rule.goal}</td><td>${rule.fund}</td><td>₪${amount.toLocaleString()}</td></tr>`;
    }).join('');
    
    document.getElementById('savingsResult').style.display = 'block';
}

// --- עזרים ---
function deleteItem(type, id) {
    if (!confirm('למחוק פריט זה?')) return;
    if (type === 'cat') categories = categories.filter(c => c.id !== id);
    else savingsRules = savingsRules.filter(r => r.id !== id);
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('louzounCategories', JSON.stringify(categories));
    localStorage.setItem('louzounSavings', JSON.stringify(savingsRules));
    init();
}

function resetMonth() {
    if (confirm('לאפס את כל ההוצאות?')) {
        categories.forEach(c => c.spent = 0);
        saveAndRefresh();
    }
}

function switchTab(tab) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
}

init();
