import { useState, useEffect } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const RichTextEditor = ({ value, onChange, placeholder = "İçeriğinizi buraya yazın..." }) => {
  const [editorHtml, setEditorHtml] = useState(value || '')

  useEffect(() => {
    setEditorHtml(value || '')
  }, [value])

  const handleChange = (html) => {
    setEditorHtml(html)
    if (onChange) {
      onChange(html)
    }
  }

  // Toolbar konfigürasyonu - Türkçe editör için optimize edilmiş
  const modules = {
    toolbar: [
      // Başlık seviyeleri
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
      // Yazı tipi ve boyutu
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      
      // Metin biçimlendirme
      ['bold', 'italic', 'underline', 'strike'],
      
      // Renk ve arka plan
      [{ 'color': [] }, { 'background': [] }],
      
      // Hizalama
      [{ 'align': [] }],
      
      // Listeler
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      
      // Alıntı ve kod
      ['blockquote', 'code-block'],
      
      // Linkler ve medya
      ['link', 'image', 'video'],
      
      // Temizleme
      ['clean']
    ],
    clipboard: {
      // Yapıştırma sırasında gereksiz formatları temizle
      matchVisual: false,
    }
  }

  // Format seçenekleri
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ]

  return (
    <div className="rich-text-editor">
      <style jsx global>{`
        /* Quill editör özelleştirmeleri */
        .ql-toolbar {
          border: 1px solid #e5e7eb !important;
          border-bottom: none !important;
          border-radius: 0.5rem 0.5rem 0 0 !important;
          background: #f9fafb !important;
          padding: 12px !important;
        }
        
        .ql-container {
          border: 1px solid #e5e7eb !important;
          border-radius: 0 0 0.5rem 0.5rem !important;
          font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
          font-size: 14px !important;
          min-height: 200px !important;
        }
        
        .ql-editor {
          min-height: 200px !important;
          padding: 16px !important;
          line-height: 1.6 !important;
        }
        
        .ql-editor.ql-blank::before {
          color: #9ca3af !important;
          font-style: normal !important;
        }
        
        /* Toolbar butonları */
        .ql-toolbar .ql-formats {
          margin-right: 12px !important;
        }
        
        .ql-toolbar button {
          padding: 4px 6px !important;
          margin: 0 1px !important;
          border-radius: 4px !important;
        }
        
        .ql-toolbar button:hover {
          background: #e5e7eb !important;
        }
        
        .ql-toolbar button.ql-active {
          background: #3b82f6 !important;
          color: white !important;
        }
        
        /* Dropdown'lar */
        .ql-toolbar .ql-picker {
          color: #374151 !important;
        }
        
        .ql-toolbar .ql-picker-options {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        
        .ql-toolbar .ql-picker-item:hover {
          background: #f3f4f6 !important;
        }
        
        /* Başlık stilleri */
        .ql-editor h1 { font-size: 2rem !important; font-weight: 700 !important; margin: 1rem 0 !important; }
        .ql-editor h2 { font-size: 1.5rem !important; font-weight: 600 !important; margin: 0.875rem 0 !important; }
        .ql-editor h3 { font-size: 1.25rem !important; font-weight: 600 !important; margin: 0.75rem 0 !important; }
        .ql-editor h4 { font-size: 1.125rem !important; font-weight: 500 !important; margin: 0.625rem 0 !important; }
        .ql-editor h5 { font-size: 1rem !important; font-weight: 500 !important; margin: 0.5rem 0 !important; }
        .ql-editor h6 { font-size: 0.875rem !important; font-weight: 500 !important; margin: 0.375rem 0 !important; }
        
        /* Paragraf ve liste stilleri */
        .ql-editor p { margin: 0.5rem 0 !important; }
        .ql-editor ul, .ql-editor ol { margin: 0.5rem 0 !important; padding-left: 1.5rem !important; }
        .ql-editor li { margin: 0.25rem 0 !important; }
        
        /* Alıntı stili */
        .ql-editor blockquote {
          border-left: 4px solid #3b82f6 !important;
          padding-left: 16px !important;
          margin: 1rem 0 !important;
          color: #6b7280 !important;
          font-style: italic !important;
        }
        
        /* Kod blok stili */
        .ql-editor pre {
          background: #f3f4f6 !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          padding: 12px !important;
          margin: 1rem 0 !important;
          overflow-x: auto !important;
        }
        
        /* Link stili */
        .ql-editor a {
          color: #3b82f6 !important;
          text-decoration: underline !important;
        }
        
        .ql-editor a:hover {
          color: #1d4ed8 !important;
        }
        
        /* Resim stili */
        .ql-editor img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 6px !important;
          margin: 0.5rem 0 !important;
        }
        
        /* Responsive tasarım */
        @media (max-width: 768px) {
          .ql-toolbar {
            padding: 8px !important;
          }
          
          .ql-toolbar .ql-formats {
            margin-right: 8px !important;
          }
          
          .ql-toolbar button {
            padding: 3px 4px !important;
          }
          
          .ql-container {
            min-height: 150px !important;
          }
          
          .ql-editor {
            min-height: 150px !important;
            padding: 12px !important;
          }
        }
      `}</style>
      
      <ReactQuill
        theme="snow"
        value={editorHtml}
        onChange={handleChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}
      />
      
      {/* Karakter sayısı göstergesi */}
      <div className="mt-2 text-right text-sm text-gray-500">
        {editorHtml.replace(/<[^>]*>/g, '').length} karakter
      </div>
      
      {/* Yardım metni */}
      <div className="mt-2 text-xs text-gray-400">
        💡 İpucu: Ctrl+B (kalın), Ctrl+I (italik), Ctrl+U (altı çizili) kısayollarını kullanabilirsiniz.
      </div>
    </div>
  )
}

export default RichTextEditor 