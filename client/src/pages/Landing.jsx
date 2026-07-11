import PremiumNavbar from "../components/PremiumNavbar";
import PremiumHero from "../components/PremiumHero";
import PremiumSection from "../components/PremiumSection";
import PremiumFooter from "../components/PremiumFooter";
import { motion } from "framer-motion";

const trendingMovies = [
  { title: "Starlight Odyssey", tag: "Sci-fi" },
  { title: "Nocturne", tag: "Drama" },
  { title: "Shadow Run", tag: "Action" },
  { title: "Midnight Echo", tag: "Thriller" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PremiumNavbar />
      <main className="pt-20">
        <PremiumHero />
        <PremiumSection />

        <section className="page-section bg-slate-950/80">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="badge-soft">Discover</p>
                <h2 className="section-title mt-4">Your next favorite film is waiting.</h2>
              </div>
              <a href="/home" className="hero-button">Browse collection</a>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {trendingMovies.map((movie, index) => (
                <motion.article
                  key={movie.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * index, duration: 0.5 }}
                  className="movie-card-upgrade overflow-hidden"
                >
                  <div className="relative h-72 bg-slate-900">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.18),transparent_35%)]" />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/90 to-transparent" />
                    <div className="absolute inset-0 flex items-end p-6">
                      <span className="movie-chip">{movie.tag}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold">{movie.title}</h3>
                    <p className="mt-3 text-slate-400">Immersive visuals, unforgettable stories, and premium streaming quality.</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PremiumFooter />
    </div>
  );
}
