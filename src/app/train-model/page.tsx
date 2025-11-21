'use client';
import { useState } from 'react';

export default function HomePage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedPath, setUploadedPath] = useState('');

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const { path } = await uploadRes.json();
    setUploadedPath(path);

    const processRes = await fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    const msg = await processRes.json();
    alert(msg.message);
  };

  const handleAsk = async () => {
    const res = await fetch('/api/ask-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAnswer(data.answer);
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload a Document</h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
      <button
        className="px-4 py-2 mt-2 bg-blue-600 text-white rounded"
        onClick={handleUpload}
      >
        Upload & Process
      </button>

      <h2 className="text-xl font-semibold mt-6 mb-2">Ask a Question</h2>
      <input
        type="text"
        className="border px-3 py-2 w-full"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button
        className="px-4 py-2 mt-2 bg-green-600 text-white rounded"
        onClick={handleAsk}
      >
        Ask
      </button>

      {answer && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-medium">Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </main>
  );
}
