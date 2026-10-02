import { Header } from "@/components/chrome/Header";
import { SideNav } from "@/components/chrome/SideNav";
import { DayCycle } from "@/components/providers/DayCycle";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { Marquee } from "@/components/sections/Marquee";
import { Process } from "@/components/sections/Process";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { SunJourney } from "@/components/sun/SunJourney";
import { profile, skills, testimonials } from "@/content/site";
import { visibleItems } from "@/lib/mock";
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
 * (process) → background (journey) → trust (testimonials) → contact.
 */
export default function Home() {
  const quotes = visibleItems(testimonials);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
      <DayCycle />
      <SunJourney />
      <Header />
      <SideNav />
      <main id="main" className="relative z-10 overflow-x-clip outline-none">
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Projects />
        <Process />
        <Journey />
        {quotes.length > 0 && <Testimonials items={quotes} />}
      </main>
      <Contact />
    </>
  );
}
