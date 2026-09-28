import { Header } from "@/components/chrome/Header";
import { SideNav } from "@/components/chrome/SideNav";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Study } from "@/components/sections/Study";
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

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
      <Header />
      <SideNav />
      <main id="main" className="relative z-10 overflow-x-clip outline-none">
        <Hero />
        <Marquee />
        <About />
        <Skills />
        <Study />
        <Projects />
      </main>
      <Contact />
    </>
  );
}
