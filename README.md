# 🏮 Lighthouse: Emergency Response & Volunteer Coordination

Lighthouse is a next-generation platform designed to bridge the gap between NGOs and volunteers during emergencies. It provides real-time task tracking, highly resilient AI-driven volunteer matching, and a seamless map-based coordination interface for rapid disaster response.

---

## 🚀 Key Features

### 🏢 For NGOs (Admin Portal)
- **Live Operational Map**: Powered by Google Maps API, offering a real-time command center to geolocate active emergencies and monitor situational status.
- **Resilient Smart Matching (Multi-Tier AI)**: An unbreakable AI architecture that matches volunteers to tasks. It prioritizes **Google Gemini 2.5 Flash**, gracefully falling back to **Groq (Llama 3.1)** and finally a local algorithm to guarantee 100% uptime even during heavy API rate limits.
- **Organization Profiles**: Manage public mission statements, contact details, and active missions.
- **Volunteer Roster**: Track impact and coordinate with your dedicated network of responders, including granular availability scheduling.

### 🤝 For Volunteers (The Hub)
- **Interactive Map & Routing**: Visualize nearby emergencies, view precise task coordinates, and navigate efficiently using Google Maps integration.
- **AI-Recommended Tasks**: Get personalized mission suggestions based on your specific skills, location, and schedule.
- **24/7 Emergency Standby**: Set granular availability or toggle emergency standby to receive high-urgency tasks.
- **Impact Tracking**: Monitor your volunteer hours, active streaks, and overall community contributions.

---

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) + [TailwindCSS](https://tailwindcss.com/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Hosting)
- **AI Intelligence (Multi-Tier)**: [Google Gemini API](https://aistudio.google.com/) (Primary) & [Groq Llama 3.1](https://groq.com/) (Fallback)
- **Maps & Geolocation**: [Google Maps API](https://developers.google.com/maps)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/krishnanx99-cyber/Lighthouse.git](https://github.com/krishnanx99-cyber/Lighthouse.git)
   cd Lighthouse
