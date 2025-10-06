document.addEventListener('DOMContentLoaded', () => {
    const budgetSettingsForm = document.getElementById('budgetSettingsForm');
    const monthlyBudgetInput = document.getElementById('monthlyBudget');
    const budgetMessage = document.getElementById('budgetMessage');

    const exportDataBtn = document.getElementById('exportDataBtn');
    const clearAllDataBtn = document.getElementById('clearAllDataBtn');
    const dataMessage = document.getElementById('dataMessage');

    let currentMonthlyBudget = 0;
    let allExpenses = []; // Needed for export
    let allCategories = []; // Needed for export

    // --- Helper Functions (reusing from script.js, ensure they are available or copied) ---

    // Function to load data from Local Storage
    const loadData = () => {
        const storedBudget = localStorage.getItem('monthlyBudget');
        if (storedBudget) {
            currentMonthlyBudget = parseFloat(storedBudget);
            monthlyBudgetInput.value = currentMonthlyBudget;
        }

        const storedExpenses = localStorage.getItem('expenses');
        if (storedExpenses) {
            allExpenses = JSON.parse(storedExpenses);
        }
        const storedCategories = localStorage.getItem('categories');
        if (storedCategories) {
            allCategories = JSON.parse(storedCategories);
        }
    };

    // Function to save budget to Local Storage
    const saveBudget = (budget) => {
        localStorage.setItem('monthlyBudget', budget.toString());
        currentMonthlyBudget = budget;
    };

    const displayMessage = (element, message, isError = false) => {
        if (element) {
            element.textContent = message;
            element.style.color = isError ? 'red' : 'green';
            setTimeout(() => {
                element.textContent = '';
            }, 3000);
        }
    };

    // --- Budget Management ---
    if (budgetSettingsForm) {
        budgetSettingsForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const newBudget = parseFloat(monthlyBudgetInput.value);

            if (isNaN(newBudget) || newBudget < 0) {
                displayMessage(budgetMessage, 'Please enter a valid positive number for your budget.', true);
                return;
            }

            saveBudget(newBudget);
            displayMessage(budgetMessage, `Monthly budget set to ₹ ${newBudget.toLocaleString('en-IN')}`);
            // Potentially update dashboard if it's open
        });
    }

    // --- Data Management ---
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            if (allExpenses.length === 0) {
                displayMessage(dataMessage, 'No data to export!', true);
                return;
            }

            const header = "Date,Description,Category,Amount\n";
            const csvRows = allExpenses.map(expense => {
                // Ensure no commas in description break CSV, by wrapping in quotes
                const description = `"${expense.description.replace(/"/g, '""')}"`;
                return `${expense.date},${description},${expense.category},${expense.amount.toFixed(2)}`;
            });
            const csvString = header + csvRows.join('\n');

            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'expense_tracker_data.csv';
            document.body.appendChild(link); // Required for Firefox
            link.click();
            document.body.removeChild(link); // Clean up
            displayMessage(dataMessage, 'Expense data exported successfully!');
        });
    }

    if (clearAllDataBtn) {
        clearAllDataBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear ALL your expense and category data? This action cannot be undone.')) {
                localStorage.removeItem('expenses');
                localStorage.removeItem('categories');
                localStorage.removeItem('monthlyBudget');
                allExpenses = [];
                allCategories = [];
                currentMonthlyBudget = 0;
                monthlyBudgetInput.value = ''; // Clear input
                displayMessage(dataMessage, 'All data cleared successfully!', false);
                // Redirect or refresh relevant parts of the app
                // For simplicity, a full page reload would show empty state
                // window.location.reload();
            } else {
                displayMessage(dataMessage, 'Data clear cancelled.', false);
            }
        });
    }

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