import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  cursorClassName?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  words,
  typingSpeed = 65,
  deletingSpeed = 35,
  pauseDuration = 2200,
  className = '',
  cursorClassName = 'text-[#00ff88]',
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const currentWord = words[wordIndex % words.length];

    let timer: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      // Deleting letters
      timer = setTimeout(() => {
        setText((prev) => prev.slice(0, -1));
        if (text.length <= 1) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }, deletingSpeed);
    } else {
      // Typing letters
      if (text.length < currentWord.length) {
        timer = setTimeout(() => {
          setText(currentWord.slice(0, text.length + 1));
        }, typingSpeed);
      } else {
        // Full word typed, pause before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  // Click to immediately skip to next word
  const handleSkip = () => {
    setIsDeleting(false);
    setText(words[(wordIndex + 1) % words.length]);
    setWordIndex((prev) => (prev + 1) % words.length);
  };

  return (
    <span
      onClick={handleSkip}
      className={`inline-flex items-center cursor-pointer select-none group ${className}`}
      title="Click to advance to next capability"
    >
      <span>{text}</span>
      <span
        className={`inline-block w-[2px] h-[1.1em] ml-1 bg-current animate-pulse align-middle ${cursorClassName}`}
        style={{ animationDuration: '0.8s' }}
      />
    </span>
  );
};

export default TypewriterText;
