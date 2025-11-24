import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const PrivacyPolicy = () => {
  const canonicalUrl = "https://www.pageperclick.com/privacy-policy";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy | Page Per Click</title>
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <header>
        <div className="container mx-auto px-6 md:px-4 py-5 md:py-10">
          <Link to="/">
            <img
              src="/header.png"
              alt="Page Per Click Logo"
              className="inline-block mt-0 md:mt-4 w-28 h-20 md:w-40 md:h-20 object-contain"
            />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-2">
        <h1 className="text-4xl font-heading mb-4">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Privacy Policy
          </span>
        </h1>
        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          Page Per Click ("we," "our," "us") respects your privacy and is
          committed to protecting your personal data. This Privacy Policy
          explains how we collect, use, and safeguard your information when you
          use our website and services.
        </p>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                      transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-3">
            <span className="text-primary">1.</span> Information We Collect
          </h2>

          <h3 className="text-xl font-heading text-primary mb-3 mt-6">
            Personal Information
          </h3>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Name, email address, phone number, business details (when you contact
            us, sign up, or use our services).
          </p>

          <h3 className="text-xl font-heading text-primary mb-3 mt-6">
            Non-Personal Information
          </h3>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            IP address, browser type, cookies, and analytics data (used to
            improve website performance and user experience).
          </p>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-3">
            <span className="text-primary">2.</span> How We Use Your Information
          </h2>
          <p className="text-muted-foreground mb-3">
            We may use your information to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Provide and manage our digital marketing services.</li>
            <li>
              Communicate with you regarding services, updates, or promotions.
            </li>
            <li>Analyze website traffic and improve user experience.</li>
            <li>Comply with legal and regulatory obligations.</li>
          </ul>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-3">
            <span className="text-primary">3.</span> Sharing of Information
          </h2>
          <p className="text-muted-foreground mb-3">
            We do not sell or trade your personal data. We may share information
            only with:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Service providers (hosting, analytics, payment processors).</li>
            <li>Legal authorities, if required by law.</li>
          </ul>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">4.</span> Data Security
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            We use reasonable security measures to protect your data. However, no
            online system is 100% secure, and we cannot guarantee absolute
            protection.
          </p>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">5.</span> Cookies & Tracking
          </h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>
              Our website (www.pageperclick.com) may use cookies and analytics
              tools (such as Google Analytics) to enhance browsing and measure
              performance.
            </li>
            <li>
              You may choose to disable cookies through your browser settings.
            </li>
          </ul>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">6.</span> Your Rights
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            You may request access, correction, or deletion of your personal
            data by contacting us at:
            <br />
            Email:{" "}
            <a
              href="mailto:pageperclick@gmail.com"
              className="text-primary hover:underline transition-all
                         inline-block hover:scale-105"
            >
              pageperclick@gmail.com
            </a>
          </p>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">7.</span> Updates to This Policy
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with a revised "Effective Date."
          </p>
        </section>

        <footer className="mb-10 mx-6 border-t border-border/50 pt-6">
          <Link
            to="/"
            className="text-primary hover:text-secondary transition-all inline-flex items-center gap-2
                       hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg"
          >
            ← Back to Home
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default PrivacyPolicy;