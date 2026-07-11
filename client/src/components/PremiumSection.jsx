import { motion } from "framer-motion";
import { Star, Sparkles, Clock3, Heart } from "lucide-react";

const cards = [
  {
    title: "Trending Movies",
    description: "What everyone is watching right now.",
    icon: Star,
  },
  {
    title: "New Releases",
    description: "Fresh premieres with premium access.",
    icon: Sparkles,
  },
  {
    title: "Continue Watching",
    description: "Resume your story from where you left off.",
    icon: Clock3,
  },
  {
    title: "Top Rated",
    description: "Critically loved movies selected for you.",
    icon: Heart,
  },
];

export default function PremiumSection() {
  return (
    <section className="page-section" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="badge-soft">Explore premium categories</p>
            <h2 className="section-title mt-4">Built for binge watchers, curated for you.</h2>
          </div>
          <p className="max-w-2xl text-slate-300">
            Discover fresh collections, top-rated picks, and specially curated thriller, drama, and family playlists.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                whileHover={{ y: -10 }}
                className="glass-card p-8"
              >
                <span className="badge-soft">
                  <Icon size={16} />
                  {card.title}
                </span>
                <h3 className="mt-6 text-2xl font-semibold text-white">{card.title}</h3>
                <p className="mt-4 text-slate-300">{card.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
