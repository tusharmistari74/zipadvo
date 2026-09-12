'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@legalhub/utils';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from './button';

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  progress?: number;
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  uploadedFiles?: UploadedFileItem[];
  onRemoveFile?: (fileId: string) => void;
  accept?: string;
  maxSizeBytes?: number; // default 25MB
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  helperText?: string;
}

export function FileUploader({
  onFilesSelected,
  uploadedFiles = [],
  onRemoveFile,
  accept = '.pdf,image/jpeg,image/png',
  maxSizeBytes = 25 * 1024 * 1024,
  maxFiles = 5,
  disabled = false,
  className,
  label,
  helperText,
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndPassFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setValidationError(null);

    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file && file.size > maxSizeBytes) {
        setValidationError(`File "${file.name}" exceeds the maximum 25MB size limit.`);
        return;
      }
      if (file) validFiles.push(file);
    }

    if (validFiles.length > maxFiles) {
      setValidationError(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }

    onFilesSelected(validFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      validateAndPassFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer select-none text-center',
          isDragOver
            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
            : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-400',
          disabled && 'cursor-not-allowed opacity-50 bg-slate-100',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          disabled={disabled}
          onChange={(e) => validateAndPassFiles(e.target.files)}
          className="hidden"
        />

        <div className="p-3 bg-blue-50 text-blue-700 rounded-full mb-2">
          <UploadCloud className="h-6 w-6" />
        </div>

        <p className="text-sm font-semibold text-slate-800">
          Click to upload or drag & drop documents
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Supported formats: PDF, JPEG, PNG (Max 25MB per document)
        </p>
      </div>

      {validationError && (
        <p className="text-xs font-medium text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          {validationError}
        </p>
      )}

      {helperText && !validationError && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}

      {/* Uploaded Files Queue */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2 pt-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-xs"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="h-5 w-5 text-blue-700 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {file.status === 'completed' && (
                  <span className="text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                )}
                {file.status === 'uploading' && (
                  <span className="text-xs font-semibold text-blue-700">
                    {file.progress || 0}%
                  </span>
                )}
                {file.status === 'error' && (
                  <span className="text-rose-600">
                    <AlertCircle className="h-4 w-4" />
                  </span>
                )}

                {onRemoveFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(file.id);
                    }}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
