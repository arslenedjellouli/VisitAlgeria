# Visit Algeria

Visit Algeria is a tourism planning application that helps users create
personalized itineraries across Algeria. It combines a React frontend with a
FastAPI backend and a constraint-based travel planner powered by the project's
Algerian attractions dataset.

## Features

- Discover attractions, hotels, restaurants, and activities across Algerian
  wilayas
- Build a personalized multi-day itinerary from location, interests, budget,
  hotel rating, and visited-attraction preferences
- Explore generated itineraries on interactive Leaflet maps
- View itinerary summaries, estimated costs, and daily travel plans
- Use the application locally with a separate frontend and backend

## Technology

- **Frontend:** React 19, Vite, React Router, Material UI, Leaflet, Recharts
- **Backend:** Python, FastAPI, Uvicorn, Pydantic
- **Planner:** Python with Pandas and NumPy
- **Data:** CSV and JSON files in `backend/CSP/`

## Requirements

- Python 3.10 or newer
- Node.js 20 or newer
- npm 9 or newer

## Run the backend

From the repository root:

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
# source .venv/bin/activate

python -m pip install --upgrade pip
pip install -r requirements.txt
python main.py
```

The API is available at `http://localhost:8000`. FastAPI's interactive
documentation is available at
[`http://localhost:8000/docs`](http://localhost:8000/docs).

## Run the frontend

In a second terminal:

```bash
cd frontend/VisitAlgeria
npm ci
npm run dev
```

The frontend is usually available at
[`http://localhost:5173`](http://localhost:5173).

The frontend uses `VITE_API_URL` for the backend URL and falls back to
`http://localhost:8000` for local development. To use a deployed backend,
create `frontend/VisitAlgeria/.env.local`:

```dotenv
VITE_API_URL=https://your-backend.example.com
```

## Useful commands

Run these commands from `frontend/VisitAlgeria`:

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build
```

## API

### `GET /`

Returns a basic service health message.

### `POST /search`

Generates an itinerary from a JSON body containing:

```json
{
  "currentLat": 36.75,
  "currentLong": 3.05,
  "interests": ["Historical & Architectural Sites"],
  "budgetPerDay": 10000,
  "minHotelRat": 3,
  "maxHotelRat": 5,
  "visitedAttractions": {},
  "currentWilaya": ""
}
```

## Project structure

```text
backend/
├── CSP/                  # Planner, attraction data, and wilaya data
├── main.py               # FastAPI application
├── requirements.txt      # Python dependencies
└── readme.md             # Backend notes

frontend/VisitAlgeria/
├── src/                  # React pages and components
├── package.json          # Frontend scripts and dependencies
└── vite.config.js        # Vite configuration
```

## Data and generated files

The application uses the datasets committed under `backend/CSP/`. Generated
itineraries are written to `backend/itineraries/` at runtime and are ignored
by Git. Virtual environments, caches, frontend dependencies, and production
builds are also intentionally excluded from the repository.

## Contributing

1. Create a feature branch.
2. Follow the setup steps above.
3. Run `npm run lint` and `npm run build` for frontend changes.
4. Test the API locally for backend changes.
5. Open a pull request describing the behavior and data changes.

## License

No license has currently been declared. Until a license is added, the source
remains protected by copyright and should not be redistributed or modified
outside the permissions granted by the repository owner.
