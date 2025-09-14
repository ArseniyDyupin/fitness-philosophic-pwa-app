import React from 'react'
import { cn } from '@utils/cn'

export interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  className,
  maxWidth = 'xl'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-none'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className={cn('mx-auto px-4 sm:px-6 lg:px-8 py-8', maxWidthClasses[maxWidth], className)}>
        {/* Page Header */}
        {(title || subtitle || actions) && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-2 text-sm sm:text-lg text-gray-600">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Page Content */}
        {children}
      </main>
    </div>
  )
}

export default PageLayout
