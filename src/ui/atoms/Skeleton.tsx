import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const cn = (...inputs: (string | undefined | null | boolean)[]) => twMerge(clsx(inputs))

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
  animate?: boolean
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = true,
  animate = true
}) => {
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        rounded && 'rounded',
        animate && 'animate-pulse',
        className
      )}
      style={{
        width: width || '100%',
        height: height || '1rem'
      }}
    />
  )
}

// Predefined skeleton components
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="0.75rem"
        width={i === lines - 1 ? '75%' : '100%'}
      />
    ))}
  </div>
)

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 space-y-3', className)}>
    <Skeleton height="1.5rem" width="60%" />
    <SkeletonText lines={3} />
    <div className="flex space-x-2">
      <Skeleton height="2rem" width="4rem" />
      <Skeleton height="2rem" width="4rem" />
    </div>
  </div>
)

export const SkeletonButton: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton height="2.5rem" width="6rem" className={className} />
)

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }
  
  return (
    <Skeleton
      height="100%"
      width="100%"
      rounded
      className={cn(sizeClasses[size], className)}
    />
  )
}

export const SkeletonTable: React.FC<{ 
  rows?: number
  columns?: number
  className?: string 
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            height="1rem"
            width={colIndex === 0 ? '20%' : colIndex === columns - 1 ? '15%' : '25%'}
          />
        ))}
      </div>
    ))}
  </div>
)

export default Skeleton
