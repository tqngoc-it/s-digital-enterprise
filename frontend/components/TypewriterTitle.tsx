'use client';

import { useState, useEffect } from 'react';

interface TypewriterTitleProps {
  text?: string;
  words?: string[];
  className?: string;
}

export default function TypewriterTitle({
  text = 'Toàn Diện',
  words,
  className = 'text-[#FF5722]',
}: TypewriterTitleProps) {
  const wordList = words && words.length > 0 ? words : [text, 'Đột Phá', 'Đa Kênh', 'Hiệu Quả'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullWord = wordList[currentWordIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedText.length < fullWord.length) {
        timeout = setTimeout(() => {
          setDisplayedText(fullWord.slice(0, displayedText.length + 1));
        }, 120);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(fullWord.slice(0, displayedText.length - 1));
        }, 60);
      } else {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % wordList.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentWordIndex, wordList]);

  return (
    <span className={`inline-flex items-center text-[#FF5722] font-black drop-shadow-[0_0_20px_rgba(255,87,34,0.45)] ${className}`}>
      <span>{displayedText}</span>
      <span className="inline-block w-[4px] h-[0.85em] ml-1 bg-[#FF5722] animate-pulse shadow-[0_0_12px_#FF5722]" />
    </span>
  );
}
