import Hero from "./Hero";
import Services from "./Services";
import CategoryShowcase from "./CategoryShowcase";
import LatestProducts from "./LatestProducts";
import About from "./About";
import WhyChooseUs from "./WhyChooseUs";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import BookingForm from "./BookingForm";
import OffersSection from "./OffersSection";

export default function PharmacyLanding() {
  return (
    <div className="min-h-screen w-full bg-ivory text-navy font-body">
      <Hero />
      <OffersSection />
      <CategoryShowcase />
      <LatestProducts />
      <Services />
      <About />
      <WhyChooseUs />
      <Testimonials />
      <FAQ />
      <BookingForm />
    </div>
  );
}
