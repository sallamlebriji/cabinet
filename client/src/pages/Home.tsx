import { Hero } from "../sections/Hero";
import { Services } from "../sections/Services";
import { About } from "../sections/About";
import { Testimonials } from "../sections/Testimonials";
import { Contact } from "../sections/Contact";
import { usePublicCabinet } from "../hooks/usePublicCabinet";

export function Home() {
  const cabinet = usePublicCabinet();

  return (
    <>
      <Hero cabinet={cabinet} />
      <Services cabinetName={cabinet.cabinetName} />
      <About cabinet={cabinet} />
      <Testimonials />
      <Contact cabinet={cabinet} />
    </>
  );
}
