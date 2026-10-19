import type * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * Renders a React email component to a clean HTML string with valid XHTML transitional doctype.
 * Zero external dependencies; avoids @react-email deprecation warnings and heavy bundle overhead on Vercel.
 */
export async function renderEmail(element: React.ReactElement): Promise<string> {
  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n';
  const markup = renderToStaticMarkup(element);
  return doctype + markup;
}
