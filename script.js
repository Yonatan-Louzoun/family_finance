// --- DATA & STATE ---
const defaultCategories = [
    { id: 1, name: 'מזון וסופר (בית)', budget: 2000, spent: 0 },
    { id: 2, name: 'פארם ותינוק (הלל ישראל)', budget: 600, spent: 0 },
    { id: 3, name: 'בילויים ומסעדות', budget: 500, spent: 0 },
    { id: 4, name: 'דלק ותחבורה', budget: 800, spent: 0 },
    { id: 5, name: 'חשבונות (חשמל/מים/גז)', budget: 700, spent: 0 },
    { id: 6, name: 'ביגוד והנעלה', budget: 300, spent: 0 }
];

// Percentage Logic based on our conversation
const savingsRules = [
    { goal: 'דירה', fund: 'דולפין כספית שקלית (5141098)', percent: 29.25 },
    { goal: 'רכב', fund: 'אי בי איי כספית חיסכון (5141197)', percent: 24.37 },
    { goal: 'אירועים (חדווה)', fund: 'אלטשולר שחם כספית (5140918)', percent: 10.48 },
    { goal: 'ארנונה', fund: 'ילין לפידות כספית כשרה (5141452)', percent: 9.75 },
    { goal: 'חופשות', fund: "מיטב כספית ג'מבו (5141296)", percent: 9.02 },
    { goal: 'מעבר דירה', fund: 'פורסט כספית (5141353)', percent: 9.02 },
    { goal: 'חירום + בלת"מ', fund: 'אנליסט כספית חיסכון (5140413)', percent: 8.11 }
];

let categories = JSON.parse(localStorage.getItem('louzounCategories')) || defaultCategories;

// --- INITIALIZATION ---
function init() {
    renderCategoriesSelect();
    renderBudgetList();
    renderCategoriesManagement();
}

// --- SAVINGS LOGIC ---
function calculateSavings() {
    const total = parseFloat(document.getElementById('totalSavingsInput').value);
    if (!total || total <= 0) {
        alert('אנא הכנס סכום תקין');
        return;
    }

    const tbody = document.getElementById('savingsTableBody');
    tbody.innerHTML = '';
    
    let checkSum = 0;

    savingsRules.forEach(rule => {
        // Calculate and round to nearest integer
        const amount = Math.round(total * (rule.percent / 100));
        checkSum += amount;

        const row = `
            <tr>
                <td><strong>${rule.goal}</strong></td>
                <td>${rule.fund}</td>
                <td style="font-size:1.1rem; color:var(--accent);">₪${amount.toLocaleString()}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    document.getElementById('savingsResult').style.display = 'block';
}

// --- BUDGET LOGIC ---
function renderCategoriesSelect() {
    const select = document.getElementById('expenseCategory');
    select.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

function addExpense() {
    const catId = parseInt(document.getElementById('expenseCategory').value);
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    
    if (!amount || amount <= 0) {
        alert('אנא הכנס סכום תקין');
        return;
    }

    const catIndex = categories.findIndex(c => c.id === catId);
    if (catIndex > -1) {
        categories[catIndex].spent += amount;
        saveData();
        renderBudgetList();
        
        // Clear inputs
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseDesc').value = '';
        alert('ההוצאה נוספה בהצלחה!');
    }
}

function renderBudgetList() {
    const container = document.getElementById('budgetList');
    container.innerHTML = '';

    categories.forEach(cat => {
        const percent = Math.min((cat.spent / cat.budget) * 100, 100);
        const isOver = cat.spent > cat.budget;
        const barColor = isOver ? 'var(--danger)' : 'var(--success)';
        
        const item = document.createElement('div');
        item.className = 'budget-val-box';
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <strong>${cat.name}</strong>
                <span>₪${cat.spent.toLocaleString()} / ₪${cat.budget.toLocaleString()}</span>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width:${percent}%; background-color:${barColor}"></div>
            </div>
            ${isOver ? `<small style="color:red">חריגה של ₪${(cat.spent - cat.budget).toLocaleString()}</small>` : ''}
        `;
        container.appendChild(item);
    });
}

// --- CATEGORY MANAGEMENT ---
function addCategory() {
    const name = document.getElementById('newCatName').value;
    const budget = parseFloat(document.getElementById('newCatBudget').value);

    if (name && budget) {
        const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
        categories.push({ id: newId, name: name, budget: budget, spent: 0 });
        saveData();
        init();
        document.getElementById('newCatName').value = '';
        document.getElementById('newCatBudget').value = '';
    }
}

function deleteCategory(id) {
    if(confirm('למחוק את הקטגוריה?')) {
        categories = categories.filter(c => c.id !== id);
        saveData();
        init();
    }
}

function renderCategoriesManagement() {
    const list = document.getElementById('categoriesList');
    list.innerHTML = '';
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.padding = '5px 0';
        div.style.borderBottom = '1px solid #eee';
        div.innerHTML = `
            <span>${cat.name} (תקציב: ${cat.budget})</span>
            <button class="delete-btn" onclick="deleteCategory(${cat.id})">מחק</button>
        `;
        list.appendChild(div);
    });
}

function resetMonth() {
    if (confirm('האם אתה בטוח שברצונך לאפס את כל ההוצאות לחודש חדש?')) {
        categories.forEach(c => c.spent = 0);
        saveData();
        renderBudgetList();
    }
}

// --- UTILS ---
function switchTab(tabName) {
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    
    if(tabName === 'budget') {
        document.getElementById('tab-budget').classList.add('active');
    } else {
        document.getElementById('tab-savings').classList.add('active');
    }
}

function saveData() {
    localStorage.setItem('louzounCategories', JSON.stringify(categories));
}

// Start
init();