import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import ffmpeg from 'fluent-ffmpeg'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('video') as unknown as File
    const mountPoint: string | null = data.get('mountPoint') as string
    const subFolder: string | null = data.get('subFolder') as string

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 })
    }

    if (!mountPoint) {
      return NextResponse.json({ error: 'No mount point specified' }, { status: 400 })
    }

    // Create necessary directories
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    
    // Use mounted volumes in container
    const baseMountDir = join(process.cwd(), 'mounts', mountPoint)
    const framesDir = subFolder 
      ? join(baseMountDir, subFolder)
      : join(baseMountDir, 'video-frames')
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    if (!existsSync(framesDir)) {
      await mkdir(framesDir, { recursive: true })
    }

    // Save uploaded video
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const filename = `video_${timestamp}.${file.name.split('.').pop()}`
    const videoPath = join(uploadsDir, filename)
    
    await writeFile(videoPath, buffer)

    // Extract frames using FFmpeg
    const outputPattern = join(framesDir, `frame_${timestamp}_%04d.png`)
    
    const frameCount = await new Promise<number>((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions([
          '-vf', 'fps=1', // Extract 1 frame per second, adjust as needed
          '-q:v', '2'     // High quality
        ])
        .output(outputPattern)
        .on('end', async () => {
          // Count extracted frames
          try {
            const files = await readdir(framesDir)
            const frameFiles = files.filter(f => f.startsWith(`frame_${timestamp}_`))
            resolve(frameFiles.length)
          } catch (error) {
            reject(error)
          }
        })
        .on('error', (error) => {
          reject(error)
        })
        .run()
    })

    // Clean up uploaded video file
    try {
      await unlink(videoPath)
    } catch (error) {
      console.warn('Failed to clean up uploaded file:', error)
    }

    return NextResponse.json({ 
      message: 'Frames extracted successfully',
      frameCount,
      outputPath: framesDir
    })

  } catch (error) {
    console.error('Error processing video:', error)
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    )
  }
}