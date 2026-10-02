import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, ArrowLeft, Scale, Cpu, Lock, AlertTriangle, Mail } from 'lucide-react';

export const TermsOfServiceScreen: React.FC = () => {
  const { setScreen } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Terms of Service — Kanto PDF';
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50">
            <Scale size={13} />
            <span>Legally Binding Agreement</span>
          </div>
        </div>

        {/* Feature Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#222222] rounded-2xl shadow-xs">
            <Cpu className="text-emerald-600 dark:text-emerald-400 mb-2.5" size={22} />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              Local-First & Zero Retention
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Client-side tools run in browser RAM. Server-side tools purge memory instantly (0-second retention).
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#222222] rounded-2xl shadow-xs">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 mb-2.5" size={22} />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              Mandatory Backups & As-Is
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Independent backups are strictly required. Kanto Empire does not and cannot recover or restore any files.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#222222] rounded-2xl shadow-xs">
            <Lock className="text-indigo-600 dark:text-indigo-400 mb-2.5" size={22} />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              No AI Model Training
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Your files and document contents will NEVER be used to train, evaluate, or improve any AI/ML models.
            </p>
          </div>
        </div>

        {/* Main Document Container with Tailwind Typography */}
        <article className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#222222] rounded-3xl p-8 sm:p-14 shadow-sm prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-table:border-collapse prose-table:w-full prose-td:border prose-th:border prose-td:border-gray-200 dark:prose-td:border-[#2a2a2a] prose-th:border-gray-200 dark:prose-th:border-[#2a2a2a] max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
          {/* Header */}
          <div className="not-prose pb-8 mb-8 border-b border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
              <FileText size={26} />
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-950 dark:text-white tracking-tight mb-2">
              KANTO PDF — TERMS OF SERVICE
            </h1>

            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Operated by <strong>Kanto Empire</strong>
            </p>
          </div>

          {/* Metadata Table */}
          <div className="overflow-x-auto not-prose my-6">
            <table className="w-full border-collapse border border-gray-200 dark:border-[#2a2a2a] text-sm text-gray-800 dark:text-gray-200 rounded-xl overflow-hidden">
              <tbody>
                <tr className="border-b border-gray-200 dark:border-[#2a2a2a]">
                  <td className="p-3.5 font-bold bg-gray-50 dark:bg-[#181818] w-1/3 border-r border-gray-200 dark:border-[#2a2a2a]">Platform</td>
                  <td className="p-3.5 bg-white dark:bg-[#121212]">Kanto PDF</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-[#2a2a2a]">
                  <td className="p-3.5 font-bold bg-gray-50 dark:bg-[#181818] border-r border-gray-200 dark:border-[#2a2a2a]">Operator / Parent Company</td>
                  <td className="p-3.5 bg-white dark:bg-[#121212]">Kanto Empire</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-[#2a2a2a]">
                  <td className="p-3.5 font-bold bg-gray-50 dark:bg-[#181818] border-r border-gray-200 dark:border-[#2a2a2a]">Effective Date</td>
                  <td className="p-3.5 bg-white dark:bg-[#121212]">September 19, 2026</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-[#2a2a2a]">
                  <td className="p-3.5 font-bold bg-gray-50 dark:bg-[#181818] border-r border-gray-200 dark:border-[#2a2a2a]">Version</td>
                  <td className="p-3.5 bg-white dark:bg-[#121212]">1.0</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold bg-gray-50 dark:bg-[#181818] border-r border-gray-200 dark:border-[#2a2a2a]">Legal Contact</td>
                  <td className="p-3.5 bg-white dark:bg-[#121212]">
                    <a href="mailto:kantoempire@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                      kantoempire@gmail.com
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr className="my-8 border-gray-200 dark:border-gray-800" />

          {/* Critical Notice Blockquote */}
          <blockquote className="my-8 p-6 sm:p-7 rounded-2xl bg-amber-500/10 border-s-4 border-amber-500 text-amber-950 dark:text-amber-200 not-italic text-sm sm:text-base leading-relaxed">
            <p className="font-bold mb-3 uppercase tracking-wide">
              IMPORTANT — READ CAREFULLY BEFORE USING KANTO PDF.
            </p>
            <p className="font-bold mb-3">
              THIS DOCUMENT IS A LEGALLY BINDING CONTRACT BETWEEN YOU AND KANTO EMPIRE. BY ACCESSING OR USING KANTO PDF IN ANY MANNER, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND UNCONDITIONALLY AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE, YOU MUST NOT ACCESS OR USE KANTO PDF.
            </p>
            <p className="font-bold mb-3">
              WITHOUT LIMITING THE FOREGOING, YOU SPECIFICALLY ACKNOWLEDGE AND AGREE THAT: (1) KANTO PDF IS PROVIDED STRICTLY &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;; (2) YOU ARE SOLELY RESPONSIBLE FOR KEEPING INDEPENDENT BACKUPS OF EVERY FILE BEFORE USING KANTO PDF; (3) KANTO EMPIRE DOES NOT RETAIN, CANNOT RECOVER, AND CANNOT RESTORE ANY FILE, INCLUDING A FILE THAT IS DAMAGED, CORRUPTED, OR DESTROYED DURING PROCESSING; (4) YOU ARE SOLELY AND EXCLUSIVELY LIABLE FOR THE LEGALITY, OWNERSHIP, AND SENSITIVITY OF ALL CONTENT YOU PROCESS; AND (5) KANTO EMPIRE&apos;S LIABILITY IS EXCLUDED AND LIMITED TO THE FULLEST EXTENT PERMITTED BY LAW AS SET OUT IN ARTICLES 20, 21, AND 22.
            </p>
            <p className="font-bold mb-0">
              THESE TERMS CONTAIN A BINDING ARBITRATION AGREEMENT AND A CLASS-ACTION WAIVER (ARTICLE 31) THAT AFFECT YOUR LEGAL RIGHTS.
            </p>
          </blockquote>

          <hr className="my-8 border-gray-200 dark:border-gray-800" />

          {/* Table of Contents */}
          <section className="not-prose my-10 p-6 rounded-2xl bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-[#262626]">
            <h2 className="text-xl font-bold text-gray-950 dark:text-white mb-4">
              TABLE OF CONTENTS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm">
              {[
                { num: 1, title: 'Definitions and Interpretation', id: 'article-1' },
                { num: 2, title: 'Parties, Scope and Acceptance', id: 'article-2' },
                { num: 3, title: 'Eligibility, Accounts and Access Credentials', id: 'article-3' },
                { num: 4, title: 'The Services and Technical Architecture', id: 'article-4' },
                { num: 5, title: 'Limited License', id: 'article-5' },
                { num: 6, title: 'Acceptable Use and User Conduct', id: 'article-6' },
                { num: 7, title: 'API Access and Automated Use', id: 'article-7' },
                { num: 8, title: 'Prohibition of Reverse Engineering, Modification and Circumvention', id: 'article-8' },
                { num: 9, title: 'User Content and User Responsibility', id: 'article-9' },
                { num: 10, title: 'No Artificial Intelligence or Machine Learning Training', id: 'article-10' },
                { num: 11, title: 'Data Protection and Privacy', id: 'article-11' },
                { num: 12, title: 'User Responsibility for Backups, Devices and Environment', id: 'article-12' },
                { num: 13, title: 'Output Files', id: 'article-13' },
                { num: 14, title: 'Availability, Updates and Modifications of the Services', id: 'article-14' },
                { num: 15, title: 'Fees and Paid Features', id: 'article-15' },
                { num: 16, title: 'Intellectual Property Rights of Kanto Empire', id: 'article-16' },
                { num: 17, title: 'Third-Party Services, Links and Open-Source Components', id: 'article-17' },
                { num: 18, title: 'Fraudulent Practices, Phishing and Impersonation', id: 'article-18' },
                { num: 19, title: 'Malware, Cyber-Attacks and Security Research', id: 'article-19' },
                { num: 20, title: 'Disclaimer of Warranties', id: 'article-20' },
                { num: 21, title: 'Limitation of Liability', id: 'article-21' },
                { num: 22, title: 'Indemnification', id: 'article-22' },
                { num: 23, title: 'Suspension and Termination', id: 'article-23' },
                { num: 24, title: 'Force Majeure', id: 'article-24' },
                { num: 25, title: 'Legal Process and Regulatory Requests', id: 'article-25' },
                { num: 26, title: 'Export Controls, Sanctions and Regional Availability', id: 'article-26' },
                { num: 27, title: 'Modification of These Terms', id: 'article-27' },
                { num: 28, title: 'Notices and Communications', id: 'article-28' },
                { num: 29, title: 'Assignment and Change of Control', id: 'article-29' },
                { num: 30, title: 'Governing Law', id: 'article-30' },
                { num: 31, title: 'Dispute Resolution', id: 'article-31' },
                { num: 32, title: 'General Provisions', id: 'article-32' },
                { num: 33, title: 'Contact Information', id: 'article-33' },
              ].map(item => (
                <button
                  key={item.num}
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center gap-2 text-start text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 cursor-pointer group"
                >
                  <span className="text-xs font-mono text-gray-400 group-hover:text-blue-500 shrink-0 w-6">
                    {item.num}.
                  </span>
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#262626] flex flex-wrap gap-4 text-xs font-bold">
              <button
                onClick={() => scrollToSection('schedule-a')}
                className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Schedule A — Tool Classification and Processing Model
              </button>
              <button
                onClick={() => scrollToSection('schedule-b')}
                className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Schedule B — Express Acknowledgments of Risk Allocation
              </button>
            </div>
          </section>

          <hr className="my-8 border-gray-200 dark:border-gray-800" />

          {/* Article 1 */}
          <section id="article-1" className="mb-12 scroll-mt-20">
            <h2>1. DEFINITIONS AND INTERPRETATION</h2>
            <p>
              <strong>1.1 Defined Terms.</strong> In these Terms, capitalized terms have the meanings set out below, and the singular includes the plural and vice versa:
            </p>
            <ul>
              <li>
                <strong>&quot;Applicable Law&quot;</strong> means all laws, statutes, regulations, treaties, binding orders, and mandatory regulatory requirements that apply to a party, the Services, or the subject matter of these Terms, in any relevant jurisdiction, including Applicable Data Protection Law.
              </li>
              <li>
                <strong>&quot;Applicable Data Protection Law&quot;</strong> means all laws governing the protection and processing of personal data that apply to a party, including, where applicable, Regulation (EU) 2016/679 (the &quot;GDPR&quot;), the GDPR as it forms part of the law of the United Kingdom, the California Consumer Privacy Act as amended, and any comparable national or regional legislation.
              </li>
              <li>
                <strong>&quot;API&quot;</strong> means any application programming interface, endpoint, software development kit, library, key, token, or other programmatic interface made available by or on behalf of Kanto Empire for access to the Server-Side Tools or any other feature of the Services.
              </li>
              <li>
                <strong>&quot;Business User&quot;</strong> means any User that is a legal entity, or a natural person acting for purposes related to a trade, business, craft, or profession, or on behalf of such an entity.
              </li>
              <li>
                <strong>&quot;Client-Side Processing&quot;</strong> and <strong>&quot;Client-Side Tools&quot;</strong> have the meanings given in Article 4.3.
              </li>
              <li>
                <strong>&quot;Consumer&quot;</strong> means a natural person who uses the Services wholly or mainly outside his or her trade, business, craft, or profession and who is recognized as a consumer under Applicable Law.
              </li>
              <li>
                <strong>&quot;Documentation&quot;</strong> means any guides, specifications, notices, help content, and instructions published or made available by Kanto Empire regarding the Services.
              </li>
              <li>
                <strong>&quot;Force Majeure Event&quot;</strong> has the meaning given in Article 24.
              </li>
              <li>
                <strong>&quot;Intellectual Property Rights&quot;</strong> means all patents, utility models, rights in inventions, copyright and related rights, moral rights (to the extent waivable), trademarks, service marks, trade names, logos, trade dress, domain names, rights in designs, database rights, rights in software (in source and object code form), rights in algorithms and methods, trade secrets, rights in confidential information, rights of unfair-competition and passing off, and all other intellectual or industrial property rights, whether registered or unregistered, together with all applications, renewals, and extensions, anywhere in the world.
              </li>
              <li>
                <strong>&quot;Kanto Empire,&quot; &quot;we,&quot; &quot;us,&quot;</strong> and <strong>&quot;our&quot;</strong> mean Kanto Empire, the operator and parent company of Kanto PDF, as further identified in Article 2.1.
              </li>
              <li>
                <strong>&quot;Kanto Parties&quot;</strong> means Kanto Empire and its Affiliates, and their respective owners, members, shareholders, directors, officers, managers, employees, contractors, agents, licensors, suppliers, successors, and assigns.
              </li>
              <li>
                <strong>&quot;Affiliate&quot;</strong> means any entity that directly or indirectly controls, is controlled by, or is under common control with a party.
              </li>
              <li>
                <strong>&quot;Kanto PDF&quot;</strong> or the <strong>&quot;Platform&quot;</strong> means the web-based and browser-delivered PDF management platform owned and operated by Kanto Empire, including its websites, web applications, interfaces, client-side code, server-side processing systems, APIs, Documentation, and all updates, versions, and derivatives.
              </li>
              <li>
                <strong>&quot;Malicious Activity&quot;</strong> has the meaning given in Article 6.3.
              </li>
              <li>
                <strong>&quot;Operational Metadata&quot;</strong> has the meaning given in Article 11.3.
              </li>
              <li>
                <strong>&quot;Output File&quot;</strong> means any file, document, or data generated by the Services as the result of an operation performed by or for you.
              </li>
              <li>
                <strong>&quot;Privacy Policy&quot;</strong> means the Kanto PDF Privacy Policy published by Kanto Empire, as updated from time to time.
              </li>
              <li>
                <strong>&quot;Server-Side Tools&quot;</strong> and <strong>&quot;Server-Side Processing&quot;</strong> have the meanings given in Article 4.4.
              </li>
              <li>
                <strong>&quot;Services&quot;</strong> means Kanto PDF and every tool, feature, function, API, and service made available through it, including Client-Side Tools and Server-Side Tools.
              </li>
              <li>
                <strong>&quot;Site&quot;</strong> means the websites, web applications, and other digital properties through which Kanto Empire makes the Services available.
              </li>
              <li>
                <strong>&quot;Terms&quot;</strong> means these Terms of Service, including Schedule A and Schedule B, the Privacy Policy to the extent incorporated, and any supplementary terms presented to you for a specific feature.
              </li>
              <li>
                <strong>&quot;User Content&quot;</strong> means any file, document, image, text, data, information, or other material that you select, load, open, upload, import, submit, transmit, or otherwise make available to or through the Services, in any form, including all data contained in or derived from it.
              </li>
              <li>
                <strong>&quot;Volatile Memory Processing&quot;</strong> and <strong>&quot;Zero-Retention Policy&quot;</strong> have the meanings given in Article 4.4.
              </li>
              <li>
                <strong>&quot;You,&quot; &quot;your,&quot;</strong> and <strong>&quot;User&quot;</strong> mean the individual or entity that accesses or uses the Services, and, where the individual acts for an entity, both the individual and that entity, jointly and severally.
              </li>
            </ul>
            <p>
              <strong>1.2 Interpretation.</strong> In these Terms: (a) headings are for convenience only and do not affect interpretation; (b) &quot;including&quot; and similar words mean &quot;including without limitation&quot;; (c) references to a statute or regulation include it as amended, re-enacted, or replaced; (d) references to &quot;writing&quot; include email; (e) capitalized bold-face text and text in capital letters is used for conspicuousness and does not alter the scope or priority of any provision; (f) no provision shall be construed against Kanto Empire on the ground that Kanto Empire drafted it; and (g) references to Articles and Schedules are to those of these Terms.
            </p>
          </section>

          {/* Article 2 */}
          <section id="article-2" className="mb-12 scroll-mt-20">
            <h2>2. PARTIES, SCOPE AND ACCEPTANCE</h2>
            <p>
              <strong>2.1 The Provider.</strong> The Services are provided by <strong>Kanto Empire</strong>, legal form and jurisdiction of organization of Kanto Empire, with registered address at [Registered Address], contactable at <strong>kantoempire@gmail.com</strong>. Kanto Empire owns and operates <strong>Kanto PDF</strong>.
            </p>
            <p>
              <strong>2.2 Binding Agreement.</strong> These Terms constitute a legally binding agreement between you and Kanto Empire governing your access to and use of the Services, the Site, the API, and the Documentation. They apply to all Users, whether or not registered, whether or not paying, and whether accessing the Services through a browser, an API, or any other interface.
            </p>
            <p>
              <strong>2.3 Acceptance by Use.</strong> You accept these Terms, and they become binding on you, upon the earliest of: (a) affirmatively indicating acceptance where the Services present an acceptance mechanism; (b) accessing or using any part of the Services; or (c) submitting or opening any User Content in the Services. You acknowledge that your continued access or use after these Terms are made available (including by link on the Site) constitutes your valid and enforceable acceptance, whether or not you have scrolled through or read them.
            </p>
            <p>
              <strong>2.4 Authority.</strong> If you accept these Terms on behalf of an entity, you represent and warrant that you have full legal authority to bind that entity, and references to &quot;you&quot; include that entity. If you lack such authority, you must not use the Services.
            </p>
            <p>
              <strong>2.5 Incorporated Documents.</strong> The Privacy Policy, the Documentation, tool-specific usage limits, and notices displayed within the interface form part of these Terms to the extent they impose obligations on you or describe the operation of the Services.
            </p>
            <p>
              <strong>2.6 Order of Precedence.</strong> In the event of conflict: (a) supplementary terms presented for a specific tool or feature prevail over the general provisions of these Terms as to that tool or feature only; and (b) the Privacy Policy prevails over these Terms solely with respect to the processing of personal data by Kanto Empire as a controller. In all other respects these Terms prevail.
            </p>
            <p>
              <strong>2.7 Entire Agreement.</strong> These Terms constitute the entire agreement between you and Kanto Empire regarding the Services and supersede all prior or contemporaneous representations, understandings, marketing statements, and communications, oral or written. You acknowledge that you have not relied on any statement, promise, or representation not expressly set out in these Terms.
            </p>
            <p>
              <strong>2.8 Electronic Contracting.</strong> You consent to entering into these Terms electronically and waive any right or requirement under any law that requires an original signature or non-electronic delivery or retention of contracts or notices.
            </p>
            <p>
              <strong>2.9 Failure to Comply.</strong> Failure to comply with these Terms may result, at Kanto Empire&apos;s sole discretion, in the suspension or termination of your access as set out in Article 23, in the pursuit of legal remedies, and in referral to competent authorities.
            </p>
          </section>

          {/* Article 3 */}
          <section id="article-3" className="mb-12 scroll-mt-20">
            <h2>3. ELIGIBILITY, ACCOUNTS AND ACCESS CREDENTIALS</h2>
            <p>
              <strong>3.1 Age and Capacity.</strong> You may use the Services only if you: (a) are at least eighteen (18) years of age or the age of majority in your jurisdiction, whichever is higher; (b) have full legal capacity to enter into binding contracts; and (c) are not barred from using the Services under Applicable Law or by order of any court or authority in your jurisdiction, your place of residence, or the place from which you access the Services.
            </p>
            <p>
              <strong>3.2 Minors.</strong> The Services are not directed to children under thirteen (13) years of age (or such higher age as Applicable Law requires for digital consent) and Kanto Empire does not knowingly offer the Services to them. A person who has not reached the age of majority may use the Services only with the prior authorization and under the continuous supervision of a parent or legal guardian, who by permitting such use accepts these Terms on the minor&apos;s behalf. <strong>The parent or guardian is solely and fully liable for all acts and omissions of the minor in connection with the Services, and Kanto Empire disclaims all liability arising from use of the Services by minors.</strong>
            </p>
            <p>
              <strong>3.3 Business Users.</strong> If you use the Services on behalf of an employer, client, or other third party, you represent and warrant that you are authorized to process the relevant User Content and to accept these Terms on their behalf, and you and that party are jointly and severally liable for compliance.
            </p>
            <p>
              <strong>3.4 Accounts.</strong> The Services are designed to be usable without registration. If Kanto Empire offers account-based features, then: (a) you must provide accurate, current, and complete information and keep it updated; (b) you may not share, sell, lease, or transfer your account or credentials, or use those of another person; (c) <strong>you are solely responsible for all activity occurring under your account or credentials, whether or not authorized by you</strong>; (d) you must maintain the confidentiality of your credentials and notify Kanto Empire immediately at kantoempire@gmail.com upon any known or suspected unauthorized use; and (e) Kanto Empire has no liability for any loss arising from your failure to safeguard your credentials, to enable available security measures, or to respond to security notices.
            </p>
            <p>
              <strong>3.5 Credential Recovery.</strong> Kanto Empire has no obligation to restore access to any account or credential where you cannot satisfy its verification requirements, and disclaims all liability for the inability to access an account for that reason.
            </p>
            <p>
              <strong>3.6 No Verification Obligation.</strong> Kanto Empire is entitled to rely on the representations you make in these Terms and has no obligation to verify your age, identity, authority, or eligibility.
            </p>
          </section>

          {/* Article 4 */}
          <section id="article-4" className="mb-12 scroll-mt-20">
            <h2>4. THE SERVICES AND TECHNICAL ARCHITECTURE</h2>
            <p>
              <strong>4.1 Description of the Services.</strong> Kanto PDF is a browser-delivered platform that enables Users to perform operations on PDF and related files, such as merging, splitting, cropping, organizing, repairing, and converting. The Services operate under one of two processing models, as described in this Article 4 and classified in Schedule A: <strong>Client-Side Processing</strong> and <strong>Server-Side Processing (Zero Retention)</strong>.
            </p>
            <p>
              <strong>4.2 Architectural Principle.</strong> Kanto PDF is engineered on a privacy-first, data-minimization principle. Kanto Empire does not design the Services to view, inspect, analyze, index, monitor, catalog, copy, store, or otherwise access User Content. The provisions of this Article describe the intended and operational design of the Services and allocate risk accordingly.
            </p>
            <p>
              <strong>4.3 Client-Side Processing.</strong>
            </p>
            <ul>
              <li>
                <strong>(a) Definition.</strong> Tools designated as executing locally, including <strong>Merge, Split, Crop, and Organize</strong> and any other tool designated as client-side in Schedule A or in the interface (&quot;<strong>Client-Side Tools</strong>&quot;), perform their operations entirely within the memory of your web browser on your own device, using application code delivered to your browser by Kanto Empire (&quot;<strong>Client-Side Processing</strong>&quot;).
              </li>
              <li>
                <strong>(b) No Transmission.</strong> In Client-Side Processing, User Content is not uploaded to, transmitted to, received by, or made available to Kanto Empire or any server under its control. Kanto Empire does not see, cannot see, and has no technical means of accessing, recovering, restoring, or reconstructing User Content processed through Client-Side Tools.
              </li>
              <li>
                <strong>(c) Delivery of Code Is Not Transmission of Content.</strong> The delivery of application code, scripts, stylesheets, fonts, or other assets from Kanto Empire to your browser, and the receipt by Kanto Empire of routine technical requests for those assets, do not constitute the transmission or receipt of User Content.
              </li>
              <li>
                <strong>(d) Local Environment.</strong> Because Client-Side Processing depends entirely on your device, browser, operating system, available memory, storage, processing capacity, extensions, and security posture, <strong>you alone bear all risk of performance limitations, browser or system crashes, freezes, memory exhaustion, and data loss arising in that environment.</strong>
              </li>
            </ul>
            <p>
              <strong>4.4 Server-Side Processing (Zero Retention).</strong>
            </p>
            <ul>
              <li>
                <strong>(a) Definition.</strong> Certain tools that require computational resources beyond those reasonably available in a browser, including <strong>PDF Repair and file conversion tools</strong> and any other tool designated as server-side in Schedule A or in the interface (&quot;<strong>Server-Side Tools</strong>&quot;), require the transmission of User Content to Kanto Empire&apos;s backend processing systems (&quot;<strong>Server-Side Processing</strong>&quot;).
              </li>
              <li>
                <strong>(b) Encrypted Transmission.</strong> User Content submitted for Server-Side Processing is transmitted from your browser to Kanto Empire&apos;s backend via an encrypted channel using industry-standard transport-layer security.
              </li>
              <li>
                <strong>(c) Volatile Memory Processing.</strong> Server-Side Processing is performed strictly in volatile memory (random-access memory, &quot;<strong>RAM</strong>&quot;) (&quot;<strong>Volatile Memory Processing</strong>&quot;). Kanto Empire does not write User Content, or any portion, page, image, text, extract, or derivative of it, to any persistent storage medium, including disks, databases, object or file storage, message queues, caches, snapshots, replicas, or backups.
              </li>
              <li>
                <strong>(d) Zero-Retention Policy.</strong> Kanto Empire operates a strict <strong>zero-second (0-second) retention policy</strong> (the &quot;<strong>Zero-Retention Policy</strong>&quot;). Upon the generation of the Output File and its hand-off for delivery to the requesting browser session (the &quot;<strong>Zero-Retention Event</strong>&quot;), all input data, intermediate data, and remaining copies of User Content and of the Output File held in Kanto Empire&apos;s systems are irrevocably released from memory and permanently destroyed. <strong>Kanto Empire holds no backups, retains no copies, and maintains no logs of file content, and there is no retention period, grace period, or download window during which User Content or an Output File remains available on Kanto Empire&apos;s systems.</strong>
              </li>
              <li>
                <strong>(e) Meaning of &quot;Zero&quot;.</strong> The Zero-Retention Policy means that Kanto Empire imposes no intentional retention of User Content beyond the minimum period technically necessary to receive it, perform the requested operation, and hand off the Output File for delivery. It does not preclude the transient existence of data in memory and network buffers during that interval.
              </li>
              <li>
                <strong>(f) No Content Logging.</strong> Kanto Empire does not record, log, or store the content of User Content or Output Files. Kanto Empire may generate Operational Metadata as described in Article 11.3, which by definition does not include User Content.
              </li>
              <li>
                <strong>(g) Failed or Interrupted Operations.</strong> If a Server-Side operation fails, times out, or is interrupted (including by loss of your connection), <strong>the User Content and any partial output are destroyed and cannot be retrieved, resumed, or re-delivered by Kanto Empire.</strong> You must resubmit the operation from your original file.
              </li>
            </ul>
            <p>
              <strong>4.5 Consequences of the Architecture; Your Acknowledgments.</strong> You acknowledge and agree that, as a direct consequence of the architecture described in this Article 4:
            </p>
            <ul>
              <li><strong>(a)</strong> Kanto Empire cannot recover, restore, re-generate, re-deliver, or provide any history, archive, or copy of any User Content or Output File, whether in the event of error, corruption, interruption, user mistake, or otherwise;</li>
              <li><strong>(b)</strong> Kanto Empire cannot inspect, diagnose, or repair any specific file you submit, and technical support will not have access to your files;</li>
              <li><strong>(c)</strong> Kanto Empire has no effective knowledge of, and no technical ability to review, the content of any User Content; and</li>
              <li><strong>(d)</strong> the inability described above is an intended feature of the Services, is the basis on which the Services are offered, and does not constitute a defect, breach, or failure of the Services.</li>
            </ul>
            <p>
              <strong>4.6 Support Communications.</strong> <strong>Do not attach or send documents to Kanto Empire&apos;s support or contact email address.</strong> Any file or content you voluntarily send to Kanto Empire by email or any channel outside the Services is not processed under the Volatile Memory Processing or Zero-Retention Policy, is handled in accordance with the Privacy Policy, is transmitted and retained by third-party email and communication providers outside Kanto Empire&apos;s control, and is sent entirely at your own risk.
            </p>
            <p>
              <strong>4.7 Tool Classification.</strong> The classification of each tool as Client-Side or Server-Side is set out in Schedule A and is indicated in the interface. Kanto Empire may add, remove, or reclassify tools and update Schedule A and the interface accordingly. It is your responsibility to review the classification of a tool before using it.
            </p>
            <p>
              <strong>4.8 Scope and Limits of the Architectural Commitments.</strong> You acknowledge that:
            </p>
            <ul>
              <li><strong>(a)</strong> the commitments in this Article 4 and in Article 10 govern Kanto Empire&apos;s own systems and practices only;</li>
              <li><strong>(b)</strong> data transmitted over the internet traverses networks, intermediaries, and infrastructure that Kanto Empire does not own or control (including internet service providers, corporate networks, proxies, TLS-inspection appliances, and content-delivery or edge infrastructure), and Kanto Empire is not responsible for the acts, omissions, or security of those parties;</li>
              <li><strong>(c)</strong> Kanto Empire has no control over, and disclaims all responsibility for, any retention, caching, indexing, synchronization, backup, screen-capture, or logging of User Content or Output Files by your own device, browser, browser extensions, operating system, downloads folder, cloud-sync services, antivirus or endpoint-security tools, or any other software or service in your environment;</li>
              <li><strong>(d)</strong> Kanto Empire may use third-party cloud infrastructure providers solely to supply computing, memory, and network capacity for the Services, and such providers are not authorized by Kanto Empire to access or retain User Content; and</li>
              <li><strong>(e)</strong> the Zero-Retention Policy is a statement of design and operating practice for Kanto Empire&apos;s systems and is not a warranty or guarantee that no unauthorized access, security incident, or third-party interference can ever occur, which risk cannot be eliminated for any system connected to the internet.</li>
            </ul>
            <p>
              <strong>4.9 Independent Verification.</strong> You may observe the network requests made by your own browser while using the Services to satisfy yourself of the processing model applicable to a given tool. Such observation of your own browser&apos;s traffic does not violate Article 8, provided that you do not decompile, disassemble, extract, or reproduce the Services&apos; code or otherwise engage in any other act prohibited by Article 8.
            </p>
            <p>
              <strong>4.10 Changes to Architecture.</strong> Kanto Empire currently offers no feature that retains User Content after processing. Should Kanto Empire ever introduce any feature that requires the retention of User Content, that feature will be clearly identified within the interface, will be optional, and will be governed by supplementary terms presented to you before you use it.
            </p>
          </section>

          {/* Article 5 */}
          <section id="article-5" className="mb-12 scroll-mt-20">
            <h2>5. LIMITED LICENSE</h2>
            <p>
              <strong>5.1 Grant.</strong> Subject to your continuous compliance with these Terms, Kanto Empire grants you a limited, personal, non-exclusive, non-transferable, non-sublicensable, non-assignable, revocable license to access and use the Services solely for their intended purpose and in accordance with these Terms and the Documentation (the &quot;<strong>License</strong>&quot;). If you are a Business User, the License is for your internal business purposes only.
            </p>
            <p>
              <strong>5.2 Reservation of Rights.</strong> The License is a license of use only. <strong>No ownership interest in the Services, the Site, the API, the client-side code, or any Intellectual Property Rights of Kanto Empire is granted or transferred to you.</strong> All rights not expressly granted are reserved by Kanto Empire.
            </p>
            <p>
              <strong>5.3 Restrictions.</strong> Except as expressly permitted by these Terms or mandatory Applicable Law, you shall not, and shall not permit any third party to: (a) copy, reproduce, redistribute, sell, resell, lease, sublicense, publish, or make available the Services or any part of them; (b) use the Services to provide a competing service, whether commercial or otherwise, or as a component of any product or service offered to third parties, save as expressly permitted by a separate written agreement with Kanto Empire; (c) frame, mirror, or embed the Services or Site in a manner that suggests affiliation with, or endorsement by, Kanto Empire; or (d) use the Services in any manner not expressly authorized in these Terms.
            </p>
            <p>
              <strong>5.4 Other Uses.</strong> Any use of the Services beyond that permitted by these Terms requires the prior express written authorization of Kanto Empire.
            </p>
            <p>
              <strong>5.5 Consequences.</strong> Any breach of this Article may result, at Kanto Empire&apos;s sole discretion, in immediate revocation of the License, suspension or termination under Article 23, and the exercise of all remedies available at law or in equity.
            </p>
          </section>

          {/* Article 6 */}
          <section id="article-6" className="mb-12 scroll-mt-20">
            <h2>6. ACCEPTABLE USE AND USER CONDUCT</h2>
            <p>
              <strong>6.1 General Standard.</strong> You shall use the Services in good faith, solely for lawful purposes, in accordance with these Terms, Applicable Law, public order, and generally accepted standards of conduct, and with due respect for the rights of Kanto Empire and third parties.
            </p>
            <p>
              <strong>6.2 Reasonable Use.</strong> Use of the Services is subject to reasonable-use conditions to preserve fair access for all Users and the integrity of the infrastructure. Kanto Empire may impose, adjust, and enforce technical limits, including limits on file size, page count, request rate, concurrent operations, processing time, and memory usage, and may throttle, queue, or block any activity that it considers excessive or abusive.
            </p>
            <p>
              <strong>6.3 Prohibited Conduct.</strong> Without limiting any other provision of these Terms, you shall not, and shall not attempt to or permit any third party to, use the Services or the Site to engage in any of the following (all of which are prohibited, and the conduct described in paragraphs (b), (c), (d), (e), and (i) below, together with any other unlawful attack on or abuse of the Services, is referred to as &quot;<strong>Malicious Activity</strong>&quot;):
            </p>
            <ul>
              <li>
                <strong>(a) Unlawful use.</strong> Violate Applicable Law, or infringe or misappropriate the rights of any person, including Intellectual Property Rights, rights of privacy or publicity, confidentiality rights, and rights in trade secrets;
              </li>
              <li>
                <strong>(b) Malware and exploit content.</strong> Submit, transmit, or process any virus, worm, Trojan horse, ransomware, spyware, logic bomb, or other malicious code, or any file crafted to exploit, crash, or compromise a PDF parser, renderer, processing library, server, or any user&apos;s device (including files containing weaponized embedded scripts, malformed structures, decompression bombs, or resource-exhaustion payloads);
              </li>
              <li>
                <strong>(c) Attacks on the Services.</strong> Attempt to gain unauthorized access to, probe, scan, or test the vulnerability of the Services, any related system, or any other user&apos;s data; launch or participate in any denial-of-service or distributed denial-of-service attack; or otherwise interfere with, disrupt, overload, or impose an unreasonable or disproportionate burden on the Services or their infrastructure;
              </li>
              <li>
                <strong>(d) Circumvention.</strong> Bypass, disable, or interfere with any security, access-control, rate-limiting, usage-limit, or technical protection measure of the Services;
              </li>
              <li>
                <strong>(e) Scraping and automation.</strong> Use bots, spiders, crawlers, scrapers, headless browsers, scripts, or other automated or non-human means to access the Services, harvest or extract data, code, interface elements, or content from them, or operate the Services at a rate or scale exceeding what a human could reasonably achieve through ordinary manual interaction, except through the API in accordance with Article 7;
              </li>
              <li>
                <strong>(f) Illegal or harmful material.</strong> Process, generate, store, or disseminate content that: is unlawful; constitutes or facilitates child sexual abuse or exploitation in any form; incites or promotes terrorism, violent extremism, or violence; incites hatred or discrimination against any person or group; constitutes harassment, threats, or intimidation; facilitates fraud, identity theft, or other criminal conduct; discloses another person&apos;s sensitive personal information without a lawful basis; or is defamatory, obscene, or otherwise unlawful;
              </li>
              <li>
                <strong>(g) Deception and fraud.</strong> Use the Services to create, alter, or distribute forged, falsified, or fraudulent documents, or to deceive or defraud any person, including through synthetic or manipulated content intended to mislead others as to its origin, authenticity, or identity;
              </li>
              <li>
                <strong>(h) Impersonation.</strong> Impersonate any person or entity, misrepresent your affiliation with any person or entity, or falsely suggest an association with or endorsement by Kanto Empire;
              </li>
              <li>
                <strong>(i) Third-party accounts.</strong> Access or attempt to access the account, credentials, or data of any other user;
              </li>
              <li>
                <strong>(j) Competitive intelligence.</strong> Access the Services to build a competing product or service, to copy its features or functionality, or to conduct benchmarking or performance testing for publication without Kanto Empire&apos;s prior written consent;
              </li>
              <li>
                <strong>(k) Resale and unauthorized commercial use.</strong> Sell, lease, or otherwise commercially exploit access to the Services, or repackage the Services or their output as a service for third parties, without written authorization;
              </li>
              <li>
                <strong>(l) Removal of notices.</strong> Remove, alter, or obscure any proprietary, copyright, trademark, or legal notice on or in the Services; or
              </li>
              <li>
                <strong>(m) Harm to persons.</strong> Use the Services to coerce, abuse, or harm any person, including Kanto Empire&apos;s personnel.
              </li>
            </ul>
            <p>
              <strong>6.4 No Obligation to Monitor; Right to Act.</strong> Kanto Empire does not monitor User Content or your conduct within Client-Side Processing and has no obligation to monitor Server-Side Processing. However, Kanto Empire reserves the right, at its sole discretion and without any obligation, to investigate any suspected violation of these Terms using Operational Metadata and lawful technical means, and to take any action permitted by these Terms or Applicable Law, including blocking access under Article 23 and reporting suspected unlawful activity to competent authorities.
            </p>
            <p>
              <strong>6.5 Cooperation.</strong> You shall cooperate with any reasonable request by Kanto Empire to investigate or remedy any suspected breach of this Article.
            </p>
          </section>

          {/* Article 7 */}
          <section id="article-7" className="mb-12 scroll-mt-20">
            <h2>7. API ACCESS AND AUTOMATED USE</h2>
            <p>
              <strong>7.1 Availability.</strong> Access to any API is a discretionary privilege, not a right, and is available only where Kanto Empire has made the API generally available or has granted you access in writing. Kanto Empire may modify, restrict, suspend, or discontinue any API or API access at any time.
            </p>
            <p>
              <strong>7.2 Authorized Access Only.</strong> You may access the API only by the means, endpoints, and methods described in the Documentation, and only with credentials issued to you. You shall not attempt to access the Server-Side Tools through any undocumented endpoint, reverse-engineered request, replayed or forged request, or spoofed client, and shall not disguise, mask, or falsify your identity, origin, user agent, or the identity of your own end users.
            </p>
            <p>
              <strong>7.3 Credentials.</strong> API keys, tokens, and any developer credentials are confidential and for your exclusive use. You shall not publish, embed in client-side or open-source code, share, sell, or transfer them. <strong>You are solely responsible for all activity conducted using your credentials and for all consequences of their loss, disclosure, or misuse.</strong> Kanto Empire may revoke any credential at any time.
            </p>
            <p>
              <strong>7.4 Rate Limits and Fair Use.</strong> Kanto Empire may set, change, and enforce rate limits, quotas, concurrency limits, payload limits, and other usage thresholds, and you shall not attempt to circumvent them, including by rotating credentials, IP addresses, identities, or accounts. Requests to exceed limits require Kanto Empire&apos;s express written consent, which it may withhold or condition on additional terms and fees.
            </p>
            <p>
              <strong>7.5 Prohibited API Uses.</strong> In addition to Article 6, you shall not use the API to: (a) scrape, crawl, harvest, or systematically extract data, code, models, or outputs of the Services; (b) create a substitute for, or replica of, the Services or any part of them; (c) conduct Malicious Activity; (d) process content in violation of Article 9; (e) train, fine-tune, evaluate, benchmark, or improve any artificial intelligence or machine-learning system using the Services, their code, interfaces, or behavior (see Article 10.5); or (f) exceed the scope of any access granted.
            </p>
            <p>
              <strong>7.6 End Users.</strong> If you make the Services available to your own end users through the API, you: (a) shall bind them to written terms at least as protective of Kanto Empire as these Terms; (b) are solely responsible for their acts and omissions as though they were your own; (c) shall provide them with your own privacy notice that accurately describes your handling of their data; and (d) shall not represent that Kanto Empire has any obligation or relationship with them.
            </p>
            <p>
              <strong>7.7 Monitoring of API Use.</strong> To protect the Services, ensure compliance, and prevent abuse, Kanto Empire may monitor API usage patterns using Operational Metadata (but not User Content), and you shall not obstruct or interfere with such monitoring. Kanto Empire may suspend or terminate API access without notice if it reasonably suspects a breach of these Terms.
            </p>
            <p>
              <strong>7.8 No Exclusivity; Competing Products.</strong> Access to the API is non-exclusive. You acknowledge that Kanto Empire may develop, acquire, or offer products and services that compete with yours.
            </p>
            <p>
              <strong>7.9 Data Protection Responsibilities.</strong> As between you and Kanto Empire, you are responsible for lawful collection of, and all notices, consents, and authorizations concerning, any personal data contained in User Content that you or your end users submit through the API, as further provided in Article 11.
            </p>
          </section>

          {/* Article 8 */}
          <section id="article-8" className="mb-12 scroll-mt-20">
            <h2>8. PROHIBITION OF REVERSE ENGINEERING, MODIFICATION AND CIRCUMVENTION</h2>
            <p>
              <strong>8.1 Confidential and Proprietary Nature.</strong> The Services, including the source code, object code, WebAssembly and other compiled modules, algorithms, processing logic, data structures, interfaces, APIs, and architecture, constitute valuable trade secrets and proprietary information of Kanto Empire and its licensors.
            </p>
            <p>
              <strong>8.2 Prohibitions.</strong> Except to the limited extent that Applicable Law expressly permits notwithstanding a contractual prohibition, you shall not, and shall not permit any third party to:
            </p>
            <ul>
              <li><strong>(a)</strong> modify, adapt, translate, port, or create derivative works of the Services or any part of them;</li>
              <li><strong>(b)</strong> reverse engineer, decompile, disassemble, deobfuscate, or otherwise attempt to derive or discover the source code, underlying ideas, algorithms, file formats, protocols, data representations, or non-public interfaces of the Services, including by monitoring, intercepting, or recording inputs and outputs of the Services in order to recreate them (other than observation of your own browser&apos;s traffic as permitted by Article 4.9);</li>
              <li><strong>(c)</strong> extract, copy, mirror, or repackage client-side code, assets, or WebAssembly modules for use outside the Services;</li>
              <li><strong>(d)</strong> remove, disable, bypass, or tamper with any licensing, security, obfuscation, integrity-check, rate-limiting, or technical protection mechanism;</li>
              <li><strong>(e)</strong> inject, hook, instrument, or intercept the Services&apos; code or runtime to alter its behavior, including to defeat the Zero-Retention Policy safeguards or usage limits;</li>
              <li><strong>(f)</strong> access the Services to build a similar or competing product or to replicate its features, or use any data or knowledge derived from prohibited analysis for such a purpose; or</li>
              <li><strong>(g)</strong> assist, encourage, or enable any third party to do any of the above.</li>
            </ul>
            <p>
              <strong>8.3 Statutory Interoperability Rights.</strong> Where Applicable Law grants you a non-waivable right to decompile any part of the Services to obtain information necessary to achieve interoperability, you shall first request that information in writing from Kanto Empire, which may, at its sole discretion, supply the information or impose reasonable conditions on any decompilation to protect its Intellectual Property Rights and confidential information.
            </p>
            <p>
              <strong>8.4 Remedies.</strong> You acknowledge that a breach of this Article would cause Kanto Empire irreparable harm for which damages would be an inadequate remedy, and that Kanto Empire is entitled to seek injunctive and other equitable relief without proof of actual damage and without posting bond, in addition to all other remedies.
            </p>
          </section>

          {/* Article 9 */}
          <section id="article-9" className="mb-12 scroll-mt-20">
            <h2>9. USER CONTENT AND USER RESPONSIBILITY</h2>
            <p>
              <strong>9.1 Ownership.</strong> As between you and Kanto Empire, you retain all rights, title, and interest, including all Intellectual Property Rights, in and to your User Content and Output Files. Kanto Empire claims no ownership of User Content or Output Files.
            </p>
            <p>
              <strong>9.2 Limited Technical License.</strong> For Server-Side Tools only, you grant Kanto Empire a limited, non-exclusive, worldwide, royalty-free, revocable license to receive, copy, and process your User Content in volatile memory solely as strictly necessary to perform the specific operation you request and to deliver the resulting Output File to you, for the duration of that operation only. This license terminates automatically at the Zero-Retention Event. <strong>It does not permit any storage, analysis, monitoring, commercial exploitation, sharing, or use of User Content for any other purpose, including any purpose described in Article 10.</strong> For Client-Side Tools, no license to User Content is required or granted, because Kanto Empire does not receive it.
            </p>
            <p>
              <strong>9.3 No Access, No Knowledge, No Monitoring.</strong> Kanto Empire does not access, review, moderate, verify, or monitor User Content. <strong>Kanto Empire has no actual or constructive knowledge of the content of any User Content and no technical ability to evaluate its legality, authenticity, ownership, accuracy, or sensitivity.</strong> Accordingly, Kanto Empire acts as a neutral technical tool and processes User Content solely on your instruction, as a technical conduit, without any editorial function or control over its content.
            </p>
            <p>
              <strong>9.4 Your Exclusive Responsibility.</strong> <strong>YOU ARE SOLELY, EXCLUSIVELY, AND ENTIRELY RESPONSIBLE AND LIABLE FOR ALL USER CONTENT, INCLUDING ITS SELECTION, LEGALITY, ACCURACY, OWNERSHIP, LICENSING, CONFIDENTIALITY, SENSITIVITY, AND THE PURPOSES FOR WHICH YOU PROCESS IT AND DISTRIBUTE OUTPUT FILES.</strong> Without limitation, you are solely liable for:
            </p>
            <ul>
              <li><strong>(a)</strong> any infringement or misappropriation of copyright, trademark, patent, database, trade-secret, or other Intellectual Property Rights, whether by the User Content, the processing you request, or the Output File;</li>
              <li><strong>(b)</strong> any violation of privacy, data protection, image, publicity, honor, confidentiality, or contractual rights of any third party;</li>
              <li><strong>(c)</strong> the processing of any illegal, unlawful, harmful, or prohibited material;</li>
              <li><strong>(d)</strong> the processing of any personal data, special-category or sensitive data, health data, financial data, payment card data, credentials, government identifiers, biometric data, children&apos;s data, privileged or classified information, or any other confidential or regulated information, and compliance with all laws, regulations, and contractual or professional duties that apply to it; and</li>
              <li><strong>(e)</strong> obtaining every consent, license, authorization, and permission necessary to process the User Content and to distribute the Output File.</li>
            </ul>
            <p>
              <strong>9.5 User Representations and Warranties.</strong> Each time you use the Services, you represent and warrant that: (a) you own the User Content or have all rights, licenses, consents, and authorizations necessary to process it as instructed; (b) your User Content and the processing you request do not and will not violate Applicable Law, these Terms, or the rights of any person; (c) your User Content contains no material prohibited by Article 6; and (d) if you are processing content on behalf of a third party, you are duly authorized to do so.
            </p>
            <p>
              <strong>9.6 Sensitive and Regulated Data.</strong> The Services are general-purpose tools. They have not been designed, audited, or certified for the processing of data subject to sector-specific regulation (including protected health information, payment-card data, or education or financial records), and Kanto Empire does not enter into business associate agreements or comparable regulatory undertakings unless otherwise agreed in a signed writing. <strong>If you choose to process regulated or sensitive data through the Services, you do so entirely at your own risk and assume sole responsibility for compliance with all laws and obligations applicable to that data.</strong> Wherever practicable, you should use Client-Side Tools for sensitive content.
            </p>
            <p>
              <strong>9.7 No Professional Relationship.</strong> Nothing in the Services creates any attorney-client, fiduciary, confidential, bailment, custodial, or professional relationship between you and Kanto Empire. Kanto Empire is not a custodian of your content, does not provide legal, notarial, compliance, records-management, or archival services, and has no duty to preserve any document, evidence, or record.
            </p>
            <p>
              <strong>9.8 Intellectual Property Complaints.</strong> Because Kanto Empire retains no User Content and has no ability to locate, view, or remove it, it is unable to remove or disable access to any User Content. If you believe that a User is infringing your rights through the Services, you may notify Kanto Empire at kantoempire@gmail.com with sufficient information to identify the claimed right and the alleged infringing conduct, so that Kanto Empire may, in its sole discretion, consider blocking access by the relevant User. Kanto Empire has no obligation to take any such action, and any dispute regarding User Content is between the complainant and the relevant User.
            </p>
            <p>
              <strong>9.9 Right to Refuse Processing.</strong> Kanto Empire may, without notice or liability, decline, block, or interrupt the processing of any User Content or any operation if it reasonably suspects, or is informed by a competent authority through reasonably reliable means, that it violates these Terms or Applicable Law.
            </p>
          </section>

          {/* Article 10 */}
          <section id="article-10" className="mb-12 scroll-mt-20">
            <h2>10. NO ARTIFICIAL INTELLIGENCE OR MACHINE LEARNING TRAINING</h2>
            <p>
              <strong>10.1 Express Covenant.</strong> <strong>KANTO PDF DOES NOT, AND WILL NEVER, USE USER CONTENT OR OUTPUT FILES (INCLUDING ANY TEXT, IMAGES, DATA, METADATA, OR DERIVATIVE OF THEM) TO TRAIN, FINE-TUNE, TEST, VALIDATE, IMPROVE, OR DEVELOP ANY ARTIFICIAL INTELLIGENCE OR MACHINE-LEARNING MODEL, ALGORITHM, OR SYSTEM, WHETHER OWNED BY KANTO EMPIRE OR BY ANY THIRD PARTY.</strong>
            </p>
            <p>
              <strong>10.2 Scope of Covenant.</strong> The covenant in Article 10.1 applies to all forms of artificial intelligence and machine learning, including large language models, generative models, computer-vision models, optical-character-recognition or document-understanding models, classification or recommendation systems, and any architecture, weights, embeddings, or datasets, whether used internally or shared, licensed, sold, or otherwise made available to any third party.
            </p>
            <p>
              <strong>10.3 Technical Consistency.</strong> This covenant is consistent with, and reinforced by, the architecture described in Article 4: Kanto Empire does not receive User Content processed by Client-Side Tools, and it does not retain User Content processed by Server-Side Tools beyond the Zero-Retention Event, so that no User Content is stored or available to be used as training data.
            </p>
            <p>
              <strong>10.4 No Third-Party Access for AI Purposes.</strong> Kanto Empire does not transmit, disclose, license, sell, or otherwise make available User Content to any third party for the purpose of artificial-intelligence or machine-learning training, development, or improvement, and does not authorize any infrastructure or service provider to do so.
            </p>
            <p>
              <strong>10.5 Restrictions on Users.</strong> You shall not, and shall not permit any third party to, use the Services (including the API), their code, interfaces, responses, or behavior, or any information derived from them, to create, train, fine-tune, test, evaluate, benchmark, distill, or otherwise improve, directly or indirectly, any artificial-intelligence or machine-learning model, dataset, or system, or to replicate the Services&apos; functionality using such technology. This restriction does not prohibit you from separately using your own lawfully obtained Output Files in a manner permitted by Applicable Law and by the rights you hold in that content, provided that no such use involves the Services&apos; code, interfaces, or systems.
            </p>
            <p>
              <strong>10.6 Future Features.</strong> Should Kanto Empire ever offer any optional feature that sends User Content to an artificial-intelligence system for the purpose of performing a task you request (as distinct from training), that feature would be clearly disclosed within the interface, would be optional, would be governed by supplementary terms presented to you before you use it, and would remain subject to the covenant in Article 10.1. Any amendment of these Terms shall not reduce the covenant in Article 10.1 with respect to User Content that you have already submitted.
            </p>
          </section>

          {/* Article 11 */}
          <section id="article-11" className="mb-12 scroll-mt-20">
            <h2>11. DATA PROTECTION AND PRIVACY</h2>
            <p>
              <strong>11.1 Privacy Policy.</strong> Kanto Empire&apos;s collection and handling of personal data as a controller (which does not include User Content) is described in the Privacy Policy. By using the Services, you confirm that you have read and understood the Privacy Policy.
            </p>
            <p>
              <strong>11.2 Roles of the Parties.</strong>
            </p>
            <ul>
              <li>
                <strong>(a) Client-Side Processing.</strong> Kanto Empire does not receive, access, or process User Content processed through Client-Side Tools, and therefore acts neither as a controller nor as a processor of the personal data (if any) contained in it. You (or the person on whose behalf you act) remain solely responsible for such data.
              </li>
              <li>
                <strong>(b) Server-Side Processing.</strong> To the extent that User Content submitted for Server-Side Processing contains personal data, and to the extent that Applicable Data Protection Law characterizes Kanto Empire&apos;s transient handling of that data as &quot;processing,&quot; the parties agree that: (i) you (or your principal) are the controller (or &quot;business&quot;) of that personal data and Kanto Empire acts solely as a processor (or &quot;service provider&quot;) on your behalf; (ii) Kanto Empire processes such data only on your documented instructions, namely your submission of the User Content and your selection of the relevant tool, exclusively to generate the Output File and to deliver it to you; (iii) Kanto Empire applies appropriate technical and organizational measures for the security of its systems, including encryption in transit and Volatile Memory Processing; (iv) Kanto Empire imposes confidentiality obligations on personnel with system access; (v) Kanto Empire does not engage sub-processors with access to User Content other than infrastructure providers described in Article 4.8(d); (vi) the Zero-Retention Event constitutes the deletion of that personal data upon completion of the processing; and (vii) Kanto Empire will provide reasonable assistance to demonstrate compliance to the extent it holds relevant information. A supplementary data processing agreement is available to Business Users on request at kantoempire@gmail.com.
              </li>
              <li>
                <strong>(c) Your Responsibilities as Controller.</strong> You are solely responsible for determining the lawful basis for processing, providing all required notices, obtaining all consents, conducting any impact assessments, honoring data-subject rights, ensuring the lawfulness of any cross-border transfer that you initiate, and otherwise complying with Applicable Data Protection Law with respect to User Content.
              </li>
            </ul>
            <p>
              <strong>11.3 Operational Metadata.</strong> To operate, secure, and maintain the Services, Kanto Empire may collect technical and operational data that is generated by your use of the Services, such as IP address, timestamps, request and error codes, tool invoked, processing duration, approximate request size, browser and device type, and rate-limit counters (&quot;<strong>Operational Metadata</strong>&quot;). <strong>Operational Metadata does not include the content of User Content or Output Files.</strong> Kanto Empire uses Operational Metadata solely for security, fraud and abuse prevention, reliability, capacity planning, and legal compliance, as further described in the Privacy Policy.
            </p>
            <p>
              <strong>11.4 No Sale or Advertising Use.</strong> Kanto Empire does not sell User Content, does not use User Content for advertising or profiling, and does not share User Content with third parties for any purpose, other than infrastructure providers acting on Kanto Empire&apos;s behalf as described in Article 4.8(d).
            </p>
            <p>
              <strong>11.5 Data-Subject Rights.</strong> Because Kanto Empire does not retain User Content, it is unable to identify, locate, access, correct, export, or erase User Content in response to a data-subject request. Kanto Empire is not required to collect, retain, or re-identify data in order to comply with such a request. Requests concerning Operational Metadata may be sent to kantoempire@gmail.com and will be handled in accordance with the Privacy Policy and Applicable Data Protection Law.
            </p>
            <p>
              <strong>11.6 International Transfers.</strong> The Services are available globally, and Operational Metadata and transient Server-Side Processing may occur in jurisdictions other than yours. By using Server-Side Tools you acknowledge that your User Content may be transmitted across borders to Kanto Empire&apos;s processing infrastructure. Where required by Applicable Data Protection Law, Kanto Empire will implement appropriate safeguards for transfers of Operational Metadata. If Applicable Law prohibits or restricts your transfer of any User Content abroad, you must not use Server-Side Tools for that content.
            </p>
            <p>
              <strong>11.7 Security Incidents.</strong> If Kanto Empire becomes aware of a breach of security leading to the unauthorized disclosure of personal data for which it is responsible under Applicable Data Protection Law, it will notify the affected parties and authorities to the extent and within the time required by that law. You acknowledge that Kanto Empire&apos;s zero-retention design substantially limits the data available to any incident, and that, save as required by mandatory law, Kanto Empire has no other obligation to notify you of incidents affecting third parties or your own environment.
            </p>
            <p>
              <strong>11.8 Children&apos;s Data.</strong> Kanto Empire does not knowingly collect personal data from children under the age specified in Article 3.2. If you believe a child has provided personal data to Kanto Empire, please contact kantoempire@gmail.com.
            </p>
            <p>
              <strong>11.9 Local Storage and Cookies.</strong> The Site may use cookies, browser storage, or similar technologies for essential operation, security, and preference retention, as described in the Privacy Policy. Any such storage does not include User Content.
            </p>
          </section>

          {/* Article 12 */}
          <section id="article-12" className="mb-12 scroll-mt-20">
            <h2>12. USER RESPONSIBILITY FOR BACKUPS, DEVICES AND ENVIRONMENT</h2>
            <p>
              <strong>12.1 Mandatory Backups.</strong> <strong>YOU MUST KEEP AN INDEPENDENT, COMPLETE, AND VERIFIED BACKUP OF EVERY FILE BEFORE USING THE SERVICES. YOU SHALL NOT USE THE SERVICES AS THE SOLE REPOSITORY, ARCHIVE, OR COPY OF ANY FILE, AND YOU SHALL NOT RELY ON THE SERVICES TO PRESERVE, PROTECT, OR RETURN ANY FILE.</strong>
            </p>
            <p>
              <strong>12.2 Assumption of Risk.</strong> You acknowledge that processing, repairing, converting, merging, splitting, cropping, reorganizing, compressing, or otherwise transforming files carries inherent risk of loss, alteration, corruption, or destruction of data, and that files that are already damaged or non-standard are at heightened risk. <strong>You assume all such risks.</strong>
            </p>
            <p>
              <strong>12.3 Original Files.</strong> You shall always perform operations on copies, never on your only original, and you shall verify each Output File for completeness, integrity, and accuracy before you delete, overwrite, distribute, file, submit, or rely on it or on any original.
            </p>
            <p>
              <strong>12.4 Your Environment.</strong> You are solely responsible for: (a) your devices, hardware, operating systems, browsers, extensions, network connections, and internet-service charges; (b) maintaining current, supported, and secure browsers and software; (c) installing security updates; (d) protecting your devices against malware; (e) sufficient memory, processing power, and storage for the operations you perform; and (f) the security of your downloads and Output Files on your device and any cloud-sync or storage service you use.
            </p>
            <p>
              <strong>12.5 Connectivity.</strong> Server-Side Tools require an internet connection. Kanto Empire is not responsible for the availability, speed, cost, or quality of your connection, or for the consequences of any interruption of it, including failed or incomplete operations.
            </p>
            <p>
              <strong>12.6 Browser Crashes and Local Failures.</strong> Kanto Empire is not liable for any browser or tab crash, freeze, memory exhaustion, device failure, power loss, storage error, or operating-system fault, however caused, including where triggered by the size or complexity of a file, and including in the course of Client-Side Processing.
            </p>
            <p>
              <strong>12.7 Third-Party Software.</strong> Kanto Empire is not responsible for the effect of any browser extension, security software, ad-blocker, corporate policy, firewall, proxy, or other software or configuration on the operation of the Services.
            </p>
          </section>

          {/* Article 13 */}
          <section id="article-13" className="mb-12 scroll-mt-20">
            <h2>13. OUTPUT FILES</h2>
            <p>
              <strong>13.1 No Guarantee of Fidelity.</strong> Outputs are generated automatically. <strong>Kanto Empire does not warrant that any Output File will be complete, accurate, error-free, visually or structurally identical to the input, editable, compatible with any software or standard, or fit for any purpose.</strong> Conversion and repair operations, in particular, may alter, reflow, re-render, downsample, omit, misplace, or discard content, formatting, fonts, images, metadata, hyperlinks, bookmarks, form fields, annotations, layers, accessibility tags, and digital signatures.
            </p>
            <p>
              <strong>13.2 PDF Repair.</strong> Repair tools operate on a best-effort, technical basis on files that are, by definition, damaged or non-conforming. <strong>A repair operation may not succeed, may recover only part of a file, may alter the file, or may render a file that was partially readable completely unreadable, and Kanto Empire cannot restore the original file after any operation.</strong> Kanto Empire owes you no recovery, restoration, refund, credit, replacement, or compensation of any kind for any such outcome.
            </p>
            <p>
              <strong>13.3 Conversion.</strong> Conversion between formats is inherently lossy and dependent on the structure of the source file. You accept that results will vary and that no conversion will be perfect.
            </p>
            <p>
              <strong>13.4 Digital Signatures, Certification, and Integrity.</strong> Modifying, merging, splitting, converting, or otherwise processing a file may invalidate digital signatures, timestamps, certifications, integrity checks, and PDF/A, PDF/UA, or other conformance status. You are solely responsible for determining whether processing is appropriate for any signed, certified, or regulated document.
            </p>
            <p>
              <strong>13.5 Security-Related Tools.</strong> Where a tool removes, applies, or modifies passwords, permissions, encryption, redactions, metadata, or hidden content, you: (a) represent that you have the legal right to do so; (b) acknowledge that Kanto Empire does not guarantee that any redaction, sanitization, metadata removal, or encryption is complete, irreversible, or effective; and (c) shall independently verify the outcome before sharing or publishing any Output File.
            </p>
            <p>
              <strong>13.6 Limits.</strong> File-size, page-count, resolution, and other limits may apply and may change at any time without notice.
            </p>
            <p>
              <strong>13.7 No Legal or Regulatory Effect.</strong> Kanto Empire does not warrant that any Output File will be accepted by, or be valid, admissible, or compliant for the purposes of, any court, authority, institution, counterparty, or regulator, or that it satisfies any legal formality, record-keeping requirement, or evidentiary standard.
            </p>
            <p>
              <strong>13.8 Verification and Reliance.</strong> You are solely responsible for reviewing and verifying every Output File and for all decisions and actions you take in reliance on it.
            </p>
          </section>

          {/* Article 14 */}
          <section id="article-14" className="mb-12 scroll-mt-20">
            <h2>14. AVAILABILITY, UPDATES AND MODIFICATIONS OF THE SERVICES</h2>
            <p>
              <strong>14.1 No Availability Commitment.</strong> Kanto Empire aims to keep the Services available but provides no service-level agreement, uptime commitment, or guarantee of continuous, uninterrupted, timely, or error-free operation. The Services may be unavailable, degraded, or limited at any time, including for maintenance, upgrades, emergency repairs, capacity constraints, security reasons, or causes beyond Kanto Empire&apos;s control.
            </p>
            <p>
              <strong>14.2 Right to Modify.</strong> Kanto Empire may, at any time and in its sole discretion, with or without notice: (a) add, modify, suspend, restrict, or remove any tool, feature, API, limit, or functionality; (b) change the processing model or classification of any tool, subject to Article 4.10; (c) release updates, patches, and new versions; and (d) discontinue the Services in whole or in part, temporarily or permanently. Kanto Empire shall have no liability to you or any third party for any such action.
            </p>
            <p>
              <strong>14.3 Updates by You.</strong> It is your responsibility to use a current, supported browser and to refresh or reload the Services to obtain updates. Kanto Empire has no obligation to support outdated browsers, operating systems, devices, or configurations, or prior versions of the Services or API.
            </p>
            <p>
              <strong>14.4 Beta and Experimental Features.</strong> Features designated as beta, preview, experimental, or similar are provided without any warranty, may contain errors, and may be changed or withdrawn at any time. Your use of such features is entirely at your own risk.
            </p>
            <p>
              <strong>14.5 Support.</strong> Kanto Empire has no obligation to provide technical support, maintenance, training, or updates. Any support Kanto Empire chooses to provide is discretionary, is provided &quot;as is,&quot; and does not create any obligation, and requests for support must not include any User Content (see Article 4.6).
            </p>
            <p>
              <strong>14.6 Discontinuation.</strong> If Kanto Empire permanently discontinues the Services in their entirety, other than by reason of a Force Majeure Event, it will endeavor to post reasonable prior notice on the Site where practicable. Because Kanto Empire does not retain User Content, there is no User Content for it to return or export, and you remain solely responsible for your own files.
            </p>
            <p>
              <strong>14.7 Geographic and Legal Availability.</strong> The Site may be accessible worldwide, but this does not mean that the Services are lawful, appropriate, or available in your jurisdiction. You are solely responsible for determining that your use of the Services complies with the law of the place from which you access them.
            </p>
          </section>

          {/* Article 15 */}
          <section id="article-15" className="mb-12 scroll-mt-20">
            <h2>15. FEES AND PAID FEATURES</h2>
            <p>
              <strong>15.1 Free Services.</strong> The Services, or certain tools, are currently offered at no charge. You acknowledge that the free provision of the Services is a material part of the consideration for the exclusions and limitations of liability in these Terms, which are fair and reasonable in light of that fact.
            </p>
            <p>
              <strong>15.2 Paid Features.</strong> Kanto Empire may at any time introduce fees, subscriptions, usage-based charges, or premium features. Any such offering will be governed by the pricing, billing, renewal, and cancellation terms presented at the point of purchase, which are incorporated into these Terms. Unless otherwise required by mandatory law or stated at the point of purchase: (a) all fees are exclusive of applicable taxes, which you shall pay; (b) fees are payable in advance and are <strong>non-refundable</strong>, including where you cease to use the Services, where your access is suspended or terminated under Article 23, or where you do not use what you have purchased; (c) subscriptions renew automatically as disclosed at the time of purchase until cancelled; and (d) Kanto Empire may change its prices prospectively on notice.
            </p>
            <p>
              <strong>15.3 Payment Processing.</strong> Payments may be processed by third-party payment providers whose terms and privacy practices apply to the processing of your payment data. Kanto Empire is not responsible for the acts, omissions, fees, delays, or security of those providers, and does not store full payment-card details.
            </p>
            <p>
              <strong>15.4 Non-Payment and Chargebacks.</strong> Kanto Empire may suspend or terminate access to paid features for non-payment or a payment dispute or chargeback, and you shall reimburse all costs of collection incurred.
            </p>
            <p>
              <strong>15.5 Consumer Rights.</strong> Nothing in this Article affects any non-waivable statutory right of withdrawal, cancellation, or refund that you may have as a Consumer under Applicable Law.
            </p>
          </section>

          {/* Article 16 */}
          <section id="article-16" className="mb-12 scroll-mt-20">
            <h2>16. INTELLECTUAL PROPERTY RIGHTS OF KANTO EMPIRE</h2>
            <p>
              <strong>16.1 Ownership.</strong> Kanto Empire (and its licensors, where applicable) is the sole and exclusive owner of all right, title, and interest, including all Intellectual Property Rights, in and to the Services, the Site, the API, and the Documentation, and all updates, upgrades, modifications, enhancements, improvements, adaptations, and derivative works of any of them, including without limitation:
            </p>
            <ul>
              <li><strong>(a)</strong> all software, source code, object code, scripts, WebAssembly and other compiled modules, libraries, engines, algorithms, processing logic, workflows, data structures, and architecture;</li>
              <li><strong>(b)</strong> all user interfaces, user experience, layouts, design, look and feel, visual elements, graphics, icons, animations, typography, text, and other content and materials;</li>
              <li><strong>(c)</strong> all trademarks, service marks, trade names, logos, and distinctive signs, including <strong>&quot;Kanto PDF,&quot; &quot;Kanto Empire,&quot;</strong> and all associated logos, stylizations, and marks, whether registered or unregistered, and all associated goodwill;</li>
              <li><strong>(d)</strong> all domain names, social-media identifiers, and trade dress; and</li>
              <li><strong>(e)</strong> all databases, compilations, specifications, documentation, and know-how.</li>
            </ul>
            <p>
              <strong>16.2 No Transfer or Implied Licenses.</strong> These Terms grant you no ownership interest, and, except for the limited License in Article 5, no license or right of any kind (whether by implication, estoppel, or otherwise) in any Intellectual Property Rights of Kanto Empire. All goodwill arising from your use of any of Kanto Empire&apos;s marks accrues to Kanto Empire.
            </p>
            <p>
              <strong>16.3 Trademark Restrictions.</strong> You shall not use, register, or seek to register any name, mark, logo, domain name, or social-media identifier that is identical or confusingly similar to any Kanto Empire mark, or use any Kanto Empire mark in any manner that is likely to cause confusion, suggest sponsorship or endorsement, or disparage or dilute it, without Kanto Empire&apos;s prior written consent.
            </p>
            <p>
              <strong>16.4 Proprietary Notices.</strong> You shall not remove, obscure, alter, or falsify any copyright, trademark, or other proprietary or legal notice contained in or displayed by the Services.
            </p>
            <p>
              <strong>16.5 Protection of Rights.</strong> You shall cooperate in good faith in protecting Kanto Empire&apos;s Intellectual Property Rights and shall promptly notify Kanto Empire at kantoempire@gmail.com of any actual or suspected infringement, misappropriation, or unauthorized use of which you become aware.
            </p>
            <p>
              <strong>16.6 Feedback.</strong> If you provide any suggestions, ideas, comments, bug reports, requests, or other feedback concerning the Services (&quot;<strong>Feedback</strong>&quot;), you hereby irrevocably assign to Kanto Empire all right, title, and interest in and to the Feedback and all Intellectual Property Rights in it (or, where assignment is not permitted by Applicable Law, grant Kanto Empire a perpetual, irrevocable, worldwide, sublicensable, transferable, royalty-free, fully paid-up license to use and exploit it for any purpose), without any obligation of attribution or compensation. Feedback does not include User Content.
            </p>
            <p>
              <strong>16.7 Kanto Empire Confidential Information.</strong> Non-public technical, operational, security, and business information about the Services that you obtain through your use of them, including non-public API documentation, credentials, roadmaps, and architecture details not expressly published by Kanto Empire (&quot;<strong>Kanto Confidential Information</strong>&quot;) is confidential. You shall use it solely for the purposes of these Terms, protect it with at least reasonable care, and not disclose it to any third party without prior written consent, except where required by Applicable Law (in which case you shall, where lawful, give Kanto Empire prior notice). This obligation does not apply to information that is or becomes public without your breach, was lawfully known to you free of any confidentiality obligation before disclosure, or is independently developed by you without use of Kanto Confidential Information. This obligation survives termination.
            </p>
            <p>
              <strong>16.8 Output Files.</strong> Nothing in this Article grants Kanto Empire any right in your Output Files. Kanto Empire does not claim any ownership of, or any license to, Output Files except as stated in Article 9.2.
            </p>
            <p>
              <strong>16.9 Injunctive Relief.</strong> Any breach of this Article may cause irreparable harm to Kanto Empire, entitling it to seek injunctive or other equitable relief in addition to all other remedies, without posting bond.
            </p>
            <p>
              <strong>16.10 Promotional Use.</strong> Kanto Empire will not use the name or logo of any Business User in promotional materials without that Business User&apos;s prior consent.
            </p>
          </section>

          {/* Article 17 */}
          <section id="article-17" className="mb-12 scroll-mt-20">
            <h2>17. THIRD-PARTY SERVICES, LINKS AND OPEN-SOURCE COMPONENTS</h2>
            <p>
              <strong>17.1 Third-Party Links.</strong> The Site and the Services may contain links to, or integrations with, websites, services, and resources operated by third parties. Such links are provided for convenience only. Kanto Empire does not control, monitor, endorse, or assume any responsibility for any third-party website, service, or content, and these Terms and the Privacy Policy do not apply to them. Your use of third-party services is governed solely by the terms and policies of those third parties.
            </p>
            <p>
              <strong>17.2 No Association.</strong> The inclusion of a link or integration does not imply any relationship, association, affiliation, sponsorship, or endorsement.
            </p>
            <p>
              <strong>17.3 Disclaimer.</strong> <strong>Kanto Empire disclaims all liability, direct or indirect, for any loss or damage arising from any third-party website, service, product, content, act, or omission, including their accessibility, security, legality, accuracy, quality, or availability.</strong> Kanto Empire may remove any link or integration at any time.
            </p>
            <p>
              <strong>17.4 Infrastructure Providers.</strong> Third-party infrastructure, hosting, network, and content-delivery providers supply technical capacity used to deliver the Services. Kanto Empire is not liable for their failures, outages, acts, or omissions, subject only to Kanto Empire&apos;s own obligations under Article 4 and Applicable Law.
            </p>
            <p>
              <strong>17.5 Open-Source Components.</strong> The Services may include or interoperate with open-source software components that are licensed under their own license terms. Those licenses govern your use of such components, and prevail over these Terms to the extent they grant broader rights in those components. Nothing in these Terms limits your rights under any such open-source license, and nothing in any such license extends to Kanto Empire&apos;s proprietary code, interfaces, or trademarks.
            </p>
          </section>

          {/* Article 18 */}
          <section id="article-18" className="mb-12 scroll-mt-20">
            <h2>18. FRAUDULENT PRACTICES, PHISHING AND IMPERSONATION</h2>
            <p>
              <strong>18.1 Notice of Risk.</strong> You are informed that third parties may attempt to impersonate Kanto PDF or Kanto Empire to obtain data, credentials, files, or payments, including by: registering look-alike domains or copying the Site&apos;s appearance; sending fraudulent emails or messages; operating fraudulent social-media pages, applications, browser extensions, or advertisements; or offering unauthorized or modified copies of the Services.
            </p>
            <p>
              <strong>18.2 Your Precautions.</strong> To protect yourself, you should: (a) access the Services only through the official domain(s) and channels designated by Kanto Empire ([Official Domain(s)]); (b) treat as suspicious any message or link purporting to be from Kanto Empire that asks for your password, payment details, or files; (c) not download the Services, extensions, or applications from unofficial sources; and (d) maintain up-to-date security software.
            </p>
            <p>
              <strong>18.3 Communications.</strong> Kanto Empire will never ask you to send your documents, passwords, or payment credentials by email or social media. Kanto Empire&apos;s only official contact address is kantoempire@gmail.com.
            </p>
            <p>
              <strong>18.4 Disclaimer.</strong> This Article is provided for informational and preventive purposes only and is not professional advice. <strong>Kanto Empire is not responsible for any fraudulent, unauthorized, or infringing use of its name, marks, appearance, or code by third parties, or for any harm you suffer as a result of dealing with impostors or unofficial versions of the Services.</strong> Please report any suspected impersonation to kantoempire@gmail.com.
            </p>
            <p>
              <strong>18.5 Fraud by Users.</strong> If Kanto Empire reasonably suspects that you have engaged in or attempted fraud, including fraudulent payment activity or misrepresentation, Kanto Empire may suspend or terminate your access, block associated identifiers, cancel any transaction, and take any other technical, legal, or organizational measure it considers appropriate, in accordance with Article 23.
            </p>
          </section>

          {/* Article 19 */}
          <section id="article-19" className="mb-12 scroll-mt-20">
            <h2>19. MALWARE, CYBER-ATTACKS AND SECURITY RESEARCH</h2>
            <p>
              <strong>19.1 Prohibition.</strong> You shall not introduce or attempt to introduce into the Services, or to any server, network, or system connected to them, any virus, worm, Trojan horse, logic bomb, ransomware, or other malicious or technologically harmful material, and shall not engage in any attack on the Services, including a denial-of-service or distributed denial-of-service attack, injection attack, credential-stuffing, or unauthorized access attempt.
            </p>
            <p>
              <strong>19.2 Consequences.</strong> Breach of this Article is a material breach of these Terms and may constitute a criminal offense. Kanto Empire may terminate your access immediately and without notice, will report violations to competent authorities, and will cooperate with them, including by disclosing Operational Metadata to the extent permitted or required by law.
            </p>
            <p>
              <strong>19.3 No Responsibility for Third-Party Attacks.</strong> <strong>Kanto Empire is not liable for any loss or damage caused by a denial-of-service attack, virus, or other malicious or technologically harmful material or activity that is not attributable to Kanto Empire&apos;s own wilful misconduct and that affects your systems, devices, data, or content.</strong> You are responsible for scanning any file for malware before you open, process, or distribute it, and for the safety of Output Files that you receive.
            </p>
            <p>
              <strong>19.4 Security Research and Responsible Disclosure.</strong> Kanto Empire welcomes good-faith reports of security vulnerabilities sent to kantoempire@gmail.com. Except with Kanto Empire&apos;s prior written authorization, you may not conduct any security testing, scanning, or penetration testing against the Services. If you discover a vulnerability, you shall: (a) report it promptly and confidentially; (b) provide reasonable detail to allow reproduction; (c) refrain from accessing, modifying, or exfiltrating data beyond the minimum necessary to demonstrate the issue; (d) refrain from degrading the Services or any user&apos;s experience; and (e) allow Kanto Empire a reasonable period to remediate before any public disclosure. Compliance with this Article 19.4 does not create any obligation on Kanto Empire to reward you, and Kanto Empire reserves all rights with respect to activity that does not comply with it.
            </p>
          </section>

          {/* Article 20 */}
          <section id="article-20" className="mb-12 scroll-mt-20">
            <h2>20. DISCLAIMER OF WARRANTIES</h2>
            <p>
              <strong>20.1 &quot;AS IS&quot; and &quot;AS AVAILABLE.&quot;</strong> <strong>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICES, THE SITE, THE API, THE DOCUMENTATION, AND ALL OUTPUT FILES ARE PROVIDED STRICTLY &quot;AS IS,&quot; &quot;WITH ALL FAULTS,&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT WARRANTY OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE.</strong>
            </p>
            <p>
              <strong>20.2 Specific Disclaimers.</strong> <strong>WITHOUT LIMITING ARTICLE 20.1, KANTO EMPIRE, ON BEHALF OF ITSELF AND THE KANTO PARTIES, EXPRESSLY DISCLAIMS ALL WARRANTIES AND REPRESENTATIONS, INCLUDING ANY IMPLIED WARRANTY OR CONDITION OF MERCHANTABILITY, SATISFACTORY QUALITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, QUIET ENJOYMENT, ACCURACY, COMPLETENESS, RELIABILITY, AVAILABILITY, SECURITY, AND ANY WARRANTY ARISING FROM COURSE OF DEALING, COURSE OF PERFORMANCE, OR USAGE OF TRADE.</strong> In particular, Kanto Empire does not warrant that:
            </p>
            <ul>
              <li><strong>(a)</strong> the Services will meet your requirements or expectations, or achieve any particular result;</li>
              <li><strong>(b)</strong> the Services will be uninterrupted, timely, secure, error-free, free of defects, or free of viruses or other harmful components;</li>
              <li><strong>(c)</strong> any operation (including PDF Repair, conversion, merging, splitting, cropping, or organizing) will succeed, or will preserve, recover, or accurately reproduce any content;</li>
              <li><strong>(d)</strong> any defect or error will be corrected;</li>
              <li><strong>(e)</strong> the Services are compatible with your hardware, software, browser, operating system, or network;</li>
              <li><strong>(f)</strong> the Services are immune from hacking, piracy, denial-of-service attacks, unauthorized access, or other third-party interference;</li>
              <li><strong>(g)</strong> any Output File will be free of errors, or fit for any legal, regulatory, evidentiary, or professional purpose; or</li>
              <li><strong>(h)</strong> your use of the Services will comply with Applicable Law in your jurisdiction.</li>
            </ul>
            <p>
              <strong>20.3 Architectural Statements.</strong> Except for the express undertakings in Article 4 and Article 10, which are undertakings as to Kanto Empire&apos;s design and operating practice and are subject to the limits stated in Article 4.8, no description of the Services, including any description of security, privacy, or data-handling features in the Site, the Documentation, marketing materials, or communications, constitutes a warranty or guarantee of any result or outcome.
            </p>
            <p>
              <strong>20.4 No Reliance; No Other Warranties.</strong> No advice, information, or statement, oral or written, obtained by you from Kanto Empire or through the Services creates any warranty not expressly stated in these Terms. You have not relied on any warranty, representation, or statement not expressly set out in these Terms.
            </p>
            <p>
              <strong>20.5 Mandatory Law.</strong> Some jurisdictions do not allow the exclusion of certain warranties, so some of the above may not apply to you, and you may have additional rights. In that case, the disclaimers apply to the fullest extent permitted by Applicable Law, and any implied warranty that cannot be excluded is limited to the shortest duration and narrowest scope permitted.
            </p>
          </section>

          {/* Article 21 */}
          <section id="article-21" className="mb-12 scroll-mt-20">
            <h2>21. LIMITATION OF LIABILITY</h2>
            <p>
              <strong>21.1 Nature of the Services; Basis of the Bargain.</strong> You acknowledge that: (a) the Services are provided free of charge or at a fee that bears no relation to the potential losses that may arise from the transformation of files; (b) Kanto Empire has no access to, and cannot recover or restore, User Content; (c) the limitations and exclusions in this Article 21 reflect a reasonable and deliberate allocation of risk between the parties; (d) Kanto Empire would not offer the Services without them; and (e) the price of the Services (if any) reflects that allocation.
            </p>
            <p>
              <strong>21.2 Exclusion of Liability for Specified Losses.</strong> <strong>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, NONE OF THE KANTO PARTIES SHALL BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY LOSS OR DAMAGE OF ANY KIND ARISING OUT OF OR IN CONNECTION WITH THE SERVICES, WHETHER DIRECT OR INDIRECT, FORESEEABLE OR UNFORESEEABLE, INCLUDING:</strong>
            </p>
            <ul>
              <li>
                <strong>(a) FILE AND DATA LOSS:</strong> THE LOSS, DELETION, DESTRUCTION, CORRUPTION, DAMAGE, ALTERATION, TRUNCATION, DEGRADATION, OMISSION, OR UNREADABILITY OF ANY FILE, CONTENT, OR DATA, INCLUDING ANY SUCH RESULT ARISING IN THE COURSE OF, OR AS A CONSEQUENCE OF, PDF REPAIR, CONVERSION, OR ANY OTHER OPERATION, AND INCLUDING THE INABILITY TO RECOVER, RESTORE, OR RE-DELIVER ANY FILE OR OUTPUT FILE;
              </li>
              <li>
                <strong>(b) DEVICE AND BROWSER FAILURES:</strong> ANY BROWSER, TAB, OR APPLICATION CRASH, FREEZE, OR MEMORY EXHAUSTION; ANY FAILURE OF YOUR DEVICE, HARDWARE, SOFTWARE, OR OPERATING SYSTEM; OR ANY POWER, CONNECTIVITY, OR STORAGE FAILURE;
              </li>
              <li>
                <strong>(c) BUSINESS INTERRUPTION:</strong> ANY INTERRUPTION OF BUSINESS, WORK, OR OPERATIONS; DOWNTIME; MISSED DEADLINES; OR LOSS OF PRODUCTIVITY OR OPPORTUNITY;
              </li>
              <li>
                <strong>(d) ECONOMIC LOSS:</strong> LOSS OF PROFITS, REVENUE, INCOME, SALES, CONTRACTS, CUSTOMERS, ANTICIPATED SAVINGS, GOODWILL, OR REPUTATION, OR THE COST OF SUBSTITUTE GOODS, SERVICES, OR RECOVERY EFFORTS;
              </li>
              <li>
                <strong>(e) INACCURATE OUTPUT:</strong> ANY ERROR, INACCURACY, OMISSION, OR DEFECT IN ANY OUTPUT FILE, OR ANY DECISION, ACT, OR OMISSION IN RELIANCE ON IT;
              </li>
              <li>
                <strong>(f) USER CONTENT:</strong> ANY USER CONTENT, INCLUDING ANY INFRINGEMENT, ILLEGALITY, OR DISCLOSURE OF CONFIDENTIAL, PERSONAL, OR SENSITIVE INFORMATION RESULTING FROM YOUR OWN ACTS OR OMISSIONS OR THOSE OF ANY PERSON WHO HAS ACCESS TO YOUR DEVICE, ACCOUNT, OR FILES;
              </li>
              <li>
                <strong>(g) THIRD PARTIES:</strong> THE ACTS, OMISSIONS, OR SECURITY OF ANY THIRD PARTY, INCLUDING ANY INTERNET, HOSTING, OR INFRASTRUCTURE PROVIDER, ANY PERSON WHO ATTACKS OR INTERFERES WITH THE SERVICES, OR ANY PROVIDER OF SERVICES TO WHICH YOU LINK OR SUBMIT YOUR OUTPUT FILES;
              </li>
              <li>
                <strong>(h) REGULATORY CONSEQUENCES:</strong> ANY FINE, PENALTY, SANCTION, OR REGULATORY OR CONTRACTUAL CONSEQUENCE ARISING FROM YOUR USE OF THE SERVICES OR YOUR USER CONTENT; AND
              </li>
              <li>
                <strong>(i) AVAILABILITY:</strong> ANY UNAVAILABILITY, DELAY, SUSPENSION, MODIFICATION, OR DISCONTINUATION OF THE SERVICES OR ANY FEATURE.
              </li>
            </ul>
            <p>
              <strong>21.3 Destroyed, Damaged, or Corrupted Files.</strong> <strong>WITHOUT LIMITING ARTICLE 21.2, YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT IF ANY FILE IS DAMAGED, CORRUPTED, ALTERED, TRUNCATED, OR DESTROYED, OR ITS CONTENT IS LOST, DURING OR AS A RESULT OF PDF REPAIR, CONVERSION, OR ANY OTHER OPERATION, WHETHER THROUGH CLIENT-SIDE PROCESSING OR SERVER-SIDE PROCESSING AND WHETHER OR NOT KANTO EMPIRE&apos;S SYSTEMS OR CODE CONTRIBUTED TO THE RESULT, KANTO EMPIRE HAS NO OBLIGATION TO YOU WHATSOEVER, INCLUDING NO OBLIGATION TO RESTORE, RECOVER, REPLACE, REPAIR, REFUND, CREDIT, OR COMPENSATE. YOUR SOLE RESPONSIBILITY IS TO MAINTAIN INDEPENDENT BACKUPS IN ACCORDANCE WITH ARTICLE 12.</strong>
            </p>
            <p>
              <strong>21.4 Exclusion of Indirect Damages.</strong> <strong>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ANY KANTO PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, EXEMPLARY, PUNITIVE, MORAL, OR ENHANCED DAMAGES, OR FOR LOSS OF PROFITS, DATA, OR GOODWILL, HOWEVER CAUSED, UNDER ANY THEORY OF LIABILITY (INCLUDING CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, MISREPRESENTATION, PRODUCT LIABILITY, BREACH OF STATUTORY DUTY, OR OTHERWISE), AND EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES OR IF SUCH DAMAGES WERE FORESEEABLE.</strong>
            </p>
            <p>
              <strong>21.5 Aggregate Liability Cap.</strong>
            </p>
            <ul>
              <li>
                <strong>(a) Free Use.</strong> <strong>IF YOU HAVE NOT PAID ANY FEE TO KANTO EMPIRE FOR THE SERVICES, THE KANTO PARTIES&apos; TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR IN CONNECTION WITH THE SERVICES AND THESE TERMS SHALL BE ZERO (0), AND YOU EXPRESSLY WAIVE ANY RIGHT TO CLAIM COMPENSATION.</strong>
              </li>
              <li>
                <strong>(b) Paid Use.</strong> <strong>IF YOU HAVE PAID FEES TO KANTO EMPIRE FOR THE SERVICES, THE KANTO PARTIES&apos; TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR IN CONNECTION WITH THE SERVICES AND THESE TERMS, IN THE AGGREGATE AND REGARDLESS OF THE NUMBER OF CLAIMS OR EVENTS, SHALL NOT EXCEED THE TOTAL FEES ACTUALLY PAID BY YOU TO KANTO EMPIRE FOR THE SERVICES IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE FIRST EVENT GIVING RISE TO LIABILITY.</strong>
              </li>
              <li>
                <strong>(c) Exclusive Remedy.</strong> The amount in Article 21.5(b) (or zero under Article 21.5(a)) is your exclusive remedy and replaces all other compensation to which you might otherwise be entitled. If you consider that you may suffer loss exceeding these limits, it is your responsibility to arrange appropriate insurance and to take appropriate precautions, including those in Article 12.
              </li>
            </ul>
            <p>
              <strong>21.6 Application Regardless of Theory.</strong> The exclusions and limitations in this Article apply to all claims, whether in contract, tort (including negligence), strict liability, statute, indemnity, misrepresentation, or otherwise, apply even if any remedy fails of its essential purpose, and apply to claims made against any Kanto Party. They are intended to apply also to any claim you bring against a third party that would result in that party seeking indemnity or contribution from a Kanto Party.
            </p>
            <p>
              <strong>21.7 Claims Period.</strong> To the fullest extent permitted by Applicable Law, any claim against a Kanto Party must be notified in writing to kantoempire@gmail.com within <strong>thirty (30) days</strong> after you first became aware (or ought reasonably to have become aware) of the event giving rise to it, and any action must be commenced within <strong>one (1) year</strong> after the cause of action arose. A claim not notified or brought within these periods is waived and permanently barred.
            </p>
            <p>
              <strong>21.8 Assumption of Risk; Sole Remedy.</strong> <strong>YOU ASSUME ALL RISKS AND RESPONSIBILITIES ARISING FROM YOUR USE OF THE SERVICES. IF YOU ARE DISSATISFIED WITH THE SERVICES OR THESE TERMS, YOUR SOLE AND EXCLUSIVE REMEDY IS TO DISCONTINUE USING THE SERVICES.</strong>
            </p>
            <p>
              <strong>21.9 No Oral Modifications.</strong> No oral or written information or advice from Kanto Empire or its personnel modifies these disclaimers and limitations, or creates any warranty.
            </p>
            <p>
              <strong>21.10 Liability That Cannot Be Excluded.</strong> Nothing in these Terms excludes or limits any liability that cannot lawfully be excluded or limited under Applicable Law, including, to the extent required by law: liability for fraud or fraudulent misrepresentation; liability for wilful misconduct; liability for death or personal injury caused by negligence; and non-waivable statutory rights of Consumers. In those circumstances, and only to the extent required, the Kanto Parties&apos; liability remains limited to the maximum extent permitted by law.
            </p>
            <p>
              <strong>21.11 Severability of Limits; Independent Provisions.</strong> Each limitation and exclusion in this Article is a separate and independent provision. If any is held unenforceable, the remaining limitations and exclusions continue to apply to the fullest extent permitted by Applicable Law.
            </p>
            <p>
              <strong>21.12 Third-Party Beneficiaries.</strong> The Kanto Parties that are not parties to these Terms are intended beneficiaries of this Article 21 and Articles 20 and 22 and may enforce them.
            </p>
          </section>

          {/* Article 22 */}
          <section id="article-22" className="mb-12 scroll-mt-20">
            <h2>22. INDEMNIFICATION</h2>
            <p>
              <strong>22.1 Your Indemnity.</strong> <strong>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, YOU SHALL DEFEND, INDEMNIFY, AND HOLD HARMLESS THE KANTO PARTIES FROM AND AGAINST ANY AND ALL CLAIMS, DEMANDS, ACTIONS, PROCEEDINGS, LIABILITIES, LOSSES, DAMAGES, JUDGMENTS, AWARDS, SETTLEMENTS, FINES, PENALTIES, COSTS, AND EXPENSES (INCLUDING REASONABLE ATTORNEYS&apos; FEES, EXPERT FEES, AND COURT AND ARBITRATION COSTS)</strong> arising out of or relating to:
            </p>
            <ul>
              <li><strong>(a)</strong> your User Content, including its processing, the Output Files, and any claim that any of them infringes, misappropriates, or violates any Intellectual Property Right, privacy, publicity, image, honor, confidentiality, or other right of a third party, or any law;</li>
              <li><strong>(b)</strong> your breach of these Terms, including Articles 6, 7, 8, 9, and 10.5;</li>
              <li><strong>(c)</strong> your violation of Applicable Law, including Applicable Data Protection Law, or of any third-party right;</li>
              <li><strong>(d)</strong> your processing of personal, sensitive, regulated, privileged, or confidential data without lawful basis or in breach of law or contract;</li>
              <li><strong>(e)</strong> any Malicious Activity conducted by you or through your account, credentials, keys, or devices;</li>
              <li><strong>(f)</strong> the acts and omissions of your end users, employees, agents, or any person using the Services with your permission or through your credentials;</li>
              <li><strong>(g)</strong> your failure to maintain backups or to take reasonable security precautions;</li>
              <li><strong>(h)</strong> any claim by any person for whom you process content;</li>
              <li><strong>(i)</strong> any inaccurate or fraudulent statement made by you; and</li>
              <li><strong>(j)</strong> any investigation, inquiry, or order by a public authority arising from any of the foregoing.</li>
            </ul>
            <p>
              <strong>22.2 Procedure.</strong> Kanto Empire will use reasonable efforts to notify you of any claim for which it seeks indemnity (provided that a failure to do so relieves you of your obligations only to the extent you are materially prejudiced). Kanto Empire may, at its option and at your expense, assume exclusive control of the defense and settlement of any claim, and you shall cooperate fully. You shall not settle any claim that imposes any liability, obligation, or admission on a Kanto Party without Kanto Empire&apos;s prior written consent.
            </p>
            <p>
              <strong>22.3 Consumers.</strong> If you are a Consumer, this Article applies only to the extent permitted by Applicable Law.
            </p>
            <p>
              <strong>22.4 Survival.</strong> This Article survives termination or expiry of these Terms and of your use of the Services.
            </p>
          </section>

          {/* Article 23 */}
          <section id="article-23" className="mb-12 scroll-mt-20">
            <h2>23. SUSPENSION AND TERMINATION</h2>
            <p>
              <strong>23.1 Term.</strong> These Terms take effect when you first access or use the Services and continue for as long as you use the Services, unless terminated in accordance with this Article.
            </p>
            <p>
              <strong>23.2 Right to Suspend or Terminate.</strong> <strong>KANTO EMPIRE MAY, AT ANY TIME, IN ITS SOLE AND ABSOLUTE DISCRETION, WITH OR WITHOUT CAUSE AND WITH OR WITHOUT NOTICE OR EXPLANATION, SUSPEND, RESTRICT, THROTTLE, BLOCK, OR TERMINATE YOUR ACCESS TO ALL OR ANY PART OF THE SERVICES, INCLUDING BY REVOKING CREDENTIALS OR KEYS, BLOCKING IP ADDRESSES, RANGES, OR DEVICE IDENTIFIERS, DISABLING ACCOUNTS, OR REFUSING FUTURE SERVICE, WITHOUT ANY LIABILITY TO YOU OR ANY THIRD PARTY.</strong>
            </p>
            <p>
              <strong>23.3 Illustrative Grounds.</strong> Without limiting Article 23.2, Kanto Empire may suspend or terminate where: (a) you breach or appear likely to breach these Terms; (b) you engage or are suspected of engaging in Malicious Activity, fraud, or unlawful conduct; (c) your use infringes or is alleged to infringe third-party rights; (d) your use threatens the security, integrity, performance, or availability of the Services; (e) you harass, threaten, or abuse Kanto Empire&apos;s personnel; (f) you bring repeated bad-faith or unfounded claims; (g) you fail to pay any applicable fees; (h) Kanto Empire is required to do so by law, a court, or a public authority; (i) Kanto Empire ceases or restricts the Services in your region or generally; (j) Kanto Empire suspects that your access is unauthorized; or (k) your account has been inactive for an extended period.
            </p>
            <p>
              <strong>23.4 No Obligation to Give Reasons.</strong> Kanto Empire has no obligation to provide reasons, to give any warning, opportunity to cure, or to reinstate access, or to preserve or return any content.
            </p>
            <p>
              <strong>23.5 Termination by You.</strong> You may terminate these Terms at any time by ceasing all use of the Services and, if you have an account or paid subscription, by closing it as provided in the Services. Termination by you does not entitle you to any refund except as required by mandatory law or expressly stated at the point of purchase.
            </p>
            <p>
              <strong>23.6 Effects of Termination.</strong> Upon suspension or termination for any reason: (a) the License and your right to use the Services immediately cease; (b) you shall stop using the Services and delete or cease using any credentials, keys, and Kanto Confidential Information; (c) all amounts accrued or owed become immediately payable; (d) Kanto Empire has no obligation to return, export, or preserve any content, because it retains none; and (e) <strong>you acknowledge that Kanto Empire has no liability for any loss arising from suspension or termination, including any loss of access to or use of the Services.</strong>
            </p>
            <p>
              <strong>23.7 Survival.</strong> Articles 1, 4.5, 4.8, 8, 9, 10, 11, 12, 13, 16, 20, 21, 22, 23.6, 23.7, 25, 26, 28, 30, 31, and 32, and any other provision that by its nature is intended to survive, survive termination or expiry of these Terms.
            </p>
          </section>

          {/* Article 24 */}
          <section id="article-24" className="mb-12 scroll-mt-20">
            <h2>24. FORCE MAJEURE</h2>
            <p>
              <strong>24.1 Definition.</strong> A &quot;<strong>Force Majeure Event</strong>&quot; means any event, circumstance, act, omission, or accident beyond the reasonable control of Kanto Empire that prevents, hinders, or delays the performance of any obligation or the provision of the Services, whether or not foreseeable, including:
            </p>
            <ul>
              <li><strong>(a)</strong> acts of God, fire, explosion, flood, storm, earthquake, or other natural disaster, or extreme weather;</li>
              <li><strong>(b)</strong> epidemic, pandemic, quarantine, or public-health emergency;</li>
              <li><strong>(c)</strong> war (declared or not), invasion, armed conflict, hostilities, terrorism, sabotage, civil commotion, riot, or insurrection;</li>
              <li><strong>(d)</strong> strike, lockout, labor dispute, or industrial action (excluding those involving only Kanto Empire&apos;s own personnel);</li>
              <li><strong>(e)</strong> failure, interruption, degradation, or unavailability of power, internet, telecommunications, hosting, cloud, network, DNS, content-delivery, or other utility or infrastructure services, or the acts or omissions of third-party providers;</li>
              <li><strong>(f)</strong> cyber-attacks, denial-of-service attacks, malware, or other malicious acts of third parties, notwithstanding Kanto Empire&apos;s implementation of reasonable security measures;</li>
              <li><strong>(g)</strong> any law, regulation, decree, order, sanction, embargo, export or import restriction, or act of any government, court, or public authority; and</li>
              <li><strong>(h)</strong> any other event or circumstance beyond Kanto Empire&apos;s reasonable control.</li>
            </ul>
            <p>
              <strong>24.2 Effect.</strong> Kanto Empire shall not be in breach of these Terms, and shall have no liability to you, for any failure or delay in performance resulting from a Force Majeure Event. Kanto Empire&apos;s obligations are suspended for the duration of the Force Majeure Event and any reasonable period needed to resume performance.
            </p>
            <p>
              <strong>24.3 Mitigation.</strong> Kanto Empire will use commercially reasonable efforts to mitigate the effects of a Force Majeure Event and to resume performance as soon as practicable, without any obligation to settle any labor dispute or incur disproportionate cost.
            </p>
            <p>
              <strong>24.4 Prolonged Events.</strong> If a Force Majeure Event continues for more than ninety (90) consecutive days, Kanto Empire may terminate these Terms or discontinue the affected Services by notice on the Site, without liability.
            </p>
          </section>

          {/* Article 25 */}
          <section id="article-25" className="mb-12 scroll-mt-20">
            <h2>25. LEGAL PROCESS AND REGULATORY REQUESTS</h2>
            <p>
              <strong>25.1 No Content Held.</strong> You acknowledge that, by reason of the architecture described in Article 4, Kanto Empire does not hold User Content or Output Files and is therefore unable to produce, disclose, preserve, or provide access to them in response to any request, subpoena, warrant, court order, or regulatory inquiry.
            </p>
            <p>
              <strong>25.2 Operational Metadata.</strong> Kanto Empire may receive requests from courts, law-enforcement bodies, or regulators concerning Operational Metadata or other information it holds. Kanto Empire may disclose such information where it believes in good faith that disclosure is required by Applicable Law or valid legal process, or is reasonably necessary to protect the rights, property, security, or safety of Kanto Empire, its Users, or the public, or to investigate or prevent Malicious Activity, fraud, or unlawful conduct.
            </p>
            <p>
              <strong>25.3 Notice and Challenge.</strong> Kanto Empire may, but is not obliged to, notify you of a request concerning you, and is not obliged to contest or seek to narrow any request. Kanto Empire shall have no liability for any disclosure made in good faith under this Article.
            </p>
            <p>
              <strong>25.4 Mandatory Reporting.</strong> Kanto Empire may report to competent authorities any matter that it is required, or in good faith believes it appropriate, to report under Applicable Law.
            </p>
            <p>
              <strong>25.5 Your Legal Obligations.</strong> You are solely responsible for any legal-hold, preservation, disclosure, evidentiary, or record-keeping obligations that apply to your documents. Use of the Services does not preserve any document, and you shall not use the Services to evade any legal obligation.
            </p>
          </section>

          {/* Article 26 */}
          <section id="article-26" className="mb-12 scroll-mt-20">
            <h2>26. EXPORT CONTROLS, SANCTIONS AND REGIONAL AVAILABILITY</h2>
            <p>
              <strong>26.1 Compliance.</strong> You shall comply with all export-control, import, economic-sanctions, and trade laws applicable to your use of the Services and your User Content.
            </p>
            <p>
              <strong>26.2 Representations.</strong> You represent and warrant that: (a) you are not located in, organized under the laws of, or ordinarily resident in any country or territory that is the target of comprehensive sanctions or embargoes; (b) you are not identified on any sanctions, denied-party, or restricted-party list maintained by any competent authority; and (c) you will not use the Services for any purpose prohibited by such laws.
            </p>
            <p>
              <strong>26.3 Regional Restrictions.</strong> Kanto Empire may restrict, block, or discontinue the Services, in whole or in part, in any country or region, at any time, for legal, regulatory, security, commercial, or other reasons, without liability.
            </p>
            <p>
              <strong>26.4 Your Responsibility.</strong> You are solely responsible for ensuring that your use of the Services, and the transmission of your User Content to Kanto Empire&apos;s processing systems, is lawful in your jurisdiction and in each jurisdiction through which your User Content is transmitted.
            </p>
          </section>

          {/* Article 27 */}
          <section id="article-27" className="mb-12 scroll-mt-20">
            <h2>27. MODIFICATION OF THESE TERMS</h2>
            <p>
              <strong>27.1 Right to Amend.</strong> Kanto Empire may amend, update, or replace these Terms at any time, in its sole discretion, including to reflect changes in law, technology, or the Services.
            </p>
            <p>
              <strong>27.2 Notice.</strong> Amended Terms will be published on the Site with an updated Effective Date and version number. For material changes, Kanto Empire will make reasonable efforts to provide additional notice, such as a notice on the Site or in the Services, or by email to an address you have provided to Kanto Empire. Kanto Empire has no obligation to give individual notice.
            </p>
            <p>
              <strong>27.3 Acceptance.</strong> Your access to or use of the Services after the effective date of the amended Terms constitutes your acceptance of them. <strong>It is your responsibility to review these Terms periodically.</strong> If you do not agree to the amended Terms, you must immediately stop using the Services.
            </p>
            <p>
              <strong>27.4 No Retroactivity.</strong> Amendments do not apply to disputes of which Kanto Empire has received written notice before the amendment took effect, and are subject to Article 10.6 with respect to User Content already submitted.
            </p>
            <p>
              <strong>27.5 Consumers.</strong> Where Applicable Law requires more extensive notice or consent for changes affecting Consumers, Kanto Empire will comply with those requirements.
            </p>
          </section>

          {/* Article 28 */}
          <section id="article-28" className="mb-12 scroll-mt-20">
            <h2>28. NOTICES AND COMMUNICATIONS</h2>
            <p>
              <strong>28.1 Notices to Kanto Empire.</strong> Notices to Kanto Empire must be in writing, in English, and sent by email to <strong>kantoempire@gmail.com</strong>, clearly identifying the sender and the subject matter, and are deemed given when received by Kanto Empire.
            </p>
            <p>
              <strong>28.2 Notices to You.</strong> Kanto Empire may give notice to you by: (a) posting on the Site or within the Services; (b) email to an address you have provided; or (c) any other legally accepted means. Notices are deemed received: upon posting; twenty-four (24) hours after an email is sent (absent a delivery-failure message); or as otherwise provided by Applicable Law.
            </p>
            <p>
              <strong>28.3 Your Responsibility.</strong> You are responsible for providing and keeping current any contact information you supply, and for periodically checking the Site for notices.
            </p>
            <p>
              <strong>28.4 Electronic Communications.</strong> You consent to receiving all communications from Kanto Empire electronically, and agree that electronic communications satisfy any legal requirement that communications be in writing.
            </p>
          </section>

          {/* Article 29 */}
          <section id="article-29" className="mb-12 scroll-mt-20">
            <h2>29. ASSIGNMENT AND CHANGE OF CONTROL</h2>
            <p>
              <strong>29.1 By Kanto Empire.</strong> Kanto Empire may assign, transfer, novate, delegate, or subcontract these Terms, or any of its rights or obligations, in whole or in part, to any Affiliate or to any successor in connection with a merger, acquisition, reorganization, change of control, or sale of all or part of its assets or business, without your consent and without notice.
            </p>
            <p>
              <strong>29.2 By You.</strong> You may not assign, transfer, delegate, or sublicense these Terms or any of your rights or obligations under them, in whole or in part, whether voluntarily, by operation of law, or otherwise, without Kanto Empire&apos;s prior written consent. Any purported assignment in breach of this Article is void and entitles Kanto Empire to terminate your access immediately under Article 23, without liability.
            </p>
            <p>
              <strong>29.3 Successors.</strong> These Terms bind and benefit the parties and their respective permitted successors and assigns.
            </p>
          </section>

          {/* Article 30 */}
          <section id="article-30" className="mb-12 scroll-mt-20">
            <h2>30. GOVERNING LAW</h2>
            <p>
              <strong>30.1 Governing Law.</strong> These Terms, the Services, and any dispute or claim (whether contractual, non-contractual, statutory, or otherwise) arising out of or in connection with them shall be governed by and construed in accordance with the general principles of international commercial law, including, to the extent appropriate, the UNIDROIT Principles of International Commercial Contracts, and, to the extent those principles do not resolve an issue, by the substantive laws of <strong>[Governing Jurisdiction]</strong>, without giving effect to any conflict-of-laws rule that would result in the application of the law of another jurisdiction.
            </p>
            <p>
              <strong>30.2 Excluded Instruments.</strong> The United Nations Convention on Contracts for the International Sale of Goods, and the Uniform Computer Information Transactions Act (and any similar law enacted in any jurisdiction), shall not apply to these Terms.
            </p>
            <p>
              <strong>30.3 Mandatory Law.</strong> Nothing in this Article deprives a Consumer of the protection of any mandatory provision of the law of the country of the Consumer&apos;s habitual residence that cannot be derogated from by agreement.
            </p>
          </section>

          {/* Article 31 */}
          <section id="article-31" className="mb-12 scroll-mt-20">
            <h2>31. DISPUTE RESOLUTION</h2>
            <p>
              <strong>31.1 Informal Resolution.</strong> Before commencing any arbitration or proceeding, the party asserting a claim (the &quot;<strong>Claimant</strong>&quot;) shall send the other party a written notice describing the dispute, the factual basis, and the relief sought (a &quot;<strong>Notice of Dispute</strong>&quot;) and the parties shall attempt in good faith to resolve the dispute amicably for thirty (30) days from receipt. Notices to Kanto Empire shall be sent in accordance with Article 28.1.
            </p>
            <p>
              <strong>31.2 Escalation.</strong> If the dispute is not resolved within that period and you are a Business User, it shall be escalated to senior management of each party, who shall attempt in good faith to resolve it for a further fifteen (15) days.
            </p>
            <p>
              <strong>31.3 Binding Arbitration.</strong> Subject to Articles 31.5 and 31.6, any dispute, controversy, or claim arising out of or relating to these Terms or the Services, including their existence, validity, interpretation, performance, breach, or termination, that is not resolved under Articles 31.1 and 31.2 shall be finally resolved by binding arbitration under the Rules of Arbitration of the International Chamber of Commerce (the &quot;<strong>ICC Rules</strong>&quot;), which are incorporated by reference, as follows:
            </p>
            <ul>
              <li><strong>(a)</strong> the tribunal shall consist of one (1) arbitrator appointed in accordance with the ICC Rules;</li>
              <li><strong>(b)</strong> the seat (legal place) of arbitration shall be <strong>[Seat of Arbitration]</strong>;</li>
              <li><strong>(c)</strong> the language of the arbitration shall be English;</li>
              <li><strong>(d)</strong> hearings, where required, may be conducted by videoconference, and the tribunal may decide claims on documents alone where appropriate;</li>
              <li><strong>(e)</strong> the tribunal shall apply the governing law specified in Article 30;</li>
              <li><strong>(f)</strong> the arbitration and all related information, submissions, and awards shall be confidential, except as required to enforce an award or by Applicable Law; and</li>
              <li><strong>(g)</strong> the award shall be final and binding, and judgment on it may be entered in any court having jurisdiction.</li>
            </ul>
            <p>
              <strong>31.4 Individual Claims Only; Class-Action and Jury Waiver.</strong> <strong>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW: (A) ALL CLAIMS MUST BE BROUGHT ONLY IN YOUR INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF, CLAIMANT, OR CLASS MEMBER IN ANY PURPORTED CLASS, COLLECTIVE, CONSOLIDATED, REPRESENTATIVE, OR PRIVATE-ATTORNEY-GENERAL ACTION OR PROCEEDING; (B) THE ARBITRATOR HAS NO AUTHORITY TO CONSOLIDATE CLAIMS OF MORE THAN ONE PERSON OR TO PRESIDE OVER ANY FORM OF REPRESENTATIVE OR CLASS PROCEEDING; AND (C) YOU AND KANTO EMPIRE EACH WAIVE ANY RIGHT TO A TRIAL BY JURY.</strong> If Article 31.4(A) or (B) is held unenforceable as to any claim, then that claim (and only that claim) shall be severed from arbitration and heard in the courts identified in Article 31.7, and the remainder of this Article shall continue to apply.
            </p>
            <p>
              <strong>31.5 Exceptions.</strong> Notwithstanding Article 31.3, either party may: (a) seek interim, injunctive, or other equitable relief in any court of competent jurisdiction to prevent actual or threatened infringement or misappropriation of Intellectual Property Rights, breach of confidentiality, or Malicious Activity; and (b) bring an individual claim in a small-claims court of competent jurisdiction if it qualifies for that court&apos;s jurisdiction.
            </p>
            <p>
              <strong>31.6 Consumers.</strong> If you are a Consumer, nothing in this Article deprives you of any mandatory right under Applicable Law to bring proceedings before the courts of your country of habitual residence, to use any alternative or out-of-court dispute-resolution mechanism required to be made available to you, or to lodge a complaint with a competent supervisory authority, and Articles 31.3 and 31.4 apply to you only to the extent permitted by that law.
            </p>
            <p>
              <strong>31.7 Courts.</strong> For any dispute that is not subject to arbitration, or where a court has jurisdiction in aid of arbitration or to enforce an award, the parties submit to the exclusive jurisdiction of the competent courts of <strong>[Governing Jurisdiction]</strong> (subject to Articles 31.5 and 31.6), and waive any objection based on inconvenient forum or lack of personal jurisdiction.
            </p>
            <p>
              <strong>31.8 Costs.</strong> To the fullest extent permitted by Applicable Law, the tribunal or court may award the prevailing party its reasonable costs and legal fees, and shall award Kanto Empire its reasonable costs and legal fees if you commence a proceeding in breach of this Article.
            </p>
            <p>
              <strong>31.9 Time Limits.</strong> Article 21.7 applies to all claims and proceedings.
            </p>
          </section>

          {/* Article 32 */}
          <section id="article-32" className="mb-12 scroll-mt-20">
            <h2>32. GENERAL PROVISIONS</h2>
            <p>
              <strong>32.1 Severability.</strong> If any provision (or part of a provision) of these Terms is held invalid, illegal, or unenforceable by a court, tribunal, or authority of competent jurisdiction, that provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving, as closely as possible, the parties&apos; original intention and economic effect, or, if modification is not possible, severed, and the remaining provisions shall continue in full force and effect. The invalidity of any provision in a particular jurisdiction shall not affect its validity in any other jurisdiction.
            </p>
            <p>
              <strong>32.2 No Waiver.</strong> No failure or delay by Kanto Empire in exercising any right, power, or remedy under these Terms operates as a waiver of it, nor does any single or partial exercise preclude any further exercise of that or any other right. A waiver is effective only if in writing and signed or sent by Kanto Empire, and applies only to the specific instance for which it is given.
            </p>
            <p>
              <strong>32.3 Remedies Cumulative.</strong> The rights and remedies of Kanto Empire under these Terms are cumulative and in addition to any rights and remedies available at law or in equity.
            </p>
            <p>
              <strong>32.4 Relationship of the Parties.</strong> Nothing in these Terms creates any partnership, joint venture, agency, franchise, fiduciary, employment, or other relationship between you and Kanto Empire. Neither party has authority to bind the other.
            </p>
            <p>
              <strong>32.5 Third-Party Rights.</strong> Except for the Kanto Parties as provided in Article 21.12, no person other than you and Kanto Empire has any right to enforce any term of these Terms.
            </p>
            <p>
              <strong>32.6 Language.</strong> These Terms are drafted in English. Any translation is provided for convenience only, and in the event of any inconsistency or ambiguity, the English version prevails to the fullest extent permitted by Applicable Law.
            </p>
            <p>
              <strong>32.7 Headings; Construction.</strong> Headings are for reference only and do not affect interpretation. These Terms have been prepared with the opportunity for you to seek independent legal advice, and shall not be construed against Kanto Empire as drafter.
            </p>
            <p>
              <strong>32.8 Compliance with Laws.</strong> Each party shall comply with the Applicable Law that governs its performance under these Terms.
            </p>
            <p>
              <strong>32.9 Force and Effect of Schedules.</strong> Schedules A and B form an integral part of these Terms.
            </p>
            <p>
              <strong>32.10 Interpretation of Conflicts.</strong> In the event of an inconsistency between the main body of these Terms and a Schedule, the main body prevails, except as provided in Article 4.7 with respect to the classification of tools.
            </p>
            <p>
              <strong>32.11 Independent Advice.</strong> You acknowledge that you have had the opportunity to obtain independent legal advice before accepting these Terms, and that you understand them.
            </p>
            <p>
              <strong>32.12 Non-Exclusivity.</strong> The Services are provided on a non-exclusive basis, and nothing in these Terms restricts Kanto Empire from providing the same or similar services to any other person.
            </p>
          </section>

          {/* Article 33 */}
          <section id="article-33" className="mb-12 scroll-mt-20">
            <h2>33. CONTACT INFORMATION</h2>
            <p>
              For any question regarding these Terms, notices, complaints, intellectual-property matters, security disclosures, data-protection requests concerning Operational Metadata, or requests for a data processing agreement (Business Users), contact:
            </p>
            <div className="not-prose my-6 p-6 rounded-2xl bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Mail size={20} />
              </div>
              <div className="text-sm">
                <p className="font-bold text-gray-900 dark:text-white mb-1">Kanto Empire</p>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Operator of <strong>Kanto PDF</strong></p>
                <p className="text-gray-900 dark:text-gray-200">
                  Email:{' '}
                  <a href="mailto:kantoempire@gmail.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    kantoempire@gmail.com
                  </a>
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              <strong>Reminder:</strong> please do not attach any documents or personal files to any communication with Kanto Empire (see Article 4.6). Kanto Empire does not guarantee any response time.
            </p>
          </section>

          <hr className="my-10 border-gray-200 dark:border-gray-800" />

          {/* Schedule A */}
          <section id="schedule-a" className="mb-14 scroll-mt-20">
            <div className="not-prose mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                Schedule A
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-950 dark:text-white mt-3">
                TOOL CLASSIFICATION AND PROCESSING MODEL
              </h2>
            </div>

            <p>
              <strong>A.1 Purpose.</strong> This Schedule classifies the tools of Kanto PDF by processing model and summarizes the data-handling characteristics of each model. It is subject to Article 4 and Article 4.7 (Tool Classification).
            </p>

            <h3 className="text-lg font-bold text-gray-950 dark:text-white mt-8 mb-4">
              A.2 Classification of Tools
            </h3>
            <div className="overflow-x-auto not-prose my-6 rounded-2xl border border-gray-200 dark:border-[#2a2a2a] shadow-xs">
              <table className="w-full border-collapse text-sm text-left">
                <thead>
                  <tr className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#2a2a2a]">
                    <th className="p-4 font-bold border-r border-gray-200 dark:border-[#2a2a2a]">Tool / Category</th>
                    <th className="p-4 font-bold border-r border-gray-200 dark:border-[#2a2a2a]">Processing Model</th>
                    <th className="p-4 font-bold">Where the Operation Executes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#262626] bg-white dark:bg-[#121212] text-gray-800 dark:text-gray-200">
                  <tr>
                    <td className="p-4 font-semibold border-r border-gray-200 dark:border-[#2a2a2a]">Merge</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 border-r border-gray-200 dark:border-[#2a2a2a]">Client-Side</td>
                    <td className="p-4">Entirely within your browser, on your device</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold border-r border-gray-200 dark:border-[#2a2a2a]">Split</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 border-r border-gray-200 dark:border-[#2a2a2a]">Client-Side</td>
                    <td className="p-4">Entirely within your browser, on your device</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold border-r border-gray-200 dark:border-[#2a2a2a]">Crop</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 border-r border-gray-200 dark:border-[#2a2a2a]">Client-Side</td>
                    <td className="p-4">Entirely within your browser, on your device</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold border-r border-gray-200 dark:border-[#2a2a2a]">Organize</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 border-r border-gray-200 dark:border-[#2a2a2a]">Client-Side</td>
                    <td className="p-4">Entirely within your browser, on your device</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold border-r border-gray-200 dark:border-[#2a2a2a]">PDF Repair</td>
                    <td className="p-4 font-bold text-cyan-600 dark:text-cyan-400 border-r border-gray-200 dark:border-[#2a2a2a]">Server-Side (Zero Retention)</td>
                    <td className="p-4">Kanto Empire&apos;s backend, in volatile memory only</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold border-r border-gray-200 dark:border-[#2a2a2a]">Conversion tools (format conversion to or from PDF)</td>
                    <td className="p-4 font-bold text-cyan-600 dark:text-cyan-400 border-r border-gray-200 dark:border-[#2a2a2a]">Server-Side (Zero Retention)</td>
                    <td className="p-4">Kanto Empire&apos;s backend, in volatile memory only</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold border-r border-gray-200 dark:border-[#2a2a2a]">Any other tool</td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-[#2a2a2a]">As indicated in the Site interface</td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">As indicated in the Site interface</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-bold text-gray-950 dark:text-white mt-10 mb-4">
              A.3 Comparison of Processing Models
            </h3>
            <div className="overflow-x-auto not-prose my-6 rounded-2xl border border-gray-200 dark:border-[#2a2a2a] shadow-xs">
              <table className="w-full border-collapse text-sm text-left">
                <thead>
                  <tr className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#2a2a2a]">
                    <th className="p-4 font-bold border-r border-gray-200 dark:border-[#2a2a2a] w-1/3">Attribute</th>
                    <th className="p-4 font-bold border-r border-gray-200 dark:border-[#2a2a2a]">Client-Side Processing</th>
                    <th className="p-4 font-bold">Server-Side Processing (Zero Retention)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#262626] bg-white dark:bg-[#121212] text-gray-800 dark:text-gray-200">
                  <tr>
                    <td className="p-4 font-semibold bg-gray-50/50 dark:bg-[#161616] border-r border-gray-200 dark:border-[#2a2a2a]">Location of processing</td>
                    <td className="p-4 border-r border-gray-200 dark:border-[#2a2a2a]">Your browser&apos;s memory, on your device</td>
                    <td className="p-4">Kanto Empire&apos;s backend volatile memory (RAM)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold bg-gray-50/50 dark:bg-[#161616] border-r border-gray-200 dark:border-[#2a2a2a]">Is User Content transmitted to Kanto Empire?</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 border-r border-gray-200 dark:border-[#2a2a2a]">No</td>
                    <td className="p-4">Yes, over an encrypted channel, solely to perform the operation you request</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold bg-gray-50/50 dark:bg-[#161616] border-r border-gray-200 dark:border-[#2a2a2a]">Does Kanto Empire see or access User Content?</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 border-r border-gray-200 dark:border-[#2a2a2a]">No</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">No (no review, monitoring, or analysis of content)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold bg-gray-50/50 dark:bg-[#161616] border-r border-gray-200 dark:border-[#2a2a2a]">Persistent storage on Kanto Empire systems</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white border-r border-gray-200 dark:border-[#2a2a2a]">None</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">None</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold bg-gray-50/50 dark:bg-[#161616] border-r border-gray-200 dark:border-[#2a2a2a]">Retention period on Kanto Empire systems</td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-[#2a2a2a]">Not applicable: content is never received</td>
                    <td className="p-4 font-bold text-blue-600 dark:text-blue-400">0 seconds, destroyed at the Zero-Retention Event</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold bg-gray-50/50 dark:bg-[#161616] border-r border-gray-200 dark:border-[#2a2a2a]">Backups, snapshots, or replicas of content</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white border-r border-gray-200 dark:border-[#2a2a2a]">None</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">None</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold bg-gray-50/50 dark:bg-[#161616] border-r border-gray-200 dark:border-[#2a2a2a]">Logs of file content</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white border-r border-gray-200 dark:border-[#2a2a2a]">None</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">None</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold bg-gray-50/50 dark:bg-[#161616] border-r border-gray-200 dark:border-[#2a2a2a]">Recoverability of User Content by Kanto Empire</td>
                    <td className="p-4 font-bold text-amber-600 dark:text-amber-400 border-r border-gray-200 dark:border-[#2a2a2a]">Impossible</td>
                    <td className="p-4 font-bold text-amber-600 dark:text-amber-400">Impossible</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold bg-gray-50/50 dark:bg-[#161616] border-r border-gray-200 dark:border-[#2a2a2a]">Use for AI or machine-learning training</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 border-r border-gray-200 dark:border-[#2a2a2a]">Never</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">Never</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold bg-gray-50/50 dark:bg-[#161616] border-r border-gray-200 dark:border-[#2a2a2a]">Party bearing the risk of file loss, corruption, or device failure</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white border-r border-gray-200 dark:border-[#2a2a2a]">You</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">You</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-6">
              <strong>A.4 Updates.</strong> Kanto Empire may update this Schedule and the interface indicators at any time in accordance with Article 27. In the event of doubt as to whether a tool is Client-Side or Server-Side, the indication displayed in the interface at the time of use prevails.
            </p>
          </section>

          <hr className="my-10 border-gray-200 dark:border-gray-800" />

          {/* Schedule B */}
          <section id="schedule-b" className="mb-12 scroll-mt-20">
            <div className="not-prose mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900">
                Schedule B
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-950 dark:text-white mt-3">
                EXPRESS ACKNOWLEDGMENTS OF RISK ALLOCATION
              </h2>
            </div>

            <p className="text-base text-gray-700 dark:text-gray-300 mb-6 font-medium">
              By accessing or using Kanto PDF, you expressly acknowledge, understand, and agree that:
            </p>

            <ol className="list-decimal ps-6 space-y-4 text-gray-800 dark:text-gray-200">
              <li>
                <strong>Backups.</strong> You are solely responsible for keeping independent backups of all files before using the Services, and Kanto Empire cannot recover any file (Article 12).
              </li>
              <li>
                <strong>Destroyed Files.</strong> If a file is damaged, corrupted, or destroyed during PDF Repair, conversion, or any other operation, Kanto Empire owes you no restoration, refund, or compensation (Articles 13 and 21.3).
              </li>
              <li>
                <strong>Architecture.</strong> Client-Side Tools operate on your device without any upload to Kanto Empire; Server-Side Tools operate in volatile memory with a zero-second retention policy; and, as a result, Kanto Empire cannot retrieve, reproduce, or diagnose your files (Article 4).
              </li>
              <li>
                <strong>As-Is Service.</strong> The Services are provided strictly &quot;as is&quot; and &quot;as available,&quot; without warranties (Article 20).
              </li>
              <li>
                <strong>No Monitoring; Your Liability for Content.</strong> Kanto Empire does not monitor User Content, and you alone are liable for the legality, ownership, and sensitivity of everything you process, including copyrighted, unlawful, personal, or regulated material (Article 9).
              </li>
              <li>
                <strong>No AI Training.</strong> Kanto PDF does not and will never use your content to train or improve any artificial intelligence or machine-learning model (Article 10).
              </li>
              <li>
                <strong>Prohibited Conduct.</strong> You will not engage in Malicious Activity, reverse engineering, scraping, or unauthorized automated use (Articles 6, 7, 8, and 19).
              </li>
              <li>
                <strong>Limitation of Liability.</strong> The Kanto Parties&apos; liability is excluded and limited as set out in Article 21, and your sole remedy for dissatisfaction is to stop using the Services.
              </li>
              <li>
                <strong>Indemnity.</strong> You will indemnify the Kanto Parties as set out in Article 22.
              </li>
              <li>
                <strong>Suspension and Termination.</strong> Kanto Empire may suspend or terminate your access at any time, with or without notice (Article 23).
              </li>
              <li>
                <strong>Dispute Resolution.</strong> Disputes are subject to informal resolution, then binding individual arbitration, with a waiver of class actions and jury trials (Article 31), subject to mandatory consumer rights.
              </li>
              <li>
                <strong>Legal Capacity.</strong> You have read these Terms, had the opportunity to seek independent legal advice, and have the legal capacity and authority to accept them.
              </li>
            </ol>
          </section>

          {/* Document Footer */}
          <div className="not-prose pt-8 mt-12 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              END OF TERMS OF SERVICE
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              © Kanto Empire. All rights reserved. &quot;Kanto PDF&quot; and &quot;Kanto Empire&quot; are names and marks of Kanto Empire.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
};

export default TermsOfServiceScreen;
