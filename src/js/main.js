import axios from "axios";
import _ from "lodash-es";

const BASE_URL = "https://openlibrary.org";
let searchCache = {};
let currentSearchTerm = "";

// UI helpers
function showLoading() {
  document.getElementById("loadingIndicator").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loadingIndicator").classList.add("hidden");
}

function showModal() {
  document.getElementById("bookModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

function hideModal() {
  document.getElementById("bookModal").style.display = "none";
  document.body.style.overflow = "auto";
}

function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";

  const title = _.get(book, "title", "Titolo sconosciuto");
  const authors = _.map(book.authors, "name").join(", ") || "Autore sconosciuto";
  const key = _.get(book, "key", "");

  card.innerHTML = `
    <div class="book-info">
      <h3 class="book-title">${title}</h3>
      <p class="book-author">${authors}</p>
      <button class="book-details-btn" data-key="${key}">Dettagli</button>
    </div>
  `;

  return card;
}

function displayResults(books, category) {
  const resultsContainer = document.getElementById("resultsContainer");
  const resultsCount = document.getElementById("resultsCount");

  resultsContainer.innerHTML = "";

  if (books.length === 0) {
    resultsCount.textContent = `Nessun risultato trovato per "${category}"`;
    return;
  }

  resultsCount.textContent = `${books.length} risultati per la categoria "${category}"`;

  books.forEach((book) => {
    const card = createBookCard(book);
    resultsContainer.appendChild(card);
  });
}

function displayBookDetails(book) {
  const modalContent = document.getElementById("modalContent");

  const title = _.get(book, "title", "Titolo sconosciuto");
  const description = _.get(book, "description.value", _.get(book, "description", "Nessuna descrizione disponibile"));

  modalContent.innerHTML = `
    <div class="book-detail-info">
      <h2 class="book-detail-title">${title}</h2>
      <div class="book-detail-description">
        <h3>Descrizione</h3>
        <p>${description}</p>
      </div>
    </div>
  `;
}

// API calls
async function searchBooksByCategory(category) {
  try {
    const response = await axios.get(`${BASE_URL}/subjects/${category}.json`);
    return _.get(response, "data.works", []);
  } catch (error) {
    console.error("API category search error:", error);
    throw error;
  }
}

async function getBookDetails(bookKey) {
  try {
    const bookResponse = await axios.get(`${BASE_URL}${bookKey}.json`);
    return bookResponse.data;
  } catch (error) {
    console.error("API book details error:", error);
    throw error;
  }
}

// Event handlers
async function handleSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchTerm = _.trim(searchInput.value.toLowerCase());

  if (!searchTerm) return;

  currentSearchTerm = searchTerm;

  if (searchCache[searchTerm]) {
    displayResults(searchCache[searchTerm], searchTerm);
    return;
  }

  try {
    showLoading();
    const results = await searchBooksByCategory(searchTerm);
    searchCache[searchTerm] = results;
    displayResults(results, searchTerm);
  } catch (error) {
    alert("Errore durante la ricerca. Riprova più tardi.");
  } finally {
    hideLoading();
  }
}

async function handleBookDetails(bookKey) {
  try {
    showLoading();
    const bookDetails = await getBookDetails(bookKey);
    displayBookDetails(bookDetails);
    showModal();
  } catch (error) {
    alert("Errore durante il caricamento dei dettagli del libro.");
  } finally {
    hideLoading();
  }
}

// Init
function initializeApp() {
  console.log("📚 App avviata");

  document.getElementById("searchButton").addEventListener("click", handleSearch);

  document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  });

  document.getElementById("resultsContainer").addEventListener("click", (e) => {
    if (e.target.classList.contains("book-details-btn")) {
      const bookKey = e.target.dataset.key;
      if (bookKey) {
        handleBookDetails(bookKey);
      }
    }
  });

  document.querySelector(".close-modal").addEventListener("click", hideModal);

  window.addEventListener("click", (e) => {
    const modal = document.getElementById("bookModal");
    if (e.target === modal) {
      hideModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideModal();
    }
  });
}

document.addEventListener("DOMContentLoaded", initializeApp);
