import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Page } from '@/types';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  List, ListOrdered, CheckSquare, Quote, Heading1, Heading2,
  Heading3, Link as LinkIcon, Highlighter, AlignLeft, AlignCenter,
  AlignRight, Trash2, MoreHorizontal
} from 'lucide-react';

interface PageEditorProps {
  page: Page;
}

export function PageEditor({ page }: PageEditorProps) {
  const { updatePage, deletePage } = useWorkspaceStore();
  const [title, setTitle] = useState(page.title);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing...' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
    ],
    content: page.content,
    onUpdate: ({ editor }) => {
      updatePage(page.id, { content: editor.getHTML() });
    },
  }, [page.id]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updatePage(page.id, { title: newTitle });
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-3xl cursor-pointer hover:bg-muted rounded p-1">{page.icon || '📄'}</span>
      </div>
      <input
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        className="w-full text-4xl font-bold bg-transparent border-none outline-none mb-4 placeholder:text-muted-foreground/50"
        placeholder="Untitled"
      />

      {editor && (
        <div className="border border-border rounded-lg mb-4 p-1 flex flex-wrap gap-0.5 bg-muted/30">
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={<Bold size={15} />} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={<Italic size={15} />} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={<UnderlineIcon size={15} />} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={<Strikethrough size={15} />} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} icon={<Code size={15} />} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} icon={<Highlighter size={15} />} />
          <div className="w-px bg-border mx-1" />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} icon={<Heading1 size={15} />} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={<Heading2 size={15} />} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} icon={<Heading3 size={15} />} />
          <div className="w-px bg-border mx-1" />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={<List size={15} />} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={<ListOrdered size={15} />} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} icon={<CheckSquare size={15} />} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={<Quote size={15} />} />
          <div className="w-px bg-border mx-1" />
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} icon={<AlignLeft size={15} />} />
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} icon={<AlignCenter size={15} />} />
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} icon={<AlignRight size={15} />} />
          <div className="ml-auto">
            <ToolbarBtn onClick={() => deletePage(page.id)} icon={<Trash2 size={15} />} />
          </div>
        </div>
      )}

      <EditorContent editor={editor} className="prose prose-invert max-w-none" />
    </div>
  );
}

function ToolbarBtn({ onClick, active, icon }: { onClick: () => void; active?: boolean; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
    >
      {icon}
    </button>
  );
}
