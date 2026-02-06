# Feature Recommendations

> Analysis of the Kanban Board codebase with prioritized recommendations for high-impact features, fixes, and improvements.

---

## Critical Fixes

### 1. Undo / Redo Support
**Impact: High** · **Effort: Medium**

There is no undo mechanism. Deleting a column or card is irreversible (the confirm dialog helps, but mistakes still happen). A simple undo stack on `boardState` snapshots would cover all destructive actions cheaply.

- Store the last _N_ board snapshots in a ring buffer
- Expose `undo()` / `redo()` from `useBoardState`
- Bind `Ctrl+Z` / `Ctrl+Shift+Z` globally

### 2. Import Validation Is Too Loose
**Impact: High** · **Effort: Low**

`importData` in `useBoardState.js` only checks that the JSON parses — it does not validate shape. A malformed file silently replaces the entire board state and can crash the app.

- Validate that `columns`, `cards`, `nextTicketNumber`, and `labelColors` exist and are the correct types before applying
- Show a descriptive error via the existing `Dialog` component if validation fails

### 3. Drag-and-Drop Does Not Work on Touch Devices
**Impact: High** · **Effort: Medium**

The HTML5 Drag and Drop API has no native support on mobile browsers. Cards are completely immovable on phones and tablets.

- Integrate a lightweight library like `@dnd-kit/core` or `react-beautiful-dnd` (or a touch-event polyfill like `mobile-drag-drop`)
- Alternatively, add touch-event handlers (`touchstart` / `touchmove` / `touchend`) alongside the existing mouse-based DnD

---

## High-Impact Features

### 4. Column Reordering
**Impact: High** · **Effort: Low**

Cards can be reordered and moved between columns, but columns themselves are fixed in place. Users should be able to drag columns horizontally to rearrange workflow stages.

- Extend `useDragAndDrop` with a column-level drag mode
- Add grip handles to column headers

### 5. Subtasks / Checklists
**Impact: High** · **Effort: Medium**

Cards only have a flat description. A checklist field (array of `{ text, done }`) would turn the board into a more complete task tracker.

- Add a `checklist: []` property to the card schema
- Render inline progress bar on the card face (e.g., "3/5")
- Allow adding, toggling, and removing items in `CardModal`

### 6. Activity Log / Card History
**Impact: Medium** · **Effort: Medium**

There is no record of when a card was moved, edited, or who changed it. An append-only `history` array per card would give visibility into ticket lifecycle.

- Push a timestamped event on every `updateCard`, `moveCard`, and `deleteCard`
- Display a collapsible timeline inside `CardModal`

### 7. Board-Level Statistics Dashboard
**Impact: Medium** · **Effort: Low**

No aggregate view of the board exists. A small stats bar or drawer showing card counts by priority, overdue count, label distribution, and average time-in-column would add quick situational awareness.

- Derive stats from `boardState` in a `useMemo`
- Render a collapsible stats panel below the header

---

## UX Improvements

### 8. Keyboard-Driven Card Navigation
**Impact: Medium** · **Effort: Medium**

Keyboard accessibility is limited to Escape/Enter on modals. Power users expect to navigate between cards with arrow keys and trigger actions without a mouse.

- Implement roving `tabindex` across cards
- Arrow keys to move focus between cards/columns
- `Enter` to open, `Delete` to trigger delete dialog

### 9. Confirmation Toast Instead of Blocking Dialogs
**Impact: Medium** · **Effort: Low**

Every destructive action opens a modal dialog, which interrupts flow. A non-blocking toast with a timed "Undo" button (paired with recommendation #1) would feel snappier.

- Add a `<Toast>` component that auto-dismisses after ~5 seconds
- Show for delete, move, and import actions

### 10. Debounced Auto-Save Indicator
**Impact: Low** · **Effort: Low**

`localStorage` writes happen on every state change synchronously. There is no visual feedback that data has been saved. Users may worry about data loss.

- Debounce the `localStorage.setItem` call (e.g., 500ms) to batch rapid edits
- Show a subtle "Saved" indicator in the header that fades after 2 seconds

### 11. Column WIP (Work-in-Progress) Limits
**Impact: Medium** · **Effort: Low**

A core Kanban concept is limiting work in progress. Columns currently accept unlimited cards.

- Add an optional `wipLimit` property to columns
- Visually warn (border glow, counter turns red) when the limit is reached
- Optionally block adding/dragging cards into a full column

### 12. Collapse / Minimize Columns
**Impact: Low** · **Effort: Low**

Boards with many columns push content off-screen. Allowing a column to collapse to just its header would save horizontal space.

- Toggle column body visibility with a chevron button
- Persist collapsed state in `boardState`

---

## Code Quality & Architecture

### 13. No Tests
**Impact: High** · **Effort: Medium**

The project has zero test files. Core logic in `useBoardState`, `useDragAndDrop`, and `dateUtils` is highly testable.

- Add Vitest (already Vite-based, near-zero config)
- Unit-test `dateUtils` functions, `useBoardState` CRUD operations, and import validation
- Add a basic React Testing Library smoke test for `Board`

### 14. Inline Styles → Tailwind or CSS Modules
**Impact: Medium** · **Effort: Medium**

Components mix Tailwind utility classes with extensive inline `style={{}}` objects. This fragments the styling approach and makes theming difficult.

- Migrate inline styles to Tailwind custom theme tokens in `tailwind.config.js` (colors, shadows, borders)
- This also enables dark-mode toggling via Tailwind's `dark:` variant

### 15. Prop Drilling Is Deep
**Impact: Medium** · **Effort: Medium**

`Board` passes 15+ props through `Column` into `Card`. This makes the component tree rigid.

- Introduce a lightweight `BoardContext` (React Context) for shared state like `labelColors`, `expandedCards`, and drag state
- Keep CRUD callbacks in the hook but consume them via context instead of threading through every layer

### 16. Error Boundary
**Impact: Medium** · **Effort: Low**

There is no React error boundary. A corrupt `localStorage` payload or a runtime bug will white-screen the entire app.

- Wrap `<Board />` in an `ErrorBoundary` component
- Show a recovery UI with the option to clear localStorage and reload

### 17. Linting & Formatting
**Impact: Low** · **Effort: Low**

No ESLint or Prettier config is present. Adding them ensures consistent style as the project grows.

- Add `eslint` + `eslint-plugin-react` + `prettier` as dev dependencies
- Add `lint` and `format` npm scripts

---

## Nice-to-Haves

| Feature | Impact | Effort | Notes |
|---|---|---|---|
| **Assignees / Avatars** | Medium | Medium | Add an `assignee` field to cards; render initials or avatar circles |
| **Custom Label Creation** | Medium | Low | Currently labels are hard-coded in `DEFAULT_LABEL_COLORS`; let users add/remove labels |
| **Markdown in Descriptions** | Low | Low | Render card descriptions with a lightweight MD parser (e.g., `marked`) |
| **Column Color Coding** | Low | Low | Let users pick a header accent color per column |
| **Board Tabs / Multiple Boards** | High | High | Support switching between separate boards (namespace `localStorage` keys) |
| **Real-Time Collaboration** | High | High | WebSocket or CRDT-based sync for multi-user editing |
| **PWA / Offline Support** | Medium | Low | Add a service worker + manifest for installability |

---

## Suggested Priority Order

1. **Import validation** — quick fix, prevents data corruption
2. **Undo/Redo** — safety net for all destructive actions
3. **Add Vitest + initial tests** — prevents regressions as features land
4. **Error boundary** — crash resilience
5. **Touch drag-and-drop** — unlocks mobile usage
6. **WIP limits** — core Kanban functionality
7. **Column reordering** — natural complement to card DnD
8. **Subtasks / Checklists** — most-requested feature in task trackers
9. **Migrate inline styles to Tailwind tokens** — enables theming & dark mode
10. **Context to reduce prop drilling** — architectural health
