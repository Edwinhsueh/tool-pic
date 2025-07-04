'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Download, Plus, X, Type, Image as ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { HexColorPicker } from 'react-colorful'

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
  x: number
  y: number
}

interface SizePreset {
  id: string
  name: string
  width: number
  height: number
}

export default function HomePage() {
  // 状态管理
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null)
  const [textOverlays, setTextOverlays] = useState<TextData[]>([])
  const [sizePresets, setSizePresets] = useState<SizePreset[]>([
    { id: 'default', name: '默认', width: 496, height: 310 },
    { id: 'square', name: '正方形', width: 400, height: 400 },
    { id: 'banner', name: '横幅', width: 800, height: 400 },
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // 文字编辑状态
  const [currentText, setCurrentText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [textColor, setTextColor] = useState('#ffffff')
  const [selectedFont, setSelectedFont] = useState('Arial')
  const [showColorPicker, setShowColorPicker] = useState(false)

  // 自定义尺寸
  const [customWidth, setCustomWidth] = useState(800)
  const [customHeight, setCustomHeight] = useState(600)

  // 字体列表
  const fonts = ['Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Impact']

  // 压缩图片为JPG
  const compressImageToJPG = useCallback((file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx?.drawImage(img, 0, 0)
        
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
      setIsProcessing(true)
      
      if (!file.type.startsWith('image/')) {
        throw new Error('请选择图片文件')
      }

      const compressedFile = await compressImageToJPG(file)
      const img = new Image()
      
      img.onload = () => {
        const imageData: ImageData = {
          file: compressedFile,
          url: URL.createObjectURL(compressedFile),
          width: img.naturalWidth,
          height: img.naturalHeight
        }
        setCurrentImage(imageData)
        setIsProcessing(false)
      }
      
      img.src = URL.createObjectURL(compressedFile)
    } catch (error) {
      setIsProcessing(false)
      alert('处理失败，请重试')
    }
  }, [compressImageToJPG])

  // 配置dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0])
      }
    }, [processFile]),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: false
  })

  // 添加文字
  const handleAddText = useCallback(() => {
    if (!currentText.trim()) return

    const newText: TextData = {
      text: currentText,
      fontSize,
      color: textColor,
      fontFamily: selectedFont,
      x: 50,
      y: 50
    }

    setTextOverlays(prev => [...prev, newText])
    setCurrentText('')
  }, [currentText, fontSize, textColor, selectedFont])

  // 添加自定义尺寸
  const addCustomSize = useCallback(() => {
    const newSize: SizePreset = {
      id: `custom-${Date.now()}`,
      name: `${customWidth}×${customHeight}`,
      width: customWidth,
      height: customHeight
    }
    setSizePresets(prev => [...prev, newSize])
  }, [customWidth, customHeight])

  // 生成图片
  const generateImage = useCallback(async (preset: SizePreset): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx || !currentImage) return

      canvas.width = preset.width
      canvas.height = preset.height

      const img = new Image()
      img.onload = () => {
        // 绘制背景图片
        ctx.drawImage(img, 0, 0, preset.width, preset.height)

        // 绘制文字
        textOverlays.forEach((overlay) => {
          const scaledFontSize = overlay.fontSize * (preset.width / 500)
          ctx.font = `${scaledFontSize}px ${overlay.fontFamily}`
          ctx.fillStyle = overlay.color
          ctx.textAlign = 'center'
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2

          const x = (overlay.x / 100) * preset.width
          const y = (overlay.y / 100) * preset.height

          ctx.fillText(overlay.text, x, y)
        })

        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.src = currentImage.url
    })
  }, [currentImage, textOverlays])

  // 下载图片
  const downloadImage = useCallback(async (preset: SizePreset) => {
    try {
      setIsProcessing(true)
      const dataUrl = await generateImage(preset)
      
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `image_${preset.width}x${preset.height}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setShowResults(true)
    } catch (error) {
      alert('下载失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }, [generateImage])

  // 重新开始
  const createNew = useCallback(() => {
    setCurrentImage(null)
    setTextOverlays([])
    setCurrentText('')
    setShowResults(false)
    setSizePresets([
      { id: 'default', name: '默认', width: 496, height: 310 },
      { id: 'square', name: '正方形', width: 400, height: 400 },
      { id: 'banner', name: '横幅', width: 800, height: 400 },
    ])
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部标题 */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">图片模板生成器</h1>
        <p className="text-gray-600">在线编辑图片，添加文字，一键下载</p>
      </div>

      <div className="container mx-auto px-6 pb-8">
        <AnimatePresence mode="wait">
          {/* 结果页面 */}
          {showResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg max-w-md mx-auto">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">下载完成</h2>
                <p className="text-gray-600 mb-6">图片已保存到您的设备</p>
                
                <motion.button
                  onClick={createNew}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-200 transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  创建新图
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 左侧：上传和预览 */}
                <div className="space-y-6">
                  {/* 上传区域 */}
                  {!currentImage ? (
                    <div
                      {...getRootProps()}
                      className={`bg-white rounded-3xl p-12 border-2 border-dashed transition-all duration-300 cursor-pointer text-center ${
                        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <input {...getInputProps()} />
                      
                      {isProcessing ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-blue-500 animate-spin" />
                          </div>
                          <p className="text-lg font-medium text-gray-900">处理中...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-xl font-medium text-gray-900 mb-2">
                              {isDragActive ? '放下文件' : '选择图片'}
                            </p>
                            <p className="text-gray-600">
                              拖拽图片到这里或点击选择
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 图片预览 */
                    <div className="bg-white rounded-3xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">图片预览</h3>
                        <button
                          onClick={createNew}
                          className="text-gray-500 hover:text-gray-700 p-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="relative bg-gray-100 rounded-2xl overflow-hidden mb-4">
                        <img 
                          src={currentImage.url} 
                          alt="预览" 
                          className="w-full h-64 object-contain"
                        />
                        
                        {/* 文字叠加预览 */}
                        {textOverlays.map((overlay, index) => (
                          <div
                            key={index}
                            className="absolute pointer-events-none"
                            style={{
                              left: `${overlay.x}%`,
                              top: `${overlay.y}%`,
                              transform: 'translate(-50%, -50%)',
                              color: overlay.color,
                              fontSize: `${Math.max(12, overlay.fontSize * 0.5)}px`,
                              fontFamily: overlay.fontFamily,
                              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {overlay.text}
                          </div>
                        ))}
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        原始尺寸: {currentImage.width} × {currentImage.height}px
                      </p>
                    </div>
                  )}
                </div>

                {/* 右侧：设置面板 */}
                <div className="space-y-6">
                  {/* 输出尺寸 */}
                  <div className="bg-white rounded-3xl p-6">
                    <h3 className="text-lg font-semibold mb-4">输出尺寸</h3>
                    
                    <div className="grid grid-cols-1 gap-3 mb-4">
                      {sizePresets.map((preset) => (
                        <div
                          key={preset.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-xl"
                        >
                          <div>
                            <span className="font-medium">{preset.name}</span>
                            <span className="text-gray-500 ml-2">
                              {preset.width} × {preset.height}px
                            </span>
                          </div>
                          
                          <motion.button
                            onClick={() => downloadImage(preset)}
                            disabled={!currentImage || isProcessing}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                            whileHover={{ scale: currentImage && !isProcessing ? 1.05 : 1 }}
                            whileTap={{ scale: currentImage && !isProcessing ? 0.95 : 1 }}
                          >
                            <Download className="w-4 h-4" />
                            <span>{isProcessing ? '生成中...' : '下载'}</span>
                          </motion.button>
                        </div>
                      ))}
                    </div>

                    {/* 添加自定义尺寸 */}
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(Number(e.target.value))}
                          placeholder="宽度"
                          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(Number(e.target.value))}
                          placeholder="高度"
                          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <motion.button
                          onClick={addCustomSize}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* 文字设置 */}
                  <div className="bg-white rounded-3xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Type className="w-5 h-5 mr-2" />
                      添加文字
                    </h3>
                    
                    <div className="space-y-4">
                      <textarea
                        value={currentText}
                        onChange={(e) => setCurrentText(e.target.value)}
                        placeholder="输入文字内容..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">字体</label>
                          <select
                            value={selectedFont}
                            onChange={(e) => setSelectedFont(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {fonts.map(font => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            大小: {fontSize}px
                          </label>
                          <input
                            type="range"
                            min="12"
                            max="48"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">颜色</label>
                        <div className="relative">
                          <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="w-full h-10 rounded-xl border border-gray-200 flex items-center px-3"
                            style={{ backgroundColor: textColor }}
                          >
                            <div 
                              className="w-6 h-6 rounded-lg border-2 border-white"
                              style={{ backgroundColor: textColor }}
                            />
                            <span className="ml-2 text-white font-medium">{textColor}</span>
                          </button>
                          
                          {showColorPicker && (
                            <div className="absolute top-12 left-0 z-10 bg-white p-3 rounded-xl shadow-lg border">
                              <HexColorPicker color={textColor} onChange={setTextColor} />
                            </div>
                          )}
                        </div>
                      </div>

                      <motion.button
                        onClick={handleAddText}
                        disabled={!currentText.trim()}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-medium transition-all duration-200"
                        whileHover={{ scale: currentText.trim() ? 1.02 : 1 }}
                        whileTap={{ scale: currentText.trim() ? 0.98 : 1 }}
                      >
                        添加文字
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 