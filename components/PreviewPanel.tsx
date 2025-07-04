'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Plus, X, Monitor, Smartphone, Tablet, ArrowLeft } from 'lucide-react'

interface ImageData {
  file: File
  url: string
  width: number
  height: number
}

interface TextData {
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

interface SizePreset {
  id: string
  name: string
  width: number
  height: number
  isCustom?: boolean
}

interface PreviewPanelProps {
  imageData: ImageData
  textOverlays: TextData[]
  sizePresets: SizePreset[]
  onAddCustomSize: (size: Omit<SizePreset, 'id'>) => void
  onBack: () => void
}

export default function PreviewPanel({ 
  imageData, 
  textOverlays, 
  sizePresets, 
  onAddCustomSize, 
  onBack 
}: PreviewPanelProps) {
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customWidth, setCustomWidth] = useState(800)
  const [customHeight, setCustomHeight] = useState(600)
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 生成包含文字叠加的图片
  const generateImageWithText = useCallback(async (targetWidth: number, targetHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = targetWidth
      canvas.height = targetHeight

      const img = new Image()
      img.onload = () => {
        // 绘制背景图片
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        // 绘制文字叠加
        textOverlays.forEach((overlay) => {
          ctx.font = `${overlay.fontSize * (targetWidth / imageData.width)}px ${overlay.fontFamily}`
          ctx.fillStyle = overlay.color
          ctx.textAlign = overlay.align
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2

          const x = (overlay.x / 100) * targetWidth
          const y = (overlay.y / 100) * targetHeight

          ctx.fillText(overlay.text, x, y)
        })

        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.src = imageData.url
    })
  }, [imageData, textOverlays])

  // 下载图片
  const downloadImage = useCallback(async (preset: SizePreset) => {
    try {
      setIsGenerating(true)
      const dataUrl = await generateImageWithText(preset.width, preset.height)
      
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${preset.name}_${preset.width}x${preset.height}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }, [generateImageWithText])

  // 批量下载所有尺寸
  const downloadAllSizes = useCallback(async () => {
    try {
      setIsGenerating(true)
      
      for (const preset of sizePresets) {
        const dataUrl = await generateImageWithText(preset.width, preset.height)
        
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `${preset.name}_${preset.width}x${preset.height}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 延迟避免浏览器阻止多个下载
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error('批量下载失败:', error)
      alert('批量下载失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }, [sizePresets, generateImageWithText])

  // 添加自定义尺寸
  const handleAddCustomSize = useCallback(() => {
    if (!customName.trim() || customWidth <= 0 || customHeight <= 0) {
      alert('请填写完整的尺寸信息')
      return
    }

    onAddCustomSize({
      name: customName,
      width: customWidth,
      height: customHeight,
      isCustom: true
    })

    // 重置表单
    setCustomName('')
    setCustomWidth(800)
    setCustomHeight(600)
    setShowAddCustom(false)
  }, [customName, customWidth, customHeight, onAddCustomSize])

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">预览与下载</h2>
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
            onClick={downloadAllSizes}
            disabled={isGenerating}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            whileHover={{ scale: isGenerating ? 1 : 1.05 }}
            whileTap={{ scale: isGenerating ? 1 : 0.95 }}
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? '生成中...' : '下载全部'}</span>
          </motion.button>
        </div>
      </div>

      {/* 添加自定义尺寸 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">输出尺寸</h3>
          <motion.button
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="btn-secondary flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            <span>自定义尺寸</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showAddCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 rounded-xl p-4 mb-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">名称</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="例: 微信头像"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">宽度 (px)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    min="1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">高度 (px)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    min="1"
                    className="input-field"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <motion.button
                    onClick={handleAddCustomSize}
                    className="btn-primary flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    添加
                  </motion.button>
                  <motion.button
                    onClick={() => setShowAddCustom(false)}
                    className="btn-secondary p-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 预览网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sizePresets.map((preset) => (
          <motion.div
            key={preset.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="card-hover p-4"
          >
            {/* 预设信息 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {preset.width > preset.height ? (
                  <Monitor className="w-4 h-4 text-gray-500" />
                ) : preset.width === preset.height ? (
                  <Tablet className="w-4 h-4 text-gray-500" />
                ) : (
                  <Smartphone className="w-4 h-4 text-gray-500" />
                )}
                <span className="font-medium text-gray-900">{preset.name}</span>
                {preset.isCustom && (
                  <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
                    自定义
                  </span>
                )}
              </div>
            </div>

            {/* 尺寸信息 */}
            <div className="text-sm text-gray-600 mb-3">
              {preset.width} × {preset.height} px
              <span className="ml-2 text-gray-400">
                ({(preset.width / preset.height).toFixed(2)})
              </span>
            </div>

            {/* 预览图 */}
            <div 
              className="bg-gray-100 rounded-xl mb-4 overflow-hidden"
              style={{ 
                aspectRatio: `${preset.width}/${preset.height}`,
                maxHeight: '200px'
              }}
            >
              <div className="relative w-full h-full">
                <img 
                  src={imageData.url} 
                  alt={`${preset.name} 预览`}
                  className="w-full h-full object-cover"
                />
                
                {/* 文字叠加预览 */}
                {textOverlays.map((overlay, index) => (
                  <div
                    key={index}
                    className="absolute pointer-events-none text-white"
                    style={{
                      left: `${overlay.x}%`,
                      top: `${overlay.y}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${Math.max(8, overlay.fontSize * 0.3)}px`,
                      fontFamily: overlay.fontFamily,
                      textAlign: overlay.align,
                      color: overlay.color,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {overlay.text}
                  </div>
                ))}
              </div>
            </div>

            {/* 下载按钮 */}
            <motion.button
              onClick={() => downloadImage(preset)}
              disabled={isGenerating}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
              whileHover={{ scale: isGenerating ? 1 : 1.02 }}
              whileTap={{ scale: isGenerating ? 1 : 0.98 }}
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? '生成中...' : '下载'}</span>
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* 使用提示 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 使用提示</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 点击单个预览卡片的下载按钮可下载对应尺寸的图片</li>
          <li>• 使用"下载全部"按钮可一次性下载所有尺寸的图片</li>
          <li>• 自定义尺寸会保存在本次会话中，可重复使用</li>
          <li>• 所有图片都会自动转换为JPG格式并进行压缩</li>
        </ul>
      </div>

      {/* 隐藏的canvas用于图片生成 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
} 