import React from 'react'
import { StatTile } from './StatTile'
import { cn } from '@utils/cn'

export interface KpiData {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  onClick?: () => void
}

export interface KpiGridProps {
  data: KpiData[]
  columns?: 2 | 3 | 4
  className?: string
}

const KpiGrid: React.FC<KpiGridProps> = ({
  data,
  columns = 2,
  className
}) => {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn('grid gap-4', gridClasses[columns], className)}>
      {data.map((item, index) => (
        <StatTile
          key={`${item.title}-${index}`}
          title={item.title}
          value={item.value}
          subtitle={item.subtitle}
          icon={item.icon}
          trend={item.trend}
          trendValue={item.trendValue}
          onClick={item.onClick}
        />
      ))}
    </div>
  )
}

export default KpiGrid
