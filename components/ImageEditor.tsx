'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Crop, RotateCw, Maximize2, ArrowLeft, ArrowRight } from 'lucide-react'

interface ImageData {
  file: File
  url: string
  width: number
  height: number
}

interface ImageEditorProps {
  imageData: ImageData
  onImageUpdate: (imageData: ImageData) => void
  onNext: () => void
  onBack: () => void
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export default function ImageEditor({ imageData, onImageUpdate, onNext, onBack }: ImageEditorProps) {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 应用裁剪
  const applyCrop = useCallback(async () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // 计算实际裁剪区域
      const scaleX = img.naturalWidth / canvas.offsetWidth
      const scaleY = img.naturalHeight / canvas.offsetHeight
      
      const actualCrop = {
        x: cropArea.x * scaleX,
        y: cropArea.y * scaleY,
        width: cropArea.width * scaleX,
        height: cropArea.height * scaleY
      }

      // 设置canvas尺寸为裁剪区域大小
      canvas.width = actualCrop.width
      canvas.height = actualCrop.height

      // 绘制裁剪后的图片
      ctx.drawImage(
        img,
        actualCrop.x, actualCrop.y, actualCrop.width, actualCrop.height,
        0, 0, actualCrop.width, actualCrop.height
      )

      // 转换为Blob并更新图片数据
      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], imageData.file.name, { type: 'image/jpeg' })
          const newImageData: ImageData = {
            file: newFile,
            url: URL.createObjectURL(newFile),
            width: actualCrop.width,
            height: actualCrop.height
          }
          onImageUpdate(newImageData)
        }
      }, 'image/jpeg', 0.9)
    }
    
    img.src = imageData.url
  }, [cropArea, imageData, onImageUpdate])

  // 处理鼠标事件
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(rect.width - prev.width, prev.x + deltaX)),
      y: Math.max(0, Math.min(rect.height - prev.height, prev.y + deltaY))
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">编辑图片</h2>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={onBack}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </motion.button>
          <motion.button
            onClick={onNext}
            className="btn-primary flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>下一步</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* 图片编辑区域 */}
      <div className="space-y-6">
        {/* 预览区域 */}
        <div 
          ref={containerRef}
          className="relative bg-gray-100 rounded-2xl overflow-hidden"
          style={{ height: '400px' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img 
            src={imageData.url} 
            alt="编辑预览" 
            className="w-full h-full object-contain"
          />
          
          {/* 裁剪遮罩 */}
          <div 
            className="absolute border-2 border-primary-500 bg-primary-500/20 cursor-move"
            style={{
              left: `${cropArea.x}px`,
              top: `${cropArea.y}px`,
              width: `${cropArea.width}px`,
              height: `${cropArea.height}px`
            }}
            onMouseDown={handleMouseDown}
          >
            {/* 调整手柄 */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary-500 rounded-full cursor-nw-resize" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full cursor-ne-resize" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary-500 rounded-full cursor-sw-resize" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-500 rounded-full cursor-se-resize" />
          </div>
        </div>

        {/* 控制面板 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 裁剪控制 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Crop className="w-4 h-4 mr-2" />
              裁剪设置
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">宽度</label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={cropArea.width}
                  onChange={(e) => setCropArea(prev => ({ ...prev, width: Number(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{cropArea.width}px</span>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">高度</label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={cropArea.height}
                  onChange={(e) => setCropArea(prev => ({ ...prev, height: Number(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{cropArea.height}px</span>
              </div>
            </div>
          </div>

          {/* 快速预设 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Maximize2 className="w-4 h-4 mr-2" />
              快速预设
            </h3>
            <div className="space-y-2">
              {[
                { name: '正方形', ratio: 1 },
                { name: '横幅 16:9', ratio: 16/9 },
                { name: '竖版 3:4', ratio: 3/4 },
              ].map((preset) => (
                <motion.button
                  key={preset.name}
                  onClick={() => {
                    const size = Math.min(200, 200 / preset.ratio)
                    setCropArea(prev => ({ 
                      ...prev, 
                      width: size * preset.ratio, 
                      height: size 
                    }))
                  }}
                  className="w-full text-left px-3 py-2 text-sm bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {preset.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-3">操作</h3>
            <div className="space-y-2">
              <motion.button
                onClick={applyCrop}
                className="w-full btn-primary text-sm py-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                应用裁剪
              </motion.button>
              <motion.button
                onClick={() => setCropArea({ x: 0, y: 0, width: 100, height: 100 })}
                className="w-full btn-secondary text-sm py-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                重置
              </motion.button>
            </div>
          </div>
        </div>

        {/* 隐藏的canvas用于图片处理 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
} 