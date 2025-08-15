# 📅 FlexHub – Adaptive Life Planner

FlexHub is a _real-time adaptive life management app_ that helps you plan your schedule, manage your budget, and prioritize tasks — all while responding to real-world disruptions like weather, transit strikes, or supply shortages.

Built with:

- _Frontend:_ React Native (Expo)
- _Backend:_ Express.js + SQLite
- _Architecture:_ Modular API + mobile app scaffold for quick iteration

---

## ✨ Features

- _Adaptive Calendar_

  - Suggests new time slots for events when conflicts, bad weather, or delays occur
  - Auto-reschedule flexible events

- _Budget & Cost-of-Living Tracker_

  - Monthly budgets with planned vs. actual spending
  - AI-like suggestions when you overspend in a category

- _Task Copilot_

  - Merges all tasks into one list
  - Prioritizes based on urgency, energy level, and deadlines

- _Disruption Mode_

  - Instant lifestyle adjustments for rain, extreme heat, transit strikes, and shortages

- _Micro-Exchange_
  - Local “have/need” listings to swap goods with nearby users

---

## 📂 Project Structure

flexhub/
backend/ # Express.js + SQLite API
app/ # React Native (Expo) mobile app

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/flexhub.git
cd flexhub

2. Backend Setup

cd backend
npm install
npm run reset-db    # creates database + demo user
npm run dev         # starts API at http://localhost:4000

3. Frontend Setup

cd ../app
npm install

# (Optional) Set API base URL for devices on your LAN
# macOS/Linux:
export EXPO_PUBLIC_API="http://YOUR_LAN_IP:4000"
# Windows PowerShell:
# $env:EXPO_PUBLIC_API="http://YOUR_LAN_IP:4000"

npm start   # or: npm run ios / npm run android / npm run web


⸻

📸 Screenshots

Tasks	Calendar	Budget
(Add image)	(Add image)	(Add image)


⸻

🛠 API Endpoints (Backend)

Tasks
	•	GET /tasks – list tasks
	•	POST /tasks – create task
	•	GET /tasks/prioritize – AI-ish task priority list

Events
	•	GET /events – list events
	•	POST /events/suggest – get adaptive time suggestion

Budget
	•	GET /budget/:month – monthly budget data
	•	GET /budget/:month/suggestions – overspending alerts

Disruptions
	•	POST /disruptions/analyze – disruption recommendations

Exchange
	•	GET /exchange – open listings
	•	POST /exchange – create listing

⸻

📅 Roadmap
	•	Push notifications for reschedules & tips
	•	Google/Apple calendar sync
	•	Real-time cost-of-living data integration
	•	AI-powered autoscheduler
	•	Authentication with JWT & user accounts
	•	Offline mode with sync

⸻

🧑‍💻 Contributing
	1.	Fork the repo
	2.	Create a new branch (feature/awesome-feature)
	3.	Commit changes
	4.	Push to your fork
	5.	Open a Pull Request

⸻

📜 License

MIT License © 2025 doge4lif3
```
