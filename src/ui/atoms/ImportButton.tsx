import React, { useRef } from 'react'
import Button from './Button'
import { Upload } from 'lucide-react'

export interface ImportButtonProps {
  onFileSelect: (file: File) => void
  loading?: boolean
  disabled?: boolean
  accept?: string
  children?: React.ReactNode
  className?: string
}

const ImportButton: React.FC<ImportButtonProps> = ({
  onFileSelect,
  loading = false,
  disabled = false,
  accept = '.json',
  children,
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
    // Reset input value to allow selecting the same file again
    event.target.value = ''
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleClick}
        loading={loading}
        disabled={disabled}
        className={className}
      >
        <Upload size={16} className="mr-2" />
        {children || 'Import'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}

export default ImportButton
