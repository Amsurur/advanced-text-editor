'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'

interface User {
  id: string
  name: string
  avatar: string
}

interface MentionPopoverProps {
  users: User[]
  position: { top: number; left: number }
  onSelect: (user: User) => void
  onClose: () => void
}

export function MentionPopover({ users, position, onSelect, onClose }: MentionPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  if (users.length === 0) {
    return (
      <Card
        ref={popoverRef}
        className="absolute z-50 w-64 p-3 shadow-lg border-border bg-popover"
        style={{ top: position.top, left: position.left }}
      >
        <p className="text-sm text-muted-foreground">No users found</p>
      </Card>
    )
  }

  return (
    <Card
      ref={popoverRef}
      className="absolute z-50 w-64 shadow-lg border-border bg-popover overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="max-h-64 overflow-y-auto">
        {users.map((user, index) => (
          <button
            key={user.id}
            onClick={() => onSelect(user)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
          >
            <span className="text-2xl">{user.avatar}</span>
            <span className="text-sm font-medium text-foreground">{user.name}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}
