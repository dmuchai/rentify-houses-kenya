# 🏠 Rentify Kenya

A modern full-stack real estate web app tailored for the Kenyan market — allowing tenants to browse listings and verified agents to manage property ads securely and efficiently.

---

## 🚀 Features

- 🔐 Supabase Auth for user login/register (Agent & Tenant roles)
- 🏢 Agent dashboard with metrics (listings, views, saves)
- 🧠 Google Gemini AI content scan for image moderation
- 🏞 Upload listing photos to Supabase Storage
- 🧪 TypeScript with clean architecture
- 🎨 Tailwind CSS for modern UI
- 📱 Mobile-responsive design
- 🔍 Location-based filtering

---

## 🛠️ Technologies Used

| Stack        | Tech                                                                 |
|--------------|----------------------------------------------------------------------|
| Frontend     | React + Vite + TypeScript                                            |
| Styling      | Tailwind CSS                                                         |
| Backend      | Supabase (PostgreSQL, Auth, Storage, Edge Functions)                |
| AI Features  | Google Gemini API integration via Supabase Edge Functions           |
| Testing      | Jest (optional for component/unit testing)                           |
| Deployment   | Vercel / Netlify (recommended)                                       |

---

## 📦 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/dmuchai/rentify-houses-kenya.git
cd rentify-houses-kenya

### 2. Install dependencies
Make sure you have Node.js ≥ v16 and npm installed:

npm install

### 3. Configure environment variables
Create a .env file in the root directory:

cp .env.example .env

Update the .env file with your Supabase project and Gemini API credentials:
GEMINI_API_KEY=your-gemini-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

### 4. Start the development server
npm run dev
The app should now be available at: http://localhost:5173

### 5. Build for production
npm run build
To preview the build locally:

npm run preview

📦 Features
🔍 Property search with filters

🖼️ Image carousels with AI scan warnings

�� Agent contact forms

📍 Listings by location (county, neighborhood)

📊 Rent estimation via Gemini API (coming soon)

🔐 Authentication
Handled by Supabase Auth. Users can log in as:

Tenants

Agents


🌍 Deployment
You can deploy this project to:

Vercel

Netlify

Render

Make sure to configure environment variables on your hosting platform.

🤝 Contributing
Contributions are welcome! Please fork the repo and submit a pull request.

📄 License
This project is licensed under the MIT License.

👤 Author
Dennis Muchai
