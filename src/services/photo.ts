export class PhotoService {
  async capturePhoto(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment' // Use back camera on mobile
      
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (!file) {
          reject(new Error('No file selected'))
          return
        }
        
        try {
          const base64 = await this.fileToBase64(file)
          resolve(base64)
        } catch (error) {
          reject(error)
        }
      }
      
      input.click()
    })
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Compress image if it's too large
        this.compressImage(result, 800, 600).then(resolve).catch(reject)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
    })
  }

  private compressImage(base64: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        // Calculate new dimensions
        let { width, height } = img
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/jpeg', 0.8)
        resolve(compressed)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = base64
    })
  }

  base64ToBlob(base64: string): Blob {
    const parts = base64.split(',')
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
    const bstr = atob(parts[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    
    return new Blob([u8arr], { type: mime })
  }

  getImageSize(base64: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = base64
    })
  }

  validatePhotoSize(base64: string, maxSizeMB: number = 5): boolean {
    // Rough estimation: base64 is ~33% larger than binary
    const sizeInBytes = (base64.length * 3) / 4
    const sizeInMB = sizeInBytes / (1024 * 1024)
    return sizeInMB <= maxSizeMB
  }
}

export const photoService = new PhotoService()
