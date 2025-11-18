'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link2, Code, Quote, Undo, Redo, AlignLeft, AlignCenter, AlignRight, Palette, Highlighter, Type, Eraser, ImageIcon } from 'lucide-react'
import { MentionPopover } from '@/components/mention-popover'
import { cn } from '@/lib/utils'

interface EditorContent {
  html: string
  text: string
}

export function RichTextEditor() {
  const [content, setContent] = useState<EditorContent>({ html: '', text: '' })
  const [showMentions, setShowMentions] = useState(false)
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [mentionSearch, setMentionSearch] = useState('')
  const [isEmpty, setIsEmpty] = useState(true)
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mockUsers = [
    { id: '1', name: 'Alice Johnson', avatar: '👩' },
    { id: '2', name: 'Bob Smith', avatar: '👨' },
    { id: '3', name: 'Carol Williams', avatar: '👩‍💼' },
    { id: '4', name: 'David Brown', avatar: '👨‍💼' },
    { id: '5', name: 'Emma Davis', avatar: '👩‍🔬' },
  ]

  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(mentionSearch.toLowerCase())
  )

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!editorRef.current?.contains(e.target as Node)) return

      const items = e.clipboardData?.items
      if (!items) return

      // Handle image paste
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault()
          const blob = items[i].getAsFile()
          if (blob) {
            insertImageFromFile(blob)
          }
          return
        }
      }

      // Handle text paste (default behavior)
      const text = e.clipboardData?.getData('text/plain')
      if (text) {
        e.preventDefault()
        document.execCommand('insertText', false, text)
        updateContent()
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  const insertImageFromFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = document.createElement('img')
      img.src = event.target?.result as string
      img.style.maxWidth = '100%'
      img.style.height = 'auto'
      img.style.borderRadius = '8px'
      img.style.margin = '8px 0'
      img.style.display = 'block'
      
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        range.insertNode(img)
        
        const br = document.createElement('br')
        range.setStartAfter(img)
        range.insertNode(br)
        range.setStartAfter(br)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
      } else {
        editorRef.current?.appendChild(img)
      }
      
      updateContent()
    }
    reader.readAsDataURL(file)
  }

  const updateContent = () => {
    if (editorRef.current) {
      const textContent = editorRef.current.innerText.trim()
      setIsEmpty(textContent.length === 0)
      
      setContent({
        html: editorRef.current.innerHTML,
        text: editorRef.current.innerText,
      })
    }
  }

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    updateContent()
  }

  const insertCodeBlock = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()
    
    const pre = document.createElement('pre')
    const code = document.createElement('code')
    code.textContent = selectedText || 'Code here...'
    code.style.cssText = 'display: block; background: hsl(var(--muted)); color: hsl(var(--foreground)); padding: 12px; border-radius: 6px; font-family: monospace; white-space: pre-wrap; word-wrap: break-word;'
    pre.appendChild(code)
    
    range.deleteContents()
    range.insertNode(pre)
    
    const br = document.createElement('br')
    range.setStartAfter(pre)
    range.insertNode(br)
    range.setStartAfter(br)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    
    editorRef.current?.focus()
    updateContent()
  }

  const insertQuote = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()
    
    const blockquote = document.createElement('blockquote')
    blockquote.textContent = selectedText || 'Quote here...'
    blockquote.style.cssText = 'border-left: 4px solid hsl(var(--primary)); padding-left: 16px; margin: 12px 0; color: hsl(var(--muted-foreground)); font-style: italic;'
    
    range.deleteContents()
    range.insertNode(blockquote)
    
    const br = document.createElement('br')
    range.setStartAfter(blockquote)
    range.insertNode(br)
    range.setStartAfter(br)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    
    editorRef.current?.focus()
    updateContent()
  }

  const insertInlineCode = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()
    
    const code = document.createElement('code')
    code.textContent = selectedText || 'code'
    code.style.cssText = 'background: hsl(var(--muted)); color: hsl(var(--foreground)); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em;'
    
    range.deleteContents()
    range.insertNode(code)
    range.setStartAfter(code)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    
    editorRef.current?.focus()
    updateContent()
  }

  const handleInput = () => {
    updateContent()
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const textBeforeCursor = range.startContainer.textContent?.slice(0, range.startOffset) || ''
    
    const atIndex = textBeforeCursor.lastIndexOf('@')
    if (atIndex !== -1 && atIndex === textBeforeCursor.length - 1) {
      const rect = range.getBoundingClientRect()
      const editorRect = editorRef.current?.getBoundingClientRect()
      if (editorRect) {
        setMentionPosition({
          top: rect.bottom - editorRect.top + 4,
          left: rect.left - editorRect.left,
        })
        setMentionSearch('')
        setShowMentions(true)
      }
    } else if (atIndex !== -1) {
      const searchText = textBeforeCursor.slice(atIndex + 1)
      if (searchText.includes(' ')) {
        setShowMentions(false)
      } else {
        setMentionSearch(searchText)
      }
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (user: typeof mockUsers[0]) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const textBeforeCursor = range.startContainer.textContent || ''
    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex !== -1) {
      range.setStart(range.startContainer, atIndex)
      range.deleteContents()

      const mention = document.createElement('span')
      mention.contentEditable = 'false'
      mention.className = 'mention'
      mention.style.cssText =
        'background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); padding: 2px 6px; border-radius: 4px; margin: 0 2px; display: inline-block; font-weight: 500;'
      mention.textContent = `@${user.name}`
      mention.dataset.userId = user.id

      const space = document.createTextNode('\u00A0')
      
      range.insertNode(space)
      range.insertNode(mention)
      range.setStartAfter(space)
      range.collapse(true)
      
      selection.removeAllRanges()
      selection.addRange(range)
    }

    setShowMentions(false)
    editorRef.current?.focus()
    updateContent()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && showMentions) {
      setShowMentions(false)
    }
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      executeCommand('createLink', url)
    }
  }

  const changeTextColor = () => {
    const color = prompt('Enter color (e.g., #ff0000, red, rgb(255,0,0)):')
    if (color) {
      executeCommand('foreColor', color)
    }
  }

  const changeBackgroundColor = () => {
    const color = prompt('Enter background color (e.g., #ffff00, yellow):')
    if (color) {
      executeCommand('hiliteColor', color)
    }
  }

  const clearFormatting = () => {
    executeCommand('removeFormat')
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      insertImageFromFile(file)
    }
  }

  return (
    <Card className="w-full border-border bg-card">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="border-b border-border bg-muted/30 p-3">
        <div className="flex flex-wrap gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('undo')}
            className="h-8 w-8 p-0"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('redo')}
            className="h-8 w-8 p-0"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-8 bg-border mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('bold')}
            className="h-8 w-8 p-0"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('italic')}
            className="h-8 w-8 p-0"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('underline')}
            className="h-8 w-8 p-0"
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('strikeThrough')}
            className="h-8 w-8 p-0"
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('justifyLeft')}
            className="h-8 w-8 p-0"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('justifyCenter')}
            className="h-8 w-8 p-0"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('justifyRight')}
            className="h-8 w-8 p-0"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('insertUnorderedList')}
            className="h-8 w-8 p-0"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('insertOrderedList')}
            className="h-8 w-8 p-0"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={insertInlineCode}
            className="h-8 w-8 p-0"
            title="Inline Code"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertCodeBlock}
            className="h-8 w-8 p-0"
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertQuote}
            className="h-8 w-8 p-0"
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={insertLink}
            className="h-8 w-8 p-0"
            title="Insert Link"
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImageUpload}
            className="h-8 w-8 p-0"
            title="Upload Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={changeTextColor}
            className="h-8 w-8 p-0"
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={changeBackgroundColor}
            className="h-8 w-8 p-0"
            title="Highlight Color"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFormatting}
            className="h-8 w-8 p-0"
            title="Clear Formatting"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <select
            onChange={(e) => {
              const value = e.target.value
              if (value === 'p') {
                executeCommand('formatBlock', '<p>')
              } else {
                executeCommand('formatBlock', `<${value}>`)
              }
            }}
            className="h-8 rounded-md border border-border bg-background px-3 text-sm text-foreground"
            defaultValue="p"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>

          <select
            onChange={(e) => executeCommand('fontSize', e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-3 text-sm text-foreground"
            defaultValue="3"
          >
            <option value="1">8pt</option>
            <option value="2">10pt</option>
            <option value="3">12pt (Normal)</option>
            <option value="4">14pt</option>
            <option value="5">18pt</option>
            <option value="6">24pt</option>
            <option value="7">36pt</option>
          </select>

          <select
            onChange={(e) => executeCommand('fontName', e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-3 text-sm text-foreground"
            defaultValue="inherit"
          >
            <option value="inherit">Default Font</option>
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>
      </div>

      <div className="relative">
        {isEmpty && (
          <div className="absolute top-6 left-6 text-muted-foreground pointer-events-none select-none">
            Start typing... Use @ to mention someone, or paste images with Ctrl+V
          </div>
        )}
        
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className={cn(
            'min-h-[400px] p-6 focus:outline-none',
            'prose prose-sm max-w-none',
            'text-foreground',
            '[&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground',
            '[&_h4]:text-foreground [&_h5]:text-foreground [&_h6]:text-foreground',
            '[&_blockquote]:border-l-primary [&_blockquote]:text-muted-foreground',
            '[&_pre]:bg-muted [&_pre]:text-foreground',
            '[&_a]:text-primary [&_a]:underline [&_a]:cursor-pointer',
            '[&_code]:bg-muted [&_code]:text-foreground [&_code]:px-1 [&_code]:rounded',
            '[&_ul]:list-disc [&_ul]:ml-6',
            '[&_ol]:list-decimal [&_ol]:ml-6'
          )}
        />

        {showMentions && (
          <MentionPopover
            users={filteredUsers}
            position={mentionPosition}
            onSelect={insertMention}
            onClose={() => setShowMentions(false)}
          />
        )}
      </div>

      <div className="border-t border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            {content.text.length} characters • Type @ to mention • Paste or upload images
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex gap-1 items-center">
              <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-xs border border-border">Ctrl+B</kbd>
              <span>Bold</span>
            </div>
            <div className="flex gap-1 items-center">
              <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-xs border border-border">Ctrl+I</kbd>
              <span>Italic</span>
            </div>
            <div className="flex gap-1 items-center">
              <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-xs border border-border">Ctrl+U</kbd>
              <span>Underline</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
