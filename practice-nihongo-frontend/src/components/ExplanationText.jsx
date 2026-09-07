import React from 'react';

export default function ExplanationText({ text, className = "" }) {
  if (!text) return null;

  const renderInline = (str) => {
    if (!str) return null;
    const tokens = str.split(/(~~.*?~~|\*\*.*?\*\*|\*.*?\*|\(bỏ ます\)|\(bỏ な\)|\(bỏ い\)|\(bỏ だ\))/gi);
    return tokens.map((part, i) => {
      if (!part) return null;
      if (part.startsWith('~~') && part.endsWith('~~')) {
        const inner = part.slice(2, -2).trim();
        if (inner === 'ます') {
          return <span key={i} className="inline-block bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-1.5 py-[2px] rounded md:rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider ml-1 -translate-y-[1px] md:-translate-y-[2px]">Bỏ MASU</span>;
        }
        if (inner === 'な') {
          return <span key={i} className="inline-block bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 px-1.5 py-[2px] rounded md:rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider ml-1 -translate-y-[1px] md:-translate-y-[2px]">Bỏ NA</span>;
        }
        if (inner === 'い') {
          return <span key={i} className="inline-block bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-1.5 py-[2px] rounded md:rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider ml-1 -translate-y-[1px] md:-translate-y-[2px]">Bỏ I</span>;
        }
        if (inner === 'だ') {
          return <span key={i} className="inline-block bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-1.5 py-[2px] rounded md:rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider ml-1 -translate-y-[1px] md:-translate-y-[2px]">Bỏ DA</span>;
        }
        return <span key={i} className="line-through opacity-50 decoration-slate-500 mx-[1px]">{inner}</span>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      const lowerPart = part.toLowerCase();
      if (lowerPart === '(bỏ ます)') {
        return <span key={i} className="inline-block bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-1.5 py-[2px] rounded md:rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider ml-1 -translate-y-[1px] md:-translate-y-[2px]">Bỏ MASU</span>;
      }
      if (lowerPart === '(bỏ な)') {
        return <span key={i} className="inline-block bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 px-1.5 py-[2px] rounded md:rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider ml-1 -translate-y-[1px] md:-translate-y-[2px]">Bỏ NA</span>;
      }
      if (lowerPart === '(bỏ い)') {
        return <span key={i} className="inline-block bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-1.5 py-[2px] rounded md:rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider ml-1 -translate-y-[1px] md:-translate-y-[2px]">Bỏ I</span>;
      }
      if (lowerPart === '(bỏ だ)') {
        return <span key={i} className="inline-block bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-1.5 py-[2px] rounded md:rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider ml-1 -translate-y-[1px] md:-translate-y-[2px]">Bỏ DA</span>;
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
