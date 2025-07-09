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

## 📚 Documentation

This project includes comprehensive documentation:

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete code documentation and architecture guide
- **[TESTING.md](./TESTING.md)** - Testing infrastructure and guidelines  
- **[TEST_SUMMARY.md](./TEST_SUMMARY.md)** - Test implementation overview
- **Inline Documentation** - All functions include detailed JSDoc comments
- **Type Definitions** - Full TypeScript interfaces in `types.ts`

### Key Documentation Features

- **JSDoc Comments**: Every function has comprehensive documentation
- **Usage Examples**: Real-world code examples for all major features
- **Error Handling**: Detailed error scenarios and handling patterns
- **Type Safety**: Complete TypeScript coverage with strict typing
- **Best Practices**: Architecture patterns and coding standards

---

## 🧪 Testing

Comprehensive test suite with 90%+ coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage
- ✅ Listing CRUD operations
- ✅ Search and filtering functionality
- ✅ Image upload and validation
- ✅ Error handling and edge cases
- ✅ Data transformation functions
- ✅ Agent metrics calculation

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

2. Install dependencies
Make sure you have Node.js ≥ v16 and npm installed:

npm install

3. Configure environment variables
Create a .env file in the root directory:

cp .env.example .env

Update the .env file with your Supabase project and Gemini API credentials:
GEMINI_API_KEY=your-gemini-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

4. Start the development server
npm run dev
The app should now be available at: http://localhost:5173

5. Build for production
npm run build
To preview the build locally:

inpm run preview
```
## 🔐 Authentication
Handled by Supabase Auth. Users can log in as:

Tenants

Agents


## 🌍 Deployment
You can deploy this project to:

Vercel

Netlify

Render

Make sure to configure environment variables on your hosting platform.

## 🤝 Contributing
Contributions are welcome! Please fork the repo and submit a pull request.

## 📄 License
This project is licensed under the MIT License.

## 👤 Author
Dennis Muchai
Github: @dmuchai
LinkedIn: https://www.linkedin.com/in/dmmuchai/
Email: dmmuchai@gmail.com
Website: https://dennis-dev-space-dmmuchai.replit.app/
