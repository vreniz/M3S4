# 📚 MyLibrary

A personal book collection manager built with vanilla JavaScript, Bootstrap 5, and JSON Server. Developed as the Module 3 capstone project, covering DOM manipulation, LocalStorage persistence, and full CRUD operations via the Fetch API.


- [see Readme in Spanish](README.es.md)

---

## ✨ Features

- **Full CRUD** — Create, Read, Update and Delete books through a clean modal-based UI
- **Real-time search** — Filter by title or author as you type
- **Genre filter** — Narrow the collection by genre from the sidebar
- **LocalStorage cache** — Books persist between sessions; the app loads cached data instantly on startup without waiting for the server
- **Offline fallback** — If the JSON Server is unreachable, the cached data is shown automatically with a "Cache" badge
- **Live API log** — Every server response is displayed as formatted JSON in the right panel
- **Session history** — A timestamped log of every operation performed during the session
- **Cover images** — Books can include a cover URL; broken images fall back to a gradient placeholder by genre
- **Stats bar** — Live counters for total books, accumulated pages and distinct genres
- **Responsive layout** — Three-column grid that collapses gracefully on smaller screens

---

## 🗂 Project structure

```
M3S4/
├── public/
│   ├── index.html       # App shell — layout, modals, Bootstrap CDN links
│   ├── app.js           # All application logic (CRUD, DOM, LocalStorage)
│   └── style.css        # Custom styles that complement Bootstrap
├── db.json              # JSON Server database — 7 seed books
├── package.json         # Project metadata and scripts
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 🛠 Tech stack

| Layer | Technology |
|---|---|
| UI framework | Bootstrap 5.3 + Bootstrap Icons 1.11 |
| Logic | Vanilla JavaScript ES6+ |
| Fonts | Inter (Google Fonts) |
| API simulation | JSON Server 1.x |
| Persistence | Browser LocalStorage |

---

## 🚀 Getting started

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/vreniz/M3S4.git
cd M3S4

# 2. Install dependencies
npm install
```

### Running the app

```bash
# Start JSON Server (serves db.json on port 3000 and static files from /public)
npm start
```

Then open your browser at:

```
http://localhost:3000
```

> JSON Server serves the `public/` folder as static files automatically, so both the API and the UI run on the same port.

---

## 📡 API reference

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/books` | Returns all books |
| `POST` | `/books` | Creates a new book (id assigned by server) |
| `PUT` | `/books/:id` | Fully replaces a book by id |
| `DELETE` | `/books/:id` | Removes a book by id |

### Book schema

```json
{
  "id":     1,
  "title":  "Dune",
  "author": "Frank Herbert",
  "year":   1965,
  "pages":  688,
  "genre":  "Sci-fi",
  "cover":  "https://…"
}
```

The `cover` field is optional. All other fields are required.

### Supported genres

`Fiction` · `Non-fiction` · `Fantasy` · `Sci-fi` · `Horror` · `Romance` · `Mystery` · `History` · `Biography`

---

## 🖼 Cover images

The `cover` field accepts any direct image URL (one that shows only the image when opened in a browser). Recommended sources:

- **Amazon** — right-click any book cover → Copy image address
- **Open Library** — `https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg`
- **Google Books** — right-click the cover thumbnail → Copy image address

If the URL fails to load, the app automatically falls back to a genre-specific gradient placeholder.

---

## 🧠 JavaScript concepts covered

This project was built to demonstrate the following Module 3 concepts:

| Concept | Where it appears |
|---|---|
| `let` / `const` | All variable declarations throughout `app.js` |
| Arrays & objects | `books` global array; book objects; rules arrays in validators |
| `Map` | `genreColors` and `genreGradients` for O(1) genre lookups |
| `Set` | `updateStats()` — counts unique genres in O(n) |
| DOM manipulation | `createElement`, `appendChild`, `removeChild` in `renderBooks` and `del` |
| LocalStorage | `saveToLS`, `syncLS` — `setItem` / `getItem` on every mutation |
| Fetch API | `get`, `post`, `put`, `del` — one function per HTTP method |
| `async` / `await` | All fetch functions; IIFE `init` |
| `try` / `catch` | Every fetch function; server-down fallback in `get` |
| Validation | `isNotEmpty`, `isPositive`, `isValidUrl`, `markError` |
| Event delegation | Single `click` listener on `#book-list` handles all card buttons |
| IIFE | `init()` — runs on page load to restore cache and ping the server |

---

## 📋 Task checklist

- [x] **TASK 1** — Project files created and correctly linked
- [x] **TASK 2** — User input captured from DOM; dynamic success/error messages
- [x] **TASK 3** — Books rendered as `<li>` elements via `createElement` / `appendChild`; delete uses `removeChild`
- [x] **TASK 4** — Global `books` array synced with `localStorage.setItem` / `getItem`; cache loaded on startup
- [x] **TASK 5** — GET, POST, PUT, DELETE implemented with `async/await` and `try/catch`
- [x] **TASK 6** — All operations work together; API responses logged to DOM and console
---
## 📸 Evidence

The following screenshots document the application behavior across the four key areas evaluated in Task 6.

### DOM — Before operation
The Elements panel shows the initial state of `#book-list` with the existing `<li>` cards rendered in the DOM before any operation is performed.

![DOM before](assets/elementsbefore.png)

### DOM — After operation
After executing a POST request, the new `<li>` element is appended to `#book-list` via `appendChild()`. The DOM updates instantly without a page reload.

![DOM after](assets/elementsafter.png)

### Console — Server responses
Every CRUD operation calls `console.log(`[${method}]`, data)` inside `showLog()`, printing the exact JSON response returned by JSON Server. The screenshot shows all four methods — GET, POST, PUT and DELETE — logged in sequence.

![Console](assets/console.png)

### Application — LocalStorage content
The Application panel shows the `myLibrary` key stored in LocalStorage. The value is the full books array serialized by `JSON.stringify()`. This data is loaded automatically on startup via `JSON.parse(localStorage.getItem(LS_KEY))` so the collection persists between sessions even when the server is offline.

![LocalStorage](assets/application.png)
---

##  Author

Vanessa Fontalvo Reniz — Systems Engineering 