import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { v4 as uuidv4 } from "uuid";

const faces = [
  "http://i.pravatar.cc/300?img=1",
  "http://i.pravatar.cc/300?img=2",
  "http://i.pravatar.cc/300?img=3",
  "http://i.pravatar.cc/300?img=4"
];

function AudioPlayer({ file }: { file?: { blobURL: string; text: string } }) {
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const wavesurferId = `wavesurfer--${uuidv4()}`;

  // Simple debounce function
  const debounce = (func: () => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(func, wait);
    };
  };

  useEffect(() => {
    wavesurfer.current = WaveSurfer.create({
      container: `#${wavesurferId}`,
      waveColor: "grey",
      progressColor: "tomato",
      height: 70,
      cursorWidth: 1,
      cursorColor: "lightgray",
      barWidth: 2,
      normalize: true,
    //   responsive: true,
      fillParent: true
    });

    // const wav = require("../../static/12346 3203.ogg");
    // wavesurfer.current.load(wav);

    wavesurfer.current.on("ready", () => {
      setPlayerReady(true);
    });

    const handleResize = debounce(() => {
      wavesurfer.current?.empty();
    //   wavesurfer.current?.drawBuffer();
    }, 150);

    wavesurfer.current.on("play", () => setIsPlaying(true));
    wavesurfer.current.on("pause", () => setIsPlaying(false));
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      wavesurfer.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (file?.blobURL && wavesurfer.current) {
      wavesurfer.current.load(file.blobURL);
    }
  }, [file]);

  const togglePlayback = () => {
    if (!wavesurfer.current) return;
    wavesurfer.current.playPause();
  };

  const stopPlayback = () => {
    wavesurfer.current?.stop();
  };

  return (
    <div className="max-w-[600px] min-w-[240px] mx-auto transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg overflow-hidden">
      <div className="flex flex-col">
        {/* User header */}
        <div className="flex items-center p-4">
          <img 
            src={faces[0]} 
            alt="User avatar" 
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="font-medium">Username</p>
            <p className="text-sm text-gray-500">@username · 11h ago</p>
          </div>
        </div>

        {/* Waveform */}
        <div id={wavesurferId} className="w-full" />

        {/* Controls */}
        <div className="flex items-center justify-between p-3">
          <div className="flex space-x-2">
            <button 
              onClick={togglePlayback}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {!isPlaying ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 text-gray-700" 
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
                  className="h-4 w-4 text-gray-700" 
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
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              aria-label="Stop"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-gray-700" 
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

          <div className="flex space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none" aria-label="Like">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-blue-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none" aria-label="Share">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
                />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none" aria-label="Comment">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-green-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
            </button>
            <div className="px-4 pb-2 text-gray-800">
                <p className="text-sm italic">📝 {file?.text}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;