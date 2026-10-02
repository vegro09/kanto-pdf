import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, ArrowLeft, Lock, CheckCircle2, ServerOff, Cpu } from 'lucide-react';

export const PrivacyPolicyScreen: React.FC = () => {
  const { setScreen } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Privacy Policy — Kanto PDF';
  }, []);

  return (
    <div dir="ltr" lang="en" className="w-full min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-[#fcfaf8] dark:bg-[#0D0D0D] transition-colors duration-250">
      <div className="max-w-4xl mx-auto">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setScreen('catalog')}
            className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white px-4 py-2.5 rounded-xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#262626] transition-all shadow-xs hover:border-gray-300 dark:hover:border-[#333333] cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to All Tools</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
            <CheckCircle2 size={13} />
            <span>GDPR Compliant</span>
          </div>
        </div>

        {/* Feature Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#222222] rounded-2xl shadow-xs">
            <Cpu className="text-emerald-600 dark:text-emerald-400 mb-2.5" size={22} />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              Local-First Architecture
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Files process in your browser RAM. Never uploaded or seen.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#222222] rounded-2xl shadow-xs">
            <ServerOff className="text-cyan-600 dark:text-cyan-400 mb-2.5" size={22} />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              Zero-Retention Policy
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Document retention is ZERO SECONDS. Instantly purged.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#222222] rounded-2xl shadow-xs">
            <Lock className="text-amber-600 dark:text-amber-400 mb-2.5" size={22} />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              No AI Model Training
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Never used to train or improve any AI models whatsoever.
            </p>
          </div>
        </div>

        {/* Main Document Container with Tailwind Typography */}
        <article className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#222222] rounded-3xl p-8 sm:p-14 shadow-sm prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
          {/* Header */}
          <div className="not-prose pb-8 mb-8 border-b border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
              <Shield size={26} />
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-950 dark:text-white tracking-tight mb-3">
              Privacy Policy
            </h1>

            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Last updated: September 2026
            </p>
          </div>

          {/* Intro Paragraph */}
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-normal mb-8">
            Explore our Privacy Policy for a clear understanding of how we manage your data. We prioritize transparency, extreme security, and local-first processing to ensure your absolute privacy while providing our services.
          </p>

          {/* Section 1 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight mt-8 mb-4">
              1. The Purpose of this Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Kanto PDF is committed to respecting users' privacy and ensuring security. Unlike traditional PDF platforms that upload your sensitive documents to remote servers, Kanto PDF is built on a &quot;Local-First&quot; architecture. Your privacy is not just a policy; it is hardcoded into our technology.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight mt-8 mb-4">
              2. Who is the Data Controller?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Kanto PDF (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) acts as the data controller for the standard telemetry and contact information you may provide.
            </p>
            <div className="not-prose my-4 p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200">
              <p className="text-sm sm:text-base leading-relaxed">
                <strong>CRITICAL EXCEPTION FOR DOCUMENT DATA:</strong> When using our client-side services (e.g., Merge, Split, Compress, Organize), Kanto PDF does <strong>NOT</strong> act as a data processor because your files are processed entirely within your own web browser. We never receive, see, or have access to your files.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight mt-8 mb-4">
              3. What Personal Data Do We Process?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              <strong>Document Content (Zero Access):</strong><br />
              For the vast majority of our tools, the files you process never leave your device. The processing happens in your browser's local memory.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              For the specific tools that require our backend servers for heavy computation (e.g., PDF/A conversion, PDF Repair), your files are transmitted via secure TLS encryption, processed strictly in volatile memory (RAM), and <strong>destroyed immediately</strong> upon task completion.
            </p>

            <div className="not-prose my-5 p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 font-semibold text-sm sm:text-base">
              Kanto PDF DOES NOT USE YOUR CONTENT TO TRAIN, IMPROVE, OR DEVELOP ITS AI MODELS OR ANY THIRD-PARTY AI MODELS.
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Usage Data:</strong> We may collect basic, anonymized analytical data (such as tools used or error logs) solely to improve the stability of our platform.
            </p>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight mt-8 mb-4">
              4. How Long Do We Keep Your Personal Data?
            </h2>
            <div className="not-prose my-4 p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-blue-950 dark:text-blue-200">
              <h3 className="text-base font-bold mb-2">Zero-Retention Policy for Documents:</h3>
              <p className="text-sm sm:text-base leading-relaxed">
                Unlike other platforms that store your files for hours or days, Kanto PDF's storage period for your document content is <strong>ZERO SECONDS</strong>. Client-side processed files are never uploaded. Server-side processed files are instantly purged from memory the millisecond the output file is generated. No backups or temporary files are kept.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight mt-8 mb-4">
              5. Do We Disclose Your Data to Third Parties?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We do not sell, rent, or trade any personal data. We will only disclose your data if legally required to do so by competent authorities under a strict legal obligation. However, because we employ a Zero-Retention policy for your documents, we physically cannot provide your processed files to any third party, government, or authority, as we do not possess them.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight mt-8 mb-4">
              6. What Rights Do I Have?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Under the General Data Protection Regulation (GDPR) and similar global privacy laws, you have the right to access, rectify, object to, erase, and restrict the processing of your personal data. To exercise your rights, please contact us at:{' '}
              <a
                href="mailto:privacy@kantopdf.com"
                className="text-emerald-600 dark:text-emerald-400 font-semibold underline hover:text-emerald-500 transition-colors"
              >
                privacy@kantopdf.com
              </a>
              .
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight mt-8 mb-4">
              7. Protection of Minors
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our services are designed to be safe for all ages, including educational environments. Because our platform processes files locally without requiring accounts or tracking, it inherently provides maximum privacy protection for students and minors.
            </p>
          </section>

          {/* Section 8 */}
          <section className="mb-6">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight mt-8 mb-4">
              8. Modification of the Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We will review and update this privacy policy when there are relevant changes in the law or our technology. Continued use of Kanto PDF implies acceptance of these extremely secure privacy terms.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;
