import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms & Conditions | Page Per Click</title>
        <meta name="robots" content="noindex" />
        <link
          rel="canonical"
          href="https://www.pageperclick.com/terms-and-conditions"
        />
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
            Terms & Conditions
          </span>
        </h1>
        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          Welcome to Page Per Click. By accessing or using our website
          (www.pageperclick.com) and services, you agree to comply with the
          following Terms & Conditions. Please read them carefully before using
          our services.
        </p>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     ✅ ADDED: transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">1.</span> Services
          </h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>
              Page Per Click provides digital marketing services, including
              Google Ads, Meta Ads, social media marketing, and related
              campaigns.
            </li>
            <li>
              Service scope, pricing, and deliverables will be outlined in
              individual agreements with each client.
            </li>
          </ul>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     ✅ ADDED: transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">2.</span> User Responsibilities
          </h2>
          <p className="text-muted-foreground mb-3">
            By using our services, you agree to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>
              Provide accurate and updated information required for campaigns.
            </li>
            <li>
              Ensure that all content, images, or materials provided for
              marketing are lawful and free of third-party rights violations.
            </li>
            <li>Not use our services for unlawful, harmful, or unethical activities.</li>
          </ul>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     ✅ ADDED: transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">3.</span> Payments & Refunds
          </h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>
              Payments must be made as per the agreed terms before campaign
              execution.
            </li>
            <li>
              Platform budgets (Google, Meta, etc.) are paid directly to those
              platforms and are non-refundable.
            </li>
            <li>
              Service fees charged by Page Per Click are non-refundable once work
              has commenced.
            </li>
          </ul>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     ✅ ADDED: transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">4.</span> Intellectual Property
          </h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>
              All creative materials, designs, and strategies developed by Page
              Per Click remain our property until full payment is received.
            </li>
            <li>
              You retain ownership of your brand assets, logos, and content you
              provide.
            </li>
          </ul>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     ✅ ADDED: transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">5.</span> Limitation of Liability
          </h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>
              While we strive to deliver the best results, we do not guarantee
              specific outcomes (such as number of leads, sales, or
              conversions).
            </li>
            <li>
              Page Per Click will not be held liable for indirect, incidental, or
              consequential damages arising from the use of our services.
            </li>
          </ul>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     ✅ ADDED: transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">6.</span> Third-Party Services
          </h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>
              We may integrate or use third-party platforms (e.g., Google Ads,
              Meta Ads, analytics tools).
            </li>
            <li>
              Their terms and policies also apply, and Page Per Click is not
              responsible for their actions or performance.
            </li>
          </ul>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     ✅ ADDED: transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">7.</span> Termination
          </h2>
          <p className="text-muted-foreground mb-3">
            We reserve the right to suspend or terminate services if:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>You violate these Terms & Conditions.</li>
            <li>You engage in unlawful, abusive, or harmful activity.</li>
          </ul>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     ✅ ADDED: transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">8.</span> Governing Law
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            These Terms are governed by the laws of India. Any disputes will be
            subject to the jurisdiction of the courts in Bangalore, Karnataka.
          </p>
        </section>

        <section
          className="mb-8 bg-card/30 border border-border/50 rounded-lg p-6
                     ✅ ADDED: transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
        >
          <h2 className="text-2xl font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">9.</span> Contact Us
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            If you have any questions regarding these Terms & Conditions or our
            services, contact us at:
            <br />
            Email:{" "}
            <a
              href="mailto:pageperclick@gmail.com"
              className="text-primary hover:underline transition-all
                         ✅ ADDED: inline-block hover:scale-105"
            >
              pageperclick@gmail.com
            </a>
            <br />
            Website:{" "}
            <a
              href="https://www.pageperclick.com"
              className="text-primary hover:underline transition-all
                         ✅ ADDED: inline-block hover:scale-105"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.pageperclick.com
            </a>
          </p>
        </section>

        <footer className="mb-10 mx-6 border-t border-border/50 pt-6">
          <Link
            to="/"
            className="text-primary hover:text-secondary transition-all inline-flex items-center gap-2
                       ✅ ADDED: hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg"
          >
            ← Back to Home
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default TermsAndConditions;