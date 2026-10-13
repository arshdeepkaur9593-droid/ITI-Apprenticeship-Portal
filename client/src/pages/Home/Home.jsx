import Navbar from "../../components/Navbar/Navbar";
import HeroSection from "../../components/HeroSection/HeroSection";
import StatsSection from "../../components/StatsSection/StatsSection";
import TradesSection from "../../components/TradesSection/TradesSection";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import CareerPathsSection from "../../components/CareerPathsSection/CareerPathsSection";
import FeaturedOpportunities from "../../components/FeaturedOpportunities/FeaturedOpportunities";
import CTASection from "../../components/CTASection/CTASection";
import Footer from "../../components/Footer/Footer";

const Home = () => {
  return (
    <>
      <Navbar />

      <main>
        <div id="home">
          <HeroSection />
        </div>

        <StatsSection />

        <div id="trades">
          <TradesSection />
        </div>

        <div id="how-it-works">
          <HowItWorks />
        </div>

        <div id="apprenticeships">
          <CareerPathsSection />
        </div>

        <FeaturedOpportunities />
        <CTASection />
      </main>

      <Footer />
    </>
  );
};

export default Home;
