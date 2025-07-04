'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Type, Upload, Palette, AlignLeft, AlignCenter, AlignRight, ArrowLeft, ArrowRight } from 'lucide-react'
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

interface TextOverlayProps {
  imageData: ImageData
  textOverlays: TextData[]
  customFonts: string[]
  onAddText: (textData: TextData) => void
  onFontUpload: (fontName: string) => void
  onNext: () => void
  onBack: () => void
}

export default function TextOverlay({ 
  imageData, 
  textOverlays, 
  customFonts, 
  onAddText, 
  onFontUpload, 
  onNext, 
  onBack 
}: TextOverlayProps) {
  const [currentText, setCurrentText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [textColor, setTextColor] = useState('#000000')
  const [selectedFont, setSelectedFont] = useState('Arial')
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center')
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 })
  const [margins, setMargins] = useState({ top: 20, right: 20, bottom: 20, left: 20 })
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isDraggingText, setIsDraggingText] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 预设字体列表
  const systemFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 
    'Verdana', 'Tahoma', 'Impact', 'Comic Sans MS',
    'Courier New', 'Lucida Console'
  ]

  // 处理字体文件上传
  const handleFontUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'font/woff' && file.type !== 'font/woff2' && 
        !file.name.endsWith('.ttf') && !file.name.endsWith('.otf')) {
      alert('请上传字体文件 (.ttf, .otf, .woff, .woff2)')
      return
    }

    const fontName = file.name.replace(/\.[^/.]+$/, '')
    
    // 创建字体URL并加载
    const fontUrl = URL.createObjectURL(file)
    const fontFace = new FontFace(fontName, `url(${fontUrl})`)
    
    fontFace.load().then(() => {
      document.fonts.add(fontFace)
      onFontUpload(fontName)
      setSelectedFont(fontName)
    }).catch(() => {
      alert('字体加载失败')
    })
  }, [onFontUpload])

  // 添加文字叠加
  const handleAddText = useCallback(() => {
    if (!currentText.trim()) return

    const textData: TextData = {
      text: currentText,
      fontSize,
      color: textColor,
      fontFamily: selectedFont,
      align: textAlign,
      x: textPosition.x,
      y: textPosition.y,
      margin: margins
    }

    onAddText(textData)
    setCurrentText('')
  }, [currentText, fontSize, textColor, selectedFont, textAlign, textPosition, margins, onAddText])

  // 处理文字位置拖拽
  const handleTextDrag = useCallback((e: React.MouseEvent) => {
    if (!isDraggingText) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setTextPosition({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    })
  }, [isDraggingText])

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">添加文字</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：预览区域 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">预览效果</h3>
          <div 
            className="relative bg-gray-100 rounded-2xl overflow-hidden cursor-crosshair"
            style={{ aspectRatio: `${imageData.width}/${imageData.height}` }}
            onMouseMove={handleTextDrag}
            onMouseDown={() => setIsDraggingText(true)}
            onMouseUp={() => setIsDraggingText(false)}
            onMouseLeave={() => setIsDraggingText(false)}
          >
            <img 
              src={imageData.url} 
              alt="预览" 
              className="w-full h-full object-cover"
            />
            
            {/* 显示已存在的文字叠加 */}
            {textOverlays.map((overlay, index) => (
              <div
                key={index}
                className="absolute pointer-events-none"
                style={{
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  transform: 'translate(-50%, -50%)',
                  color: overlay.color,
                  fontSize: `${overlay.fontSize}px`,
                  fontFamily: overlay.fontFamily,
                  textAlign: overlay.align,
                  marginTop: `${overlay.margin.top}px`,
                  marginRight: `${overlay.margin.right}px`,
                  marginBottom: `${overlay.margin.bottom}px`,
                  marginLeft: `${overlay.margin.left}px`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap'
                }}
              >
                {overlay.text}
              </div>
            ))}
            
            {/* 显示当前编辑的文字 */}
            {currentText && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${textPosition.x}%`,
                  top: `${textPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  color: textColor,
                  fontSize: `${fontSize}px`,
                  fontFamily: selectedFont,
                  textAlign: textAlign,
                  marginTop: `${margins.top}px`,
                  marginRight: `${margins.right}px`,
                  marginBottom: `${margins.bottom}px`,
                  marginLeft: `${margins.left}px`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap'
                }}
              >
                {currentText}
              </div>
            )}
            
            {/* 位置指示器 */}
            <div
              className="absolute w-2 h-2 bg-primary-500 rounded-full pointer-events-none"
              style={{
                left: `${textPosition.x}%`,
                top: `${textPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
        </div>

        {/* 右侧：文字设置面板 */}
        <div className="space-y-6">
          {/* 文字输入 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Type className="w-4 h-4 mr-2" />
              文字内容
            </h3>
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="输入要添加的文字..."
              className="input-field resize-none"
              rows={3}
            />
            <motion.button
              onClick={handleAddText}
              disabled={!currentText.trim()}
              className="btn-primary w-full mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: currentText.trim() ? 1.02 : 1 }}
              whileTap={{ scale: currentText.trim() ? 0.98 : 1 }}
            >
              添加文字到图片
            </motion.button>
          </div>

          {/* 字体设置 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-3">字体设置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">字体</label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="input-field"
                >
                  <optgroup label="系统字体">
                    {systemFonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </optgroup>
                  {customFonts.length > 0 && (
                    <optgroup label="自定义字体">
                      {customFonts.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  字体大小: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">上传自定义字体</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={handleFontUpload}
                  className="hidden"
                />
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className="w-4 h-4" />
                  <span>选择字体文件</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* 颜色和对齐 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-3">样式设置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">文字颜色</label>
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-full h-10 rounded-xl border border-gray-200 flex items-center px-3 space-x-2"
                    style={{ backgroundColor: textColor }}
                  >
                    <div 
                      className="w-6 h-6 rounded-lg border border-white"
                      style={{ backgroundColor: textColor }}
                    />
                    <span className="text-white text-shadow">{textColor}</span>
                  </button>
                  {showColorPicker && (
                    <div className="absolute top-12 left-0 z-10 bg-white p-3 rounded-xl shadow-apple-lg border">
                      <HexColorPicker color={textColor} onChange={setTextColor} />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">文字对齐</label>
                <div className="flex space-x-2">
                  {[
                    { value: 'left', icon: AlignLeft, label: '左对齐' },
                    { value: 'center', icon: AlignCenter, label: '居中' },
                    { value: 'right', icon: AlignRight, label: '右对齐' },
                  ].map((align) => (
                    <motion.button
                      key={align.value}
                      onClick={() => setTextAlign(align.value as any)}
                      className={`flex-1 p-2 rounded-xl border transition-colors ${
                        textAlign === align.value 
                          ? 'border-primary-500 bg-primary-50 text-primary-600' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title={align.label}
                    >
                      <align.icon className="w-4 h-4 mx-auto" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 边距设置 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-3">边距设置</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(margins).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs text-gray-600 mb-1 capitalize">
                    {key === 'top' ? '上' : key === 'right' ? '右' : key === 'bottom' ? '下' : '左'}: {value}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={value}
                    onChange={(e) => setMargins(prev => ({ 
                      ...prev, 
                      [key]: Number(e.target.value) 
                    }))}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 