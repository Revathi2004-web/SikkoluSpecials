import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value: string;
  onChange: (imageData: string) => void;
  onRemove: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  if (value) {
    return (
      <div className="relative group">
        <img 
          src={value} 
          alt="Product preview" 
          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <X className="w-4 h-4 mr-1" />
          Remove
        </Button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-all duration-200
        ${isDragging 
          ? 'border-primary bg-primary/5 scale-105' 
          : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-2">
        {isDragging ? (
          <>
            <Upload className="w-12 h-12 text-primary animate-bounce" />
            <p className="text-lg font-medium text-primary">Drop image here!</p>
          </>
        ) : (
          <>
            <ImageIcon className="w-12 h-12 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              Drag & drop product image here
            </p>
            <p className="text-xs text-gray-500">
              or click to browse from your computer
            </p>
            <div className="mt-2 text-xs text-gray-400">
              Supported: JPG, PNG, GIF, WebP
            </div>
          </>
        )}
      </div>
    </div>
  );
}
