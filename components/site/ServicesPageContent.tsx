"use client";

import { useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Settings } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";
import { ServicesSection } from "./ServicesSection";
import { FaqSection } from "./FaqSection";
import { ContactSection } from "./ContactSection";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Связывает прайс с формой: клик по «Заказать» подставляет тариф в заявку и
 * прокручивает к ней, чтобы человеку не пришлось искать форму и вспоминать,
 * что именно он выбрал.
 */
export function ServicesPageContent({
  locale,
  dict,
  settings,
}: {
  locale: Locale;
  dict: Dictionary;
  settings: Settings;
}) {
  const [topic, setTopic] = useState<string>("");

  const selectService = (serviceTitle: string) => {
    setTopic(serviceTitle);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section className="container-page pb-section">
        <ServicesSection
          services={settings.services}
          locale={locale}
          dict={dict}
          onSelect={selectService}
        />

        <Reveal delay={0.1}>
          <p className="mt-10 max-w-2xl text-xs leading-relaxed text-muted">
            {dict.services.priceNote}
          </p>
        </Reveal>
      </section>

      {settings.faq.length > 0 && (
        <section className="container-page pb-section">
          <SectionHeading eyebrow={dict.faq.label} title={dict.faq.title} />
          <FaqSection items={settings.faq} locale={locale} />
        </section>
      )}

      <ContactSection locale={locale} dict={dict} settings={settings} topic={topic} />
    </>
  );
}
