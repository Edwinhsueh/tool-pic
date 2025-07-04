/**
 * 图片处理工具函数
 * 提供图片压缩、尺寸调整、格式转换等功能
 */

// 图片数据接口
export interface ImageData {
  file: File
  url: string
  width: number
  height: number
}

// 文字叠加数据接口
export interface TextOverlay {
  text: string
  fontSize: number
  color: string
  fontFamily: string
  align: 'left' | 'center' | 'right'
  x: number
  y: number
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

/**
 * 压缩图片为 JPG 格式
 * @param file 原始图片文件
 * @param quality 压缩质量 (0-1)
 * @returns 压缩后的 JPG 文件
 */
export const compressImageToJPG = (file: File, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      try {
        // 设置 canvas 尺寸为图片原始尺寸
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        
        // 在 canvas 上绘制图片
        ctx?.drawImage(img, 0, 0)
        
        // 转换为 JPG 格式
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File(
              [blob], 
              file.name.replace(/\.[^/.]+$/, '.jpg'), 
              { type: 'image/jpeg' }
            )
            resolve(compressedFile)
          } else {
            reject(new Error('图片压缩失败'))
          }
        }, 'image/jpeg', quality)
        
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 获取图片尺寸信息
 * @param file 图片文件
 * @returns 图片尺寸信息
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    
    img.onerror = () => {
      reject(new Error('无法获取图片尺寸'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 裁剪图片
 * @param imageUrl 图片 URL
 * @param cropArea 裁剪区域
 * @param outputSize 输出尺寸
 * @returns 裁剪后的图片 DataURL
 */
export const cropImage = (
  imageUrl: string,
  cropArea: { x: number; y: number; width: number; height: number },
  outputSize?: { width: number; height: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    if (!ctx) {
      reject(new Error('Canvas context 不可用'))
      return
    }
    
    img.onload = () => {
      try {
        // 设置输出尺寸
        const outputWidth = outputSize?.width || cropArea.width
        const outputHeight = outputSize?.height || cropArea.height
        
        canvas.width = outputWidth
        canvas.height = outputHeight
        
        // 绘制裁剪后的图片
        ctx.drawImage(
          img,
          cropArea.x, cropArea.y, cropArea.width, cropArea.height,
          0, 0, outputWidth, outputHeight
        )
        
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }
    
    img.src = imageUrl
  })
}

/**
 * 生成包含文字叠加的图片
 * @param imageUrl 原始图片 URL
 * @param textOverlays 文字叠加数组
 * @param outputSize 输出尺寸
 * @returns 包含文字的图片 DataURL
 */
export const generateImageWithText = (
  imageUrl: string,
  textOverlays: TextOverlay[],
  outputSize: { width: number; height: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    if (!ctx) {
      reject(new Error('Canvas context 不可用'))
      return
    }
    
    img.onload = () => {
      try {
        // 设置 canvas 尺寸
        canvas.width = outputSize.width
        canvas.height = outputSize.height
        
        // 绘制背景图片
        ctx.drawImage(img, 0, 0, outputSize.width, outputSize.height)
        
        // 绘制文字叠加
        textOverlays.forEach((overlay) => {
          // 计算字体大小比例
          const fontSizeRatio = outputSize.width / 500 // 假设基准宽度为 500px
          const scaledFontSize = overlay.fontSize * fontSizeRatio
          
          // 设置字体样式
          ctx.font = `${scaledFontSize}px ${overlay.fontFamily}`
          ctx.fillStyle = overlay.color
          ctx.textAlign = overlay.align
          
          // 设置文字阴影
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2
          
          // 计算文字位置
          const x = (overlay.x / 100) * outputSize.width
          const y = (overlay.y / 100) * outputSize.height
          
          // 应用边距
          const marginX = overlay.margin.left - overlay.margin.right
          const marginY = overlay.margin.top - overlay.margin.bottom
          
          // 绘制文字
          ctx.fillText(overlay.text, x + marginX, y + marginY)
          
          // 清除阴影设置，避免影响下一个文字
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        })
        
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }
    
    img.src = imageUrl
  })
}

/**
 * 下载图片文件
 * @param dataUrl 图片 DataURL
 * @param filename 文件名
 */
export const downloadImage = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 验证图片文件格式
 * @param file 文件对象
 * @returns 是否为支持的图片格式
 */
export const isValidImageFile = (file: File): boolean => {
  const validTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp'
  ]
  return validTypes.includes(file.type)
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 计算图片的显示尺寸（保持宽高比）
 * @param originalWidth 原始宽度
 * @param originalHeight 原始高度
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @returns 计算后的显示尺寸
 */
export const calculateDisplaySize = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight
  
  let displayWidth = originalWidth
  let displayHeight = originalHeight
  
  // 如果宽度超出限制，按宽度缩放
  if (displayWidth > maxWidth) {
    displayWidth = maxWidth
    displayHeight = displayWidth / aspectRatio
  }
  
  // 如果高度仍然超出限制，按高度缩放
  if (displayHeight > maxHeight) {
    displayHeight = maxHeight
    displayWidth = displayHeight * aspectRatio
  }
  
  return {
    width: Math.round(displayWidth),
    height: Math.round(displayHeight)
  }
} 