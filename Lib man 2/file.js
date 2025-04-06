// Initialize Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// State management
const state = {
    currentTab: 'books',
    books: {
        filters: {
            title: '',
            author: '',
            genre: '',
            available: ''
        },
        sort: 'title-asc',
        pagination: {
            currentPage: 1,
            itemsPerPage: 5,
            totalItems: 0
        }
    },
    members: {
        // Similar structure to books
    }
};

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('libraryState');
    if (savedState) {
        Object.assign(state, JSON.parse(savedState));
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('libraryState', JSON.stringify(state));
}

// DOM Elements
const elements = {
    // Book elements
    booksSection: document.getElementById('books-section'),
    booksTable: document.getElementById('books-table'),
    addBookBtn: document.getElementById('add-book'),
    bookTitleFilter: document.getElementById('book-title-filter'),
    bookAuthorFilter: document.getElementById('book-author-filter'),
    bookGenreFilter: document.getElementById('book-genre-filter'),
    bookAvailabilityFilter: document.getElementById('book-availability-filter'),
    bookSort: document.getElementById('book-sort'),
    bookItemsPerPage: document.getElementById('book-items-per-page'),
    bookPrevPage: document.getElementById('book-prev-page'),
    bookNextPage: document.getElementById('book-next-page'),
    bookPageInfo: document.getElementById('book-page-info'),
    
    // Member elements (similar to books)
    // ...
};

// Event Listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-section`).classList.add('active');
            state.currentTab = tab.dataset.tab;
            saveState();
        });
    });
    
    // Book filter/sort/pagination events
    elements.bookTitleFilter.addEventListener('input', () => {
        state.books.filters.title = elements.bookTitleFilter.value;
        state.books.pagination.currentPage = 1;
        saveState();
        fetchBooks();
    });
    
    // Similar for other filters, sort, pagination...
    
    // Add book button
    elements.addBookBtn.addEventListener('click', showBookForm);
}

// Fetch books from Firebase
function fetchBooks() {
    const booksRef = database.ref('books');
    booksRef.on('value', (snapshot) => {
        const booksData = snapshot.val();
        state.books.totalItems = booksData ? Object.keys(booksData).length : 0;
        const filteredBooks = applyFiltersAndSort(booksData);
        renderBooks(filteredBooks);
        updatePaginationInfo();
    });
}

// Apply filters and sorting
function applyFiltersAndSort(data) {
    if (!data) return [];
    
    let items = Object.values(data);
    
    // Apply filters
    items = items.filter(book => {
        return (
            book.title.toLowerCase().includes(state.books.filters.title.toLowerCase()) &&
            book.author.toLowerCase().includes(state.books.filters.author.toLowerCase()) &&
            (state.books.filters.genre === '' || book.genre === state.books.filters.genre) &&
            (state.books.filters.available === '' || book.available.toString() === state.books.filters.available)
        );
    });
    
    // Apply sorting
    const [sortField, sortDirection] = state.books.sort.split('-');
    items.sort((a, b) => {
        if (sortField === 'year') {
            return sortDirection === 'asc' ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
        } else {
            return sortDirection === 'asc' 
                ? a[sortField].localeCompare(b[sortField]) 
                : b[sortField].localeCompare(a[sortField]);
        }
    });
    
    // Apply pagination
    const startIndex = (state.books.pagination.currentPage - 1) * state.books.pagination.itemsPerPage;
    return items.slice(startIndex, startIndex + state.books.pagination.itemsPerPage);
}

// Render books to the table
function renderBooks(books) {
    const tbody = elements.booksTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td>${book.publishedYear}</td>
            <td>${book.available ? 'Yes' : 'No'}</td>
            <td>
                <button class="edit-btn" data-id="${book.id}">Edit</button>
                <button class="delete-btn" data-id="${book.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => showBookForm(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteBook(btn.dataset.id));
    });
}

// Book CRUD operations
function addBook(bookData) {
    const newBookRef = database.ref('books').push();
    newBookRef.set({
        id: newBookRef.key,
        ...bookData
    });
}

function updateBook(id, bookData) {
    database.ref(`books/${id}`).update(bookData);
}

function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        database.ref(`books/${id}`).remove();
    }
}

// Show book form (add/edit)
function showBookForm(bookId = null) {
    // Implementation for showing modal form
    // Pre-fill form if editing
    // Handle form submission
}

// Similar functions for members...

// Initialize the app
function init() {
    loadState();
    setupEventListeners();
    fetchBooks();
    // fetchMembers();
}

// Start the application
document.addEventListener('DOMContentLoaded', init);