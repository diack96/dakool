import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Clients from "@/components/sections/Clients";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import Realisations from "@/components/sections/Realisations";
import APropos from "@/components/sections/APropos";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Clients />
        <Services />
        <Process />
        <Realisations />
        <APropos />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
