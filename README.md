# Kanban Board

A visually distinctive ticket tracker built with React and a **Neo-Brutalist** design language — chunky borders, bold shadows, offset elements, and the Clash Display typeface.

![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?style=flat-square)

---

## Features

- **Drag & Drop** — HTML5 drag-and-drop with positional card insertion
- **Column CRUD** — Add, rename, and delete columns
- **Card CRUD** — Create, edit, and delete tickets with title, description, priority, labels, and due dates
- **Filtering & Search** — Filter by priority or label; full-text search across titles and descriptions
- **Persistence** — Board state auto-saves to `localStorage`
- **Import / Export** — Download and restore board data as JSON
- **Custom Dialogs** — All confirmations and prompts use styled modals (no native browser alerts)
- **Keyboard Accessible** — Escape to close, Enter to confirm, focus management on modals

---

## Tech Stack

| Layer       | Tool                  |
| ----------- | --------------------- |
| Framework   | React 18              |
| Bundler     | Vite 6                |
| Styling     | Tailwind CSS 3        |
| Icons       | Lucide React          |
| Persistence | localStorage          |

---

## Project Structure

```
src/
├── App.jsx                  # Root layout & background
├── main.jsx                 # React DOM entry point
├── index.css                # Tailwind directives, animations, scrollbars
├── components/
│   ├── Board.jsx            # Main board container, state wiring
│   ├── Card.jsx             # Individual ticket card
│   ├── CardModal.jsx        # Full card editor modal
│   ├── Column.jsx           # Column with header, card list, drop zone
│   ├── Dialog.jsx           # Reusable confirm / input dialog (portal)
│   └── Header.jsx           # Title bar, search, filters, import/export
├── hooks/
│   ├── useBoardState.js     # Board state, CRUD, persistence
│   └── useDragAndDrop.js    # Drag-and-drop state machine
└── utils/
    ├── constants.js         # Colors, priority styles, defaults
    ├── dateUtils.js         # Date helpers (overdue, due soon, format)
    └── seedData.js          # Sample board data
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** (or yarn / pnpm)

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server (default: http://localhost:5173)
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Usage

| Action             | How                                                              |
| ------------------ | ---------------------------------------------------------------- |
| Add column         | Click **+ COL** in the header                                   |
| Rename column      | Click the pencil icon on a column header                        |
| Delete column      | Click the trash icon on a column header                         |
| Add card           | Click **+** on any column                                       |
| Edit card          | Click a card to open the editor modal                           |
| Delete card        | Open a card → click **DELETE**                                  |
| Drag & drop        | Drag a card to reorder or move between columns                  |
| Filter             | Use the priority / label buttons in the header                  |
| Search             | Type in the search box                                          |
| Export             | Click the download icon → saves a `.json` file                  |
| Import             | Click the upload icon → select a previously exported `.json`    |

---

## License

MIT
