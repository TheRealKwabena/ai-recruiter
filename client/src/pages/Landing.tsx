import { Link } from 'react-router-dom';

const logos = ['Home Depot', 'FedEx', 'Caterpillar', 'Target', 'UPS'];

const featuredTalent = [
  { name: 'Marco Ruiz', role: 'Journeyman Electrician', type: 'OSHA verified', gradient: 'from-emerald-300/60 via-emerald-500/70 to-emerald-900/80' },
  { name: 'Keisha Brown', role: 'CDL Class A Driver', type: 'DOT certified', gradient: 'from-sky-200/70 via-sky-400/70 to-sky-900/80' },
  { name: 'Luis Hernandez', role: 'HVAC Technician', type: 'Ready for dispatch', gradient: 'from-lime-200/70 via-lime-500/70 to-emerald-900/80' },
  { name: 'Sophia Patel', role: 'Warehouse Supervisor', type: 'Leadership endorsed', gradient: 'from-teal-200/70 via-teal-400/70 to-emerald-900/80' },
];

const benefits = [
  {
    title: '80% Faster Hiring',
    copy: 'Shortlists land in your inbox within 48 hours so you can keep momentum with candidates.',
    icon: '⚡',
  },
  {
    title: 'Decrease Spendings',
    copy: 'Reduce sourcing fees by tapping into one global pipeline of curated candidates.',
    icon: '💸',
  },
  {
    title: 'Top 0.1% Candidates',
    copy: 'Every profile is skill-tested, reference-checked, and interview ready.',
    icon: '🏅',
  },
];

const stats = [
  { value: '5.2k', label: 'Skilled workers ready' },
  { value: '210+', label: 'Trades & job families' },
  { value: '48hr', label: 'Average time-to-fill' },
];

const Landing = () => {
  return (
    <div className="relative overflow-hidden bg-[#f4fff9]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/3 h-64 w-64 rounded-full bg-primary-300/40 blur-3xl" />
        <div className="absolute top-40 left-4 h-80 w-80 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-8 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/40 bg-white/80 px-6 py-3 shadow-soft-card backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white font-semibold">HR</div>
            <div>
              <p className="text-lg font-bold text-charcoal">Hirings</p>
              <p className="text-xs uppercase tracking-[0.3em] text-primary-600">Global Talent Hub</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-charcoal/70">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <a href="#platform" className="hover:text-primary-600">Platform</a>
            <a href="#talent" className="hover:text-primary-600">Talent</a>
            <a href="#cta" className="hover:text-primary-600">Pricing</a>
          </nav>
        </header>

        <main className="mt-16 space-y-24">
          <section className="grid gap-10 rounded-[32px] bg-hero-gradient px-8 py-14 text-white lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-6">
              <span className="pill bg-white/20 text-white">America’s skilled labor network</span>
              <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
                Hire dependable blue-collar crews in days, not weeks
              </h1>
              <p className="text-lg text-white/80">
                Dispatch licensed electricians, HVAC techs, CDL drivers, warehouse leads, and facility teams that pass background, reference, and safety checks.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="btn-primary bg-white text-primary-700 hover:bg-white/90 shadow-lg">
                  Get started
                </Link>
                <Link to="/login" className="btn-secondary border-white/40 bg-transparent text-white hover:bg-white/10">
                  View demo
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 pt-4">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/20 px-6 py-4">
                    <p className="text-3xl font-bold">{item.value}</p>
                    <p className="text-sm text-white/70">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {featuredTalent.map((talent) => (
                <div
                  key={talent.name}
                  className={`glass-panel relative overflow-hidden border-white/20 bg-gradient-to-br ${talent.gradient} px-6 py-5 text-white`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-semibold">{talent.name}</p>
                      <p className="text-sm text-white/80">{talent.role}</p>
                    </div>
                    <span className="rounded-full bg-white/20 px-4 py-1 text-xs uppercase tracking-wide">
                      {talent.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-soft-card">
            <p className="text-center text-sm uppercase tracking-[0.25em] text-primary-600">Trusted by hiring teams at</p>
            <div className="mt-6 grid grid-cols-2 gap-6 text-center text-lg font-semibold text-charcoal/60 sm:grid-cols-3 lg:grid-cols-5">
              {logos.map((logo) => (
                <div key={logo} className="rounded-2xl bg-slate-50 py-4 shadow-sm">{logo}</div>
              ))}
            </div>
          </section>

          <section id="platform" className="grid gap-8 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="card h-full p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-2xl">{benefit.icon}</div>
                <h3 className="mt-4 text-xl font-semibold text-charcoal">{benefit.title}</h3>
                <p className="mt-2 text-sm text-charcoal/70">{benefit.copy}</p>
              </div>
            ))}
          </section>

          <section id="talent" className="grid gap-8 rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-soft-card lg:grid-cols-2">
            <div className="space-y-6">
              <span className="pill bg-primary-50 text-primary-700">Leverage field talent</span>
              <h2 className="text-3xl font-semibold text-charcoal">
                Crews when you need them. Reliable shifts every day.
              </h2>
              <p className="text-charcoal/70">
                Keep a living pipeline of vetted tradespeople, CDL drivers, material handlers, and facility teams ready when your next shift opens.
              </p>
              <ul className="space-y-3 text-sm text-charcoal/80">
                <li className="flex items-center gap-3"><span className="text-primary-500">●</span> OSHA & background screening completed</li>
                <li className="flex items-center gap-3"><span className="text-primary-500">●</span> Licenses and certifications re-verified every 90 days</li>
                <li className="flex items-center gap-3"><span className="text-primary-500">●</span> Interview-ready workers in under 48 hours</li>
              </ul>
            </div>
            <div className="glass-panel p-6">
              <div className="rounded-2xl bg-charcoal p-6 text-white shadow-2xl">
                <p className="text-sm text-white/70">Night Shift · Distribution Center</p>
                <p className="mt-2 text-2xl font-semibold">Crew Assignment</p>
                <p className="text-sm text-white/60">3 Forklift Leads · 2 days ago</p>
                <div className="mt-6 space-y-3 text-sm text-white/80">
                  <p className="flex items-center justify-between">
                    <span>Full-time</span>
                    <span>Onsite</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>28 workers</span>
                    <span>Ready to dispatch</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-8 rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-soft-card lg:grid-cols-[1fr_360px]">
            <div>
              <p className="text-sm font-semibold text-primary-600">Find the right trade</p>
              <h3 className="mt-3 text-3xl font-semibold text-charcoal">Search crews by license, shift, or region</h3>
              <p className="mt-2 text-charcoal/70">
                Filter by craft, shift availability, pay range, or location. Send one brief to every qualified worker instantly.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                {['Electrician', 'HVAC', 'Logistics', 'Drivers'].map((tag) => (
                  <button key={tag} className="btn-secondary px-6 py-2">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="glass-panel p-6">
              <p className="text-sm font-medium text-charcoal/80">Journeyman Electrician</p>
              <input className="input-field mt-4" placeholder="Search by trade, license, city" type="text" />
              <button className="btn-primary mt-4 w-full">View 120 available workers</button>
            </div>
          </section>

          <section id="cta" className="glass-panel flex flex-col items-center gap-4 px-8 py-12 text-center">
            <span className="pill bg-primary-600/10 text-primary-700">Web application · Mobile friendly</span>
            <h2 className="text-3xl font-semibold text-charcoal">Get started for free forever</h2>
            <p className="max-w-2xl text-charcoal/70">
              One workspace for hiring teams to collaborate, score candidates, and send offers in record time. Launch your first role today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup" className="btn-primary px-8">Get started</Link>
              <Link to="/login" className="btn-secondary px-8">Talk to an expert</Link>
            </div>
          </section>
        </main>

        <footer className="mt-16 flex flex-col gap-2 border-t border-white/60 py-8 text-sm text-charcoal/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Hirings. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#platform" className="hover:text-primary-600">About</a>
            <a href="#talent" className="hover:text-primary-600">Features</a>
            <Link to="/login" className="hover:text-primary-600">Login</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;

