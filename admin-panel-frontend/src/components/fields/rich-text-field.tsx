import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Undo,
  Redo,
} from 'lucide-react';
import type { FieldComponentProps } from '@/lib/registry/field-components';

export const RichTextField: React.FC<FieldComponentProps> = ({
  value,
  onChange,
  error,
  label,
  required,
  disabled,
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value ?? '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}

      <div className={[
        'rounded-md border overflow-hidden',
        error ? 'border-destructive' : 'border-input',
        disabled ? 'opacity-50' : '',
      ].join(' ')}>
        {/* Toolbar */}
        {!disabled && editor && (
          <div className="flex items-center gap-0.5 border-b bg-muted/50 p-1 flex-wrap">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 ${editor.isActive('bold') ? 'bg-accent' : ''}`}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 ${editor.isActive('italic') ? 'bg-accent' : ''}`}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 ${editor.isActive('bulletList') ? 'bg-accent' : ''}`}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 ${editor.isActive('orderedList') ? 'bg-accent' : ''}`}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </Button>
            <div className="mx-1 h-4 w-px bg-border" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none px-3 py-2 min-h-[120px] focus-within:outline-none"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default RichTextField;
