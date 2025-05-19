import { ChangeEvent } from 'react';
import clsx from 'clsx';

interface FileUploadProps {
  label: string;
  accept: string;
  multiple?: boolean;
  onChange: (files: FileList | null) => void;
  className?: string;
}

export default function FileUpload({ label, accept, multiple = false, onChange, className }: FileUploadProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.files);
  };

  return (
    <div className={clsx('w-full', className)}>
      <label className="block text-lg font-semibold text-gray-900 mb-2">{label}</label>
      <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-blue-200 border-dashed rounded-lg hover:border-blue-400 transition-all bg-blue-50">
        <div className="space-y-2 text-center">
          <div className="text-blue-500 text-4xl mb-4">📄</div>
          <div className="flex text-sm text-gray-600">
            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              <span>Upload files</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            Supported formats: {accept.split(',').join(', ')} (Max 10MB)
          </p>
        </div>
      </div>
    </div>
  );
}