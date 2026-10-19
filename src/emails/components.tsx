import * as React from "react";

export function Html({
  children,
  lang = "en",
}: {
  children: React.ReactNode;
  lang?: string;
}) {
  return (
    <html lang={lang}>
      {children}
    </html>
  );
}

export function Head({ children }: { children?: React.ReactNode }) {
  return <head>{children}</head>;
}

export function Preview({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "none",
        fontSize: "1px",
        color: "#333333",
        lineHeight: "1px",
        maxHeight: "0px",
        maxWidth: "0px",
        opacity: 0,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

export function Body({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <body className={className} style={style}>
      {children}
    </body>
  );
}

export function Container({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <table
      align="center"
      width="100%"
      border={0}
      cellPadding="0"
      cellSpacing="0"
      role="presentation"
      className={className}
      style={{ maxWidth: "100%", ...style }}
    >
      <tbody>
        <tr>
          <td>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function Section({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <table
      width="100%"
      border={0}
      cellPadding="0"
      cellSpacing="0"
      role="presentation"
      className={className}
      style={style}
    >
      <tbody>
        <tr>
          <td>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function Row({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <table
      width="100%"
      align="center"
      border={0}
      cellPadding="0"
      cellSpacing="0"
      role="presentation"
      className={className}
      style={style}
    >
      <tbody style={{ width: "100%" }}>
        <tr style={{ width: "100%" }}>{children}</tr>
      </tbody>
    </table>
  );
}

export function Column({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <td className={className} style={style}>
      {children}
    </td>
  );
}

export function Text({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <p className={className} style={style}>
      {children}
    </p>
  );
}

export function Link({
  children,
  href,
  target,
  className,
  style,
}: {
  children: React.ReactNode;
  href?: string;
  target?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <a href={href} target={target} className={className} style={style}>
      {children}
    </a>
  );
}

export function Hr({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <hr
      className={className}
      style={{
        width: "100%",
        border: "none",
        borderTop: "1px solid #eaeaea",
        ...style,
      }}
    />
  );
}

export function Img({
  src,
  alt,
  width,
  height,
  className,
  style,
}: {
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
    />
  );
}
