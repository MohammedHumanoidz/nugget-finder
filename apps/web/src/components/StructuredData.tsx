import React from 'react';

interface StructuredDataProps {
  data: Record<string, unknown>;
}

/**
 * A component to safely inject JSON-LD structured data into the page head.
 * This helps search engines understand the content and context of the page.
 * @param {StructuredDataProps} props The structured data object.
 */
export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}