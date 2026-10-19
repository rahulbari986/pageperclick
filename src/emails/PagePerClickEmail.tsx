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
  Img,
} from "./components";

export type InquiryDetails = {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  company?: string;
  message?: string;
};

export type PagePerClickEmailProps = InquiryDetails & {
  contactEmail?: string;
  website?: string;
  headerImageUrl?: string;
  socialIconUrls?: Partial<Record<"facebook" | "instagram" | "youtube" | "linkedin" | "x", string>>;
  referenceId?: string;
  submittedAt?: string;
};

const colors = {
  purple: "#3510B8",
  purpleGradient: "linear-gradient(135deg, #260B87 0%, #4B12D4 48%, #9B2CF5 100%)",
  violet: "#8127F5",
  pink: "#D65BFA",
  navy: "#172747",
  blue: "#0878F9",
  light: "#F0F4FC",
  footer: "#F0F4FC",
  white: "#FFFFFF",
  grayBorder: "#E5EAF6",
  textMuted: "#4B5563",
  textDark: "#111827",
};

const pageStyle: React.CSSProperties = {
  margin: "0",
  padding: "24px 8px",
  backgroundColor: "#F2F5FA",
  fontFamily: "Arial, Helvetica, sans-serif",
  color: colors.navy,
};

const summaryLabelStyle: React.CSSProperties = {
  padding: "7px 0",
  fontSize: "14px",
  lineHeight: "22px",
  fontWeight: "bold",
  color: colors.navy,
  width: "95px",
  verticalAlign: "top",
  whiteSpace: "nowrap",
};

const summaryColonStyle: React.CSSProperties = {
  padding: "7px 0",
  fontSize: "14px",
  lineHeight: "22px",
  fontWeight: "bold",
  color: colors.navy,
  width: "24px",
  textAlign: "center",
  verticalAlign: "top",
};

const summaryValueStyle: React.CSSProperties = {
  padding: "7px 0 7px 12px",
  fontSize: "14px",
  lineHeight: "22px",
  color: "#27364F",
  wordBreak: "break-word",
  verticalAlign: "top",
};

const defaultSocialChannels = [
  {
    name: "Facebook",
    key: "facebook" as const,
    url: "https://www.facebook.com/pageperclicks",
    file: "facebook.png",
  },
  {
    name: "Instagram",
    key: "instagram" as const,
    url: "https://instagram.com/pageperclick/",
    file: "instagram.png",
  },
  {
    name: "YouTube",
    key: "youtube" as const,
    url: "https://www.youtube.com/@pageperclick",
    file: "youtube.png",
  },
  {
    name: "LinkedIn",
    key: "linkedin" as const,
    url: "https://www.linkedin.com/company/pageperclick/",
    file: "linkedin.png",
  },
  {
    name: "X (Twitter)",
    key: "x" as const,
    url: "https://x.com/pageperclick",
    file: "x.png",
  },
];

export default function PagePerClickEmail({
  name = "",
  email = "",
  phone = "",
  service = "",
  company = "",
  message = "",
  contactEmail = "contact@pageperclick.com",
  website = "https://www.pageperclick.com",
  headerImageUrl,
  socialIconUrls,
  referenceId,
  submittedAt,
}: PagePerClickEmailProps) {
  const normalizedWebsite = (website || "https://www.pageperclick.com").replace(/\/+$/, "");
  const headerSrc =
    headerImageUrl || `${normalizedWebsite}/images/email-header-client.png`;

  const socialLinks = defaultSocialChannels.map((item) => ({
    name: item.name,
    url: item.url,
    icon: (socialIconUrls && socialIconUrls[item.key]) || `${normalizedWebsite}/images/social/${item.file}`,
  }));

  const details = [
    ["Name", name || "N/A"],
    ["Email", email || "N/A"],
    ["Phone", phone || "N/A"],
    ["Service", service || "General Inquiry"],
    ["Company", company || "N/A"],
    ["Message", message || "----"],
  ];

  const clientName = name ? name.trim() : "";

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
              .body-subheading {
                color: #A5B4FC !important;
              }
              .body-greeting {
                color: #F9FAFB !important;
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
              .step-card {
                background-color: #18202F !important;
                border-color: #2D3B52 !important;
              }
              .step-title {
                color: #F9FAFB !important;
              }
              .step-desc {
                color: #CBD5E1 !important;
              }
              .body-signoff {
                color: #F3F4F6 !important;
              }
              .email-footer {
                background-color: #0B0F19 !important;
                border-top-color: #1F2937 !important;
              }
              .footer-title {
                color: #F9FAFB !important;
              }
              .footer-sub {
                color: #CBD5E1 !important;
              }
              .footer-link {
                color: #60A5FA !important;
              }
              .footer-hr {
                border-color: #1F2937 !important;
              }
              .footer-legal {
                color: #94A3B8 !important;
              }
              .footer-legal-link {
                color: #93C5FD !important;
              }
            }
          `}
        </style>
      </Head>
      <Preview>
        Thank you for contacting PagePerClick! We have received your inquiry.
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
          {/* Brand Header Banner */}
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
              href={website}
              target="_blank"
              style={{ display: "block", textDecoration: "none", margin: "0", padding: "0" }}
            >
              <Img
                src={headerSrc}
                alt="PagePerClick - Great Things Start with a Click"
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

          {/* Email Body Content */}
          <Section style={{ padding: "32px 30px 24px" }}>
            <Text
              className="body-heading"
              style={{
                margin: "0 0 6px",
                textAlign: "center",
                color: colors.navy,
                fontSize: "26px",
                lineHeight: "32px",
                fontWeight: "bold",
              }}
            >
              Thank You for Contacting Us!
            </Text>

            <Text
              className="body-subheading"
              style={{
                margin: "0 0 26px",
                textAlign: "center",
                color: "#6366F1",
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: "600",
                letterSpacing: "0.3px",
              }}
            >
              YOUR INQUIRY HAS BEEN RECEIVED &bull; WE&apos;RE ON IT
            </Text>

            <Text
              className="body-greeting"
              style={{
                margin: "0 0 14px",
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: "bold",
                color: colors.navy,
              }}
            >
              Hi{clientName ? ` ${clientName}` : " there"},
            </Text>

            <Text
              className="body-text"
              style={{
                margin: "0 0 24px",
                fontSize: "15px",
                lineHeight: "25px",
                color: "#374151",
              }}
            >
              Thank you for reaching out to <strong>PagePerClick</strong>. We&apos;re
              thrilled about the possibility of collaborating with you. Our digital
              growth team has received your project details and is currently analyzing
              the best strategies to help you reach your goals.
            </Text>

            {/* Inquiry Summary Box */}
            <Section
              className="email-card"
              style={{
                padding: "20px 22px",
                backgroundColor: colors.light,
                borderRadius: "14px",
                border: "1px solid #E5EAF6",
                margin: "0 0 24px",
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
                Inquiry Summary
              </Text>

              <table
                role="presentation"
                cellPadding="0"
                cellSpacing="0"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <tbody>
                  {details.map(([label, value]) => (
                    <tr key={label}>
                      <td className="summary-label" style={summaryLabelStyle}>{label}</td>
                      <td className="summary-colon" style={summaryColonStyle}>:</td>
                      <td className="summary-value" style={summaryValueStyle}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* What Happens Next Roadmap */}
            <Section
              className="step-card"
              style={{
                padding: "20px 22px",
                backgroundColor: "#F9FAFB",
                borderRadius: "14px",
                border: "1px solid #E5E7EB",
                margin: "0 0 26px",
              }}
            >
              <Text
                className="step-title email-card-title"
                style={{
                  margin: "0 0 14px",
                  fontSize: "16px",
                  lineHeight: "22px",
                  fontWeight: "bold",
                  color: colors.navy,
                }}
              >
                What Happens Next
              </Text>

              <table
                role="presentation"
                cellPadding="0"
                cellSpacing="0"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: "32px",
                        verticalAlign: "top",
                        padding: "4px 0",
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "#6366F1",
                      }}
                    >
                      01
                    </td>
                    <td style={{ padding: "4px 0 10px 6px", verticalAlign: "top" }}>
                      <Text className="step-title" style={{ margin: "0", fontSize: "14px", lineHeight: "20px", fontWeight: "bold", color: "#1F2937" }}>
                        Strategic Review
                      </Text>
                      <Text className="step-desc" style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "19px", color: "#4B5563" }}>
                        Our specialists assess your requirements, target audience, and current digital landscape.
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        width: "32px",
                        verticalAlign: "top",
                        padding: "4px 0",
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "#6366F1",
                      }}
                    >
                      02
                    </td>
                    <td style={{ padding: "4px 0 10px 6px", verticalAlign: "top" }}>
                      <Text className="step-title" style={{ margin: "0", fontSize: "14px", lineHeight: "20px", fontWeight: "bold", color: "#1F2937" }}>
                        Discovery Consultation
                      </Text>
                      <Text className="step-desc" style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "19px", color: "#4B5563" }}>
                        A marketing strategist will reach out within <strong>24 business hours</strong> to share insights and answer questions.
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        width: "32px",
                        verticalAlign: "top",
                        padding: "4px 0",
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "#6366F1",
                      }}
                    >
                      03
                    </td>
                    <td style={{ padding: "4px 0 0 6px", verticalAlign: "top" }}>
                      <Text className="step-title" style={{ margin: "0", fontSize: "14px", lineHeight: "20px", fontWeight: "bold", color: "#1F2937" }}>
                        Custom Growth Roadmap
                      </Text>
                      <Text className="step-desc" style={{ margin: "2px 0 0", fontSize: "13px", lineHeight: "19px", color: "#4B5563" }}>
                        We formulate an actionable, high-ROI plan tailored specifically to elevate your business.
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Call to action & Immediate Help */}
            <Section style={{ textAlign: "center", margin: "0 0 24px" }}>
              <Link
                href={website}
                target="_blank"
                style={{
                  display: "inline-block",
                  backgroundColor: colors.purple,
                  color: colors.white,
                  fontSize: "14px",
                  fontWeight: "bold",
                  textDecoration: "none",
                  padding: "13px 28px",
                  borderRadius: "10px",
                }}
              >
                Visit Our Website &rarr;
              </Link>
            </Section>

            <Text
              className="body-text"
              style={{
                margin: "0 0 16px",
                fontSize: "14px",
                lineHeight: "23px",
                color: "#4B5563",
              }}
            >
              Need immediate assistance or have additional files to share? Simply
              reply directly to this email or reach us at{" "}
              <Link
                href={`mailto:${contactEmail}`}
                style={{
                  color: colors.blue,
                  textDecoration: "underline",
                  fontWeight: "500",
                }}
              >
                {contactEmail}
              </Link>
              .
            </Text>

            <Text
              className="body-signoff"
              style={{
                margin: "18px 0 0",
                fontSize: "14px",
                lineHeight: "22px",
                color: colors.navy,
              }}
            >
              With warm regards,
              <br />
              <strong style={{ color: colors.navy, fontSize: "15px" }}>
                The PagePerClick Team
              </strong>
              <br />
              <Link
                href={website}
                style={{
                  color: colors.blue,
                  textDecoration: "underline",
                  fontSize: "13px",
                }}
              >
                pageperclick.com
              </Link>
            </Text>
          </Section>

          {/* Footer with Real Social Media Icons */}
          <Section
            className="email-footer"
            style={{
              backgroundColor: "#F0F4FC",
              padding: "24px 20px 20px",
              textAlign: "center",
              borderTop: "1px solid #CAD4E4",
            }}
          >
            {/* Social Icons Row */}
            <table
              align="center"
              border={0}
              cellPadding={0}
              cellSpacing={0}
              role="presentation"
              style={{ margin: "0 auto 16px" }}
            >
              <tbody>
                <tr>
                  {socialLinks.map((item) => (
                    <td key={item.name} style={{ padding: "0 8px" }} align="center">
                      <Link
                        href={item.url}
                        target="_blank"
                        style={{ display: "inline-block", textDecoration: "none" }}
                      >
                        <Img
                          src={item.icon}
                          alt={item.name}
                          width="28"
                          height="28"
                          style={{
                            display: "block",
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            border: "none",
                            outline: "none",
                          }}
                        />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <Text
              className="footer-title"
              style={{
                margin: "0",
                fontSize: "13px",
                lineHeight: "20px",
                fontWeight: "bold",
                color: "#0F172A",
              }}
            >
              PagePerClick
            </Text>

            <Text
              className="footer-sub"
              style={{
                margin: "2px 0 0",
                fontSize: "12px",
                lineHeight: "18px",
                color: "#1E293B",
              }}
            >
              High-Performance Digital Marketing &bull;{" "}
              <Link
                href={website}
                className="footer-link"
                style={{ color: "#2563EB", textDecoration: "none", fontWeight: "600" }}
              >
                pageperclick.com
              </Link>
            </Text>

            <Hr
              className="footer-hr"
              style={{
                borderColor: "#CAD4E4",
                margin: "16px 0 12px",
              }}
            />

            <Text
              className="footer-legal"
              style={{
                margin: "0",
                fontSize: "11px",
                lineHeight: "18px",
                color: "#334155",
              }}
            >
              You are receiving this confirmation because an inquiry was submitted
              under your email on pageperclick.com.
              <br />
              <Link
                href={`${normalizedWebsite}/privacy-policy`}
                className="footer-legal-link"
                style={{
                  color: "#2563EB",
                  textDecoration: "underline",
                  marginRight: "10px",
                }}
              >
                Privacy Policy
              </Link>
              &bull;
              <Link
                href={`${normalizedWebsite}/terms-and-conditions`}
                className="footer-legal-link"
                style={{
                  color: "#2563EB",
                  textDecoration: "underline",
                  marginLeft: "10px",
                }}
              >
                Terms &amp; Conditions
              </Link>
            </Text>

            {referenceId && (
              <Text
                style={{
                  margin: "10px 0 0",
                  fontSize: "10px",
                  lineHeight: "15px",
                  color: "#64748B",
                  letterSpacing: "0.2px",
                }}
              >
                Inquiry Ref: #{referenceId}
                {submittedAt ? ` • Submitted ${submittedAt}` : ""}
              </Text>
            )}
          </Section>

          {/* Dynamic unique token to prevent Gmail from collapsing repeating footer into 'Show quoted text' */}
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
            {`ppc-token:${referenceId || ""}`}
          </div>
        </Container>
      </Body>
    </Html>
  );
}
