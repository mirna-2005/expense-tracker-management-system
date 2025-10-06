// script-all-expenses.js

document.addEventListener('DOMContentLoaded', () => {
    const allTransactionsList = document.getElementById('allTransactionsList');
    let expenses = []; // Array to store all expenses

    // Function to load expenses from localStorage
    function loadExpenses() {
        const storedExpenses = localStorage.getItem('expenses');
        if (storedExpenses) {
            expenses = JSON.parse(storedExpenses);
        } else {
            expenses = [];
        }
        renderAllExpenses();
    }

    // Function to save expenses to localStorage (needed if we allow delete here)
    function saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    // Function to render all expenses
    function renderAllExpenses() {
        allTransactionsList.innerHTML = ''; // Clear existing list

        if (expenses.length === 0) {
            const p = document.createElement('p');
            p.className = 'no-transactions-message';
            p.textContent = 'No expenses added yet.';
            allTransactionsList.appendChild(p);
            return;
        }

        // Sort expenses by date in descending order (most recent first)
        const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedExpenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            expenseItem.innerHTML = `
                <span class="expense-date">${expense.date}</span>
                <span class="expense-description">${expense.description}</span>
                <span class="expense-category">(${expense.category})</span>
                <span class="expense-amount">₹ ${parseFloat(expense.amount).toFixed(2)}</span>
                <button class="delete-expense-btn" data-id="${expense.id}">X</button>
            `;
            allTransactionsList.appendChild(expenseItem);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-expense-btn').forEach(button => {
            button.addEventListener('click', deleteExpense);
        });
    }

    // Function to delete an expense (copied from main script)
    function deleteExpense(e) {
        const idToDelete = parseInt(e.target.dataset.id);
        expenses = expenses.filter(expense => expense.id !== idToDelete);
        saveExpenses();
        renderAllExpenses(); // Re-render the list on this page
        // You would also need to update the balance on the index page if an item is deleted from here
        // For simplicity, we'll just handle it here.
    }

    // Initial load when the page loads
    loadExpenses();
});