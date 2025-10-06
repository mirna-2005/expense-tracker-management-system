document.addEventListener('DOMContentLoaded', () => {
    const addCategoryForm = document.getElementById('add-category-form');
    const newCategoryNameInput = document.getElementById('new-category-name');
    const categoryListDisplay = document.getElementById('category-list');
    const categoryMessage = document.getElementById('category-message');

    let categories = []; // Will be loaded from localStorage
    let expenses = []; // Also needed to check for category deletion

    // --- Helper Functions (copied/adapted from script.js) ---
    const loadData = () => {
        const storedCategories = localStorage.getItem('categories');
        if (storedCategories) {
            categories = JSON.parse(storedCategories);
        } else {
            // Initialize with defaults if no categories are stored
            categories = ["Food", "Travel", "Bills", "Shopping", "Entertainment", "Other"];
            saveCategories(); // Save defaults
        }

        const storedExpenses = localStorage.getItem('expenses');
        if (storedExpenses) {
            expenses = JSON.parse(storedExpenses);
        }
        displayCategories();
    };

    const saveCategories = () => {
        localStorage.setItem('categories', JSON.stringify(categories));
        // Also ensure dropdowns on other pages are updated
        // For simplicity, a page refresh or re-call of populateCategoryDropdown is needed
    };

    const displayMessage = (message, isError = false) => {
        categoryMessage.textContent = message;
        categoryMessage.style.color = isError ? 'red' : 'green';
        setTimeout(() => {
            categoryMessage.textContent = '';
        }, 3000);
    };

    // --- Category Display and Management ---
    const displayCategories = () => {
        categoryListDisplay.innerHTML = ''; // Clear existing list

        if (categories.length === 0) {
            categoryListDisplay.innerHTML = '<p style="text-align: center; color: #777;">No categories defined. Add one above!</p>';
            return;
        }

        categories.forEach(category => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${category}</span>
                <button class="delete-category-btn" data-category="${category}">Delete</button>
            `;
            categoryListDisplay.appendChild(listItem);
        });
    };

    // --- Event Listeners ---
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const newCategoryName = newCategoryNameInput.value.trim();

            if (!newCategoryName) {
                displayMessage('Category name cannot be empty.', true);
                return;
            }

            if (categories.some(cat => cat.toLowerCase() === newCategoryName.toLowerCase())) {
                displayMessage('Category already exists.', true);
                return;
            }

            categories.push(newCategoryName);
            saveCategories();
            displayCategories();
            newCategoryNameInput.value = '';
            displayMessage(`Category "${newCategoryName}" added successfully.`);

            // Important: Trigger an update on the Home page's category dropdown if it's open
            // This would typically involve a custom event or reloading relevant parts.
            // For now, a simple full page refresh might be needed or assume user navigates.
        });
    }

    if (categoryListDisplay) {
        categoryListDisplay.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-category-btn')) {
                const categoryToDelete = event.target.dataset.category;

                // Check if any expenses are linked to this category
                const hasLinkedExpenses = expenses.some(exp => exp.category === categoryToDelete);

                if (hasLinkedExpenses) {
                    if (!confirm(`Category "${categoryToDelete}" has existing expenses linked to it. Are you sure you want to delete it? Expenses will remain linked but category will be removed from list.`)) {
                        return; // User cancelled deletion
                    }
                } else {
                     if (!confirm(`Are you sure you want to delete category "${categoryToDelete}"?`)) {
                        return; // User cancelled deletion
                    }
                }


                categories = categories.filter(cat => cat !== categoryToDelete);
                saveCategories();
                displayCategories();
                displayMessage(`Category "${categoryToDelete}" deleted.`);

                // Consider what happens to expenses with this deleted category:
                // 1. Keep them as is (current approach, category name just won't appear in future dropdowns)
                // 2. Assign them to an "Uncategorized" category (more robust)
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