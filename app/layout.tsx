import type { Metadata } from 'next'
import { StagewiseToolbar } from '@stagewise/toolbar-next'
import { ReactPlugin } from '@stagewise-plugins/react'
import './globals.css'

export const metadata: Metadata = {
  title: '图片模板生成器 | 企业内部工具',
  description: '简易的在线图片模板生成工具，支持图片编辑、文字叠加、多尺寸预览等功能',
  keywords: '图片编辑,模板生成,企业工具,图片压缩',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sf antialiased">
        <StagewiseToolbar 
          config={{
            plugins: [ReactPlugin]
          }}
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </div>
      </body>
    </html>
  )
} 