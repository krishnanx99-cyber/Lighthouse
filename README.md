# 🏮 Lighthouse: Emergency Response & Volunteer Coordination

Lighthouse is a next-generation platform designed to bridge the gap between NGOs and volunteers during emergencies. It provides real-time task tracking, AI-driven volunteer matching, and a seamless coordination interface for rapid disaster response.

---

## 🚀 Key Features

### 🏢 For NGOs (Admin Portal)
- **Emergency Command Center**: A real-time map and dashboard to deploy tasks and monitor situation status.
- **Smart Matching Engine**: Uses Groq-powered AI (Llama 3) to identify the best volunteers for a task based on skills and availability.
- **Organization Profiles**: Manage public mission statements, contact details, and active missions.
- **Volunteer Management**: Track impact and coordinate with a dedicated roster.

### 🤝 For Volunteers (The Hub)
- **AI-Recommended Tasks**: Get personalized mission suggestions based on your skills and location.
- **Real-time Map**: Visualize nearby emergencies and navigation routes.
- **Impact Tracking**: Monitor your volunteer hours, streaks, and contributions.
- **Seamless Onboarding**: A step-by-step flow to set up your skills and availability.

---

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) + [TailwindCSS](https://tailwindcss.com/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Hosting)
- **AI Intelligence**: [Groq](https://groq.com/) (Llama 3.1 8B Instant)
- **Maps & Location**: [Google Maps API](https://developers.google.com/maps)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/krishnanx99-cyber/Lighthouse.git
   cd Lighthouse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add your API keys:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   VITE_GROQ_API_KEY=your_groq_key
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

---

## 📸 Screenshots

*(Add your screenshots here)*

| NGO Dashboard | Volunteer Explore |
| :---: | :---: |
| ![NGO Dashboard](https://via.placeholder.com/400x200?text=NGO+Dashboard) | ![Volunteer Hub](https://via.placeholder.com/400x200?text=Volunteer+Explore) |

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ for the global community.*
