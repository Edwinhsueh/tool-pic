'use client'

import { motion } from 'framer-motion'

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-apple border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">📷</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 text-shadow">
                图片模板生成器
              </h1>
              <p className="text-sm text-gray-600">
                企业内部图片编辑工具
              </p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="#" 
              className="text-gray-600 hover:text-primary-500 transition-colors duration-200 font-medium"
            >
              使用帮助
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-primary-500 transition-colors duration-200 font-medium"
            >
              反馈建议
            </a>
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              保存模板
            </motion.button>
          </nav>
        </motion.div>
      </div>
    </header>
  )
} 