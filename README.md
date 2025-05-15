# Habitify

A modern, beautiful habit and task tracker built with Next.js, Supabase, and Tailwind CSS.

## 🚀 Features
- User authentication (Supabase)
- Habit tracking with daily, weekly, and overall views
- Contribution-style calendar for overall progress
- Task management with priorities and focus mode
- Responsive, mobile-friendly UI
- Light/dark mode

## 🛠️ Tech Stack
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/) (auth & database)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## ⚡ Getting Started

1. **Clone the repo:**
   ```sh
   git clone https://github.com/Samarcodesinpython/Habitify.git
   cd Habitify
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local` (or create it)
   - Add your Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```
4. **Run the development server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```
5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## 📸 Screenshots
![Dashboard](./screenshots/dashboard.png)
![Habits](./screenshots/habits.png)
![Contribution Calendar](./screenshots/contribution-calendar.png)

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## 📄 License
[MIT](LICENSE)
