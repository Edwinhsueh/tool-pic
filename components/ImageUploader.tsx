'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react'

interface ImageData {
  file: File
  url: string
  width: number
  height: number
}

interface ImageUploaderProps {
  onImageUpload: (imageData: ImageData) => void
  onNext: () => void
}

export default function ImageUploader({ onImageUpload, onNext }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // 处理图片压缩为JPG格式
  const compressImageToJPG = useCallback((file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // 设置canvas尺寸
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        
        // 绘制图片到canvas
        ctx?.drawImage(img, 0, 0)
        
        // 转换为JPG格式，质量0.8
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], 
              file.name.replace(/\.[^/.]+$/, '.jpg'), 
              { type: 'image/jpeg' }
            )
            resolve(compressedFile)
          }
        }, 'image/jpeg', 0.8)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }, [])

  // 处理文件上传
  const processFile = useCallback(async (file: File) => {
    try {
      setIsUploading(true)
      setUploadError(null)

      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        throw new Error('请选择图片文件')
      }

      // 检查文件大小 (限制10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('图片文件不能超过10MB')
      }

      // 压缩图片为JPG
      const compressedFile = await compressImageToJPG(file)
      
      // 获取图片尺寸
      const img = new Image()
      img.onload = () => {
        const imageData: ImageData = {
          file: compressedFile,
          url: URL.createObjectURL(compressedFile),
          width: img.naturalWidth,
          height: img.naturalHeight
        }
        
        setPreviewUrl(imageData.url)
        onImageUpload(imageData)
        setIsUploading(false)
      }
      
      img.src = URL.createObjectURL(compressedFile)

    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '上传失败')
      setIsUploading(false)
    }
  }, [compressImageToJPG, onImageUpload])

  // 配置react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0])
      }
    }, [processFile]),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false
  })

  return (
    <div className="card p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">上传图片</h2>
        <p className="text-gray-600">
          支持 JPG、PNG、GIF 等格式，自动压缩为 JPG 格式
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!previewUrl ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${
              isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            }`}
          >
            <input {...getInputProps()} />
            
            <div className="py-12 text-center">
              {isUploading ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary-500 animate-spin-slow" />
                  </div>
                  <div>
                    <div className="text-lg font-medium text-gray-900 mb-1">
                      正在处理...
                    </div>
                    <div className="text-sm text-gray-600">
                      压缩图片并生成预览
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-lg font-medium text-gray-900 mb-1">
                      {isDragActive ? '放下文件开始上传' : '拖拽图片到这里'}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      或者 <span className="text-primary-500 font-medium">点击选择文件</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      支持 JPG、PNG、GIF 格式，最大 10MB
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-gray-100 rounded-2xl p-4">
              <img 
                src={previewUrl} 
                alt="上传预览" 
                className="w-full h-64 object-contain rounded-xl"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <motion.button
                onClick={() => {
                  setPreviewUrl(null)
                  setUploadError(null)
                }}
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                重新选择
              </motion.button>
              
              <motion.button
                onClick={onNext}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                下一步：编辑图片
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700">{uploadError}</span>
        </motion.div>
      )}
    </div>
  )
} 