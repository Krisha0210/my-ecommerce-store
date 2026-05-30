import React from 'react';

export default function Loader({ fullPage = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-900"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-500 animate-spin"></div>
      </div>
      <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase animate-pulse">
        Loading...
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center bg-slate-950">
        {content}
      </div>
    );
  }

  return <div className="p-12 w-full flex items-center justify-center">{content}</div>;
}
