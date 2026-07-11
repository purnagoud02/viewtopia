import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";

export default function PremiumHero() {
  return (
    <section className="relative overflow-hidden pt-24">
      <div className="absolute inset-0">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          src="https://assets.mixkit.co/videos/720p/mixkit-cinema-trailer-16-5801.mp4"
        />
        <div className="hero-overlay" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-20 pt-28 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <span className="badge-soft">Premium Entertainment</span>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Watch the worlds best movies with cinematic HD playback.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Dive into a premium OTT experience with personalized recommendations,
            ultra-fast streaming, and a beautifully designed movie library.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#plans" className="hero-button">
              <PlayCircle size={18} /> Start your trial
            </a>
            <a href="#features" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10">
              Learn more
              <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { label: "Trending", value: "4.8M" },
            { label: "Movies", value: "18K+" },
            { label: "Rated", value: "4.9/5" },
            { label: "Premium", value: "Ultra HD" },
          ].map((metric) => (
            <div key={metric.label} className="glass-card p-6">
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">{metric.label}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{metric.value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
