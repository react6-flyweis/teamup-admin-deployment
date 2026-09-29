import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { uploadFile } from '@/utils/fileUpload';
import { TrashIcon } from '@/assets/icons';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
}

/**
 * Custom React NodeView for TipTap Images:
 * Renders an interactive action overlay directly on the image when selected or hovered,
 * providing one-click Remove, Alignment, and Size adjustments.
 */
const CustomImageNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes, deleteNode, selected }) => {
  const src = node.attrs.src as string;
  const alt = node.attrs.alt as string | undefined;
  const width = (node.attrs.width as string) || '100%';
  const alignment = (node.attrs.alignment as string) || 'center';

  return (
    <NodeViewWrapper
      className={`relative my-4 transition-all clear-both ${
        alignment === 'left'
          ? 'float-left mr-5 mb-3'
          : alignment === 'right'
          ? 'float-right ml-5 mb-3'
          : 'flex flex-col items-center mx-auto my-3'
      }`}
      style={{ maxWidth: '100%' }}
    >
      <div
        className={`relative inline-block rounded-xl transition-all group ${
          selected
            ? 'ring-2 ring-[#E1017D] shadow-lg'
            : 'hover:ring-1 hover:ring-[#E1017D]/50'
        }`}
        style={{ width: width === '100%' ? '100%' : width }}
      >
        <img
          src={src}
          alt={alt || ''}
          className="rounded-xl w-full h-auto block select-none cursor-pointer"
        />

        {/* Action pill on top-right of image */}
        <div
          className={`absolute top-2.5 right-2.5 flex items-center gap-1 p-1 bg-[#181818]/95 backdrop-blur-md border border-[#3A3530] rounded-lg shadow-2xl z-30 transition-opacity select-none ${
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Alignment */}
          <button
            type="button"
            onClick={() => updateAttributes({ alignment: 'left' })}
            className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              alignment === 'left' ? 'bg-[#E1017D] text-white' : 'text-gray-300 hover:bg-white/10'
            }`}
            title="Align Left"
          >
            Left
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ alignment: 'center' })}
            className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              alignment === 'center' ? 'bg-[#E1017D] text-white' : 'text-gray-300 hover:bg-white/10'
            }`}
            title="Align Center"
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ alignment: 'right' })}
            className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              alignment === 'right' ? 'bg-[#E1017D] text-white' : 'text-gray-300 hover:bg-white/10'
            }`}
            title="Align Right"
          >
            Right
          </button>

          <div className="w-px h-3.5 bg-[#3A3530] mx-0.5" />

          {/* Quick Sizes */}
          <button
            type="button"
            onClick={() => updateAttributes({ width: '50%' })}
            className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              width === '50%' ? 'bg-[#E1017D] text-white' : 'text-gray-300 hover:bg-white/10'
            }`}
            title="50% Width"
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ width: '100%' })}
            className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              width === '100%' ? 'bg-[#E1017D] text-white' : 'text-gray-300 hover:bg-white/10'
            }`}
            title="100% Width"
          >
            100%
          </button>

          <div className="w-px h-3.5 bg-[#3A3530] mx-0.5" />

          {/* Remove / Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              deleteNode();
            }}
            className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-600 hover:bg-red-500 text-white flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
            title="Remove Image (or press Backspace / Delete)"
          >
            <TrashIcon size={12} color="currentColor" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { style: `width: ${attributes.width};` };
        },
      },
      alignment: {
        default: 'center',
        renderHTML: (attributes) => {
          if (!attributes.alignment) return {};
          return { 'data-alignment': attributes.alignment };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(CustomImageNodeView);
  },
});

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  editable = true,
  minHeight = '280px',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'text-[#E1017D] underline hover:text-[#ff38a5]',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content if it changes externally and differs
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // Handle image upload from file picker
  const handleImageFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      setIsUploading(true);
      setUploadError(null);
      try {
        const url = await uploadFile(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (err: unknown) {
        console.error('Failed to upload editor image:', err);
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setUploadError(error?.response?.data?.message || error?.message || 'Failed to upload image.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [editor]
  );

  const handleSetLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter link URL:', previousUrl);

    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="w-full h-48 bg-white/5 animate-pulse rounded-lg flex items-center justify-center text-gray-500 text-sm">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="border border-[#3A3530] rounded-xl bg-white text-black flex flex-col shadow-inner relative">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Editor Toolbar (Sticky to modal scroll container) */}
      <div className="bg-[#181818] border-b border-[#3A3530] p-2.5 flex flex-wrap items-center gap-1 text-white select-none sticky top-0 z-30 shadow-md rounded-t-xl">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-[#E1017D] text-white'
              : 'hover:bg-[#2A2A2A] text-gray-300'
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-[#E1017D] text-white'
              : 'hover:bg-[#2A2A2A] text-gray-300'
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-[#E1017D] text-white'
              : 'hover:bg-[#2A2A2A] text-gray-300'
          }`}
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
            editor.isActive('paragraph')
              ? 'bg-[#E1017D] text-white'
              : 'hover:bg-[#2A2A2A] text-gray-300'
          }`}
          title="Paragraph"
        >
          P
        </button>

        <div className="w-px h-4 bg-[#3A3530] mx-1" />

        {/* Text Formats */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('bold')
              ? 'bg-[#E1017D] text-white'
              : 'hover:bg-[#2A2A2A] text-gray-300'
          }`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2.5 py-1 rounded text-xs italic font-serif transition-colors cursor-pointer ${
            editor.isActive('italic')
              ? 'bg-[#E1017D] text-white'
              : 'hover:bg-[#2A2A2A] text-gray-300'
          }`}
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2.5 py-1 rounded text-xs line-through transition-colors cursor-pointer ${
            editor.isActive('strike')
              ? 'bg-[#E1017D] text-white'
              : 'hover:bg-[#2A2A2A] text-gray-300'
          }`}
          title="Strikethrough"
        >
          S
        </button>

        <div className="w-px h-4 bg-[#3A3530] mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
            editor.isActive('bulletList')
              ? 'bg-[#E1017D] text-white'
              : 'hover:bg-[#2A2A2A] text-gray-300'
          }`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
            editor.isActive('orderedList')
              ? 'bg-[#E1017D] text-white'
              : 'hover:bg-[#2A2A2A] text-gray-300'
          }`}
          title="Numbered List"
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
            editor.isActive('blockquote')
              ? 'bg-[#E1017D] text-white'
              : 'hover:bg-[#2A2A2A] text-gray-300'
          }`}
          title="Quote"
        >
          “ Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 rounded text-xs hover:bg-[#2A2A2A] text-gray-300 transition-colors cursor-pointer"
          title="Divider Line"
        >
          ― Line
        </button>

        <div className="w-px h-4 bg-[#3A3530] mx-1" />

        {/* Link */}
        <button
          type="button"
          onClick={handleSetLink}
          className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
            editor.isActive('link')
              ? 'bg-[#E1017D] text-white'
              : 'hover:bg-[#2A2A2A] text-gray-300'
          }`}
          title="Link"
        >
          🔗 Link
        </button>

        {/* Image Upload Button */}
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1 rounded text-xs bg-[#242424] hover:bg-[#333333] border border-[#3A3530] text-[#E1017D] font-medium transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
          title="Upload and insert image"
        >
          {isUploading ? (
            <span className="animate-spin rounded-full h-3 w-3 border border-[#E1017D] border-t-transparent" />
          ) : (
            <span>📷</span>
          )}
          <span>{isUploading ? 'Uploading...' : 'Insert Image'}</span>
        </button>

        {/* Undo / Redo */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="px-2 py-1 rounded text-xs hover:bg-[#2A2A2A] text-gray-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            ↺
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="px-2 py-1 rounded text-xs hover:bg-[#2A2A2A] text-gray-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            ↻
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs px-3 py-1.5 flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-red-200 ml-2 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Editor Content Area (no internal scrollbar, expands naturally) */}
      <div
        className="p-5 flex-1 cursor-text text-black bg-white rounded-b-xl"
        style={{ minHeight }}
        onClick={() => {
          if (!editor.isFocused) {
            editor.commands.focus();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TipTapEditor;
