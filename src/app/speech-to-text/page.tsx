'use client';

import React, { useState } from 'react';
import Microphone from '@/components/MicroPhone';
import AudioPlayer from '@/components/AudioPlayer';

function SpeechToTextClient() {
  const [files, setFiles] = useState<{ blob: Blob; blobURL: string; text: string }[]>([]);

  const pushFile = (file: { blob: Blob; blobURL: string; text: string }) => {
    setFiles((prev) => [...prev, file]);
  };

  return (
    <>
      <Microphone pushFile={pushFile} />
      <div className="flex flex-col space-y-6 mt-4">
        {files.map((file, index) => (
          <div key={index}>
            <AudioPlayer file={file} />
          </div>
        ))}
      </div>
    </>
  );
}

export default SpeechToTextClient;
