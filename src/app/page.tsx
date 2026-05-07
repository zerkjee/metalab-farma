import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { HeroSection } from "@/components/sections/HeroSection"
import { BenefitsSection } from "@/components/sections/BenefitsSection"
import { CategoriesSection } from "@/components/sections/CategoriesSection"
import { FeaturedProducts } from "@/components/sections/FeaturedProducts"
import { InstitutionalSection } from "@/components/sections/InstitutionalSection"
import { SocialProof } from "@/components/sections/SocialProof"
import { Newsletter } from "@/components/sections/Newsletter"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <BenefitsSection />
        <CategoriesSection />
        <FeaturedProducts />
        <InstitutionalSection />
        <SocialProof />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
