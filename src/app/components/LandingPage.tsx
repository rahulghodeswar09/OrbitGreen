import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Sun, Zap, Shield, Users, Phone, Mail, MapPin, Check, Star,
  Award, Clock, ChevronDown, ArrowRight, Leaf, TrendingUp,
  Battery, Cpu, Menu, X, IndianRupee,
} from 'lucide-react';
import { publicAPI } from '@/app/utils/api';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

// ─── Default data ─────────────────────────────────────────────────────────────
const DEFAULT_PLANS = [
  {
    capacity: '1 kW',
    price: '₹60,000',
    subsidy: '₹30,000',
    finalPrice: '₹30,000',
    units: '3–4 units/day',
    features: ['25-year panel warranty', 'PM Surya Ghar subsidy', 'Net metering', 'Free site survey'],
  },
  {
    capacity: '2 kW',
    price: '₹1,20,000',
    subsidy: '₹60,000',
    finalPrice: '₹60,000',
    units: '8–10 units/day',
    popular: true,
    features: ['25-year panel warranty', 'PM Surya Ghar subsidy', 'Net metering', 'Free site survey', 'Priority support'],
  },
  {
    capacity: '3 kW',
    price: '₹1,80,000',
    subsidy: '₹78,000',
    finalPrice: '₹1,02,000',
    units: '12–15 units/day',
    features: ['25-year panel warranty', 'PM Surya Ghar subsidy', 'Net metering', 'Free site survey', 'Priority support', 'AMC included'],
  },
];

const DEFAULT_TESTIMONIALS = [
  { name: 'Atul Ghodeswar', location: 'Rendal, Kolhapur', rating: 5, comment: 'Excellent service! My electricity bill reduced by 80%. Highly recommend Orbit Green Power.' },
  { name: 'Sudarshan khot', location: 'Hupari, Kolhapur', rating: 5, comment: 'Professional installation team. Got subsidy within 3 months. Very happy with the system.' },
  { name: 'Amol Davane', location: 'Ichalkaranji, Kolhapur', rating: 5, comment: 'Best investment I made. Quality Waaree panels. Working perfectly for 2 years now.' },
];

const STATS = [
  { value: '50+', label: 'Installations', icon: Zap },
  { value: '3+', label: 'Years Experience', icon: Clock },
  { value: '25 Yr', label: 'Warranty', icon: Shield },
  { value: '98%', label: 'Satisfaction', icon: Star },
];

const BRANDS = ['Waaree', 'Adani Solar', 'Vikram Solar', 'Growatt', 'Luminous', 'Havells', 'Tata Power Solar', 'RenewSys'];

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(target: string, duration = 1500, start = false) {
  const [count, setCount] = useState('0');
  useEffect(() => {
    if (!start) return;
    const num = parseInt(target.replace(/\D/g, ''));
    if (isNaN(num)) { setCount(target); return; }
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * num).toString() + target.replace(/[\d]/g, ''));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ─── Stat item (own component so hook is called at top level) ─────────────────
function StatItem({ value, label, icon: Icon, inView }: { value: string; label: string; icon: React.ElementType; inView: boolean }) {
  useCountUp(value, 1500, inView); // keep hook call valid
  return (
    <div className="text-center group">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 mb-4 group-hover:bg-green-500/20 transition-colors mx-auto">
        <Icon className="h-7 w-7 text-green-400" />
      </div>
      <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{inView ? value : '0'}</div>
      <div className="text-sm text-gray-400 font-medium">{label}</div>
    </div>
  );
}

// ─── Intersection observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Component ────────────────────────────────────────────────────────────────
export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onRegisterClick }) => {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { ref: statsRef, inView: statsInView } = useInView();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    publicAPI.getPlans().then(d => { if (d.plans?.length) setPlans(d.plans); }).catch(() => { });
    publicAPI.getTestimonials().then(d => { if (d.testimonials?.length) setTestimonials(d.testimonials); }).catch(() => { });
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0f0a]/95 backdrop-blur-md shadow-lg shadow-green-900/20 border-b border-green-900/30' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative shrink-0">
                <img src="/logo.png" alt="Orbit Green Power Technology Logo" className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain drop-shadow-xl" />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-bold text-white leading-tight truncate">Orbit Green Power Technology</p>
                <p className="text-[10px] sm:text-xs md:text-[20px] text-green-400 leading-tight">Qulity Is Our Identity</p>
              </div>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {['about', 'services', 'plans', 'contact'].map(s => (
                <button key={s} onClick={() => scrollTo(s)}
                  className="text-sm text-gray-300 hover:text-green-400 capitalize transition-colors font-medium">
                  {s}
                </button>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" onClick={onLoginClick}
                className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10">
                Login
              </Button>
              <Button onClick={onRegisterClick}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/30 border-0">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile menu toggle */}
            <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0d1a0d]/98 backdrop-blur-md border-t border-green-900/30 px-4 py-4 space-y-3">
            {['about', 'services', 'plans', 'contact'].map(s => (
              <button key={s} onClick={() => scrollTo(s)}
                className="block w-full text-left text-gray-300 hover:text-green-400 capitalize py-2 text-sm font-medium">
                {s}
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onLoginClick} className="flex-1 border-green-700 text-green-400 hover:bg-green-900/30">Login</Button>
              <Button onClick={onRegisterClick} className="flex-1 bg-green-600 hover:bg-green-500">Register</Button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            playsInline
            onEnded={(e) => (e.currentTarget.pause())}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          >
            <source src="/bg-video.mp4" type="video/mp4" />
          </video>
          {/* Subtle overlay to ensure text readability without overpowering the video */}
          <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-8 backdrop-blur-sm">
            <Leaf className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">PM Surya Ghar Yojana — Up to ₹78,000 Subsidy Available By Goverment</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight px-2">
            <span className="text-white">Power Your Home</span>
            <br />
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              With Orbit Green Power Technology
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-4 max-w-2xl mx-auto leading-relaxed">
            Invest once. Save forever. Orbit Green Power Technology delivers premium solar installations with government subsidies and 25-year warranty.
          </p>
          <p className="text-base text-green-400 font-semibold mb-10">
            🌞 Think Green → Go Green → Save Energy
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onRegisterClick}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-base px-8 py-6 shadow-2xl shadow-green-500/30 border-0 rounded-xl">
              Get Free Quote <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.open('tel:+919763246164')}
              className="border-green-700 text-green-400 hover:bg-green-900/30 text-base px-8 py-6 rounded-xl backdrop-blur-sm">
              <Phone className="mr-2 h-5 w-5" /> Call Now
            </Button>
          </div>

          {/* Scroll cue */}
          <div className="mt-20 flex justify-center animate-bounce">
            <button onClick={() => scrollTo('about')} className="text-gray-600 hover:text-green-400 transition-colors">
              <ChevronDown className="h-8 w-8" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section ref={statsRef} className="py-16 bg-gradient-to-r from-green-900/20 via-emerald-900/10 to-green-900/20 border-y border-green-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <StatItem key={label} value={value} label={label} icon={Icon} inView={statsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20">About Us</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Leading Solar Solutions <br />
              <span className="text-green-400">in Maharashtra</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              We are a premier solar energy solutions provider committed to making clean energy accessible to every home and business.
              With 2+ years of experience and 50+ satisfied customers, we deliver quality, reliability, and excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Award, title: 'Our Mission', desc: 'To empower every home and business with sustainable solar energy, reducing carbon footprint and electricity costs across India.' },
              { icon: TrendingUp, title: 'Our Vision', desc: 'A future where solar energy is the primary power source, creating a cleaner and greener planet for generations to come.' },
              { icon: Shield, title: 'Our Values', desc: 'Quality, transparency, customer satisfaction, and environmental responsibility guide every installation we do.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group relative p-8 rounded-2xl bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-900/30 hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                  <Icon className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 px-4 bg-gradient-to-b from-transparent via-green-900/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border border-green-500/30">Our Services</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Comprehensive Solar Solutions</h2>
            <p className="text-gray-400 text-lg">Everything you need for a complete solar transition</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap, title: 'On-Grid Solar System', tag: 'Most Popular',
                desc: 'Connect to the grid and earn credits for excess power. Ideal for homes and businesses with consistent power supply.',
                features: ['Net metering enabled', 'Up to 90% bill reduction', 'Low maintenance cost', 'ROI in 4–6 years'],
              },
              {
                icon: Battery, title: 'Off-Grid Solar System', tag: 'Power Independence',
                desc: 'Complete energy independence with battery backup. Perfect for areas with frequent power cuts.',
                features: ['24/7 power availability', 'Battery backup included', 'No grid dependency', 'Ideal for rural areas'],
              },
              {
                icon: Cpu, title: 'Commercial & Industrial', tag: 'Enterprise',
                desc: 'Large-scale solar installations for factories, commercial complexes, and industrial units.',
                features: ['10 kW to 1 MW+ capacity', 'ROI in 3–5 years', 'Tax benefits available', 'Dedicated project manager'],
              },
            ].map(({ icon: Icon, title, tag, desc, features }) => (
              <div key={title} className="group relative p-8 rounded-2xl bg-[#0d1a0d] border border-green-900/30 hover:border-green-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <Icon className="h-7 w-7 text-green-400" />
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">{tag}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed text-sm">{desc}</p>
                <ul className="space-y-2">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subsidy Banner ── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-10 md:p-16">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="relative z-10 text-center">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 text-sm px-4 py-1">🏛️ Government Scheme</Badge>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">PM Surya Ghar Yojana</h2>
              <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto">
                Get up to <strong>₹78,000 subsidy By Goverment</strong> on your residential solar installation. We handle all documentation and application processes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mb-10">
                {[['₹30,000', '1 kW System'], ['₹60,000', '2 kW System'], ['₹78,000', '3 kW+ System']].map(([amt, label]) => (
                  <div key={label} className="bg-white/15 backdrop-blur rounded-2xl p-4 sm:p-5 border border-white/20">
                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-1">{amt}</div>
                    <div className="text-green-100 text-xs sm:text-sm">{label}</div>
                  </div>
                ))}
              </div>
              <Button size="lg" onClick={onRegisterClick}
                className="bg-white text-green-700 hover:bg-green-50 font-bold px-10 py-6 text-base rounded-xl shadow-xl">
                Apply for Subsidy Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section id="plans" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border border-green-500/30">Pricing Plans</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Solar Plans & Pricing</h2>
            <p className="text-gray-400 text-lg">Transparent pricing with government subsidy applied</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div key={i} className={`relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2 ${plan.popular
                ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/10 border-green-500/60 shadow-2xl shadow-green-500/20'
                : 'bg-[#0d1a0d] border-green-900/30 hover:border-green-500/40'
                }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold shadow-lg">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="text-4xl font-extrabold text-green-400 mb-1">{plan.capacity}</div>
                  <div className="text-sm text-gray-500 mb-4">Solar System</div>
                  <div className="text-gray-500 line-through text-sm">{plan.price}</div>
                  <div className="text-sm text-green-400 font-semibold">− {plan.subsidy} subsidy</div>
                  <div className="text-4xl font-extrabold text-white mt-2">{plan.finalPrice}</div>
                  <div className="text-xs text-gray-500 mt-1">after government subsidy</div>
                  {plan.units && <div className="mt-3 text-sm text-emerald-400 font-medium">⚡ {plan.units}</div>}
                </div>

                <ul className="space-y-3 mb-8">
                  {(plan.features || []).map((f: string, j: number) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-green-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button onClick={onRegisterClick}
                  className={`w-full py-5 rounded-xl font-semibold ${plan.popular
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/30 border-0'
                    : 'bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-700/50'
                    }`}>
                  Get This Plan
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-green-900/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border border-green-500/30">Why Us</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Why Choose Orbit Green Power Technology?</h2>
            <p className="text-gray-400 text-lg">Experience excellence in every solar installation</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, title: '10+ Years', sub: 'Industry Experience', desc: 'Trusted expertise in solar installations across Maharashtra and Qulity Is Our Identity' },
              { icon: Shield, title: '25 Years', sub: 'Panel Warranty', desc: 'Comprehensive product and performance warranty on all installations.' },
              { icon: Award, title: 'Premium', sub: 'Brands Only', desc: 'Waaree, Adani, Vikram Solar, Tata Power Solar certified products.' },
              { icon: Users, title: 'Expert', sub: 'Certified Team', desc: 'MNRE certified engineers and trained installation technicians.' },
            ].map(({ icon: Icon, title, sub, desc }) => (
              <div key={title} className="group p-6 rounded-2xl bg-[#0d1a0d] border border-green-900/30 hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5 mx-auto group-hover:bg-green-500/20 transition-colors">
                  <Icon className="h-8 w-8 text-green-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{title}</div>
                <div className="text-green-400 text-sm font-semibold mb-3">{sub}</div>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partner Brands ── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500 text-sm font-medium mb-8 uppercase tracking-widest">Trusted Partner Brands</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
            {BRANDS.map(brand => (
              <div key={brand} className="flex items-center justify-center p-3 sm:p-4 rounded-xl bg-[#0d1a0d] border border-green-900/20 hover:border-green-500/40 transition-all group">
                <span className="text-[10px] sm:text-xs text-gray-500 group-hover:text-green-400 font-medium text-center transition-colors leading-tight">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-green-900/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border border-green-500/30">Testimonials</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">What Our Customers Say</h2>
            <p className="text-gray-400 text-lg">50+ happy customers across India</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 rounded-2xl bg-[#0d1a0d] border border-green-900/30 hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 italic mb-6 leading-relaxed">"{t.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1"><MapPin className="h-3 w-3" />{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border border-green-500/30">Contact Us</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Get In Touch</h2>
            <p className="text-gray-400 text-lg">Our solar experts are ready to help you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Phone, title: 'Phone', lines: ['+91 9763246164', '+91 9552028430'], action: () => window.open('tel:+919763246164') },
              { icon: Mail, title: 'Email', lines: ['orbitgpt22@gmail.com', 'rahulghodeswar99@gmail.com'], action: () => window.open('mailto:orbitgpt22@gmail.com') },
              { icon: MapPin, title: 'Address', lines: ['CH. Sambhaji Chowk, Rendal', 'Tal-Hatkalange, Kolhapur - 416203'], action: undefined },
            ].map(({ icon: Icon, title, lines, action }) => (
              <div key={title} onClick={action}
                className={`p-8 rounded-2xl bg-[#0d1a0d] border border-green-900/30 hover:border-green-500/40 transition-all text-center ${action ? 'cursor-pointer hover:-translate-y-1' : ''}`}>
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5 mx-auto">
                  <Icon className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
                {lines.map((l, i) => <p key={i} className="text-gray-400 text-sm">{l}</p>)}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => window.open('https://wa.me/919763246164', '_blank')}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-10 py-6 rounded-xl text-base font-semibold shadow-lg shadow-green-500/20 border-0">
              💬 WhatsApp Us
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.open('tel:+919763246164')}
              className="border-green-700 text-green-400 hover:bg-green-900/30 px-10 py-6 rounded-xl text-base">
              <Phone className="mr-2 h-5 w-5" /> Call Now
            </Button>
            <Button size="lg" onClick={onRegisterClick}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-10 py-6 rounded-xl text-base font-semibold border-0">
              Register Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-green-900/30 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Orbit Green Power Technology Logo" className="w-12 h-12 object-contain" />
              <div>
                <p className="text-white font-bold">Orbit Green Power Technology</p>
                <p className="text-green-400 text-xs">Invest one Time and Save Money Forever
                  Energy Beyond Limits.
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              {['about', 'services', 'plans', 'contact'].map(s => (
                <button key={s} onClick={() => scrollTo(s)} className="hover:text-green-400 capitalize transition-colors">{s}</button>
              ))}
            </div>
            <p className="text-gray-600 text-sm">© 2026 Orbit Green Power Technology. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
