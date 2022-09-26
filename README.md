# Collabart
A simple app for collaboratively creating stories and probably other stuff in future.

## Usage
    git clone git@github.com:strombergs-denniss/collabart.git
    cd collabart
    npm install
    Copy .env.example, rename it to .env and set credentials
    ./start.sh on Linux | npm start on Windows
    Open http://localhost:3000/
    Sign in or create account

## Paths
* `/` - Auth
* `/stories` - All stories
* `/stories/:id` - Story config
* `/stories/:id/lines` Story lines
