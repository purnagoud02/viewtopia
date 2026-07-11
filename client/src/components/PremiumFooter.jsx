import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";

const social = [
  { Icon: Instagram, label: "Instagram", href: "#" },
  { Icon: Twitter, label: "Twitter", href: "#" },
  { Icon: Youtube, label: "YouTube", href: "#" },
  { Icon: Facebook, label: "Facebook", href: "#" },
];

export default function PremiumFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/90 px-6 py-14 text-slate-300">
      <div className="mx-auto max-w-7xl space-y-10 lg:flex lg:items-start lg:justify-between lg:space-y-0">
        <div className="max-w-xl space-y-4">
          <p className="text-sm uppercase tracking-[0.32em] text-pink-400/90">StreamFlix</p>
          <h3 className="text-3xl font-semibold text-white">Premium entertainment, made for every screen.</h3>
          <p className="text-slate-400">Get notified about new launches, exclusive drops, and curated collections for your next binge session.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Company</p>
            <ul className="mt-5 space-y-3 text-slate-300">
              <li>About Us</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Support</p>
            <ul className="mt-5 space-y-3 text-slate-300">
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Follow</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {social.map(({ Icon, label, href }) => (
                <a key={label} href={href} className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">
                  <Icon size={18} /> {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
