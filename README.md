# Inventory Insight

A smart inventory management application powered by AI.

## Project info

This project uses React, Vite, and Tailwind CSS. The application connects to a Supabase backend for data persistence and authentication.

## Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v16 or higher)
-   npm (comes with Node.js) or [Bun](https://bun.sh/)

## Getting Started

Follow these steps to get the project up and running on your local machine.

### 1. Installation

1.  **Clone the repository** (if you haven't already):
    ```sh
    git clone <YOUR_GIT_URL>
    cd inventory-insight-main
    ```

2.  **Install dependencies**:
    ```sh
    npm install
    ```

### 2. Environment Setup

This project requires environment variables to connect to Supabase.

1.  Create a file named `.env.local` in the root directory of the project.
2.  Copy and paste the following content into the file:

    ```env
    # Supabase Configuration
    # You can find these values in your Supabase project dashboard (Settings -> API)

    VITE_SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
    VITE_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
    ```

    > **Note:** The `.env.local` file is ignored by Git to protect your API keys. Do not commit this file to version control.

### 3. Running the Application

Start the development server:

```sh
npm run dev
```

The application will be available at `http://localhost:3001` (or another port if 3001 is busy).

## Building for Production

To build the application for production deployment:

```sh
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Technologies

-   [Vite](https://vitejs.dev/) - Frontend Tooling
-   [React](https://react.dev/) - UI Library
-   [TypeScript](https://www.typescriptlang.org/) - Type Safety
-   [Tailwind CSS](https://tailwindcss.com/) - Styling
-   [shadcn/ui](https://ui.shadcn.com/) - UI Components
-   [Supabase](https://supabase.com/) - Backend & Database
