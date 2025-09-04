# Video Frame Extractor

A simple Next.js application that allows you to upload video files (MOV or MP4) via drag-and-drop and extract frames as PNG images. The app runs locally in a Docker container with FFmpeg for video processing.

## Features

- 🎥 Drag-and-drop video upload (MOV, MP4)
- 📸 Automatic frame extraction to PNG files
- 🎨 Clean UI built with shadcn/ui and Tailwind CSS
- 🐳 Runs locally in Docker container
- ⚡ Built with Next.js for optimal performance

## Quick Start with Docker

1. **Build and run the Docker container:**
   ```bash
   docker-compose up --build
   ```

2. **Open your browser:**
   - Navigate to `http://localhost:3000`

3. **Upload a video:**
   - Drag and drop a MOV or MP4 file onto the upload area
   - Or click to browse and select a file

4. **Download frames:**
   - Extracted PNG frames will be available in the `public/frames` directory
   - Access them via `http://localhost:3000/frames/frame_[timestamp]_[number].png`

## Development

If you want to run the app locally without Docker:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install FFmpeg:**
   - macOS: `brew install ffmpeg`
   - Ubuntu: `sudo apt install ffmpeg`
   - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open http://localhost:3000**

## Project Structure

```
├── app/
│   ├── api/extract-frames/route.ts    # API endpoint for video processing
│   ├── globals.css                    # Global styles
│   ├── layout.tsx                     # Root layout
│   └── page.tsx                       # Home page
├── components/
│   ├── ui/                           # shadcn/ui components
│   └── video-upload.tsx              # Main upload component
├── lib/
│   └── utils.ts                      # Utility functions
├── public/
│   ├── frames/                       # Extracted frames (auto-created)
│   └── uploads/                      # Temporary uploads (auto-created)
├── Dockerfile                        # Docker configuration
├── docker-compose.yml               # Docker Compose setup
└── package.json                     # Dependencies and scripts
```

## How it works

1. **Upload**: Video files are uploaded via drag-and-drop or file selection
2. **Processing**: The API endpoint uses FFmpeg to extract frames at 1 FPS
3. **Output**: Frames are saved as PNG files with automatic numbering
4. **Cleanup**: Original video files are automatically deleted after processing

## Configuration

You can modify the frame extraction settings in `app/api/extract-frames/route.ts`:

- **Frame rate**: Change the `fps=1` parameter to extract more/fewer frames per second
- **Quality**: Adjust the `q:v` parameter (1-31, lower = higher quality)
- **Output format**: Modify the output pattern and file extension

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **FFmpeg** - Video processing
- **Docker** - Containerization