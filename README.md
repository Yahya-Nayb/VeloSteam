# 🚀 VeloStream Engine

**VeloStream** is a high-performance, Next.js-powered media tunneling engine designed to extract and merge high-bitrate video and audio streams directly from YouTube to the user. Built for speed and quality, it bypasses standard resolution limits using advanced stream merging via FFmpeg.

---

## 🌟 Key Features

- **⚡ Real-Time Tunneling:** Streams data directly from source to user without storing heavy files on the server.
- **🎬 1080p HD Merging:** Automatically merges separate high-quality video and audio tracks.
- **🎵 Ultra-Fast MP3 Extraction:** High-fidelity audio processing with metadata support.
- **🐧 Ubuntu Optimized:** Fully compatible with Linux environments and system-level FFmpeg.
- **📊 Live Diagnostics:** Detailed terminal logging for bitrate, resolution, and process status.

---

## 🛠️ Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

---

## 🚀 Getting Started

### 1. Prerequisites (Ubuntu/Linux)

Ensure you have the core processing engines installed:

```bash
# Install FFmpeg
sudo apt update && sudo apt install ffmpeg -y

# Install/Update yt-dlp
sudo wget [https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp](https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp) -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### 2. Installation

```bash
# Clone the repository
git clone [https://github.com/Yahya-Nayb/velo-stream.git](https://github.com/Yahya-Nayb/velo-stream.git)

# Install dependencies
npm install

# Run the development server
npm run dev
```

⚙️ How it Works

1. Request: User submits a URL and selects quality (e.g., 1080p).

2. Extraction: The VeloStream Engine identifies the highest bitrate avc1 video and m4a audio streams.

3. Merging: FFmpeg pipes both streams into a single MP4 container on-the-fly.

4. Delivery: The merged file is streamed to the browser using a ReadableStream for an instant download experience.

📝 Roadmap

[ ] Support for Playlist downloads.

[ ] Adaptive Bitrate (ABR) selection.

[ ] Browser extension for one-click downloading.

[ ] Enhanced Mobile-first UI.

Developed with ⚡ by Yahya Nayb (Full Stack Developer)
