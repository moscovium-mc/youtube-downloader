# YouTube Downloader

[![Install](https://img.shields.io/badge/Install-Tampermonkey-brightgreen)](https://raw.githubusercontent.com/moscovium-mc/youtube-downloader/main/youtube-downloader.user.js)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Tampermonkey/Violentmonkey userscript that adds a download button to YouTube's video player with support for both regular videos and Shorts.

## Features

- **One-click download** - Adds download button next to YouTube's settings gear
- **Shorts support** - Floating button appears when hovering over Shorts videos
- **Auto-navigation** - Works with YouTube's SPA (Single Page Application) navigation
- **Language aware** - Detects your browser language for the download page

## Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox)

2. [Click here to install](https://raw.githubusercontent.com/moscovium-mc/youtube-downloader/main/youtube-downloader.user.js)

3. Visit any YouTube video or Short

## Usage

### Regular Videos
- Look for the download button (download icon) in the video player controls
- Located next to the settings gear icon
- Click once to open the download page

### YouTube Shorts
- Hover your mouse over the Shorts video
- A floating button with rainbow animation will appear
- Click to download

## How It Works

The script sends the current YouTube video URL to `tool77.com`, a free video download service that handles the actual downloading and conversion.

## Notes

- The download page opens in a new tab
- Supports all YouTube video formats
- Free to use, no registration required

## License

MIT License - feel free to modify and distribute

## Author

**moscovium-mc** - [GitHub](https://github.com/moscovium-mc)

---

⭐ Star this repo if you find it useful!
