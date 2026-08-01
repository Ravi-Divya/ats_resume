'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResumeUploadProps {
  onTextExtracted: (text: string) => void;
  onImageSelected: (base64: string, mime: string) => void;
  isAnalyzing: boolean;
}

const ACCEPTED = '.pdf,.png,.jpg,.jpeg,.webp';
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

export function ResumeUpload({ onTextExtracted, onImageSelected, isAnalyzing }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractPdfText = useCallback(
    async (pdfFile: File) => {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += pageText + '\n';
      }

      onTextExtracted(fullText);
    },
    [onTextExtracted],
  );

  const processFile = useCallback(
    async (selectedFile: File | null) => {
      if (!selectedFile) return;
      setError(null);

      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File is too large (max 15 MB). Please try a smaller file.');
        return;
      }

      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        try {
          await extractPdfText(selectedFile);
        } catch (err) {
          console.error('Error extracting PDF text:', err);
          setError('Failed to read PDF. Please try another file.');
        }
        return;
      }

      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = reader.result as string;
              resolve(dataUrl.split(',')[1] ?? '');
            };
            reader.onerror = () => reject(new Error('Failed to read image'));
            reader.readAsDataURL(selectedFile);
          });
          onImageSelected(base64, selectedFile.type);
        } catch (err) {
          console.error('Error reading image:', err);
          setError('Failed to read the image. Please try another file.');
        }
        return;
      }

      setError('Please upload a PDF or an image (PNG, JPG, WEBP)');
    },
    [extractPdfText, onImageSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFile(e.dataTransfer.files[0] ?? null);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  const isImage = file?.type.startsWith('image/');

  return (
    <div className="w-full">
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-3 border-dashed rounded-xl p-8 md:p-12 transition-all duration-200 cursor-pointer
            ${isDragging
              ? 'border-primary bg-primary/10 scale-[1.02]'
              : 'border-border bg-card hover:border-primary hover:bg-primary/5'
            }
          `}
        >
          <input
            type="file"
            accept={ACCEPTED}
            onChange={(e) => processFile(e.target.files?.[0] ?? null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Drop your resume here</p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse — PDF or image (PNG, JPG, WEBP)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" /> PDF
              </span>
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" /> Image
              </span>
              <span>AI-powered analysis</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 bg-card border-2 border-border rounded-xl">
          <div className="p-3 rounded-lg bg-primary/10">
            {isImage ? (
              <ImageIcon className="w-6 h-6 text-primary" />
            ) : (
              <FileText className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB • {isImage ? 'Image' : 'PDF'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={removeFile}
            disabled={isAnalyzing}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-destructive font-medium">{error}</p>}
    </div>
  );
}
