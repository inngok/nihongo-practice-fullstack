import React from 'react';

export default function ExplanationText({ text, className = "" }) {
  if (!text) return null;

  const renderInline = (str) => {
    if (!str) return null;
    const tokens = str.split(/(~~.*?~~|\*\*.*?\*\*|\*.*?\*)/g);
    return tokens.map((part, i) => {
      if (part.startsWith('~~') && part.endsWith('~~')) {
        return <span key={i} className="line-through opacity-50 decoration-slate-500 mx-[1px]">{part.slice(2, -2)}</span>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  // Split text by the [[ ... ]] syntax
  // Regex to match [[ ... || ... ]] or [[ ... ]]
  const regex = /\[\[([\s\S]*?)(?:\|\|([\s\S]*?))?\]\]/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add the text before the match
    if (match.index > lastIndex) {
      let textBefore = text.slice(lastIndex, match.index);
      textBefore = textBefore.replace(/\n+$/, ' ');
      if (textBefore) {
        parts.push(<span key={`text-${lastIndex}`}>{renderInline(textBefore)}</span>);
      }
    }
    
    // Add the custom block
    const leftSide = match[1].trim().split('\n').filter(l => l.trim());
    const rightSideLines = match[2] ? match[2].trim().split('\n').filter(l => l.trim()) : null;
    
    parts.push(
      <span key={`block-${match.index}`} className="mx-1 inline-flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 md:p-3 rounded-xl border border-slate-200 dark:border-slate-700 align-middle">
        <span className="flex flex-col items-center justify-center gap-1 text-sm md:text-base font-medium text-slate-700 dark:text-slate-300">
          {leftSide.map((line, i) => (
            <span key={i} className="block">{renderInline(line.trim())}</span>
          ))}
        </span>
        {rightSideLines && (
          <>
            <span className="w-[1.5px] self-stretch bg-slate-300 dark:bg-slate-600 mx-1"></span>
            <span className="flex flex-col items-start justify-center gap-1 text-sm md:text-base font-black text-slate-900 dark:text-white">
              {rightSideLines.map((line, i) => (
                <span key={i} className="block">{renderInline(line.trim())}</span>
              ))}
            </span>
          </>
        )}
      </span>
    );
    
    lastIndex = regex.lastIndex;
  }
  
  // Add the remaining text
  if (lastIndex < text.length) {
    let remainingText = text.slice(lastIndex);
    if (remainingText) {
      parts.push(<span key={`text-${lastIndex}`}>{renderInline(remainingText)}</span>);
    }
  }

  return <div className={`whitespace-pre-line ${className}`}>{parts}</div>;
}
