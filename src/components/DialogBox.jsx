import { useEffect, useRef, useState } from 'react';

export default function DialogBox({ speaker, text, isStreaming }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!text) {
      setDisplayed('');
      indexRef.current = 0;
      return;
    }

    function advance() {
      if (indexRef.current < text.length) {
        indexRef.current += 1;
        setDisplayed(text.slice(0, indexRef.current));
        timerRef.current = setTimeout(advance, 18);
      }
    }

    // If new text came in (streaming), just jump ahead without restarting
    if (text.length > indexRef.current) {
      clearTimeout(timerRef.current);
      advance();
    }

    return () => clearTimeout(timerRef.current);
  }, [text]);

  // Reset when speaker changes (new conversation turn)
  const prevSpeakerRef = useRef(speaker);
  useEffect(() => {
    if (speaker !== prevSpeakerRef.current) {
      setDisplayed('');
      indexRef.current = 0;
      prevSpeakerRef.current = speaker;
    }
  }, [speaker]);

  const isDone = !isStreaming && displayed.length === text?.length;

  return (
    <div className="dialog-overlay">
      {speaker && <div className="dialog-speaker">{speaker}:</div>}
      <div className="dialog-text">
        {displayed}
        {isStreaming && <span className="dialog-cursor" />}
        {isDone && displayed && <span className="dialog-arrow">▼</span>}
      </div>
    </div>
  );
}
