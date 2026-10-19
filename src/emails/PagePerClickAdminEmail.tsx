import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Row,
  Column,
  Img,
} from "./components";

export type AdminLeadDetails = {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  company?: string;
  message?: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  ipAddress?: string;
  submittedAt?: string;
};

export type PagePerClickAdminEmailProps = AdminLeadDetails & {
  website?: string;
  headerImageUrl?: string;
  referenceId?: string;
};

const colors = {
  purple: "#3510B8",
  violet: "#8127F5",
  pink: "#D65BFA",
  navy: "#172747",
  blue: "#0878F9",
  light: "#F0F4FC",
  footer: "#F0F4FC",
  white: "#FFFFFF",
  grayBorder: "#E5EAF6",
  grayText: "#4A5870",
  successGreen: "#059669",
};

const pageStyle = {
  margin: "0",
  padding: "20px 8px",
  backgroundColor: "#F2F5FA",
  fontFamily: "Arial, Helvetica, sans-serif",
  color: colors.navy,
};

const summaryLabelStyle: React.CSSProperties = {
  padding: "6px 0",
  fontSize: "14px",
  lineHeight: "22px",
  fontWeight: "bold",
  color: colors.navy,
  width: "140px",
  verticalAlign: "top",
  whiteSpace: "nowrap",
};

const summaryColonStyle: React.CSSProperties = {
  padding: "6px 0",
  fontSize: "14px",
  lineHeight: "22px",
  fontWeight: "bold",
  color: colors.navy,
  width: "24px",
  textAlign: "center",
  verticalAlign: "top",
};

const summaryValueStyle: React.CSSProperties = {
  padding: "6px 0 6px 14px",
  fontSize: "14px",
  lineHeight: "22px",
  color: "#27364F",
  wordBreak: "break-word",
  verticalAlign: "top",
};

export default function PagePerClickAdminEmail({
  name = "Prospective Client",
  email = "",
  phone = "",
  service = "",
  company = "",
  message = "",
  utmSource = "Direct",
  utmMedium = "None",
  utmCampaign = "None",
  ipAddress = "127.0.0.1",
  submittedAt,
  website = "https://www.pageperclick.com",
  headerImageUrl,
  referenceId,
}: PagePerClickAdminEmailProps) {
  const normalizedWebsite = (website || "https://www.pageperclick.com").replace(/\/+$/, "");
  const headerSrc =
    headerImageUrl || `${normalizedWebsite}/images/email-header-admin.png`;

  const leadDetails = [
    ["Client Name", name || "N/A"],
    ["Email Address", email || "N/A"],
    ["Phone Number", phone || "N/A"],
    ["Company", company || "Not specified"],
    ["Interested Service", service || "General Inquiry"],
  ];

  const attributionDetails = [
    ...(referenceId ? [["Reference", `#${referenceId}`]] : []),
    ["Source", utmSource || "Direct"],
    ["Medium", utmMedium || "None"],
    ["Campaign", utmCampaign || "None"],
    ["IP Address", ipAddress || "N/A"],
  ];

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>
          {`
            :root {
              color-scheme: light dark;
              supported-color-schemes: light dark;
            }
            @media (prefers-color-scheme: dark) {
              body, .page-body {
                background-color: #0B0F19 !important;
              }
              .email-container {
                background-color: #111827 !important;
                border-color: #1F2937 !important;
              }
              .body-heading {
                color: #FFFFFF !important;
              }
              .body-text {
                color: #E5E7EB !important;
              }
              .email-card {
                background-color: #18202F !important;
                border-color: #2D3B52 !important;
              }
              .email-card-title {
                color: #F9FAFB !important;
                border-bottom-color: #2D3B52 !important;
              }
              .summary-label {
                color: #93C5FD !important;
              }
              .summary-colon {
                color: #9CA3AF !important;
              }
              .summary-value {
                color: #F3F4F6 !important;
              }
              .meta-card {
                background-color: #18202F !important;
                border-color: #2D3B52 !important;
              }
              .meta-title {
                color: #CBD5E1 !important;
              }
              .meta-label {
                color: #94A3B8 !important;
              }
              .meta-colon {
                color: #94A3B8 !important;
              }
              .meta-value {
                color: #F1F5F9 !important;
              }
              .email-footer {
                background-color: #0B0F19 !important;
                border-top-color: #1F2937 !important;
              }
              .footer-title {
                color: #F9FAFB !important;
              }
              .footer-text {
                color: #94A3B8 !important;
              }
            }
          `}
        </style>
      </Head>
      <Preview>
        Inbound inquiry details for {name} ({service || "General Inquiry"}).
      </Preview>

      <Body className="page-body" style={pageStyle}>
        <Container
          className="email-container"
          style={{
            maxWidth: "640px",
            width: "100%",
            margin: "0 auto",
            backgroundColor: colors.white,
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid #E2E8F0",
          }}
        >
          {/* Brand header banner */}
          <Section
            style={{
              padding: "0",
              margin: "0",
              backgroundColor: "transparent",
              lineHeight: "0",
              textAlign: "center",
            }}
          >
            <Link
              href={`${normalizedWebsite}/admin`}
              target="_blank"
              style={{ display: "block", textDecoration: "none", margin: "0", padding: "0" }}
            >
              <Img
                src={headerSrc}
                alt="PagePerClick Admin Notification"
                width="640"
                style={{
                  width: "100%",
                  maxWidth: "640px",
                  height: "auto",
                  display: "block",
                  border: "none",
                  outline: "none",
                  textDecoration: "none",
                  borderRadius: "20px 20px 0 0",
                }}
              />
            </Link>
          </Section>

          {/* Email body content */}
          <Section style={{ padding: "30px 28px 24px" }}>
            <Text
              className="body-heading"
              style={{
                margin: "0 0 8px",
                color: colors.navy,
                fontSize: "24px",
                lineHeight: "30px",
                fontWeight: "bold",
              }}
            >
              Inbound Lead Notification
            </Text>

            <Text
              className="body-text"
              style={{
                margin: "0 0 24px",
                fontSize: "15px",
                lineHeight: "24px",
                color: "#4A5870",
              }}
            >
              A prospective client has submitted an inquiry through the contact form
              on{" "}
              <Link
                href={normalizedWebsite}
                style={{ color: colors.blue, textDecoration: "underline" }}
              >
                pageperclick.com
              </Link>
              . Here are the full submission details:
            </Text>

            {/* Lead Information Card */}
            <Section
              className="email-card"
              style={{
                padding: "20px 20px",
                backgroundColor: colors.light,
                borderRadius: "14px",
                border: "1px solid #E5EAF6",
                margin: "0 0 20px",
              }}
            >
              <Text
                className="email-card-title"
                style={{
                  margin: "0 0 14px",
                  fontSize: "17px",
                  lineHeight: "22px",
                  fontWeight: "bold",
                  color: "#111827",
                  borderBottom: "1px solid #DCE4F1",
                  paddingBottom: "8px",
                }}
              >
                Client Information
              </Text>

              <table
                role="presentation"
                cellPadding="0"
                cellSpacing="0"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <tbody>
                  {leadDetails.map(([label, value]) => {
                    const isEmail = label.includes("Email") && value.includes("@");
                    const isPhone = label.includes("Phone") && value.length > 5;

                    return (
                      <tr key={label}>
                        <td className="summary-label" style={summaryLabelStyle}>{label}</td>
                        <td className="summary-colon" style={summaryColonStyle}>:</td>
                        <td className="summary-value" style={summaryValueStyle}>
                          {isEmail ? (
                            <Link
                              href={`mailto:${value}`}
                              style={{
                                color: colors.blue,
                                textDecoration: "underline",
                                fontWeight: "500",
                              }}
                            >
                              {value}
                            </Link>
                          ) : isPhone ? (
                            <Link
                              href={`tel:${value}`}
                              style={{
                                color: colors.blue,
                                textDecoration: "underline",
                                fontWeight: "500",
                              }}
                            >
                              {value}
                            </Link>
                          ) : (
                            value
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Section>

            {/* Client Message Section */}
            <Section
              className="email-card"
              style={{
                padding: "18px 20px",
                backgroundColor: "#FAF5FF",
                borderRadius: "14px",
                border: "1px solid #E9D5FF",
                margin: "0 0 20px",
              }}
            >
              <Text
                className="email-card-title"
                style={{
                  margin: "0 0 10px",
                  fontSize: "15px",
                  lineHeight: "20px",
                  fontWeight: "bold",
                  color: "#6B21A8",
                }}
              >
                Client Message:
              </Text>
              <Text
                className="body-text"
                style={{
                  margin: "0",
                  fontSize: "14px",
                  lineHeight: "22px",
                  color: "#374151",
                  whiteSpace: "pre-wrap",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{message || "No message provided."}&rdquo;
              </Text>
            </Section>

            {/* Quick Actions */}
            <Section style={{ margin: "24px 0", textAlign: "center" }}>
              {email && (
                <Link
                  href={`mailto:${email}?subject=${encodeURIComponent(
                    `Regarding your inquiry with PagePerClick - ${service || "Digital Marketing"}`
                  )}`}
                  style={{
                    display: "inline-block",
                    backgroundColor: colors.purple,
                    color: colors.white,
                    fontSize: "14px",
                    fontWeight: "bold",
                    textDecoration: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    marginRight: "10px",
                    marginBottom: "8px",
                  }}
                >
                  Reply to {name.split(" ")[0] || "Client"}
                </Link>
              )}
              <Link
                href={`${normalizedWebsite}/admin`}
                style={{
                  display: "inline-block",
                  backgroundColor: colors.light,
                  color: colors.navy,
                  border: "1px solid #CBD5E1",
                  fontSize: "14px",
                  fontWeight: "bold",
                  textDecoration: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              >
                Open Admin Portal
              </Link>
            </Section>

            {/* Marketing Attribution & Meta Card */}
            <Section
              className="meta-card"
              style={{
                padding: "14px 18px",
                backgroundColor: "#F8FAFC",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                margin: "20px 0 0",
              }}
            >
              <Text
                className="meta-title"
                style={{
                  margin: "0 0 8px",
                  fontSize: "13px",
                  lineHeight: "18px",
                  fontWeight: "bold",
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Attribution & Security Details
              </Text>

              <table
                role="presentation"
                cellPadding="0"
                cellSpacing="0"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <tbody>
                  {attributionDetails.map(([label, value]) => (
                    <tr key={label}>
                      <td
                        className="meta-label"
                        style={{
                          width: "90px",
                          padding: "3px 0",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#64748B",
                          verticalAlign: "top",
                        }}
                      >
                        {label}
                      </td>
                      <td
                        className="meta-colon"
                        style={{
                          width: "20px",
                          padding: "3px 0",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#64748B",
                          textAlign: "center",
                          verticalAlign: "top",
                        }}
                      >
                        :
                      </td>
                      <td
                        className="meta-value"
                        style={{
                          padding: "3px 0 3px 8px",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#334155",
                          fontWeight: "500",
                          verticalAlign: "top",
                        }}
                      >
                        {value}
                      </td>
                    </tr>
                  ))}
                  {submittedAt && (
                    <tr>
                      <td
                        className="meta-label"
                        style={{
                          width: "90px",
                          padding: "3px 0",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#64748B",
                          verticalAlign: "top",
                        }}
                      >
                        Received
                      </td>
                      <td
                        className="meta-colon"
                        style={{
                          width: "20px",
                          padding: "3px 0",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#64748B",
                          textAlign: "center",
                          verticalAlign: "top",
                        }}
                      >
                        :
                      </td>
                      <td
                        className="meta-value"
                        style={{
                          padding: "3px 0 3px 8px",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#334155",
                          verticalAlign: "top",
                        }}
                      >
                        {submittedAt}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>
          </Section>

          {/* Footer */}
          <Section
            className="email-footer"
            style={{
              backgroundColor: "#F0F4FC",
              padding: "18px 20px",
              textAlign: "center",
              borderTop: "1px solid #CAD4E4",
            }}
          >
            <Text
              className="footer-title"
              style={{
                margin: "0",
                fontSize: "12px",
                lineHeight: "18px",
                fontWeight: "bold",
                color: "#0F172A",
              }}
            >
              PagePerClick Internal Lead Notification
            </Text>
            <Text
              className="footer-text"
              style={{
                margin: "6px 0 0",
                fontSize: "11px",
                lineHeight: "16px",
                color: "#334155",
              }}
            >
              This is an automated operational alert generated by pageperclick.com.
              <br />
              Confidential &middot; For authorized team use only.
            </Text>

            {referenceId && (
              <Text
                style={{
                  margin: "6px 0 0",
                  fontSize: "10px",
                  lineHeight: "14px",
                  color: "#64748B",
                }}
              >
                Lead Ref: #{referenceId}
              </Text>
            )}
          </Section>

          {/* Anti-quote dynamic delimiter: Prevents Gmail from collapsing footer into 'Show quoted text' */}
          <div
            style={{
              display: "none",
              fontSize: "1px",
              color: "transparent",
              lineHeight: "1px",
              maxHeight: "0px",
              maxWidth: "0px",
              opacity: 0,
              overflow: "hidden",
            }}
          >
            {`ppc-lead-token:${referenceId || ""}`}
          </div>
        </Container>
      </Body>
    </Html>
  );
}
