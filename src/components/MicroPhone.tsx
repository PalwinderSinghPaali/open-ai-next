'use client';
import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';

export default function Microphone({ pushFile }: { pushFile: (file: { blobURL: string; blob: Blob; text: string }) => void }) {
  const [record, setRecord] = useState(false);
  const [open, setOpen] = useState(false);
  const [tempFile, setTempFile] = useState<Blob | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
    // Properly type the WaveSurfer ref
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!open || !tempFile) return;

    wavesurfer.current = WaveSurfer.create({
      container: '#wavesurfer-id',
      waveColor: 'grey',
      progressColor: 'tomato',
      height: 140,
      cursorWidth: 1,
      cursorColor: 'lightgrey',
      barWidth: 2,
      normalize: true,
    //   responsive: true,
      fillParent: true
    });

    wavesurfer.current.on('ready', () => {
      setPlayerReady(true);
    });

    wavesurfer.current.on('play', () => setIsPlaying(true));
    wavesurfer.current.on('pause', () => setIsPlaying(false));

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [open, tempFile]);

  // Load audio when tempFile changes
  useEffect(() => {
    if (tempFile && wavesurfer.current) {
      const audioURL = URL.createObjectURL(tempFile);
      wavesurfer.current.load(audioURL);
    }
  }, [tempFile]);

  const togglePlayback = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const stopPlayback = () => {
    if (wavesurfer.current) {
      wavesurfer.current.stop();
    }
  };

  const startRecording = async () => {
    try {
        console.log("navigator", navigator)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      setTempFile(null);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setTempFile(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecord(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecord(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleDone = async () => {
    if (tempFile) {
        const formData = new FormData();
        formData.append('file', tempFile, 'audio.webm');

        const res = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        console.log("object", data)
      pushFile({
        blobURL: URL.createObjectURL(tempFile),
        blob: tempFile,
        text: data.text
      });
        console.log({
        blobURL: URL.createObjectURL(tempFile),
        blob: tempFile
      });
      setTempFile(null);
      setRecord(false);
      setOpen(false);
    }
  };

  const handleCancel = () => {
    if (mediaRecorderRef.current && record) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setRecord(false);
    setTempFile(null);
    setOpen(false);
  };

  return (
    <>
      <div className="flex justify-center">
        <button 
          onClick={handleClickOpen}
          className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-9 w-9 text-gray-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
            />
          </svg>
        </button>
      </div>
      
      {/* Modal */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ${open ? 'block' : 'hidden'}`}
        onClick={handleCancel}
      >
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Record Audio</h3>
          </div>
          
          <div className="p-4">
            {tempFile ? (
              <div id="wavesurfer-id" className="w-full" />
            ) : (
              <div className="w-full h-48 bg-white border border-gray-200 flex items-center justify-center">
                {record ? (
                  <div className="text-center">
                    <div className="animate-pulse flex space-x-2 justify-center">
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    </div>
                    <p className="mt-2 text-gray-600">Recording...</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Click the record button to start</p>
                )}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t">
            {tempFile && (
              <div className="flex justify-center space-x-4 mb-4">
                <button 
                  onClick={togglePlayback}
                  className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                >
                  {!isPlaying ? (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-9 w-9 text-gray-600" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-9 w-9 text-gray-600" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                  )}
                </button>
                <button 
                  onClick={stopPlayback}
                  className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-9 w-9 text-gray-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" 
                    />
                  </svg>
                </button>
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              {!record && !tempFile && (
                <button 
                  onClick={startRecording}
                  className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-9 w-9 text-red-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                    />
                  </svg>
                </button>
              )}

              {record && (
                <button 
                  onClick={stopRecording}
                  className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-9 w-9 text-gray-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" 
                    />
                  </svg>
                </button>
              )}

              {tempFile && !record && (
                <button 
                  onClick={startRecording}
                  className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-9 w-9 text-gray-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                </button>
              )}

              <button 
                onClick={handleDone}
                className={`p-2 rounded-full hover:bg-gray-200 focus:outline-none ${tempFile && !record ? 'text-green-500' : 'text-gray-400'}`}
                disabled={!tempFile || record}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-9 w-9" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </button>
              
              <button 
                onClick={handleCancel}
                className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-9 w-9 ${tempFile && !record ? 'text-red-500' : 'text-gray-600'}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}