'use client'

import React, { useState } from 'react'
import { FolderOpen, Home, HardDrive, FileText, Film } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FolderSelection {
  mountPoint: string
  subFolder: string
  displayName: string
}

interface FolderSelectionDialogProps {
  currentSelection: FolderSelection
  onSelectionChange: (selection: FolderSelection) => void
  children: React.ReactNode
}

export function FolderSelectionDialog({
  currentSelection,
  onSelectionChange,
  children,
}: FolderSelectionDialogProps) {
  const [tempSelection, setTempSelection] = useState(currentSelection)
  const [isOpen, setIsOpen] = useState(false)

  const handleSave = () => {
    onSelectionChange(tempSelection)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempSelection(currentSelection)
    setIsOpen(false)
  }

  const setQuickSelection = (mountPoint: string, subFolder: string = 'video-frames') => {
    const displayName = `${mountPoint}/${subFolder}`
    setTempSelection({ mountPoint, subFolder, displayName })
  }

  const availableMounts = [
    { key: 'Downloads', label: 'Downloads Folder', icon: Home },
    { key: 'Desktop', label: 'Desktop Folder', icon: HardDrive },
    { key: 'Documents', label: 'Documents Folder', icon: FileText },
    { key: 'Movies', label: 'Movies Folder', icon: Film },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Select Output Folder
          </DialogTitle>
          <DialogDescription>
            Choose where to save the extracted video frames from the available mounted directories.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Available Locations</Label>
            <div className="grid grid-cols-1 gap-2">
              {availableMounts.map((mount) => {
                const Icon = mount.icon
                return (
                  <Button
                    key={mount.key}
                    variant={tempSelection.mountPoint === mount.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setQuickSelection(mount.key)}
                    className="justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {mount.label}
                    <span className="ml-auto text-xs text-muted-foreground">
                      ~/{mount.key}/video-frames
                    </span>
                  </Button>
                )
              })}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="subfolder">Subfolder Name</Label>
            <Input
              id="subfolder"
              type="text"
              value={tempSelection.subFolder}
              onChange={(e) => setTempSelection(prev => ({
                ...prev,
                subFolder: e.target.value,
                displayName: `${prev.mountPoint}/${e.target.value}`
              }))}
              placeholder="video-frames"
              className="text-sm"
            />
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Selected path:</strong></p>
            <code className="block bg-muted p-2 rounded text-xs">
              ~/{tempSelection.mountPoint}/{tempSelection.subFolder}
            </code>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Path
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}