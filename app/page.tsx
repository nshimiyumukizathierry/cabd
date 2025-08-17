import { HeroSection } from "@/components/home/hero-section"
import { FeaturedCars } from "@/components/home/featured-cars"
import { SearchSection } from "@/components/home/search-section"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <SearchSection />
      <FeaturedCars />
    </div>
  )
}
