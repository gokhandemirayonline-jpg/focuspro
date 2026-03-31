import React, { useCallback, useRef } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';

/* ──────────────────────────────────────────
   Custom Line Height Extension
─────────────────────────────────────────── */
const LINE_HEIGHTS = [
  { label: 'Tek (1.0)', value: '1' },
  { label: 'Dar (1.25)', value: '1.25' },
  { label: 'Normal (1.5)', value: '1.5' },
  { label: 'Orta (1.75)', value: '1.75' },
  { label: 'Geniş (2.0)', value: '2' },
  { label: 'Çok Geniş (2.5)', value: '2.5' },
];

const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() { return { types: ['paragraph', 'heading'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        lineHeight: {
          default: null,
          parseHTML: (el) => el.style.lineHeight || null,
          renderHTML: (attrs) => {
            if (!attrs.lineHeight) return {};
            return { style: `line-height: ${attrs.lineHeight}` };
          },
        },
      },
    }];
  },
  addCommands() {
    return {
      setLineHeight: (lineHeight) => ({ commands }) =>
        this.options.types.every((t) => commands.updateAttributes(t, { lineHeight })),
      unsetLineHeight: () => ({ commands }) =>
        this.options.types.every((t) => commands.resetAttributes(t, 'lineHeight')),
    };
  },
});


/* ──────────────────────────────────────────
   Toolbar Button
─────────────────────────────────────────── */
const ToolBtn = ({ onClick, active, title, children, disabled }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-all text-sm font-medium leading-none select-none
      ${active
        ? 'bg-purple-600 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {children}
  </button>
);

const Sep = () => <div className="w-px h-5 bg-gray-200 mx-1 self-center" />;

/* ──────────────────────────────────────────
   Main Component
─────────────────────────────────────────── */
const RichTextEditor = ({ value, onChange, onImageUpload }) => {
  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Youtube.configure({ width: '100%', height: 400, nocookie: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      LineHeight,
      Placeholder.configure({ placeholder: 'Blog içeriğini buraya yazın...' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-purple max-w-none focus:outline-none min-h-[400px] p-4 text-gray-800',
      },
    },
  });

  /* Image upload handler */
  const handleImageFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    if (!file.type.startsWith('image/')) { alert('Sadece resim dosyası yüklenebilir.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Maksimum 5 MB olabilir.'); return; }

    if (onImageUpload) {
      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        alert('Resim yüklenemedi: ' + err.message);
      }
    } else {
      // fallback: base64
      const reader = new FileReader();
      reader.onload = (ev) => editor.chain().focus().setImage({ src: ev.target.result }).run();
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  }, [editor, onImageUpload]);

  /* YouTube embed handler */
  const addYoutube = useCallback(() => {
    const url = window.prompt('YouTube video URL\'sini girin:');
    if (url && editor) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  }, [editor]);

  /* Link handler */
  const addLink = useCallback(() => {
    const prev = editor?.getAttributes('link').href || '';
    const url = window.prompt('Bağlantı URL\'sini girin:', prev);
    if (url === null) return;
    if (url === '') { editor?.chain().focus().unsetLink().run(); return; }
    editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const lineHeightSelect = (
    <select
      value={
        LINE_HEIGHTS.find(lh =>
          editor.isActive({ lineHeight: lh.value })
        )?.value ||
        editor.getAttributes('paragraph').lineHeight ||
        editor.getAttributes('heading').lineHeight ||
        ''
      }
      onChange={(e) => {
        if (!e.target.value) {
          editor.chain().focus().unsetLineHeight().run();
        } else {
          editor.chain().focus().setLineHeight(e.target.value).run();
        }
      }}
      title="Satır aralığı"
      className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer"
    >
      <option value="">Satır Aralığı</option>
      {LINE_HEIGHTS.map(lh => (
        <option key={lh.value} value={lh.value}>{lh.label}</option>
      ))}
    </select>
  );

  const headingSelect = (
    <select
      value={
        editor.isActive('heading', { level: 1 }) ? '1'
        : editor.isActive('heading', { level: 2 }) ? '2'
        : editor.isActive('heading', { level: 3 }) ? '3'
        : '0'
      }
      onChange={(e) => {
        const lvl = parseInt(e.target.value);
        if (lvl === 0) editor.chain().focus().setParagraph().run();
        else editor.chain().focus().toggleHeading({ level: lvl }).run();
      }}
      className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer"
    >
      <option value="0">Paragraf</option>
      <option value="1">Başlık 1</option>
      <option value="2">Başlık 2</option>
      <option value="3">Başlık 3</option>
    </select>
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">

      {/* ─── Toolbar ─── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-3 py-2 flex flex-wrap items-center gap-1">

        {/* Heading */}
        {headingSelect}
        {lineHeightSelect}
        <Sep />

        {/* Bold / Italic / Strike / Code */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Kalın (Ctrl+B)">
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="İtalik (Ctrl+I)">
          <em>I</em>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Üstü çizili">
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Satır içi kod">
          {'</>'}
        </ToolBtn>
        <Sep />

        {/* Lists */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Madde işaretli liste">
          ≡•
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numaralı liste">
          1.≡
        </ToolBtn>
        <Sep />

        {/* Alignment */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Sola hizala">
          ⬛◻◻
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Ortala">
          ◻⬛◻
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Sağa hizala">
          ◻◻⬛
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Her iki yana yasla">
          ▬▬▬
        </ToolBtn>
        <Sep />

        {/* Blockquote / HR / Code Block */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Alıntı">
          "
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Kod bloğu">
          {'{ }'}
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Yatay çizgi">
          —
        </ToolBtn>
        <Sep />

        {/* Text Color */}
        <div className="relative flex items-center gap-0.5" title="Yazı rengi">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); colorInputRef.current?.click(); }}
            className="p-1.5 rounded hover:bg-gray-100 cursor-pointer transition-all"
            title="Yazı rengi seç"
          >
            <span className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-bold leading-none" style={{ color: editor.getAttributes('textStyle').color || '#1a1a1a' }}>A</span>
              <span
                className="block w-4 h-1 rounded-sm"
                style={{ backgroundColor: editor.getAttributes('textStyle').color || '#1a1a1a' }}
              />
            </span>
          </button>
          <input
            ref={colorInputRef}
            type="color"
            className="sr-only"
            value={editor.getAttributes('textStyle').color || '#1a1a1a'}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); }}
            className="text-[10px] text-gray-400 hover:text-gray-700 px-0.5 rounded hover:bg-gray-100 transition-all leading-none"
            title="Rengi sıfırla"
          >
            ×
          </button>
        </div>
        <Sep />

        {/* Link */}
        <ToolBtn onClick={addLink} active={editor.isActive('link')} title="Bağlantı ekle/kaldır">
          🔗
        </ToolBtn>

        {/* Image */}
        <ToolBtn onClick={() => fileInputRef.current?.click()} active={false} title="Resim yükle">
          🖼
        </ToolBtn>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

        {/* YouTube */}
        <ToolBtn onClick={addYoutube} active={false} title="YouTube video ekle">
          ▶ YT
        </ToolBtn>
        <Sep />

        {/* Undo / Redo */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} active={false} disabled={!editor.can().undo()} title="Geri Al">
          ↩
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} active={false} disabled={!editor.can().redo()} title="Yinele">
          ↪
        </ToolBtn>
      </div>

      {/* ─── Editor Area ─── */}
      <EditorContent editor={editor} />

      {/* ─── Word count strip ─── */}
      <div className="border-t border-gray-100 px-4 py-1.5 flex justify-end">
        <span className="text-[11px] text-gray-400">
          {editor.storage.characterCount?.words?.() ?? editor.getText().split(/\s+/).filter(Boolean).length} kelime
        </span>
      </div>
    </div>
  );
};

export default RichTextEditor;
