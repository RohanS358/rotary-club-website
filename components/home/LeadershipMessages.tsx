"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  name: string;
  role: string;
  org: string;
  year: string;
  /** Drop a portrait in /public/messages and set it here; falls back to a monogram. */
  photo?: string;
  title?: string;
  salutation: string;
  paragraphs: string[];
  signOff: string;
  /** Devanagari body copy needs a slightly looser line-height. */
  nepali?: boolean;
};

const MESSAGES: Message[] = [
  {
    name: "Olayinka H. Babalola",
    role: "President, Rotary International",
    org: "Rotary International",
    year: "2026–27",
    photo: "/messages/ri-president.jpg",
    salutation: "Dear friends,",
    paragraphs: [
      "Rotary has changed my life, and I’m willing to bet that it has changed yours too. It expands our world, enriches our understanding of service, creates international friendships, and grounds us. It teaches us to see, to look beyond ourselves.",
      "Think about our Vision Statement: Together, we see a world where people unite and take action to create lasting change—across the globe, in our communities, and in ourselves.",
      "Those final words of our Vision Statement are at the heart of what it means to Create Lasting Impact. We often share how Rotary inspires lasting change in others, but we rarely discuss how it transforms us. We must consider how Rotary has changed our lives and share our stories widely. If we can do that, we will engage current members, expand our reach, and forge exciting connections with like-minded partners.",
      "We must embrace Rotary’s global diversity and build a welcoming culture, one where fresh perspectives are embraced, new ideas are celebrated, and differences are met with curiosity and kindness instead of judgement. If we can do that, we will meet our membership goals and continue to grow.",
      "And finally, we must reaffirm our commitment to service. We must think bigger, understanding our struggles as interconnected and leveraging our connections to make global progress. If we can do that, we will be one step closer to a world free of polio, a world where everyone has access to clean water and a quality education—a world at peace.",
      "Let us continue to inspire one another and seek innovative solutions to some of the world’s most pressing challenges. I look forward to working alongside you in service.",
    ],
    signOff: "Warm regards,",
  },
  {
    name: "Vishnu B. Karkee",
    role: "District Governor, District 3292",
    org: "Rotary International District 3292",
    year: "2026–27",
    photo: "/messages/district-governor.jpg",
    salutation: "Dear President Tej,",
    paragraphs: [
      "We would like to extend our warmest and heartfelt best wishes as you will take on the role of the Club President of your Club. Huge congratulations on this significant leadership commitment that you have accepted stepping to lead your Club to even greater heights during the Rotary Year 2026/27.",
      "Your enthusiasm, visionary leadership, dedication and commitment to our organization are truly commendable, and we are fortunate to have someone as capable and passionate as you leading the way. We believe in your ability to guide your Club Members towards success and create a thriving environment for all, serving and supporting the needy people in the communities all over the country and beyond.",
      "As the Club President, you have the opportunity to shape the future of the Members, Club and supporting the District as well, implementing new initiatives, and fostering a sense of unity among everyone. Your vision, leadership, and ability to inspire others will play a crucial role in the continued growth and achievement.",
      "As a Team Member of the District, we stand side by side and hand in hand, ready to offer our support and assistance whenever needed. We have every confidence that you will excel in this role and leave a lasting impact in the Club as well as in the District. May you have the wisdom to make sound decisions, the strength to overcome challenges, and the passion to make a positive difference.",
      "Congratulations once again, and we look forward to witnessing the great accomplishments that lie ahead under your exceptional leadership. Let’s Unite For Good to “Create Lasting Impact” around the globe, in our communities and to ourselves in the Rotary Year 2026/27.",
      "Thank you once again.",
    ],
    signOff: "With best wishes,",
  },
  {
    name: "महाबीर गुरुङ्ग",
    role: "Assistant Governor",
    org: "Rotary International District 3292",
    year: "2026–27",
    photo: "/messages/assistant-governor.jpg",
    nepali: true,
    salutation: "अध्यक्ष ज्यू",
    paragraphs: [
      "बधाई तथा सफल कार्यकालको शुभकामना । लामो समय देखि सामाजिक कार्यमा संलग्न रही विविध सेवा प्रदान गर्दै समाजमा क्लबको सकारात्मक छवि बनाउन सफल भएको क्लबसंग सहजकर्ताको रुपमा सहकार्य गर्नु पाउँदा आफूलाई गौरवान्वित महसूस भएको छ ।",
      "तपाईंको नेतृत्वमा क्लबका सबै साथीहरू संग मिलेर सामाजिक कार्य गरी क्लबको छवि अरू उच्च पार्नु हुन्छ भन्ने विश्वास लिएको छ । मेरो कार्य भनेको डिस्ट्रिक्ट र क्लब बिच सेतुको कार्य गर्नु हो तथापि मेरो अनुभव, ज्ञान र क्षमताले भ्याएसम्म सहयोग गर्ने छु । Service above self र Create Lasting Impact भन्ने आदर्श वाक्यलाई मूलमन्त्रको रुपमा अंगीकार गरौँ ।",
      "अन्त्यमा सामाजिक भलाईको कार्यमा सबै मिलीजुली एकजुट होउँ । पुनः बधाई तथा सफल कार्यकालको शुभकामना । सबैको जय होस्, धन्यवाद ।",
    ],
    signOff: "भलोचाहने,",
  },
  {
    name: "Rtn. Tej Prasad Timsina",
    role: "President",
    org: "Rotary Club of Pashupati Kathmandu",
    year: "2026–27",
    photo: "/messages/club-president.jpg",
    title: "Continuing the Legacy of Service: Advancing the Rotary Spirit of Humanity",
    salutation: "Dear Fellow Rotarians,",
    paragraphs: [
      "It is my great honor and privilege to serve as the President of the Rotary Club of Pashupati for the Rotary Year 2026–27. I sincerely thank all members for their trust and confidence in me. As I take on this responsibility, I am proud to continue the remarkable legacy built by our founders, Past Presidents, senior Rotarians, and dedicated members whose vision, leadership, and commitment have established our club as a respected institution within the Rotary family.",
      "Guided by Rotary’s timeless motto, “Service above Self,” we remain committed to making a meaningful difference in the lives of those we serve. During this Rotary year, our focus will be on implementing impactful and sustainable projects in education, healthcare, environmental protection, community development, and support for vulnerable groups. We will also strengthen fellowship, encourage greater member engagement, and promote teamwork so that every Rotarian has the opportunity to contribute to our shared mission.",
      "I firmly believe that the success of our club lies in our unity, collaboration, and collective commitment to service. With the continued guidance of our senior Rotarians, advisors, and Past Presidents, along with the active participation of every member, I am confident that we can further enhance the prestige and impact of the Rotary Club of Pashupati.",
      "I extend my heartfelt gratitude to all Rotarians, partners, well-wishers, and community members for your continued support and encouragement. Together, let us work with renewed enthusiasm, integrity, and compassion to make the Rotary Year 2026–27 a memorable and successful chapter in the proud history of our club.",
    ],
    signOff: "Yours in Rotary Service,",
  },
];

const initials = (name: string) =>
  name
    .replace(/^Rtn\.\s*/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

/** First paragraph, trimmed at a word boundary — enough to pull the reader in. */
const excerpt = (m: Message, max = 260) => {
  const t = m.paragraphs[0];
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(" ", max)).replace(/[,;:]$/, "") + "…";
};

function Portrait({ m, size }: { m: Message; size: number }) {
  return (
    <div
      className="relative shrink-0 rounded-full overflow-hidden ring-2 ring-white/70 shadow-sm bg-[#17458f]/10"
      style={{ width: size, height: size }}
    >
      {m.photo ? (
        <Image src={m.photo} alt={m.name} fill sizes={`${size}px`} className="object-cover object-top" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #17458f 0%, #1e5ba8 100%)",
            fontSize: size * 0.34,
          }}
        >
          {initials(m.name)}
        </div>
      )}
    </div>
  );
}

export default function LeadershipMessages() {
  const [open, setOpen] = useState<number | null>(null);
  const m = open === null ? null : MESSAGES[open];

  return (
    <section className="relative bg-[#f5f5f4] py-16 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="text-xs font-medium tracking-[0.22em] uppercase text-[#0f2252]/50">
            Messages
          </span>
          <h2
            className="mt-3 text-[#0f2252] font-semibold tracking-tight leading-[1.12]"
            style={{ fontSize: "clamp(2rem, 3.6vw, 3.5rem)" }}
          >
            Words from those who lead us.
            <br />
            Rotary Year <span style={{ color: "#f7a800" }}>2026&ndash;27</span>.
          </h2>
        </motion.div>
      </div>

      {/* ── Card rail ── */}
      <div className="mt-10 lg:mt-14 overflow-x-auto scrollbar-none">
        <div className="flex gap-6 px-6 lg:px-8 pb-4 w-max mx-auto max-w-none">
          {MESSAGES.map((item, i) => (
            <motion.button
              key={item.name}
              onClick={() => setOpen(i)}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="group relative text-left w-[19rem] sm:w-[21rem] shrink-0 rounded-2xl bg-white p-7 flex flex-col shadow-[0_10px_40px_rgba(15,34,82,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,34,82,0.12)]"
            >
              <Portrait m={item} size={52} />

              <p
                className={cn(
                  "mt-6 text-[#0f2252]/85 text-[15px]",
                  item.nepali ? "leading-[1.9]" : "leading-relaxed"
                )}
              >
                &ldquo;{excerpt(item)}&rdquo;
              </p>

              <div className="mt-auto pt-10">
                <span className="block text-2xl text-[#0f2252] font-signature leading-none">
                  {item.name}
                </span>
                <span className="mt-2 block text-sm text-[#0f2252]/45">
                  {item.role}
                  {item.org !== item.role && <> at {item.org}</>}
                </span>
              </div>

              <span className="absolute top-7 right-7 text-xs font-medium text-[#0f2252]/0 group-hover:text-[#f7a800] transition-colors duration-300">
                Read
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Full letter ── */}
      <AnimatePresence>
        {m && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-[#0f2252]/45 backdrop-blur-sm"
              onClick={() => setOpen(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Message from ${m.name}`}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl"
            >
              <button
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="sticky top-4 float-right mr-4 z-10 w-9 h-9 rounded-full bg-[#0f2252]/5 hover:bg-[#0f2252]/10 flex items-center justify-center text-[#0f2252] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-7 sm:p-10 lg:p-12">
                <header className="flex items-center gap-4 pb-6 mb-6 border-b border-[#0f2252]/10">
                  <Portrait m={m} size={64} />
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-[#0f2252] leading-tight">{m.name}</h3>
                    <p className="text-sm text-[#0f2252]/50 leading-tight mt-1">
                      {m.role} &middot; {m.org} &middot; {m.year}
                    </p>
                  </div>
                </header>

                {m.title && (
                  <p className="text-base lg:text-lg font-semibold text-[#0f2252] mb-5">{m.title}</p>
                )}

                <p className="text-[#0f2252] font-medium mb-4">{m.salutation}</p>

                <div
                  className={cn(
                    "space-y-4 text-[#0f2252]/80 text-[15px] lg:text-base",
                    m.nepali ? "leading-[2]" : "leading-relaxed"
                  )}
                >
                  {m.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                <footer className="mt-8 pt-6 border-t border-[#0f2252]/10">
                  <p className="text-[#0f2252]/60 text-sm">{m.signOff}</p>
                  <p className="mt-1 text-3xl text-[#0f2252] font-signature leading-none">
                    {m.name}
                  </p>
                  <p className="mt-2 text-sm text-[#0f2252]/50">
                    {m.role}, {m.org}
                  </p>
                </footer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
