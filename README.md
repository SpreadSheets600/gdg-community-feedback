# GDG Community Wall 🎨

A collaborative, real-time "Post-it note" wall built for GDG community events. Attendees can leave colorful digital sticky notes to share thoughts, feedback, or greetings on a shared public canvas.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-blue) ![Vercel Postgres](https://img.shields.io/badge/Vercel-Postgres-pink)

## ✨ Features

- **Interactive Canvas**: Drag and drop notes anywhere on the wall.
- **Real-time Updates**: The wall auto-refreshes to show new notes from other users.
- **Customization**: Notes have random rotations and vibrant sticky-note colors.
- **Smart Placement**: New notes automatically find open spaces to avoid clutter.
- **content Moderation**: Basic built-in profanity filter for public safety.
- **Responsive**: Works on mobile for posting and large screens for display.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI library**: [React 19](https://react.dev/)
- **Database**: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- **Styling**: CSS Modules (No Tailwind, pure custom styles)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed.
- A [Vercel](https://vercel.com) account (for the database).

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd gdg-wall
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory. You need to connect a Vercel Postgres database to get the credentials.
    
    ```bash
    # .env.local
    POSTGRES_URL="postgres://default:..."
    POSTGRES_PRISMA_URL="..."
    POSTGRES_URL_NO_SSL="..."
    POSTGRES_URL_NON_POOLING="..."
    POSTGRES_USER="..."
    POSTGRES_HOST="..."
    POSTGRES_PASSWORD="..."
    POSTGRES_DATABASE="..."
    ```
    *Tip: If deploying on Vercel, these are added automatically when you integrate the storage.*

4.  **Initialize the Database**:
    The project includes an automatic setup route. Once your environment variables are set, start the dev server and visit the setup endpoint once to create the necessary tables.
    
    Start server:
    ```bash
    npm run dev
    ```
    
    **Visit in browser**: `http://localhost:3000/api/setup`
    
    You should see: `{"message":"Database initialized successfully"}`

5.  **Run the App**:
    Now go to the home page: `http://localhost:3000`

## 📦 Deployment

This application is optimized for **Vercel**.

1.  Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2.  Import the project in your Vercel Dashboard.
3.  In the Vercel Project Settings, navigate to the **Storage** tab and create a new **Postgres** database. Connect it to your project.
4.  Deploy content.
5.  **Important**: After the first deployment, verify the database tables are created by visiting `https://<your-project>.vercel.app/api/setup`.

## 📂 Project Structure

- `src/app/page.tsx`: Main UI logic (Wall + Composer).
- `src/app/api/notes`: API endpoints for fetching and creating notes.
- `src/components`: Reusable UI components (Wall, Note, Composer).
- `src/lib`: Utility functions and types.

## 🤝 Contributing

Feel free to fork and submit PRs if you want to add features like better reaction emojis or admin moderation dashboards!
