import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { CLUB_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Rotary Club of Pashupati Kathmandu. We are happy to hear from you.",
};

const CONTACT_DETAILS = [
  {
    icon: MapPin,
    label: "Address",
    value: CLUB_INFO.address,
    href: null,
  },
  {
    icon: Phone,
    label: "Phone",
    value: CLUB_INFO.phone,
    href: `tel:${CLUB_INFO.phone}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: CLUB_INFO.email,
    href: `mailto:${CLUB_INFO.email}`,
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: CLUB_INFO.hours,
    href: null,
  },
  {
    icon: Clock,
    label: "Weekly Meeting",
    value: CLUB_INFO.meeting,
    href: null,
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#06112a] to-[#17458f] py-16 lg:py-24 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-[#f7a800] font-semibold text-sm uppercase tracking-widest mb-3">
              Get In Touch
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-blue-200 max-w-xl mx-auto text-lg">
              We are happy to hear from you and answer any questions about our
              club, membership, or how to get involved.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact details */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-8">
                  Reach Out to Us
                </h2>
                <div className="space-y-6 mb-10">
                  {CONTACT_DETAILS.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex gap-4 items-start">
                      <div className="w-11 h-11 rounded-xl bg-[#eef2fa] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                          {label}
                        </p>
                        {href ? (
                          <a
                            href={href}
                            className="text-foreground hover:text-primary transition-colors font-medium"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="text-foreground font-medium">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map embed placeholder */}
                <div className="rounded-2xl overflow-hidden border border-border h-56 bg-[#f8faff] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-primary/40" />
                    <p className="text-sm">09 Sinamangal, Kathmandu</p>
                  </div>
                </div>
              </div>

              {/* Contact form */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-8">
                  Send Us a Message
                </h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
