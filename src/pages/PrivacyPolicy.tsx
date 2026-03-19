import Layout from "@/components/layout/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container-veil py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          <div className="bg-card rounded-2xl border border-primary/10 p-8 text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Information We Collect</h2>
              <p>
                We collect information you provide directly, such as name, email, phone number, and shipping address when you make a purchase or create an account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">How We Use Your Information</h2>
              <p>
                Your information is used to process orders, provide customer support, send order updates, and improve our services. We may also send promotional communications with your consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information. Contact us at privacy@veil.com for any data-related requests.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at privacy@veil.com.
              </p>
            </section>

            <p className="text-sm text-muted-foreground pt-4 border-t border-primary/10">
              Last updated: January 2026
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
