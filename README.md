# BehaviTracker (Static Frontend)

BehaviTracker is a fully static school behaviour points website built with HTML, CSS, and JavaScript.

## Project structure

- `index.html` — Dashboard with student table, status badges, filters, sorting, and award/deduct form
- `students.html` — Student detail page with score, badges, and points history
- `rules.html` — Behaviour rules management page with add/edit and active/inactive toggle
- `stats.html` — Statistics page with Chart.js charts
- `main.js` — LocalStorage data model, scoring logic, rules logic, badges, and page rendering
- `style.css` — Responsive layout and component styling

## Data model (LocalStorage)

The app stores data in `localStorage` under `behavitracker-data-v1`:

- Students
- Behaviour rules
- Merit/demerit transactions

## Run

```bash
python3 -m http.server 8000
```

Open:

- `http://localhost:8000/index.html`
- `http://localhost:8000/students.html`
- `http://localhost:8000/rules.html`
- `http://localhost:8000/stats.html`
