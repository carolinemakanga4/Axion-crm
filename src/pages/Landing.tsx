import React from "react";
import { useNavigate } from "react-router-dom";
import { BenefitsSection } from "../components/landing/BenefitsSection";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { FinalCtaSection } from "../components/landing/FinalCtaSection";
import { HeroSection } from "../components/landing/HeroSection";
import { LandingHeader } from "../components/landing/LandingHeader";
import { SocialProofSection } from "../components/landing/SocialProofSection";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => navigate("/login");
  const handleDemo = () => navigate("/register");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.18),transparent_38%),linear-gradient(to_bottom,#020617,#020617)]" />
        <div className="relative">
          <LandingHeader onGetDemo={handleDemo} onGetStarted={handleGetStarted} />
          <HeroSection onPrimaryClick={handleGetStarted} onSecondaryClick={handleDemo} />
          <SocialProofSection />
          <FeaturesSection />
          <BenefitsSection />
          <FinalCtaSection
            onPrimaryClick={handleGetStarted}
            onSecondaryClick={handleDemo}
          />
        </div>
      </div>
    </div>
  );
};

export default Landing;
