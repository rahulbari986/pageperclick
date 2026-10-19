import type * as React from "react";

/**
 * Renders a React email component to a clean HTML string with valid XHTML transitional doctype.
 * Zero external dependencies; avoids @react-email deprecation warnings and heavy bundle overhead on Vercel.
 *
 * Uses a dynamic import for react-dom/server to satisfy the Next.js 16 Turbopack bundler,
 * which blocks top-level static imports of react-dom/server in application code.
 */
export async function renderEmail(element: React.ReactElement): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n';
  const markup = renderToStaticMarkup(element);
  return doctype + markup;
}
