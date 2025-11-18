import { RichTextEditor } from '@/components/rich-text-editor'

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Advanced Text Editor</h1>
          <p className="text-muted-foreground">
            Full-featured editor with @mentions, image/text pasting (Ctrl+V), and complete formatting tools
          </p>
        </div>
        <RichTextEditor />
      </div>
    </div>
  )
}
