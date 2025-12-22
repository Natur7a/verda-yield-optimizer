## VERDA Predictive AI - Palm Oil Waste Optimizer

VERDA is a full-stack machine learning application designed to optimize palm oil mill waste allocation for maximum economic value and environmental sustainability.

## Running the Full Stack

To run the complete application with both backend API and frontend:

### Terminal 1 - Backend API

```bash
cd ai
pip install -r requirement.txt
python trainer.py  # First time only - trains the ML models
```
**Make sure Python version is 3.9 or higher**

For Running the API Server

For MacOS/Linux
```bash
chmod +x start_api.sh
./start_api.sh
```

For Windows
```bash
uvicorn api:app --reload --port 8000 
```


The API will be available at:
- **Base URL**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Terminal 2 - Frontend


1. Install Dependencies
```bash
npm install
```

2. Env Setup
```bash
cp .env.example .env
```
**Make sure the variable is set to:**
```bash
VITE_USE_REAL_AI=true
```

3. Starting the Frontend
```bash
npm run dev
```

The frontend will be available at http://localhost:8080

### Environment Configuration

The default .env.example configuration works for local development.
You may edit .env to customize API URLs or feature flags if needed.

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE (Recommended)**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


## Team
Moses Handoyo - 2802418834
Kenneth Sean Ternadi - 2802422245
Nicholas Anthony Cahyadi - 2802429535
Stefanus Severiano Tandjungan - 2802403630
