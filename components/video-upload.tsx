'use client'

import React, { useState, useCallback } from 'react'
import { Upload, FileVideo, Loader2, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderSelectionDialog } from '@/components/folder-selection-dialog'

interface FolderSelection {
  mountPoint: string
  subFolder: string
  displayName: string
}

interface ProcessingStatus {
  isProcessing: boolean
  progress?: string
  frameCount?: number
  outputPath?: string
  error?: string
}

export function VideoUpload() {
  const [dragActive, setDragActive] = useState(false)
  const [status, setStatus] = useState<ProcessingStatus>({ isProcessing: false })
  const [folderSelection, setFolderSelection] = useState<FolderSelection>({
    mountPoint: 'Downloads',
    subFolder: 'video-frames',
    displayName: 'Downloads/video-frames'
  })

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const videoFile = files.find(file => 
      file.type.startsWith('video/') || 
      file.name.toLowerCase().endsWith('.mov') ||
      file.name.toLowerCase().endsWith('.mp4')
    )
    
    if (videoFile) {
      processVideo(videoFile)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processVideo(file)
    }
  }, [])

  const processVideo = async (file: File) => {
    setStatus({ isProcessing: true, progress: 'Uploading video...' })
    
    const formData = new FormData()
    formData.append('video', file)
    formData.append('mountPoint', folderSelection.mountPoint)
    formData.append('subFolder', folderSelection.subFolder)
    
    try {
      const response = await fetch('/api/extract-frames', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to process video')
      }
      
      const result = await response.json()
      setStatus({ 
        isProcessing: false, 
        frameCount: result.frameCount,
        outputPath: `~/${folderSelection.mountPoint}/${folderSelection.subFolder}`,
        progress: `Successfully extracted ${result.frameCount} frames!`
      })
    } catch (error) {
      setStatus({ 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileVideo className="h-6 w-6" />
          Video Frame Extractor
        </CardTitle>
        <CardDescription>
          Upload a video file (MOV or MP4) to extract frames as PNG images
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium">Output Folder</p>
            <p className="text-xs text-muted-foreground truncate max-w-md">
              ~/{folderSelection.displayName}
            </p>
          </div>
          <FolderSelectionDialog
            currentSelection={folderSelection}
            onSelectionChange={setFolderSelection}
          >
            <Button
              variant="outline"
              size="sm"
              disabled={status.isProcessing}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Change
            </Button>
          </FolderSelectionDialog>
        </div>
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
            ${status.isProcessing ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:border-primary'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('video-input')?.click()}
        >
          <input
            id="video-input"
            type="file"
            accept="video/*,.mov,.mp4"
            onChange={handleFileInput}
            className="hidden"
            disabled={status.isProcessing}
          />
          
          {status.isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div>
                <p className="text-lg font-medium">Processing Video</p>
                <p className="text-muted-foreground">{status.progress}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Drop your video here</p>
                <p className="text-muted-foreground">or click to browse files</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports MOV and MP4 formats
                </p>
              </div>
            </div>
          )}
        </div>
        
        {status.error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive font-medium">Error:</p>
            <p className="text-destructive text-sm">{status.error}</p>
          </div>
        )}
        
        {status.frameCount && !status.isProcessing && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">Success!</p>
            <p className="text-green-700 text-sm">
              Extracted {status.frameCount} frames to: <br />
              <code className="text-xs bg-green-100 px-1 py-0.5 rounded">
                {status.outputPath}
              </code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}