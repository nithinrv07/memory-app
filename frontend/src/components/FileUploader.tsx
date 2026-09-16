'use client';

import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface FileUploaderProps {
  onUploadSuccess: () => void;
}

export default function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/ingest', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to parse document');

      setStatus('Document ingested & graph extracted!');
      onUploadSuccess();
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-lime-400 p-8 rounded-3xl border border-lime-500 shadow-sm text-slate-950">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-lime-400">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight">Ingest Decision Record</h3>
          <p className="text-xs text-slate-800 font-medium">Upload text logs, meeting notes, or project PRDs</p>
        </div>
      </div>

      <div className="mt-6 bg-white/60 backdrop-blur border-2 border-dashed border-slate-900/20 rounded-2xl p-6 text-center">
        <FileText className="w-8 h-8 mx-auto text-slate-800 mb-2 opacity-60" />
        <label className="inline-block cursor-pointer bg-slate-950 text-white font-medium text-xs px-5 py-2.5 rounded-full hover:bg-slate-800 transition shadow-sm mb-2">
          Select Document (.txt, .md)
          <input
            type="file"
            accept=".txt,.md"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="text-xs text-slate-700">Supported Formats: UTF-8 Plain Text Documents</p>
      </div>

      {uploading && <p className="text-xs font-semibold text-slate-900 mt-3 text-center">Parsing SpaCy entities & FAISS vectors...</p>}
      {status && (
        <p className={`text-xs font-semibold mt-3 flex items-center justify-center gap-1 ${status.startsWith('Error') ? 'text-red-700' : 'text-slate-950'}`}>
          {status.startsWith('Error') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {status}
        </p>
      )}
    </div>
  );
}