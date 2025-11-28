# Game Tierlist from Links

A small web tool for creating game tierlists on stream or just for fun.  
Runs directly in the browser – no registration, no installation.

Live version: https://tierlist-tool.vercel.app/

---

## Features

- Accepts links to game pages (Steam, itch.io, Epic, GOG, etc.);
- Automatically fetches:
  - game title (via OpenGraph / page metadata),
  - game cover image;
- Supports:
  - adding a single game via URL;
  - bulk adding multiple links at once (one URL per line);
- Sorting based on **pairwise choices**:
  - shows two games,
  - you click the one you like more,
  - in the end you get a fully sorted list;
- Automatically builds a nice tier table (S / A / B / C / D) with game covers;
- Lets you **download the tier table as a PNG image**;
- Stores progress locally in the browser (`localStorage`);
- Allows you to:
  - delete individual games,
  - reload a game’s metadata (update title/cover from URL),
  - add new games to an existing tierlist **without** re-sorting all old games.

---

## How to Use

1. Open the page:  
   **https://tierlist-tool.vercel.app/**
2. Enter a game page URL and click **“Загрузить и добавить игру”**  
   (Load and add game),  
   or paste several URLs into the **“Несколько URL”** (Multiple URLs) field  
   – one URL per line.
3. After loading the metadata, games will appear in the **“Собранные игры”** (Collected games) list.
4. Click **“Начать тир-лист”** (Start tierlist):
   - a fullscreen comparison mode will open,
   - choose which of the two games you like more.
5. When comparisons are done:
   - the sorted list of games appears on the right,
   - below it you get a visual S / A / B / C / D tier table.
6. Use the **“Скачать таблицу как картинку”** button  
   to download the tier table as a PNG image.

---

## Technology

- Plain **HTML + CSS + JavaScript** on the frontend;
- Deployed via **Vercel**;
- Serverless function `/api/og`:
  - accepts `?url=...`,
  - fetches the page from the backend,
  - extracts OpenGraph metadata (`og:title`, `og:image`, etc.),
  - returns JSON with title and image.

---

## Limitations

- Some sites may block requests from the server (for example, certain Steam pages),
  which can result in an “Access Denied” page instead of proper metadata.
- In that case, the title/cover might not be ideal – manual editing or alternative
  sources may be needed (planned/improvable).

---

## Author

Idea and development: **DevilishBlood**  
This tool was created primarily to make it easy to build game tierlists during streams.
