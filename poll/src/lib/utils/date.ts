/**
 * Utility functions for consistent date formatting across the application
 * to prevent hydration errors between server and client rendering
 */

export function formatDate(date: string | Date, options?: {
  includeTime?: boolean
  relative?: boolean
}): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (options?.relative) {
    return formatRelativeDate(dateObj)
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(options?.includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return dateObj.toLocaleDateString('en-US', formatOptions)
}

export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInHours = diffInMs / (1000 * 60 * 60)
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays)
    return `${days} day${days === 1 ? '' : 's'} ago`
  } else {
    return formatDate(dateObj)
  }
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, { includeTime: true })
}