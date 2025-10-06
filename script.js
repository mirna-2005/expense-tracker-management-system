// --- DUMMY DATA SETUP --- (Place this at the VERY TOP of your script.js)
// This block ensures dummy data exists if not already present.
(function() {
    if (!localStorage.getItem('expenses')) {
        const dummyExpenses = [
            { id: 1, date: "2025-08-15", category: "Food", amount: 250, description: "Restaurant dinner" },
            { id: 2, date: "2025-08-20", category: "Transport", amount: 80, description: "Metro ticket" },
            { id: 3, date: "2025-08-22", category: "Shopping", amount: 1200, description: "New shirt" },
            { id: 4, date: "2025-09-01", category: "Food", amount: 200, description: "Lunch" },
            { id: 5, date: "2025-09-05", category: "Transport", amount: 100, description: "Bus fare" },
            { id: 6, date: "2025-09-08", category: "Shopping", amount: 500, description: "Clothes" },
            { id: 7, date: "2025-09-10", category: "Food", amount: 150, description: "Snacks" },
            { id: 8, date: "2025-09-12", category: "Entertainment", amount: 750, description: "Movie tickets" },
            { id: 9, date: "2025-09-15", category: "Bills", amount: 1500, description: "Electricity bill" },
            { id: 10, date: "2025-09-18", category: "Food", amount: 300, description: "Groceries" },
            { id: 11, date: "2025-09-20", category: "Health", amount: 600, description: "Medicine" },
            { id: 12, date: "2025-09-25", category: "Transport", amount: 200, description: "Taxi ride" },
            { id: 13, date: "2025-10-01", category: "Food", amount: 400, description: "Dinner with friends" },
            { id: 14, date: "2025-10-03", category: "Shopping", amount: 800, description: "Books" },
            { id: 15, date: "2025-10-05", category: "Entertainment", amount: 300, description: "Concert tickets" }
        ];
        localStorage.setItem('expenses', JSON.stringify(dummyExpenses));
        console.log('Dummy expenses loaded into localStorage.');
    }

    // IMPORTANT: Ensure this key matches what your other pages use, e.g., 'expenseCategories'
    if (!localStorage.getItem('expenseCategories')) {
        const dummyCategories = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Health", "Education", "Rent"];
        localStorage.setItem('expenseCategories', JSON.stringify(dummyCategories));
        console.log('Dummy categories loaded into localStorage.');
    }

    if (!localStorage.getItem('monthlyBudget')) {
        localStorage.setItem('monthlyBudget', '50000');
        console.log('Dummy monthly budget set in localStorage.');
    }
})();
// --- END DUMMY DATA SETUP ---

document.addEventListener('DOMContentLoaded', () => {

    // --- Authentication Check Function ---
    // This function will be called before any sensitive action or page load (except initial login.html)
    function requireLogin() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const currentPage = window.location.pathname.split('/').pop();
        const loginPage = 'login.html'; // Your separate login/signup page

        if (!isLoggedIn) {
            if (currentPage !== loginPage) {
                alert('Please log in to continue.');
                window.location.href = loginPage;
                return false; // Indicate that login is required
            }
        }
        return true; // Indicate that user is logged in
    }

    // --- Utility Functions (Reusable) ---
    // These functions now call requireLogin() at their entry point.
    function getAllExpenses() {
        if (!requireLogin()) return [];
        return JSON.parse(localStorage.getItem('expenses')) || [];
    }

    function getAllCategories() {
        if (!requireLogin()) return [];
        // IMPORTANT: Consistent key for categories
        return JSON.parse(localStorage.getItem('expenseCategories')) || [];
    }

    function saveExpenses(expenses) {
        if (!requireLogin()) return;
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    function saveCategories(categories) {
        if (!requireLogin()) return;
        // IMPORTANT: Consistent key for categories
        localStorage.setItem('expenseCategories', JSON.stringify(categories));
    }

    // Function to format amount to Indian Rupee (₹) - Re-added here
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // --- Selectors for Common Elements (Unified approach) ---
    const expenseForm = document.getElementById('expense-form');
    const expenseDescriptionInput = document.getElementById('expense-description');
    const expenseAmountInput = document.getElementById('expense-amount');
    const expenseDateInput = document.getElementById('expense-date');
    const expenseCategorySelect = document.getElementById('expense-category');
    const totalBalanceSpan = document.getElementById('total-balance'); // Assuming this is the main balance display
    const recentTransactionsList = document.getElementById('recentTransactionsList');
    const viewAllExpensesButton = document.querySelector('#recent-expenses-card .view-all-button') || document.querySelector('.view-all-button');

    const displayedMonthlyBudget = document.getElementById('displayedMonthlyBudget');
    const remainingBudgetElement = document.getElementById('remainingBudget');
    const spendingChartCanvas = document.getElementById('spendingChart'); // New: Chart canvas
    const topCategoriesList = document.getElementById('topCategoriesList'); // New: Top categories list

    const addCategoryForm = document.getElementById('addCategoryForm');
    const categoryNameInput = document.getElementById('categoryName');
    const categoriesList = document.getElementById('categoriesList');

    // Reports page specific elements - IDs match the HTML I suggested
    const reportFiltersForm = document.getElementById('reportFiltersForm'); // This is a new wrapper for filters
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    const categoryFilterSelect = document.getElementById('categoryFilter'); // Changed ID for consistency
    const minAmountInput = document.getElementById('minAmount');
    const maxAmountInput = document.getElementById('maxAmount');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn'); // Specific button for apply
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const summaryTotalExpenses = document.getElementById('summaryTotalExpenses'); // Changed ID for consistency
    const summaryNumTransactions = document.getElementById('summaryNumTransactions'); // Changed ID for consistency
    const reportAverageExpenseEl = document.getElementById('reportAverageExpense'); // New element for average
    const filteredTransactionsList = document.getElementById('filteredTransactionsList');
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    const noTransactionsMessage = document.getElementById('noTransactionsMessage');


    const monthlyBudgetInputOnSettings = document.getElementById('monthly-budget');
    const saveBudgetBtn = document.getElementById('saveBudgetBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const clearAllDataBtn = document.getElementById('clearAllDataBtn');

    // --- Page Initialization Flags ---
    const currentPage = window.location.pathname.split('/').pop();
    const isIndexPage = (currentPage === '' || currentPage === 'index.html');
    const isDashboardPage = (currentPage === 'dashboard.html');
    const isCategoriesPage = (currentPage === 'categories.html');
    const isReportsPage = (currentPage === 'reports.html'); // This page
    const isSettingsPage = (currentPage === 'settings.html');
    const isLoginPage = (currentPage === 'login.html'); // Only for the login page itself


    // --- Core UI Update Functions (Centralized) ---

    // Populates a given select element with categories
    function populateCategoryDropdown(selectElement, includeAllOption = false) {
        if (!selectElement) return;
        const categories = getAllCategories(); // Already checks login
        selectElement.innerHTML = '';
        if (includeAllOption) {
            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = 'All Categories';
            selectElement.appendChild(allOption);
        } else {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select Category';
            selectElement.appendChild(defaultOption);
        }

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            selectElement.appendChild(option);
        });
    }

    // Updates the total balance displayed
    function updateTotalBalance() {
        if (!totalBalanceSpan) return;
        const expenses = getAllExpenses(); // Already checks login
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        totalBalanceSpan.textContent = totalExpenses.toFixed(2);
    }

    // Displays recent transactions on the home page
    function displayRecentTransactions() {
        if (!recentTransactionsList) return;
        const expenses = getAllExpenses().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5); // Get 5 most recent
        recentTransactionsList.innerHTML = ''; // Clear existing

        if (expenses.length === 0) {
            recentTransactionsList.innerHTML = '<p class="no-transactions-message">No expenses added yet. Add one above!</p>';
        } else {
            const ul = document.createElement('ul');
            ul.className = 'recent-expense-list';
            expenses.forEach(expense => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="recent-expense-date">${expense.date}</span>
                    <span class="recent-expense-description">${expense.description}</span>
                    <span class="recent-expense-amount">₹ ${parseFloat(expense.amount).toFixed(2)}</span>
                `;
                ul.appendChild(li);
            });
            recentTransactionsList.appendChild(ul);
        }
    }

    // Loads and displays categories on the categories page
    function loadCategoriesList() {
        if (!categoriesList) return;
        const categories = getAllCategories(); // Already checks login
        categoriesList.innerHTML = '';

        if (categories.length === 0) {
            categoriesList.innerHTML = '<li class="no-categories-message">No categories added yet.</li>';
        } else {
            categories.forEach(category => {
                const li = document.createElement('li');
                li.className = 'category-item';
                li.innerHTML = `
                    <span>${category}</span>
                    <button class="delete-category-btn danger-button" data-category="${category}">Delete</button>
                `;
                categoriesList.appendChild(li);
            });
        }
    }

    let spendingChartInstance = null; // To hold the chart instance

    // Loads monthly budget and calculates remaining budget for dashboard
    // Also generates the spending overview chart and top categories list
    function loadDashboardBudgetAndChart() {
        if (!displayedMonthlyBudget) return;
        const savedBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;
        const expenses = getAllExpenses(); // Already checks login
        let totalExpensesThisMonth = 0;
        const categorySpending = {};

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
                const amount = parseFloat(expense.amount);
                totalExpensesThisMonth += amount;
                categorySpending[expense.category] = (categorySpending[expense.category] || 0) + amount;
            }
        });

        displayedMonthlyBudget.textContent = formatCurrency(savedBudget);
        const remaining = savedBudget - totalExpensesThisMonth;
        if (remainingBudgetElement) {
            remainingBudgetElement.textContent = formatCurrency(remaining);
            if (remaining < 0) {
                remainingBudgetElement.style.color = 'red';
            } else {
                remainingBudgetElement.style.color = 'green';
            }
        }

        // --- Chart.js Integration ---
        if (spendingChartCanvas) {
            const categories = Object.keys(categorySpending);
            const amounts = Object.values(categorySpending);

            // Destroy existing chart if it exists
            if (spendingChartInstance) {
                spendingChartInstance.destroy();
            }

            // Create new chart
            spendingChartInstance = new Chart(spendingChartCanvas, {
                type: 'bar',
                data: {
                    labels: categories,
                    datasets: [{
                        label: 'Spending by Category (This Month)',
                        data: amounts,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)',
                            'rgba(199, 199, 199, 0.7)',
                            'rgba(83, 102, 140, 0.7)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(199, 199, 199, 1)',
                            'rgba(83, 102, 140, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Amount (₹)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Category'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false // No need for legend in a single dataset bar chart
                        },
                        title: {
                            display: true,
                            text: 'Monthly Spending by Category'
                        }
                    }
                }
            });
        }

        // --- Top Categories List ---
        if (topCategoriesList) {
            topCategoriesList.innerHTML = ''; // Clear existing
            const sortedCategories = Object.entries(categorySpending).sort(([, a], [, b]) => b - a);

            if (sortedCategories.length === 0) {
                topCategoriesList.innerHTML = '<li>No expenses yet this month.</li>';
            } else {
                sortedCategories.slice(0, 5).forEach(([category, amount]) => { // Show top 5
                    const li = document.createElement('li');
                    li.textContent = `${category}: ${formatCurrency(amount)}`;
                    topCategoriesList.appendChild(li);
                });
            }
        }
    }

    // Displays filtered reports on the reports page
    function displayReportTable(expensesToDisplay) {
        if (!filteredTransactionsList || !noTransactionsMessage) return;

        filteredTransactionsList.innerHTML = ''; // Clear existing list
        noTransactionsMessage.style.display = 'none'; // Hide by default

        if (expensesToDisplay.length === 0) {
            noTransactionsMessage.style.display = 'block';
            summaryTotalExpenses.textContent = formatCurrency(0);
            summaryNumTransactions.textContent = 0;
            reportAverageExpenseEl.textContent = formatCurrency(0);
            return;
        }

        // Sort by date (most recent first) for display
        const sortedExpenses = [...expensesToDisplay].sort((a, b) => new Date(b.date) - new Date(a.date));

        let totalExpenses = 0;
        const ul = document.createElement('ul');
        ul.className = 'transaction-report-list';

        sortedExpenses.forEach(expense => {
            totalExpenses += expense.amount; // Summing up, assuming amounts are positive
            const li = document.createElement('li');
            li.className = 'transaction-report-item';
            li.innerHTML = `
                <span class="report-date">${expense.date}</span>
                <span class="report-description">${expense.description}</span>
                <span class="report-category">[${expense.category}]</span>
                <span class="report-amount">${formatCurrency(expense.amount)}</span>
                <div class="report-actions">
                    <button class="edit-expense-btn primary-button" data-id="${expense.id}">Edit</button>
                    <button class="delete-expense-btn danger-button" data-id="${expense.id}">Delete</button>
                </div>
            `;
            ul.appendChild(li);
        });
        filteredTransactionsList.appendChild(ul);

        // Update summary statistics
        summaryTotalExpenses.textContent = formatCurrency(totalExpenses);
        summaryNumTransactions.textContent = sortedExpenses.length;
        reportAverageExpenseEl.textContent = formatCurrency(totalExpenses / sortedExpenses.length);

        // Add event listeners for edit/delete buttons after rendering
        document.querySelectorAll('.edit-expense-btn').forEach(button => {
            button.addEventListener('click', handleEditExpense);
        });
        document.querySelectorAll('.delete-expense-btn').forEach(button => {
            button.addEventListener('click', handleDeleteExpense);
        });
    }

    // Applies filters and calls displayReportTable
    function applyReportFilters() {
        if (!filteredTransactionsList) return; // Only proceed if on reports page
        if (!requireLogin()) return; // Ensure user is logged in

        let expenses = getAllExpenses(); // Already checks login

        const startDate = fromDateInput.value ? new Date(fromDateInput.value + 'T00:00:00') : null; // Ensure start of day
        const endDate = toDateInput.value ? new Date(toDateInput.value + 'T23:59:59') : null; // Ensure end of day
        const selectedCategory = categoryFilterSelect.value;
        const minAmount = parseFloat(minAmountInput.value);
        const maxAmount = parseFloat(maxAmountInput.value);

        const filteredTransactions = expenses.filter(expense => {
            const expenseDate = new Date(expense.date + 'T12:00:00'); // Use midday to avoid timezone issues

            const matchesDate = (!startDate || expenseDate >= startDate) && (!endDate || expenseDate <= endDate);
            const matchesCategory = (selectedCategory === 'all' || expense.category === selectedCategory);
            // Assuming amounts are positive. If you store negative for expenses, use Math.abs
            const matchesAmount = (isNaN(minAmount) || expense.amount >= minAmount) && (isNaN(maxAmount) || expense.amount <= maxAmount);

            return matchesDate && matchesCategory && matchesAmount;
        });

        displayReportTable(filteredTransactions);
    }

    // Resets report filters
    function resetReportFilters() {
        if (!categoryFilterSelect) return; // Only proceed if on reports page
        fromDateInput.value = '';
        toDateInput.value = '';
        categoryFilterSelect.value = 'all';
        minAmountInput.value = '';
        maxAmountInput.value = '';
        applyReportFilters(); // Re-apply to show all expenses
    }

    // Loads the monthly budget value into the settings input field
    function loadSavedBudgetInput() {
        if (!monthlyBudgetInputOnSettings) return;
        const savedBudget = localStorage.getItem('monthlyBudget');
        monthlyBudgetInputOnSettings.value = savedBudget || '';
    }

    // Function to generate and download CSV report
    function downloadCSVReport(transactionsToExport, filename = "expense_report.csv") {
        if (!requireLogin()) return;
        if (transactionsToExport.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = ["Date", "Description", "Category", "Amount"];
        const rows = transactionsToExport.map(exp => [
            exp.date,
            exp.description,
            exp.category,
            parseFloat(exp.amount).toFixed(2)
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Placeholder for Edit/Delete functionality (to be implemented)
    function handleEditExpense(event) {
        if (!requireLogin()) return;
        const expenseId = event.target.dataset.id;
        alert(`Edit expense with ID: ${expenseId}`);
        // In a real app, this would likely open a modal with the expense details
        // for editing, then update localStorage and re-render.
    }

    function handleDeleteExpense(event) {
        if (!requireLogin()) return;
        const expenseId = parseInt(event.target.dataset.id);
        if (confirm(`Are you sure you want to delete this expense?`)) {
            let expenses = getAllExpenses();
            expenses = expenses.filter(exp => exp.id !== expenseId);
            saveExpenses(expenses);
            alert('Expense deleted successfully!');
            // After deleting, re-apply filters to update the report and summaries
            if (isReportsPage) { // Only re-apply if on reports page
                applyReportFilters();
            }
            // Also update home page balance and recent transactions if they are visible
            if (isIndexPage) {
                updateTotalBalance();
                displayRecentTransactions();
            }
            if (isDashboardPage) {
                loadDashboardBudgetAndChart(); // Updated to include chart
            }
        }
    }


    // --- Page-Specific Initializations and Event Listeners ---

    // Global: Check login status for all protected pages upon DOMContentLoaded
    // The login.html page is *not* protected by this initial check.
    if (!isLoginPage) {
        requireLogin();
    }

    // Home Page (index.html)
    if (isIndexPage) {
        populateCategoryDropdown(expenseCategorySelect);
        updateTotalBalance();
        displayRecentTransactions();

        if (expenseForm) {
            expenseForm.addEventListener('submit', (event) => {
                event.preventDefault();
                if (!requireLogin()) return;

                const description = expenseDescriptionInput.value.trim();
                const amount = parseFloat(expenseAmountInput.value);
                const date = expenseDateInput.value;
                const category = expenseCategorySelect.value;

                if (description && amount > 0 && date && category) {
                    const newExpense = {
                        id: Date.now(),
                        description,
                        amount,
                        date,
                        category
                    };

                    const expenses = getAllExpenses();
                    expenses.push(newExpense);
                    saveExpenses(expenses);

                    expenseDescriptionInput.value = '';
                    expenseAmountInput.value = '';
                    expenseDateInput.value = '';
                    expenseCategorySelect.value = '';
                    populateCategoryDropdown(expenseCategorySelect); // Re-populate for reset
                    updateTotalBalance();
                    displayRecentTransactions();
                    alert('Expense added successfully!');
                    // If on dashboard and an expense is added, update dashboard too
                    // This is handled by a separate check, but a re-render might be needed on index itself
                    // if index also showed budget/chart directly. For now, this is sufficient.
                } else {
                    alert('Please fill in all expense details (Description, Amount, Date, Category).');
                }
            });
        }

        if (viewAllExpensesButton) {
            viewAllExpensesButton.addEventListener('click', (event) => {
                if (!requireLogin()) return;
                window.location.href = 'reports.html'; // Or a dedicated 'all-expenses.html'
            });
        }
    }

    // Dashboard Page (dashboard.html)
    if (isDashboardPage) {
        loadDashboardBudgetAndChart(); // Updated function call to load budget, chart, and top categories
    }

    // Categories Page (categories.html)
    if (isCategoriesPage) {
        loadCategoriesList();

        if (addCategoryForm) {
            addCategoryForm.addEventListener('submit', (event) => {
                event.preventDefault();
                if (!requireLogin()) return;

                const newCategoryName = categoryNameInput.value.trim();

                if (newCategoryName) {
                    let categories = getAllCategories();

                    if (categories.some(cat => cat.toLowerCase() === newCategoryName.toLowerCase())) {
                        alert('Category already exists!');
                        categoryNameInput.value = '';
                        return;
                    }

                    categories.push(newCategoryName);
                    saveCategories(categories);

                    categoryNameInput.value = '';
                    loadCategoriesList();
                    alert(`Category "${newCategoryName}" added successfully!`);

                    // Also update the category dropdown on the Home page if the user navigates there
                    if (expenseCategorySelect) {
                        populateCategoryDropdown(expenseCategorySelect);
                    }
                    if (categoryFilterSelect) { // For reports page filter
                        populateCategoryDropdown(categoryFilterSelect, true);
                    }
                    if (isDashboardPage) { // If dashboard open, re-render chart as categories changed
                        loadDashboardBudgetAndChart();
                    }
                } else {
                    alert('Please enter a category name.');
                }
            });
        }

        if (categoriesList) {
            categoriesList.addEventListener('click', (event) => {
                if (!requireLogin()) return;

                if (event.target.classList.contains('delete-category-btn')) {
                    const categoryToDelete = event.target.dataset.category;
                    if (confirm(`Are you sure you want to delete the category "${categoryToDelete}"? This will not affect existing expenses.`)) {
                        let categories = getAllCategories();
                        categories = categories.filter(cat => cat !== categoryToDelete);
                        saveCategories(categories);
                        loadCategoriesList();
                        alert(`Category "${categoryToDelete}" deleted.`);

                        // Also update category dropdown on Home/Reports/Dashboard pages
                        if (expenseCategorySelect) populateCategoryDropdown(expenseCategorySelect);
                        if (categoryFilterSelect) populateCategoryDropdown(categoryFilterSelect, true); // Pass true for 'All' option
                        if (isDashboardPage) { // If dashboard open, re-render chart as categories changed
                            loadDashboardBudgetAndChart();
                        }
                    }
                }
            });
        }
    }

    // Reports Page (reports.html)
    if (isReportsPage) {
        // Initial setup for reports page
        populateCategoryDropdown(categoryFilterSelect, true); // Populate with 'All Categories' option
        applyReportFilters(); // Initial display of all transactions

        if (reportFiltersForm) { // Listen for changes on filter inputs to re-apply filters dynamically (optional)
            reportFiltersForm.addEventListener('change', (event) => {
                // If you want filters to apply on change, uncomment this and remove explicit applyFiltersBtn listener
                // applyReportFilters();
            });
        }

        if (applyFiltersBtn) { // Listener for explicit apply button
            applyFiltersBtn.addEventListener('click', () => {
                if (!requireLogin()) return;
                applyReportFilters();
            });
        }

        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                if (!requireLogin()) return;
                resetReportFilters();
            });
        }

        if (downloadReportBtn) {
            downloadReportBtn.addEventListener('click', () => {
                if (!requireLogin()) return;

                // Get the currently filtered transactions (re-run the filter logic)
                let expenses = getAllExpenses();
                const startDate = fromDateInput.value ? new Date(fromDateInput.value + 'T00:00:00') : null;
                const endDate = toDateInput.value ? new Date(toDateInput.value + 'T23:59:59') : null;
                const selectedCategory = categoryFilterSelect.value;
                const minAmount = parseFloat(minAmountInput.value);
                const maxAmount = parseFloat(maxAmountInput.value);

                const filteredTransactionsForExport = expenses.filter(expense => {
                    const expenseDate = new Date(expense.date + 'T12:00:00');
                    const matchesDate = (!startDate || expenseDate >= startDate) && (!endDate || expenseDate <= endDate);
                    const matchesCategory = (selectedCategory === 'all' || expense.category === selectedCategory);
                    const matchesAmount = (isNaN(minAmount) || expense.amount >= minAmount) && (isNaN(maxAmount) || expense.amount <= maxAmount);
                    return matchesDate && matchesCategory && matchesAmount;
                });

                downloadCSVReport(filteredTransactionsForExport, "filtered_expense_report.csv");
            });
        }
    }

    // Settings Page (settings.html)
    if (isSettingsPage) {
        loadSavedBudgetInput(); // Load current budget into input field

        if (saveBudgetBtn) {
            saveBudgetBtn.addEventListener('click', (event) => {
                event.preventDefault();
                if (!requireLogin()) return;

                const newBudget = parseFloat(monthlyBudgetInputOnSettings.value);

                if (!isNaN(newBudget) && newBudget >= 0) {
                    localStorage.setItem('monthlyBudget', newBudget.toFixed(2));
                    loadSavedBudgetInput(); // Re-load to show updated value
                    // If dashboard is open, update its budget display as well
                    if (isDashboardPage) { // Check if elements exist
                        loadDashboardBudgetAndChart(); // Updated function call
                    }
                    alert('Monthly budget updated successfully!');
                } else {
                    alert('Please enter a valid non-negative number for the budget.');
                }
            });
        }

        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                if (!requireLogin()) return;
                const allExpenses = getAllExpenses();
                if (allExpenses.length === 0) {
                    alert("No expense data to export.");
                    return;
                }
                downloadCSVReport(allExpenses, "all_expense_data.csv");
                alert("All expense data exported to 'all_expense_data.csv'.");
            });
        }

        if (clearAllDataBtn) {
            clearAllDataBtn.addEventListener('click', () => {
                if (!requireLogin()) return;
                if (confirm('WARNING: Are you absolutely sure you want to clear ALL expense data, categories, and budget? This action cannot be undone.')) {
                    localStorage.clear(); // Clears everything including isLoggedIn, dummy data
                    alert('All data has been cleared from your local storage.');
                    window.location.href = 'login.html'; // Redirect to login page after clearing
                }
            });
        }
    }

    // Global: Logout Functionality (if a logout button exists on any page)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('isLoggedIn'); // Remove only login status
                window.location.href = 'login.html';
                alert('You have been logged out.');
            }
        });
    }

    // --- Common Navigation Active State ---
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const linkHref = link.href.split('/').pop().replace(/(\?.*)?(#.*)?$/, '');
        const currentUrl = window.location.pathname.split('/').pop().replace(/(\?.*)?(#.*)?$/, '');

        if (linkHref === currentUrl || (currentUrl === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
});