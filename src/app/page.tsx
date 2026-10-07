import { Header } from "@/components/chrome/Header";
import { SideNav } from "@/components/chrome/SideNav";
import { Chapters } from "@/components/providers/Chapters";
import { HomeLanding } from "@/components/providers/HomeLanding";
import { SkyCycle } from "@/components/providers/SkyCycle";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { Process } from "@/components/sections/Process";
import { HighStreet } from "@/components/sections/HighStreet";
import { Services } from "@/components/sections/Services";
import { CloudLayer } from "@/components/scenery/CloudLayer";
import { Landscape } from "@/components/scenery/Landscape";
import { Life } from "@/components/scenery/Life";
import { SunJourney } from "@/components/sun/SunJourney";
import { profile, skills } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.fullName,
  jobTitle: profile.role,
  url: siteUrl,
  email: `mailto:${profile.email}`,
  sameAs: profile.socials.map((social) => social.href),
  knowsAbout: skills.map((skill) => skill.name),
};

/**
 * The story: who (hero, about) → what (services) → proof (work) → how
 * (process) → background (journey) → contact. Testimonials (trust) are hidden
 * until there are real quotes; the section is in sections/Testimonials.tsx.
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
      <Chapters />
      <HomeLanding />
      <SkyCycle />
      <SunJourney />
      <CloudLayer />
      <Life />
      <Landscape />
      <Header />
      <SideNav />
      <main id="main" data-night-ink="" className="relative z-10 overflow-x-clip outline-none">
        <Hero />
        <About />
        <Services />
        <HighStreet />
        <Process />
        <Journey />
      </main>
      <Contact />
    </>
  );
}
