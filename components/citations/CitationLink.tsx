/**
 * Citation Link Component
 *
 * Parses text and makes inline citation numbers [1], [2], etc. clickable
 * Clicking scrolls to the citation in the Sources section
 */

"use client";

import React from "react";

interface CitationLinkProps {
  text: string;
  onCitationClick?: (citationNumber: number) => void;
}

export function CitationLink({ text, onCitationClick }: CitationLinkProps) {
  // Parse text and split by citation patterns [1], [2], etc.
  const parts = text.split(/(\[\d+\])/g);

  const handleCitationClick = (citationNumber: number, e: React.MouseEvent) => {
    e.preventDefault();

    // Call callback - parent will handle expansion and scrolling
    onCitationClick?.(citationNumber);
  };

  return (
    <>
      {parts.map((part, index) => {
        // Check if this part is a citation number
        const match = part.match(/\[(\d+)\]/);

        if (match) {
          const citationNumber = parseInt(match[1]);
          return (
            <a
              key={index}
              href={`#citation-${citationNumber}`}
              onClick={(e) => handleCitationClick(citationNumber, e)}
              className="inline-flex items-baseline text-blue-600 hover:text-blue-800 font-medium cursor-pointer no-underline hover:underline"
            >
              [{citationNumber}]
            </a>
          );
        }

        // Regular text
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}

/**
 * Citation Text Component
 *
 * Higher-level component that wraps text content and makes citations clickable
 */
interface CitationTextProps {
  children: string;
  onCitationClick?: (citationNumber: number) => void;
  className?: string;
}

export function CitationText({ children, onCitationClick, className }: CitationTextProps) {
  return (
    <span className={className}>
      <CitationLink text={children} onCitationClick={onCitationClick} />
    </span>
  );
}
