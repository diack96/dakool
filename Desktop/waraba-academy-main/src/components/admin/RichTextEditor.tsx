'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useCallback, useState, useRef } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered, Code, Quote,
  Link as LinkIcon, Unlink, Minus, ImageIcon, Upload, Loader2,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function ToolbarButton({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Contenu de la leçon...',
  minHeight = 200,
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const [showImagePanel, setShowImagePanel] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-3 py-2',
        style: `min-height:${minHeight}px`,
      },
    },
    immediatelyRender: false,
  });

  // Sync valeur externe → éditeur
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const normalized = current === '<p></p>' ? '' : current;
    if (normalized !== value && !(value === '' && current === '<p></p>')) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) { editor.chain().focus().unsetLink().run(); return; }
    const href = url.startsWith('http') ? url : `https://${url}`;
    editor.chain().focus().setLink({ href }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const insertImage = useCallback((src: string, alt: string) => {
    if (!editor || !src) return;
    editor.chain().focus().setImage({ src, alt: alt || '' }).run();
    setImageUrl('');
    setImageAlt('');
    setShowImagePanel(false);
    setUploadError('');
  }, [editor]);

  const handleFileUpload = useCallback(async (file: File) => {
    const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!ALLOWED.includes(file.type)) {
      setUploadError('Format non supporté (JPG, PNG, GIF, WebP uniquement).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Fichier trop volumineux (max 5 Mo).');
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'lesson');
      formData.append('courseId', 'general');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setUploadError(data.error || 'Erreur lors de l\'upload.');
        return;
      }
      insertImage(data.url, file.name.replace(/\.[^.]+$/, ''));
    } catch {
      setUploadError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [insertImage]);

  if (!editor) return null;

  const sep = <div className="w-px h-5 bg-gray-200 mx-0.5" />;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Gras (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italique (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Souligné (Ctrl+U)">
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Barré">
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        {sep}

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Titre H2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Titre H3">
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        {sep}

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste à puces">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Liste numérotée">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        {sep}

        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code inline">
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citation">
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Séparateur horizontal">
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        {sep}

        <ToolbarButton
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              setLinkUrl(editor.getAttributes('link').href ?? '');
              setShowImagePanel(false);
              setShowLinkInput((v) => !v);
            }
          }}
          active={editor.isActive('link')}
          title={editor.isActive('link') ? 'Supprimer le lien' : 'Ajouter un lien'}
        >
          {editor.isActive('link') ? <Unlink className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            setShowLinkInput(false);
            setUploadError('');
            setShowImagePanel((v) => !v);
          }}
          active={showImagePanel}
          title="Insérer une image"
        >
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Panel URL lien */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100">
          <LinkIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } if (e.key === 'Escape') setShowLinkInput(false); }}
            placeholder="https://example.com"
            autoFocus
            className="flex-1 text-sm bg-transparent border-none outline-none placeholder-blue-300 text-blue-900"
          />
          <button type="button" onClick={addLink} className="text-xs font-medium text-blue-700 hover:text-blue-900 px-2 py-0.5 rounded hover:bg-blue-100">
            Insérer
          </button>
          <button type="button" onClick={() => setShowLinkInput(false)} className="text-xs text-blue-400 hover:text-blue-600">
            Annuler
          </button>
        </div>
      )}

      {/* Panel image */}
      {showImagePanel && (
        <div className="border-b border-green-100 bg-green-50 px-3 py-2.5 space-y-2">
          {/* Ligne URL */}
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); insertImage(imageUrl, imageAlt); } if (e.key === 'Escape') setShowImagePanel(false); }}
              placeholder="URL de l'image (https://...)"
              autoFocus
              className="flex-1 text-sm bg-transparent border-none outline-none placeholder-green-400 text-green-900"
            />
          </div>
          {/* Ligne texte alternatif */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-500 flex-shrink-0 w-4 text-center">alt</span>
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Texte alternatif (optionnel)"
              className="flex-1 text-sm bg-transparent border-none outline-none placeholder-green-400 text-green-900"
            />
          </div>
          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => insertImage(imageUrl, imageAlt)}
              disabled={!imageUrl.trim()}
              className="text-xs font-medium text-green-700 hover:text-green-900 px-2 py-0.5 rounded hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Insérer l&apos;URL
            </button>
            <span className="text-xs text-green-400">ou</span>
            {/* Upload fichier */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-900 px-2 py-0.5 rounded hover:bg-green-100 disabled:opacity-40"
            >
              {uploading
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Upload className="w-3 h-3" />}
              {uploading ? 'Envoi…' : 'Uploader un fichier'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
            />
            <button type="button" onClick={() => { setShowImagePanel(false); setUploadError(''); }} className="ml-auto text-xs text-green-400 hover:text-green-600">
              Fermer
            </button>
          </div>
          {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
        </div>
      )}

      {/* Zone de saisie */}
      <EditorContent editor={editor} />

      {/* Styles prose embarqués */}
      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .tiptap h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75em 0 0.25em; }
        .tiptap h3 { font-size: 1.05rem; font-weight: 600; margin: 0.6em 0 0.2em; }
        .tiptap p { margin: 0.4em 0; line-height: 1.65; }
        .tiptap strong { font-weight: 700; }
        .tiptap em { font-style: italic; }
        .tiptap u { text-decoration: underline; }
        .tiptap s { text-decoration: line-through; }
        .tiptap a { color: #2563eb; text-decoration: underline; }
        .tiptap ul { list-style-type: disc; padding-left: 1.5em; margin: 0.4em 0; }
        .tiptap ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.4em 0; }
        .tiptap li { margin: 0.15em 0; }
        .tiptap blockquote { border-left: 3px solid #d1d5db; padding-left: 1em; color: #6b7280; margin: 0.5em 0; }
        .tiptap code { background: #f3f4f6; border-radius: 3px; padding: 0.1em 0.3em; font-family: monospace; font-size: 0.9em; }
        .tiptap hr { border: none; border-top: 1px solid #e5e7eb; margin: 0.75em 0; }
        .tiptap img { max-width: 100%; border-radius: 6px; margin: 0.5em 0; }
      `}</style>
    </div>
  );
}
