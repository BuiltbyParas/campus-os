import { useMemo } from 'react'

import { cn } from '@/lib/utils'

interface SparkChartProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  showDots?: boolean
  className?: string
}

export function SparkChart({
  data,
  width = 120,
  height = 32,
  color = 'var(--color-brand)',
  showDots = true,
  className,
}: SparkChartProps) {
  const points = useMemo(() => {
    if (data.length === 0) return ''
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1 // Avoid division by zero
    
    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((d - min) / range) * height
      return `${x},${y}`
    }).join(' ')
  }, [data, width, height])

  if (data.length === 0) return null

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
    >
      <defs>
        <linearGradient id="spark-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {points && (
        <polygon
          points={`${points} ${width},${height} 0,${height}`}
          fill="url(#spark-gradient)"
        />
      )}
      
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {showDots && data.map((_, i) => {
        const pt = points.split(' ')[i].split(',')
        return (
          <circle
            key={i}
            cx={pt[0]}
            cy={pt[1]}
            r={i === data.length - 1 ? "3" : "1.5"}
            fill={i === data.length - 1 ? color : 'var(--color-surface)'}
            stroke={color}
            strokeWidth={i === data.length - 1 ? "0" : "1.5"}
          />
        )
      })}
    </svg>
  )
}
