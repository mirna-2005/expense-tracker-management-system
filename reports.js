document.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const reportCategorySelect = document.getElementById('reportCategory');
    const minAmountInput = document.getElementById('minAmount');
    const maxAmountInput = document.getElementById('maxAmount');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    const reportTotalExpensesEl = document.getElementById('reportTotalExpenses');
    const reportNumTransactionsEl = document.getElementById('reportNumTransactions');
    const reportAverageExpenseEl = document.getElementById('reportAverageExpense');
    const expenseTableBody = document.querySelector('#expenseTable tbody');
    const noTransactionsMessage = document.getElementById('noTransactionsMessage');

    let allExpenses = []; // All loaded expenses
    let allCategories = []; // All loaded categories

    // --- Helper Functions (from script.js, ensure they are available or copied) ---

    // Function to load data from Local Storage
    const loadData = () => {
        const storedExpenses = localStorage.getItem('expenses');
        if (storedExpenses) {
            allExpenses = JSON.parse(storedExpenses);
        }
        const storedCategories = localStorage.getItem('categories');
        if (storedCategories) {
            allCategories = JSON.parse(storedCategories);
        } else {
            allCategories = ["Food", "Travel", "Bills", "Shopping", "Entertainment", "Other"]; // Default
        }
        populateCategoryFilter();
        applyFilters(); // Apply filters on initial load
    };

    // Function to format amount to Indian Rupee (₹)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // --- Reports Specific Functions ---

    const populateCategoryFilter = () => {
        if (!reportCategorySelect) return;
        reportCategorySelect.innerHTML = '<option value="all">All Categories</option>'; // Default option
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            reportCategorySelect.appendChild(option);
        });
    };

    const applyFilters = () => {
        let filteredExpenses = [...allExpenses];

        const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
        const selectedCategory = reportCategorySelect.value;
        const minAmount = parseFloat(minAmountInput.value);
        const maxAmount = parseFloat(maxAmountInput.value);

        // Filter by Date
        if (startDate) {
            filteredExpenses = filteredExpenses.filter(expense => new Date(expense.date) >= startDate);
        }
        if (endDate) {
            // Adjust endDate to include the whole day
            const adjustedEndDate = new Date(endDate);
            adjustedEndDate.setDate(adjustedEndDate.getDate() + 1); // Go to next day, exclusive
            filteredExpenses = filteredExpenses.filter(expense => new Date(expense.date) < adjustedEndDate);
        }

        // Filter by Category
        if (selectedCategory !== 'all') {
            filteredExpenses = filteredExpenses.filter(expense => expense.category === selectedCategory);
        }

        // Filter by Amount
        if (!isNaN(minAmount)) {
            filteredExpenses = filteredExpenses.filter(expense => Math.abs(expense.amount) >= minAmount);
        }
        if (!isNaN(maxAmount)) {
            filteredExpenses = filteredExpenses.filter(expense => Math.abs(expense.amount) <= maxAmount);
        }

        displayReport(filteredExpenses);
    };

    const resetFilters = () => {
        startDateInput.value = '';
        endDateInput.value = '';
        reportCategorySelect.value = 'all';
        minAmountInput.value = '';
        maxAmountInput.value = '';
        applyFilters(); // Re-apply filters to show all expenses
    };


    const displayReport = (expensesToDisplay) => {
        expenseTableBody.innerHTML = ''; // Clear existing rows
        noTransactionsMessage.style.display = 'none'; // Hide no transactions message by default

        if (expensesToDisplay.length === 0) {
            noTransactionsMessage.style.display = 'block';
            reportTotalExpensesEl.textContent = formatCurrency(0);
            reportNumTransactionsEl.textContent = 0;
            reportAverageExpenseEl.textContent = formatCurrency(0);
            return;
        }

        // Sort by date (most recent first) for display
        const sortedExpenses = [...expensesToDisplay].sort((a, b) => new Date(b.date) - new Date(a.date));

        let totalExpenses = 0;
        sortedExpenses.forEach(expense => {
            totalExpenses += expense.amount; // expense.amount is already negative for expenses

            const row = expenseTableBody.insertRow();
            row.innerHTML = `
                <td>${expense.date}</td>
                <td>${expense.description}</td>
                <td>${expense.category}</td>
                <td class="expense-amount">${formatCurrency(expense.amount)}</td>
                <td class="action-buttons">
                    <button class="edit-expense-btn" data-id="${expense.id}">Edit</button>
                    <button class="delete-expense-btn" data-id="${expense.id}">Delete</button>
                </td>
            `;
            // You'd add event listeners for edit/delete here if implementing
        });

        // Update summary statistics
        reportTotalExpensesEl.textContent = formatCurrency(totalExpenses);
        reportNumTransactionsEl.textContent = sortedExpenses.length;
        reportAverageExpenseEl.textContent = formatCurrency(totalExpenses / sortedExpenses.length);
    };

    // --- Event Listeners ---
    applyFiltersBtn.addEventListener('click', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);

    // --- Initialization ---
    loadData();
});
// At the very top of each page's JavaScript file (e.g., script.js, dashboard.js)

// Check if user is logged in
const getLoggedInUser = () => {
    return localStorage.getItem('loggedInUser');
};

if (!getLoggedInUser()) {
    // If no user is logged in, redirect to the login page
    window.location.href = 'login.html';
}

// ... rest of your page's JavaScript code ...