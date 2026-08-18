import { Navbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { WorkflowSection } from '@/components/landing/workflow-section'
import { GenresSection } from '@/components/landing/genres-section'
import { CTASection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="workflow">
          <WorkflowSection />
        </div>
        <div id="genres">
          <GenresSection />
        </div>
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
