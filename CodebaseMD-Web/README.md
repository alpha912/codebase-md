# CodebaseMD

Convert any file to Markdown with our powerful web interface, powered by [MarkItDown](https://github.com/microsoft/markitdown).

## Overview

CodebaseMD is a web interface and VS Code extension that leverages the powerful MarkItDown library to convert various file formats to clean, structured Markdown. Perfect for documentation, knowledge bases, and preparing content for LLMs.

## Features

- **Convert Any File**: Transform PDFs, Office documents, images, audio, and more to clean Markdown
- **Preserve Structure**: Maintains headings, lists, tables, and other formatting elements
- **AI Enhancements**: Uses Gemini API for rich image descriptions
- **VS Code Integration**: Seamlessly convert files directly in your editor
- **Web Interface**: Upload and convert files from anywhere

## Supported File Types

- 📄 PDF
- 📊 Excel (.xlsx, .xls)
- 📝 Word (.docx)
- 🖼️ PowerPoint (.pptx)
- 📷 Images (with EXIF metadata and OCR)
- 🎵 Audio (with metadata and speech transcription)
- 📰 HTML
- 🗄️ Text formats (CSV, JSON, XML)
- 📚 EPub
- 📦 ZIP (iterates through contents)
- 🎬 YouTube URLs (transcription)
- ...and more!

## Coming Soon

Our web application is currently in development using:

- **Frontend**: Next.js, Tailwind CSS, shadcn/ui, Lucide React icons
- **Backend**: FastAPI Python server
- **Deployment**: Docker containerization with frontend on Vercel and backend on Linux VPS

## Why Use CodebaseMD?

### LLM-Ready Output

Markdown is the perfect format for LLMs, as they're trained on vast amounts of Markdown-formatted text. The simple structure preserves document semantics while remaining highly token-efficient.

### VS Code Integration

Our VS Code extension allows you to:
- Convert files without leaving your editor
- Preview Markdown output side-by-side
- Batch convert multiple files

### Advanced AI Features

We leverage AI to enhance conversion quality:
- Smart image captioning via Gemini API
- Improved OCR for scanned documents
- Structure preservation with intelligent formatting

## Get Started

Stay tuned for our web application launch! In the meantime:

1. Install our VS Code extension (coming soon)
2. Try [MarkItDown](https://github.com/microsoft/markitdown) directly via pip:
   ```
   pip install 'markitdown[all]'
   markitdown your-file.pdf > output.md
   ```

## Contributing

We welcome contributions to CodebaseMD! Check back soon for our contributing guidelines.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 