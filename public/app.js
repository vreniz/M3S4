// ════════════════════════════════════════════════════
// MyLibrary — app.js
// Historia de usuario Módulo 3
//
// TASK 1 : Archivo principal de lógica
// TASK 2 : Captura e interacción con el usuario
// TASK 3 : Manipulación dinámica del DOM
// TASK 4 : Persistencia en LocalStorage
// TASK 5 : Fetch API — operaciones CRUD
// TASK 6 : Validaciones y pruebas
// ════════════════════════════════════════════════════


// ──────────────────────────────────────────────────
// TASK 1 — CONFIGURACIÓN Y CONSTANTES
// ──────────────────────────────────────────────────

const BASE_URL = "http://localhost:3000";   // JSON Server
const LS_KEY   = "myLibrary";              // clave de LocalStorage


// ──────────────────────────────────────────────────
// TASK 1 — REFERENCIAS AL DOM
// getElementById busca el elemento por su id en el HTML.
// Se capturan al inicio para no repetir la búsqueda.
// ──────────────────────────────────────────────────

const bookList      = document.getElementById("book-list");
const alertZone     = document.getElementById("alert-zone");
const counterLabel  = document.getElementById("counter-label");

// Panel de log de API
const logEl         = document.getElementById("log");
const logBadge      = document.getElementById("log-badge");

// Panel de LocalStorage
const lsCount       = document.getElementById("ls-count");

// Historial
const historyList   = document.getElementById("history-list");

// Status de API
const apiStatusEl   = document.getElementById("api-status");

// Stats
const statTotal     = document.getElementById("stat-total");
const statPages     = document.getElementById("stat-pages");
const statGenres    = document.getElementById("stat-genres");

// Filtros
const genreFilter   = document.getElementById("genre-filter");
const searchInput   = document.getElementById("search-input");

// Inputs POST (modal agregar)
const postTitle     = document.getElementById("post-title");
const postAuthor    = document.getElementById("post-author");
const postYear      = document.getElementById("post-year");
const postPages     = document.getElementById("post-pages");
const postGenre     = document.getElementById("post-genre");
const postCover     = document.getElementById("post-cover");

// Inputs PUT (modal editar)
const putId         = document.getElementById("put-id");
const putTitle      = document.getElementById("put-title");
const putAuthor     = document.getElementById("put-author");
const putYear       = document.getElementById("put-year");
const putPages      = document.getElementById("put-pages");
const putGenre      = document.getElementById("put-genre");
const putCover      = document.getElementById("put-cover");

// Input DELETE
const delId         = document.getElementById("del-id");

// Referencias a los modales de Bootstrap
// bootstrap.Modal es el objeto JS que controla los modales
const modalAddEl    = document.getElementById("modalAdd");
const modalEditEl   = document.getElementById("modalEdit");
const modalDelEl    = document.getElementById("modalDelete");
const modalDetailEl = document.getElementById("modalDetail");

// Instancias de los modales (para poder cerrarlos desde JS)
const modalAdd      = bootstrap.Modal.getOrCreateInstance(modalAddEl);
const modalEdit     = bootstrap.Modal.getOrCreateInstance(modalEditEl);
const modalDel      = bootstrap.Modal.getOrCreateInstance(modalDelEl);
const modalDetail   = bootstrap.Modal.getOrCreateInstance(modalDetailEl);


// ──────────────────────────────────────────────────
// TASK 4 — ESTADO GLOBAL (arreglo en memoria + LS)
//
// books es el arreglo global que almacena los datos.
// Se sincroniza con localStorage en cada operación.
// JSON.parse convierte el string guardado → array JS.
// ──────────────────────────────────────────────────

let books = JSON.parse(localStorage.getItem(LS_KEY)) || [];


// ──────────────────────────────────────────────────
// TASK 1 — MAPA DE COLORES POR GÉNERO
// Map (estructura ES6) asigna clases de Bootstrap
// a cada género para los badges de las cards.
// ──────────────────────────────────────────────────

const genreColors = new Map([
  ["Fiction",     "primary"],
  ["Non-fiction", "secondary"],
  ["Fantasy",     "success"],
  ["Sci-fi",      "info"],
  ["Horror",      "danger"],
  ["Romance",     "pink"],
  ["Mystery",     "dark"],
  ["History",     "warning"],
  ["Biography",   "purple"],
]);

/**
 * Returns the Bootstrap color class for a given genre.
 * Falls back to 'secondary' if the genre is not in the Map.
 * @param {string} genre
 * @returns {string} Bootstrap color class
 */
function getGenreColor(genre) {
  return genreColors.get(genre) || "secondary";
}

/** Gradients for the cover placeholder, mapped by genre */
const genreGradients = new Map([
  ["Fiction",     "linear-gradient(135deg,#667eea,#764ba2)"],
  ["Non-fiction", "linear-gradient(135deg,#434343,#000)"],
  ["Fantasy",     "linear-gradient(135deg,#11998e,#38ef7d)"],
  ["Sci-fi",      "linear-gradient(135deg,#0093E9,#80D0C7)"],
  ["Horror",      "linear-gradient(135deg,#8B0000,#ff4757)"],
  ["Romance",     "linear-gradient(135deg,#f953c6,#b91d73)"],
  ["Mystery",     "linear-gradient(135deg,#2c3e50,#3498db)"],
  ["History",     "linear-gradient(135deg,#b8860b,#DAA520)"],
  ["Biography",   "linear-gradient(135deg,#1a1a2e,#16213e)"],
]);


// ════════════════════════════════════════════════════
// TASK 4 — FUNCIONES DE LOCAL STORAGE
// ════════════════════════════════════════════════════

/**
 * Saves the global `books` array to LocalStorage.
 * JSON.stringify convierte el array → string para poder guardarlo.
 * Also updates the visible counter in the LS panel.
 */
function saveToLS() {
  localStorage.setItem(LS_KEY, JSON.stringify(books));
  lsCount.textContent = books.length;
}

/**
 * Replaces the local array with fresh data from the server
 * and persists it in LocalStorage.
 * @param {Array} newBooks - array received from the server
 */
function syncLS(newBooks) {
  books = newBooks;
  saveToLS();
}


// ════════════════════════════════════════════════════
// TASK 2 — MENSAJES DINÁMICOS EN EL DOM
// ════════════════════════════════════════════════════

/**
 * Displays a Bootstrap alert message in the DOM.
 * Used for success, error and warning feedback (TASK 2).
 *
 * @param {string} message   - message text
 * @param {string} type      - 'success' | 'danger' | 'warning' | 'info'
 * @param {string} container - id of the div where the alert is shown
 */
function showAlert(message, type = "info", container = "alert-zone") {
  const zone = document.getElementById(container);
  if (!zone) return;

  // Lookup object reemplaza las ternarias anidadas — O(1), sin ramificaciones
  const icons = {
    success: "check-circle",
    danger:  "x-circle",
    warning: "exclamation-triangle",
    info:    "info-circle",
  };
  const icon = icons[type] ?? "info-circle";

  zone.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show d-flex align-items-center gap-2 py-2 small" role="alert">
      <i class="bi bi-${icon}"></i>
      <span>${message}</span>
      <button type="button" class="ms-auto btn btn-sm btn-link text-decoration-none text-muted p-0 lh-1" data-bs-dismiss="alert" style="font-size:1rem">✕</button>
    </div>`;

  // La alerta desaparece automáticamente después de 4s
  setTimeout(() => {
    const alertEl = zone.querySelector(".alert");
    if (alertEl) alertEl.remove();
  }, 4000);
}

/**
 * Updates the log panel with the JSON response from the server.
 * Changes the text color according to the response type.
 *
 * @param {*}      data   - object to display
 * @param {string} type   - 'success' | 'error' | 'warning' | ''
 * @param {string} method - HTTP method executed
 */
function showLog(data, type = "", method = "") {
  // JSON.stringify formatea el objeto con 2 espacios de sangría
  logEl.textContent = JSON.stringify(data, null, 2);
  logEl.className   = `log-pre p-3 mb-0 ${type}`;

  // Colores y texto del badge por método HTTP
  const configs = {
    GET:    { bg: "bg-primary", label: "GET 200"    },
    POST:   { bg: "bg-success", label: "POST 201"   },
    PUT:    { bg: "bg-warning", label: "PUT 200"    },
    DELETE: { bg: "bg-danger",  label: "DELETE 200" },
    ERROR:  { bg: "bg-danger",  label: "Error"      },
  };
  const cfg = configs[method] || { bg: "bg-secondary", label: method };
  logBadge.className   = `badge rounded-pill ${cfg.bg}`;
  logBadge.textContent = cfg.label;

  // También lo muestra en consola (TASK 2 y TASK 6)
  console.log(`[${method}]`, data);
}

/**
 * Updates the API connection indicator in the navbar.
 * @param {boolean} connected
 */
function updateAPIStatus(connected) {
  const dot = apiStatusEl.querySelector(".status-dot");
  const txt = apiStatusEl.querySelector(".status-text");
  if (connected) {
    dot.className  = "status-dot bg-success";
    txt.className  = "status-text text-success small";
    txt.textContent = "API connected";
  } else {
    dot.className  = "status-dot bg-danger";
    txt.className  = "status-text text-danger small";
    txt.textContent = "No server";
  }
}

/**
 * Adds an entry to the session history panel (TASK 3 — appendChild).
 * @param {string} method  - 'GET' | 'POST' | 'PUT' | 'DEL'
 * @param {string} message - short description of the operation
 */
function addToHistory(method, message) {
  // Elimina el mensaje "No activity yet" si existe
  const empty = historyList.querySelector(".text-center");
  if (empty) empty.closest("li").remove();

  const time = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit"
  });

  const colorMap = { GET: "primary", POST: "success", PUT: "warning", DEL: "danger" };
  const color    = colorMap[method] || "secondary";

  // TASK 3: createElement + appendChild para agregar el <li> al DOM
  const li = document.createElement("li");
  li.className = "list-group-item py-2 px-3 historial-item";
  li.innerHTML = `
    <div class="d-flex align-items-center gap-2">
      <span class="badge bg-${color}-subtle text-${color} historial-method">${method}</span>
      <span class="small text-truncate flex-grow-1">${message}</span>
      <span class="small text-muted flex-shrink-0">${time}</span>
    </div>`;

  // insertBefore coloca el nuevo <li> arriba de todos los anteriores
  historyList.insertBefore(li, historyList.firstChild);
}

/**
 * Updates the three stat counters in the hero bar.
 * Uses Set (ES6) to count unique genres.
 * @param {Array} data - books array
 */
function updateStats(data) {
  // Set solo almacena valores únicos → conteo de géneros en O(n)
  const uniqueGenres = new Set(data.map(b => b.genre).filter(Boolean));
  const totalPages   = data.reduce((acc, b) => acc + (Number(b.pages) || 0), 0);

  statTotal.textContent  = data.length;
  statPages.textContent  = totalPages.toLocaleString("en-US");
  statGenres.textContent = uniqueGenres.size;
  counterLabel.textContent = `${data.length} book${data.length !== 1 ? "s" : ""}`;
  lsCount.textContent    = books.length;
}


// ════════════════════════════════════════════════════
// TASK 3 — RENDER Y MANIPULACIÓN DEL DOM
// ════════════════════════════════════════════════════

/**
 * Renders the books array as cards in the DOM list.
 * Uses createElement and appendChild (TASK 3).
 *
 * @param {Array}   data   - books to render
 * @param {boolean} fromLS - true if data comes from localStorage (shows Cache badge)
 */
// ── Funciones auxiliares puras — cada una hace una sola cosa ──

/**
 * Builds the empty-state <li> element when the collection has no books.
 * @returns {HTMLElement}
 */
function buildEmptyState() {
  const li = document.createElement("li");
  li.className = "col-12";
  li.innerHTML = `
    <div class="text-center py-5 text-muted">
      <i class="bi bi-book display-4 d-block mb-3 opacity-25"></i>
      <p class="mb-2 fw-semibold">Your collection is empty</p>
      <p class="small">Press <strong>Load collection</strong> or add a new book.</p>
    </div>`;
  return li;
}

/**
 * Builds the cover HTML block for a book card.
 * Uses <img> when a cover URL exists; falls back to a gradient placeholder.
 * @param {Object} book
 * @param {string} gradient
 * @returns {string} HTML string
 */
function buildCoverHTML(book, gradient) {
  if (!book.cover) {
    return `
      <div class="book-cover-placeholder" style="background:${gradient}">
        <i class="bi bi-book fs-2 opacity-75"></i>
        <span class="text-truncate-2">${book.title}</span>
      </div>`;
  }
  return `
    <img src="${book.cover}" alt="Cover of ${book.title}"
         class="book-cover"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
    <div class="book-cover-placeholder" style="display:none;background:${gradient}">
      <i class="bi bi-book fs-2 opacity-75"></i>
      <span>${book.title}</span>
    </div>`;
}

/**
 * Builds the metadata badges row (genre, year, pages).
 * @param {Object} book
 * @param {string} color - Bootstrap color class
 * @returns {string} HTML string
 */
function buildBadges(book, color) {
  const genre = book.genre
    ? `<span class="badge bg-${color}-subtle text-${color} genre-badge">${book.genre}</span>`
    : "";
  const year  = book.year
    ? `<span class="badge bg-light text-muted genre-badge border">${book.year}</span>`
    : "";
  const pages = book.pages
    ? `<span class="badge bg-light text-muted genre-badge border">${Number(book.pages).toLocaleString()} p.</span>`
    : "";
  return genre + year + pages;
}

/**
 * Builds a single book <li> card element.
 * @param {Object}  book
 * @param {number}  index  - position in the array (used for animation delay)
 * @param {boolean} fromLS - whether data comes from localStorage
 * @returns {HTMLElement}
 */
function buildBookCard(book, index, fromLS) {
  const color      = getGenreColor(book.genre);
  const gradient   = genreGradients.get(book.genre) || "linear-gradient(135deg,#667eea,#764ba2)";
  const cacheBadge = fromLS
    ? '<span class="badge bg-warning-subtle text-warning" style="font-size:0.6rem">Cache</span>'
    : "";

  const li = document.createElement("li");
  li.className = "col-sm-6 col-md-4 col-xl-3";
  li.style.animationDelay = `${index * 40}ms`;

  li.innerHTML = `
    <div class="card book-card h-100 shadow-sm border-0 overflow-hidden">

      <div class="cursor-pointer" data-id="${book.id}" data-action="detail">
        ${buildCoverHTML(book, gradient)}
      </div>

      <div class="card-body p-3 d-flex flex-column gap-1">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <span class="text-muted font-monospace" style="font-size:0.65rem">#${book.id}</span>
          ${cacheBadge}
        </div>
        <h6 class="card-title fw-bold mb-0 text-truncate-2" style="font-size:0.9rem"
            title="${book.title}">${book.title}</h6>
        <p class="card-text text-muted mb-0" style="font-size:0.78rem">${book.author}</p>
        <div class="d-flex flex-wrap gap-1 mt-auto pt-2">
          ${buildBadges(book, color)}
        </div>
      </div>

      <div class="card-footer bg-white border-top-0 p-2 d-flex gap-1">
        <button class="btn btn-sm btn-outline-warning flex-fill"
                data-id="${book.id}" data-action="edit" title="Edit this book">
          <i class="bi bi-pencil me-1"></i>Edit
        </button>
        <button class="btn btn-sm btn-outline-danger flex-fill"
                data-id="${book.id}" data-action="delete" title="Delete this book">
          <i class="bi bi-trash"></i>
        </button>
      </div>

    </div>`;

  return li;
}

// ── Función principal — complejidad reducida a 2 ──

/**
 * Renders the books array as cards in the DOM list.
 * Delegates all card-building logic to helper functions (TASK 3).
 *
 * @param {Array}   data   - books to render
 * @param {boolean} fromLS - true if data comes from localStorage
 */
function renderBooks(data, fromLS = false) {
  // Limpia el contenido actual de la lista
  bookList.innerHTML = "";

  if (data.length === 0) {
    bookList.appendChild(buildEmptyState());
    counterLabel.textContent = "0 books";
    return;
  }

  updateStats(data);

  // TASK 3: createElement + appendChild — cada libro es un <li> independiente
  data.forEach((book, i) => bookList.appendChild(buildBookCard(book, i, fromLS)));
}
/**
 * Filters books by genre and/or search term and re-renders.
 * No fetch is made — filters the local array only.
 */
// ── Funciones predicado puras — cada una evalúa una sola condición ──

/**
 * Returns true if the book matches the selected genre,
 * or if no genre filter is active.
 * @param {Object} book
 * @param {string} selectedGenre
 * @returns {boolean}
 */
function matchesGenre(book, selectedGenre) {
  return !selectedGenre || book.genre === selectedGenre;
}

/**
 * Returns true if the book title or author includes the search term,
 * or if no search term is active.
 * @param {Object} book
 * @param {string} term - already lowercased
 * @returns {boolean}
 */
function matchesSearch(book, term) {
  return !term
    || book.title.toLowerCase().includes(term)
    || book.author.toLowerCase().includes(term);
}

/**
 * Updates the counter label when results are fewer than the full collection.
 * @param {number} filteredCount
 * @param {number} totalCount
 */
function updateCounterLabel(filteredCount, totalCount) {
  counterLabel.textContent = filteredCount < totalCount
    ? `Showing ${filteredCount} of ${totalCount} books`
    : `${filteredCount} book${filteredCount !== 1 ? "s" : ""}`;
}

// ── Función principal — complejidad reducida a 1 ──

/**
 * Filters the local books array by genre and search term, then re-renders.
 * No fetch is made — operates on the in-memory array only.
 */
function applyFilters() {
  const selectedGenre = genreFilter.value;
  const term          = searchInput.value.trim().toLowerCase();

  const filtered = books.filter(b => matchesGenre(b, selectedGenre) && matchesSearch(b, term));

  renderBooks(filtered);
  updateCounterLabel(filtered.length, books.length);
}

/**
 * Shows the detail of a book in the detail modal.
 * @param {number} id - book ID to display
 */
// ── Funciones auxiliares puras ──

/**
 * Builds the cover HTML for the detail modal.
 * Uses <img> when a cover URL exists; falls back to a gradient placeholder.
 * @param {Object} book
 * @param {string} gradient
 * @returns {string} HTML string
 */
function buildDetailCover(book, gradient) {
  if (!book.cover) {
    return `
      <div class="rounded mb-3 d-flex align-items-center justify-content-center"
           style="height:160px;background:${gradient}">
        <i class="bi bi-book text-white opacity-75" style="font-size:3rem"></i>
      </div>`;
  }
  return `
    <img src="${book.cover}" alt="Cover"
         class="img-fluid rounded shadow-sm mb-3"
         style="max-height:250px;object-fit:cover;width:100%"
         onerror="this.outerHTML='<div class=\\'detalle-placeholder rounded mb-3\\'></div>'"/>`;
}

/**
 * Builds the three stat boxes (year, pages, id) for the detail modal.
 * Centralizes the fallback logic for missing values.
 * @param {Object} book
 * @returns {string} HTML string
 */
function buildDetailStats(book) {
  const year  = book.year  || "—";
  const pages = book.pages ? Number(book.pages).toLocaleString() : "—";

  return `
    <div class="row g-2 text-center">
      <div class="col-4">
        <div class="bg-light rounded p-2">
          <div class="fw-bold">${year}</div>
          <div class="small text-muted">Year</div>
        </div>
      </div>
      <div class="col-4">
        <div class="bg-light rounded p-2">
          <div class="fw-bold">${pages}</div>
          <div class="small text-muted">Pages</div>
        </div>
      </div>
      <div class="col-4">
        <div class="bg-light rounded p-2">
          <div class="fw-bold">#${book.id}</div>
          <div class="small text-muted">ID</div>
        </div>
      </div>
    </div>`;
}

/**
 * Builds the full detail modal inner HTML for a given book.
 * @param {Object} book
 * @returns {string} HTML string
 */
function buildDetailHTML(book) {
  const gradient = genreGradients.get(book.genre) || "linear-gradient(135deg,#667eea,#764ba2)";
  const color    = getGenreColor(book.genre);
  const genre    = book.genre || "No genre";

  return `
    ${buildDetailCover(book, gradient)}
    <span class="badge bg-${color}-subtle text-${color} mb-2">${genre}</span>
    <h4 class="fw-bold mb-1">${book.title}</h4>
    <p class="text-muted mb-3">${book.author}</p>
    ${buildDetailStats(book)}
    <div class="d-flex gap-2 mt-3">
      <button class="btn btn-warning btn-sm flex-fill" onclick="prepareEdit(${book.id})">
        <i class="bi bi-pencil me-1"></i>Edit
      </button>
      <button class="btn btn-danger btn-sm" onclick="confirmDelete(${book.id})">
        <i class="bi bi-trash"></i>
      </button>
    </div>`;
}

// ── Función principal — complejidad reducida a 2 ──

/**
 * Finds a book by id, renders its detail HTML and opens the detail modal.
 * @param {number} id
 */
function showDetail(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  document.getElementById("detail-content").innerHTML = buildDetailHTML(book);
  modalDetail.show();
}
/**
 * Fills the PUT form with a book's data and opens the edit modal.
 * @param {number} id
 */
/**
 * Extracts editable fields from a book object with safe fallbacks.
 * Centralizes all the || "" defaults in one place.
 * @param {Object} book
 * @returns {Object} flat object ready to populate form inputs
 */
function getEditableFields(book) {
  return {
    id:     book.id,
    title:  book.title,
    author: book.author,
    year:   book.year   || "",
    pages:  book.pages  || "",
    genre:  book.genre  || "",
    cover:  book.cover  || "",
  };
}

/**
 * Populates the PUT form inputs with the given fields.
 * @param {Object} fields - output of getEditableFields()
 */
function populateEditForm(fields) {
  putId.value     = fields.id;
  putTitle.value  = fields.title;
  putAuthor.value = fields.author;
  putYear.value   = fields.year;
  putPages.value  = fields.pages;
  putGenre.value  = fields.genre;
  putCover.value  = fields.cover;
}



/**
 * Finds a book by id, fills the edit form and opens the edit modal.
 * @param {number} id
 */
function prepareEdit(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  populateEditForm(getEditableFields(book));
  modalDetail.hide();
  setTimeout(() => modalEdit.show(), 300);
}

/**
 * Pre-fills the DELETE input with the given ID and opens the modal.
 * @param {number} id
 */
function confirmDelete(id) {
  delId.value = id;
  modalDetail.hide();
  setTimeout(() => modalDel.show(), 300);
}

// Expone las funciones al scope global para poder llamarlas desde onclick HTML
window.prepareEdit   = prepareEdit;
window.confirmDelete = confirmDelete;


// ════════════════════════════════════════════════════
// TASK 6 — VALIDACIONES DE ENTRADA
// ════════════════════════════════════════════════════

/** @returns {boolean} true if the string is not empty after trim() */
function isNotEmpty(value) {
  return typeof value === "string" && value.trim() !== "";
}

/** @returns {boolean} true if the number is finite and greater than 0 */
function isPositive(value) {
  return Number.isFinite(value) && value > 0;
}

/** @returns {boolean} true if the URL is valid or empty (optional field) */
/**
 * Returns true if the URL is valid or empty (optional field).
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  return !url || URL.canParse(url);
}

/**
 * Adds Bootstrap's error class to an invalid input.
 * @param {HTMLElement} el
 */
function markError(el) {
  el.classList.add("is-invalid");
  el.addEventListener("input", () => el.classList.remove("is-invalid"), { once: true });
}


// ════════════════════════════════════════════════════
// TASK 5 — FETCH API — OPERACIONES CRUD
// Cada función usa async/await y try/catch (TASK 5).
// ════════════════════════════════════════════════════

// ── GET ──────────────────────────────────────────────
/**
 * Fetches all books from the server.
 * Falls back to localStorage cache if the server is unreachable.
 */
async function get() {
  try {
    // fetch devuelve una Promesa que se resuelve con la respuesta HTTP
    const res = await fetch(`${BASE_URL}/books`);

    // Si el servidor responde con código de error (4xx, 5xx), lanzamos Error
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    // res.json() convierte el cuerpo de la respuesta (string JSON) → objeto JS
    const data = await res.json();

    syncLS(data);                 // TASK 4: actualiza localStorage
    renderBooks(data);            // TASK 3: actualiza el DOM
    showLog(data, "", "GET");
    updateAPIStatus(true);
    addToHistory("GET", `${data.length} book(s) loaded`);
    showAlert(`${data.length} books loaded successfully.`, "success");

  } catch (err) {
    // El servidor no responde → usamos localStorage como respaldo (TASK 4)
    updateAPIStatus(false);
    showLog({ error: err.message }, "error", "ERROR");
    console.error("[GET Error]", err);

    if (books.length > 0) {
      renderBooks(books, true); // fromLS = true → muestra badge "Cache"
      showAlert(
        `Server unavailable. Showing ${books.length} book(s) from local cache.`,
        "warning"
      );
    } else {
      showAlert(`Connection error: ${err.message}`, "danger");
    }
  }
}

// ── POST ─────────────────────────────────────────────
/**
 * Creates a new book on the server.
 * The server (JSON Server) assigns the id automatically.
 * @param {Object} newBook - book data without id
 */
async function post(newBook) {
  try {
    const res = await fetch(`${BASE_URL}/books`, {
      method: "POST",
      // headers indica al servidor el formato del body que enviamos
      headers: { "Content-Type": "application/json" },
      // JSON.stringify convierte el objeto JS → string JSON para enviarlo
      body: JSON.stringify(newBook)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    // El servidor devuelve el libro creado incluyendo el id asignado
    const data = await res.json();

    // Agrega al arreglo global y persiste en localStorage (TASK 4)
    books.push(data);
    saveToLS();
    updateStats(books);

    showLog(data, "success", "POST");
    addToHistory("POST", `"${data.title}" created (#${data.id})`);
    showAlert(`✅ "${data.title}" added to your collection.`, "success");
    modalAdd.hide();
    clearForm("modalAdd");
    renderBooks(books);

  } catch (err) {
    showLog({ error: err.message }, "error", "ERROR");
    showAlert(`Error adding book: ${err.message}`, "danger", "alert-modal-post");
    console.error("[POST Error]", err);
  }
}

// ── PUT ──────────────────────────────────────────────
/**
 * Fully replaces a book by its id on the server.
 * PUT sends the complete object (unlike PATCH which is partial).
 * @param {number} id          - book id (goes in the URL)
 * @param {Object} updatedData - complete object with new data
 */
async function put(id, updatedData) {
  try {
    // El id va en la URL; los datos nuevos van en el body
    const res = await fetch(`${BASE_URL}/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const data = await res.json();

    // findIndex busca la posición del libro en el arreglo por su id
    // Devuelve -1 si no lo encuentra
    const idx = books.findIndex(b => b.id === id);
    if (idx !== -1) {
      books[idx] = data; // reemplaza el objeto en el arreglo (TASK 4)
      saveToLS();
    }

    showLog(data, "", "PUT");
    addToHistory("PUT", `#${id} → "${data.title}"`);
    showAlert(`✏️ Book #${id} updated successfully.`, "success");
    modalEdit.hide();
    clearForm("modalEdit");
    renderBooks(books);

  } catch (err) {
    showLog({ error: err.message }, "error", "ERROR");
    showAlert(`Error updating: ${err.message}`, "danger", "alert-modal-put");
    console.error("[PUT Error]", err);
  }
}

// ── DELETE ───────────────────────────────────────────
/**
 * Deletes a book from the server by its id.
 * No body or Content-Type needed — only the method and id in the URL.
 * @param {number} id - book id to delete
 */
/**
 * Sends the DELETE request to the server.
 * Throws if the response status is not ok.
 * @param {number} id
 * @returns {Promise<void>}
 */
async function fetchDeleteBook(id) {
  const res = await fetch(`${BASE_URL}/books/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
}

/**
 * Removes the book card from the DOM using removeChild (TASK 3).
 * Falls back to a full re-render if the card element is not found.
 * @param {number} id
 */
function removeBookFromDOM(id) {
  const cardEl = bookList.querySelector(`[data-id="${id}"][data-action="delete"]`);
  const li     = cardEl?.closest("li");

  if (li?.parentNode) {
    // removeChild elimina el hijo de su padre en el DOM (TASK 3)
    li.parentNode.removeChild(li);
  }

  if (books.length === 0) renderBooks([]);
}

/**
 * Updates state and UI after a successful DELETE.
 * @param {number} id
 */
function handleDeleteSuccess(id) {
  // filter() crea un nuevo arreglo sin el libro eliminado (no muta el original)
  books = books.filter(b => b.id !== id);
  saveToLS();
  updateStats(books);

  showLog({ message: `Book #${id} deleted ✓` }, "error", "DELETE");
  addToHistory("DEL", `Book #${id} deleted`);
  showAlert(`🗑️ Book #${id} removed from the collection.`, "danger");
  modalDel.hide();
  clearForm("modalDelete");
  removeBookFromDOM(id);
}

/**
 * Handles a failed DELETE request.
 * @param {Error} err
 */
function handleDeleteError(err) {
  showLog({ error: err.message }, "error", "ERROR");
  showAlert(`Error deleting: ${err.message}`, "danger", "alert-modal-del");
  console.error("[DELETE Error]", err);
}


/**
 * Deletes a book from the server by its id,
 * then removes it from the DOM and localStorage.
 * @param {number} id
 */
async function del(id) {
  await fetchDeleteBook(id)
    .then(() => handleDeleteSuccess(id))
    .catch(handleDeleteError);
}


// ════════════════════════════════════════════════════
// UTILIDADES
// ════════════════════════════════════════════════════

/**
 * Clears all inputs and selects inside a given container.
 * @param {string} containerId - id of the modal or section
 */
function clearForm(containerId) {
  document.getElementById(containerId)
    .querySelectorAll("input, select, textarea")
    .forEach(el => { el.value = ""; el.classList.remove("is-invalid"); });

  // Limpia también las alertas internas del modal
  document.querySelectorAll(`#${containerId} [id^="alert-modal"]`)
    .forEach(el => { el.innerHTML = ""; });
}


// ════════════════════════════════════════════════════
// EVENT LISTENERS
// Conectan los botones del HTML con las funciones de fetch.
// Cada listener: lee inputs → valida → construye objeto → llama fetch.
// ════════════════════════════════════════════════════

// ── GET ──
document.getElementById("btn-get").addEventListener("click", get);

// ── POST ──
/**
 * Reads and normalizes all POST form input values.
 * @returns {Object} raw form values
 */
function readPostForm() {
  return {
    title:  postTitle.value.trim(),
    author: postAuthor.value.trim(),
    year:   Number(postYear.value),
    pages:  Number(postPages.value),
    genre:  postGenre.value,
    cover:  postCover.value.trim(),
  };
}

/**
 * Validates all POST form fields.
 * Marks invalid inputs and returns whether the form is valid.
 * @param {Object} fields - output of readPostForm()
 * @returns {boolean}
 */
function validatePostForm(fields) {
  const rules = [
    { valid: isNotEmpty(fields.title),                    el: postTitle  },
    { valid: isNotEmpty(fields.author),                   el: postAuthor },
    { valid: isPositive(fields.year) && fields.year <= 2099, el: postYear },
    { valid: isPositive(fields.pages),                    el: postPages  },
    { valid: isNotEmpty(fields.genre),                    el: postGenre  },
    { valid: isValidUrl(fields.cover),                    el: postCover  },
  ];

  // Marca todos los campos inválidos de una sola pasada
  const invalids = rules.filter(r => !r.valid);
  invalids.forEach(r => markError(r.el));
  return invalids.length === 0;
}

/**
 * Builds the new book object from validated form fields.
 * Only includes cover if a URL was provided.
 * @param {Object} fields - output of readPostForm()
 * @returns {Object} book object ready to POST
 */
function buildNewBook(fields) {
  const book = {
    title:  fields.title,
    author: fields.author,
    year:   fields.year,
    pages:  fields.pages,
    genre:  fields.genre,
  };
  if (fields.cover) book.cover = fields.cover;
  return book;
}


document.getElementById("btn-post").addEventListener("click", () => {
  const fields = readPostForm();

  if (!validatePostForm(fields)) {
    showAlert("Please review the fields marked in red.", "danger", "alert-modal-post");
    return;
  }

  post(buildNewBook(fields));
});

// ── PUT ──
/**
 * Reads and normalizes all PUT form input values.
 * @returns {Object} raw form values including id
 */
function readPutForm() {
  return {
    id:     Number(putId.value),
    title:  putTitle.value.trim(),
    author: putAuthor.value.trim(),
    year:   Number(putYear.value),
    pages:  Number(putPages.value),
    genre:  putGenre.value,
    cover:  putCover.value.trim(),
  };
}

/**
 * Validates all PUT form fields.
 * Marks invalid inputs and returns whether the form is valid.
 * @param {Object} fields - output of readPutForm()
 * @returns {boolean}
 */
function validatePutForm(fields) {
  const rules = [
    { valid: isPositive(fields.id),     el: putId     },
    { valid: isNotEmpty(fields.title),  el: putTitle  },
    { valid: isNotEmpty(fields.author), el: putAuthor },
    { valid: isPositive(fields.year),   el: putYear   },
    { valid: isPositive(fields.pages),  el: putPages  },
    { valid: isNotEmpty(fields.genre),  el: putGenre  },
    { valid: isValidUrl(fields.cover),  el: putCover  },
  ];

  const invalids = rules.filter(r => !r.valid);
  invalids.forEach(r => markError(r.el));
  return invalids.length === 0;
}

/**
 * Builds the updated book object from validated form fields.
 * Only includes cover if a URL was provided.
 * @param {Object} fields - output of readPutForm()
 * @returns {Object} book object ready to PUT
 */
function buildUpdatedBook(fields) {
  const book = {
    title:  fields.title,
    author: fields.author,
    year:   fields.year,
    pages:  fields.pages,
    genre:  fields.genre,
  };
  if (fields.cover) book.cover = fields.cover;
  return book;
}


document.getElementById("btn-put").addEventListener("click", () => {
  const fields = readPutForm();

  if (!validatePutForm(fields)) {
    showAlert("Please review the highlighted fields.", "danger", "alert-modal-put");
    return;
  }

  put(fields.id, buildUpdatedBook(fields));
});
// ── DELETE ──
document.getElementById("btn-delete").addEventListener("click", () => {
  const id = Number(delId.value);
  if (!isPositive(id)) {
    markError(delId);
    showAlert("Please enter a valid ID.", "danger", "alert-modal-del");
    return;
  }
  del(id);
});

// ── Clear localStorage ──
document.getElementById("btn-clear-ls").addEventListener("click", () => {
  localStorage.removeItem(LS_KEY);
  books = [];
  lsCount.textContent = "0";
  renderBooks([]);
  showLog({ action: "localStorage cleared" }, "", "DELETE");
  showAlert("Local cache cleared. Server data remains intact.", "warning");
});

// ── Delegación de eventos en la lista de libros ──
// En lugar de agregar un listener a cada botón, usamos uno solo
// en el contenedor padre y detectamos el target con event.target.
// Esto es más eficiente cuando hay muchos elementos dinámicos.
bookList.addEventListener("click", e => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const id     = Number(btn.dataset.id);
  const action = btn.dataset.action;

  if (action === "edit")   prepareEdit(id);
  if (action === "delete") confirmDelete(id);
  if (action === "detail") showDetail(id);
});

// ── Filtros en tiempo real ──
genreFilter.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);

// Limpia los modales al cerrarse
modalAddEl.addEventListener("hidden.bs.modal",    () => clearForm("modalAdd"));
modalEditEl.addEventListener("hidden.bs.modal",   () => clearForm("modalEdit"));
modalDelEl.addEventListener("hidden.bs.modal",    () => clearForm("modalDelete"));


// ════════════════════════════════════════════════════
// TASK 4 + TASK 6 — INICIALIZACIÓN (IIFE)
//
// IIFE = Immediately Invoked Function Expression:
// se declara y se ejecuta en el mismo momento.
// Al cargar la página, si hay datos en localStorage
// los mostramos de inmediato sin esperar al servidor.
// ════════════════════════════════════════════════════

(function init() {
  console.log("[MyLibrary] Starting application…");
  console.log("[LocalStorage] Key:", LS_KEY);
  console.log("[LocalStorage] Cached books:", books.length);

  lsCount.textContent = books.length;

  if (books.length > 0) {
    // Muestra el caché inmediatamente mientras carga el servidor (TASK 4)
    renderBooks(books, true);
    updateStats(books);

    showLog({
      source: "localStorage",
      cached_books: books.length,
      tip: "Press 'Load collection' to sync with the server."
    }, "", "GET");

    showAlert(
      `${books.length} book(s) loaded from local cache. Sync to get the latest data.`,
      "info"
    );
  }

  // Intenta conectar con el servidor automáticamente
  // Si falla, ya mostramos el caché arriba
  fetch(`${BASE_URL}/books`)
    .then(r => { if (r.ok) updateAPIStatus(true); })
    .catch(() => updateAPIStatus(false));
})();