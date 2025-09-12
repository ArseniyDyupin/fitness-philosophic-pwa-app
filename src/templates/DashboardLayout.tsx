import React from 'react'
import { cn } from '@utils/cn'

export interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  className?: string
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebar,
  header,
  className
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {header && (
        <header className="bg-white shadow-sm border-b border-gray-200">
          {header}
        </header>
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <aside className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-64">
              <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
                {sidebar}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={cn('flex-1', className)}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
