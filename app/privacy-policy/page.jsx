"use client";
import React from "react";
import { useRouter } from "next/navigation";
import FloatingNavbar from "@/components/global/floatingNavbar";
import { useEffect, useState } from "react";

const PrivacyPolicy = () => {
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState(0);

  useEffect(() => {
    const year = new Date().getFullYear();
    setCurrentYear(year);
  }, []);

  const sections = [
    {
      id: "summary",
      title: "Summary of Key Points",
      icon: "/icons/info/primary.svg"
    },
    {
      id: "collection",
      title: "What Information Do We Collect?",
      icon: "/icons/info/primary.svg"
    },
    {
      id: "processing",
      title: "How Do We Process Your Personal Data?",
      icon: "/icons/info/primary.svg"
    },
    {
      id: "legal-basis",
      title: "Legal Basis for Processing (India)",
      icon: "/icons/info/primary.svg"
    },
    {
      id: "sharing",
      title: "Sharing of Personal Data",
      icon: "/icons/info/primary.svg"
    },
    {
      id: "cookies",
      title: "Cookies and Tracking Technologies",
      icon: "/icons/info/primary.svg"
    },
    {
      id: "social-logins",
      title: "Social Logins",
      icon: "/icons/info/primary.svg"
    },
    {
      id: "storage",
      title: "Data Storage and Transfers",
      icon: "/icons/info/primary.svg"
    },
    {
      id: "retention",
      title: "Data Retention",
      icon: "/icons/info/primary.svg"
    },
    {
      id: "rights",
      title: "Your Rights Under Indian Law",
      icon: "/icons/info/primary.svg"
    },
    {
      id: "updates",
      title: "Updates to This Notice",
      icon: "/icons/info/primary.svg"
    },
    {
      id: "contact",
      title: "Contact & Grievance Redressal",
      icon: "/icons/contact/primary.svg"
    }
  ];

  return (
    <>
      <FloatingNavbar />
      <div className="max-h-screen overflow-auto pb-floatingNavHeight">
        {/* Header */}
        <div className="py-4 w-full">
          <div className="flex items-center justify-center p-4">
            <img
              src="/logo.svg"
              alt="Campus Web"
              className="h-8 w-auto"
            />
            <div className="w-10" />
          </div>
        </div>

        <div className="px-4">
          {/* Privacy Policy Header */}
          <div className="theme_box_bg p-6 mb-4 text-center">
            <h1 className="text-2xl font-bold text-theme_text_primary">
              PRIVACY NOTICE
            </h1>
          </div>

          {/* Introduction */}
          <div className="theme_box_bg p-6 mb-4">
            <p className="text-theme_text_normal text-sm leading-relaxed">
              This Privacy Notice for <span className="text-theme_text_primary font-medium">Campus App</span> ("we", "us", or "our") explains how we collect, use, store, share, and protect your personal data when you use our services ("Services"), including when you:
            </p>
            <ul className="mt-4 space-y-2 text-theme_text_normal text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-theme_text_primary mt-2 flex-shrink-0"></div>
                <span>Download and use our mobile application (Campus App)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-theme_text_primary mt-2 flex-shrink-0"></div>
                <span>Use Campus App to access campus resources, events, and community features</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-theme_text_primary mt-2 flex-shrink-0"></div>
                <span>Interact with us through support, marketing, or events</span>
              </li>
            </ul>
            <div className="mt-4 p-4 bg-theme_primary/10 rounded-lg border-l-4 border-theme_primary">
              <p className="text-theme_text_normal text-sm">
                By using our Services, you agree to the processing of your personal data as described in this Privacy Notice. If you do not agree, please do not use our Services.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="theme_box_bg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-theme_primary/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#0094FF">
                  <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-theme_text_primary">Table of Contents</h2>
            </div>
            <div className="grid gap-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-3 p-3 rounded-lg bg-theme_primary/5 hover:bg-theme_primary/10 transition-colors text-left"
                >
                  <span className="text-theme_text_primary font-medium text-sm">
                    {index + 1}.
                  </span>
                  <span className="text-theme_text_normal text-sm">{section.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary Section */}
          <div id="summary" className="theme_box_bg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-theme_primary/20 flex items-center justify-center">
                <span className="text-theme_text_primary text-xs font-bold">1</span>
              </div>
              <h2 className="text-lg font-semibold text-theme_text_primary">Summary of Key Points</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-theme_text_primary font-medium mb-2">What data do we collect?</h3>
                <p className="text-theme_text_normal text-sm">Personal data you provide directly and certain data collected automatically when you use the app.</p>
              </div>
              <div>
                <h3 className="text-theme_text_primary font-medium mb-2">Do we collect sensitive personal data?</h3>
                <p className="text-theme_text_normal text-sm">No. We do not knowingly collect or process sensitive personal data as defined under Indian law.</p>
              </div>
              <div>
                <h3 className="text-theme_text_primary font-medium mb-2">Why do we process your data?</h3>
                <p className="text-theme_text_normal text-sm">To provide and improve our Services, manage user accounts, ensure security, and comply with legal obligations.</p>
              </div>
              <div>
                <h3 className="text-theme_text_primary font-medium mb-2">Do we share your data?</h3>
                <p className="text-theme_text_normal text-sm">Only in limited situations such as with service providers, affiliates, or when required by law.</p>
              </div>
              <div>
                <h3 className="text-theme_text_primary font-medium mb-2">What are your rights?</h3>
                <p className="text-theme_text_normal text-sm">You have rights under the Digital Personal Data Protection Act, 2023, including access, correction, deletion, and grievance redressal.</p>
              </div>
            </div>
          </div>

          {/* What Information Do We Collect */}
          <div id="collection" className="theme_box_bg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-theme_primary/20 flex items-center justify-center">
                <span className="text-theme_text_primary text-xs font-bold">2</span>
              </div>
              <h2 className="text-lg font-semibold text-theme_text_primary">What Information Do We Collect?</h2>
            </div>
            
            <div className="mb-6">
              <h3 className="text-theme_text_primary font-medium mb-3">Personal Data You Provide</h3>
              <p className="text-theme_text_normal text-sm mb-3">We collect personal data that you voluntarily provide, including when you:</p>
              <ul className="space-y-2 text-theme_text_normal text-sm mb-4">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-theme_text_primary mt-2 flex-shrink-0"></div>
                  <span>Register an account</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-theme_text_primary mt-2 flex-shrink-0"></div>
                  <span>Participate in campus activities or events</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-theme_text_primary mt-2 flex-shrink-0"></div>
                  <span>Contact us for support</span>
                </li>
              </ul>
              
              <div className="bg-theme_secondary/10 p-4 rounded-lg">
                <h4 className="text-theme_text_primary font-medium mb-2">This may include:</h4>
                <div className="grid grid-cols-1 gap-2 text-theme_text_normal text-sm">
                  <span>• Name</span>
                  <span>• Email address</span>
                  <span>• Phone number</span>
                  <span>• College or institutional details</span>
                  <span>• Profile information you choose to share</span>
                </div>
              </div>
              
              <p className="text-theme_text_normal text-sm mt-3 italic">All information provided must be accurate and up to date.</p>
            </div>

            <div>
              <h3 className="text-theme_text_primary font-medium mb-3">Information Automatically Collected</h3>
              <p className="text-theme_text_normal text-sm mb-3">When you use our Services, we may automatically collect:</p>
              <div className="bg-theme_primary/10 p-4 rounded-lg">
                <div className="grid grid-cols-1 gap-2 text-theme_text_normal text-sm">
                  <span>• IP address</span>
                  <span>• Device type, operating system, and app version</span>
                  <span>• Usage data (pages viewed, features used, timestamps)</span>
                  <span>• Approximate location (city/state level)</span>
                </div>
              </div>
              <p className="text-theme_text_normal text-sm mt-3">This data is used for security, analytics, and service improvement.</p>
            </div>
          </div>

          {/* How Do We Process */}
          <div id="processing" className="theme_box_bg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-theme_primary/20 flex items-center justify-center">
                <span className="text-theme_text_primary text-xs font-bold">3</span>
              </div>
              <h2 className="text-lg font-semibold text-theme_text_primary">How Do We Process Your Personal Data?</h2>
            </div>
            <p className="text-theme_text_normal text-sm mb-4">We process personal data only for lawful purposes, including:</p>
            <div className="space-y-3">
              {[
                "Creating and managing user accounts",
                "Providing campus-related features and services",
                "Communicating important updates and notifications",
                "Ensuring app security and preventing misuse",
                "Complying with applicable Indian laws and regulations"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-theme_primary/5 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-theme_primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-theme_text_primary text-xs font-medium">{index + 1}</span>
                  </div>
                  <span className="text-theme_text_normal text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Basis */}
          <div id="legal-basis" className="theme_box_bg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-theme_primary/20 flex items-center justify-center">
                <span className="text-theme_text_primary text-xs font-bold">4</span>
              </div>
              <h2 className="text-lg font-semibold text-theme_text_primary">Legal Basis for Processing (India)</h2>
            </div>
            <p className="text-theme_text_normal text-sm mb-4">We process personal data in accordance with the Digital Personal Data Protection Act, 2023, based on:</p>
            <div className="grid gap-3">
              {[
                { title: "Your consent", desc: "When you explicitly agree to our processing" },
                { title: "Performance of a lawful purpose", desc: "To provide the services you requested" },
                { title: "Compliance with legal obligations", desc: "When required by Indian law" },
                { title: "Protection of vital interests", desc: "To protect health, safety, or security" }
              ].map((item, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-theme_primary/10 to-theme_secondary/10 rounded-lg border-l-4 border-theme_primary">
                  <h4 className="text-theme_text_primary font-medium mb-1">{item.title}</h4>
                  <p className="text-theme_text_normal text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-theme_secondary/10 rounded-lg">
              <p className="text-theme_text_normal text-sm">
                <span className="text-theme_text_primary font-medium">Note:</span> You may withdraw consent at any time.
              </p>
            </div>
          </div>

          {/* Sharing Data */}
          <div id="sharing" className="theme_box_bg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-theme_primary/20 flex items-center justify-center">
                <span className="text-theme_text_primary text-xs font-bold">5</span>
              </div>
              <h2 className="text-lg font-semibold text-theme_text_primary">Sharing of Personal Data</h2>
            </div>
            <p className="text-theme_text_normal text-sm mb-4">We may share personal data only in the following situations:</p>
            <div className="space-y-4">
              <div className="p-4 bg-theme_primary/10 rounded-lg">
                <h4 className="text-theme_text_primary font-medium mb-2">Service Providers</h4>
                <p className="text-theme_text_normal text-sm">Hosting, analytics, notifications (under confidentiality obligations)</p>
              </div>
              <div className="p-4 bg-theme_secondary/10 rounded-lg">
                <h4 className="text-theme_text_primary font-medium mb-2">Affiliates or Business Transfers</h4>
                <p className="text-theme_text_normal text-sm">Mergers or restructuring</p>
              </div>
              <div className="p-4 bg-theme_primary/10 rounded-lg">
                <h4 className="text-theme_text_primary font-medium mb-2">Legal Requirements</h4>
                <p className="text-theme_text_normal text-sm">Court orders or government authorities</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-theme_red/10 rounded-lg border-l-4 border-theme_red">
              <p className="text-theme_text_normal text-sm font-medium">
                We do not sell personal data.
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div id="cookies" className="theme_box_bg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-theme_primary/20 flex items-center justify-center">
                <span className="text-theme_text_primary text-xs font-bold">6</span>
              </div>
              <h2 className="text-lg font-semibold text-theme_text_primary">Cookies and Tracking Technologies</h2>
            </div>
            <p className="text-theme_text_normal text-sm mb-4">We may use cookies or similar technologies to:</p>
            <div className="grid gap-3 mb-4">
              {[
                "Maintain app functionality",
                "Improve performance",
                "Analyze usage"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-theme_primary/5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-theme_text_primary"></div>
                  <span className="text-theme_text_normal text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-theme_text_normal text-sm">You can manage cookie preferences through your device or browser settings.</p>
          </div>

          {/* Social Logins */}
          <div id="social-logins" className="theme_box_bg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-theme_primary/20 flex items-center justify-center">
                <span className="text-theme_text_primary text-xs font-bold">7</span>
              </div>
              <h2 className="text-lg font-semibold text-theme_text_primary">Social Logins</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-theme_primary/10 rounded-lg">
                <p className="text-theme_text_normal text-sm">If you log in using third-party services (e.g., Google), we may receive limited profile information such as name and email address.</p>
              </div>
              <div className="p-4 bg-theme_secondary/10 rounded-lg">
                <p className="text-theme_text_normal text-sm">We use this information only for authentication and account creation.</p>
              </div>
            </div>
          </div>

          {/* Data Storage */}
          <div id="storage" className="theme_box_bg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-theme_primary/20 flex items-center justify-center">
                <span className="text-theme_text_primary text-xs font-bold">8</span>
              </div>
              <h2 className="text-lg font-semibold text-theme_text_primary">Data Storage and Transfers</h2>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-theme_primary/10 rounded-lg">
                <p className="text-theme_text_normal text-sm">Your personal data may be stored on servers located in India or outside India.</p>
              </div>
              <div className="p-4 bg-theme_secondary/10 rounded-lg">
                <p className="text-theme_text_normal text-sm">Where data is transferred outside India, reasonable safeguards are applied as required by law.</p>
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div id="retention" className="theme_box_bg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-theme_primary/20 flex items-center justify-center">
                <span className="text-theme_text_primary text-xs font-bold">9</span>
              </div>
              <h2 className="text-lg font-semibold text-theme_text_primary">Data Retention</h2>
            </div>
            <p className="text-theme_text_normal text-sm mb-4">We retain personal data only for as long as necessary to:</p>
            <div className="space-y-2 mb-4">
              {[
                "Fulfil the purposes stated in this notice",
                "Comply with legal or regulatory requirements"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-theme_primary/5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-theme_text_primary mt-2 flex-shrink-0"></div>
                  <span className="text-theme_text_normal text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-theme_text_normal text-sm">Data is securely deleted or anonymised when no longer required.</p>
          </div>

          {/* Your Rights */}
          <div id="rights" className="theme_box_bg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-theme_primary/20 flex items-center justify-center">
                <span className="text-theme_text_primary text-xs font-bold">10</span>
              </div>
              <h2 className="text-lg font-semibold text-theme_text_primary">Your Rights Under Indian Law</h2>
            </div>
            <p className="text-theme_text_normal text-sm mb-4">Under the Digital Personal Data Protection Act, 2023, you have the right to:</p>
            <div className="grid gap-3">
              {[
                "Access your personal data",
                "Correct inaccurate or incomplete data",
                "Request deletion of personal data",
                "Withdraw consent",
                "File a grievance regarding data processing"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-theme_primary/10 to-theme_secondary/5 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-theme_primary/20 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#0094FF">
                      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                    </svg>
                  </div>
                  <span className="text-theme_text_normal text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-theme_primary/10 rounded-lg">
              <p className="text-theme_text_normal text-sm">You may exercise these rights by contacting us using the details below.</p>
            </div>
          </div>

          {/* Updates */}
          <div id="updates" className="theme_box_bg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-theme_primary/20 flex items-center justify-center">
                <span className="text-theme_text_primary text-xs font-bold">11</span>
              </div>
              <h2 className="text-lg font-semibold text-theme_text_primary">Updates to This Notice</h2>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-theme_primary/10 rounded-lg">
                <p className="text-theme_text_normal text-sm">We may update this Privacy Notice from time to time.</p>
              </div>
              <div className="p-4 bg-theme_secondary/10 rounded-lg">
                <p className="text-theme_text_normal text-sm">Changes will be reflected by updating the "Last updated" date.</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div id="contact" className="theme_box_bg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-theme_primary/20 flex items-center justify-center">
                <span className="text-theme_text_primary text-xs font-bold">12</span>
              </div>
              <h2 className="text-lg font-semibold text-theme_text_primary">Contact & Grievance Redressal</h2>
            </div>
            <p className="text-theme_text_normal text-sm mb-4">
              If you have questions, concerns, or requests regarding this Privacy Notice or your personal data, contact us at:
            </p>
            <div className="p-4 bg-gradient-to-r from-theme_primary/10 to-theme_secondary/10 rounded-lg">
              <div className="text-center">
                <h3 className="text-theme_text_primary font-medium mb-2">Campus App Team</h3>
                <p className="text-theme_text_normal text-sm">
                  Email: <span className="text-theme_text_primary">yourcampusweb@gmail.com</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <img src="/logo.svg" alt="Campus Web" className="h-6 w-auto" />
            </div>
            <p className="text-theme_text_normal_60 text-xs">
              © {currentYear} Campus App. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
