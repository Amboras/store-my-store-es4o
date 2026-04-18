'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Download,
  Smartphone,
  Infinity as InfinityIcon,
  Quote,
  CheckCircle2,
  Zap,
} from 'lucide-react'
import ProductGrid from '@/components/product/product-grid'
import { useCollections } from '@/hooks/use-collections'
import { trackMetaEvent } from '@/lib/meta-pixel'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600&q=80'
const EDITORIAL_IMAGE = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80'
const READER_IMAGE = 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1600&q=80'

export default function HomePage() {
  const { data: collections } = useCollections()
  const featured = collections?.find((c) => c.handle === 'featured-reads') || collections?.[0]
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    trackMetaEvent('Lead', {
      content_name: 'newsletter_signup',
      status: 'submitted',
    })
    setSubscribed(true)
  }

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-background paper-grain">
        <div className="container-custom grid lg:grid-cols-12 gap-10 items-center py-16 lg:py-28">
          {/* Text */}
          <div className="lg:col-span-6 space-y-7 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent font-semibold">
              <span className="rule-gold" />
              <span>A Folio Original Series</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-semibold leading-[1.05] tracking-tight text-balance">
              Ebooks that <em className="font-normal text-accent">actually</em> change
              <br className="hidden sm:block" /> the way you work.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Deeply practical guides on focus, mindset, and doing the work.
              Written for the people who'd rather build something than read about it.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
                prefetch
              >
                Browse Library
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products/the-focus-formula"
                className="inline-flex items-center gap-2 border border-foreground px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
                prefetch
              >
                Best-Seller
              </Link>
            </div>

            {/* Feature strip */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t max-w-md">
              <div className="text-xs">
                <Download className="h-4 w-4 mb-1.5" strokeWidth={1.5} />
                <p className="font-semibold">Instant</p>
                <p className="text-muted-foreground">Download</p>
              </div>
              <div className="text-xs">
                <Smartphone className="h-4 w-4 mb-1.5" strokeWidth={1.5} />
                <p className="font-semibold">Any</p>
                <p className="text-muted-foreground">Device</p>
              </div>
              <div className="text-xs">
                <InfinityIcon className="h-4 w-4 mb-1.5" strokeWidth={1.5} />
                <p className="font-semibold">Lifetime</p>
                <p className="text-muted-foreground">Access</p>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="lg:col-span-6 relative animate-fade-in">
            <div className="relative aspect-[4/5] lg:aspect-[5/6] overflow-hidden rounded-sm shadow-2xl">
              <Image
                src={HERO_IMAGE}
                alt="Reading Folio on a tablet"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* Floating stat card */}
            <div className="hidden sm:block absolute -bottom-6 -left-6 bg-background border shadow-xl p-5 max-w-[240px]">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent font-semibold mb-2">
                <Zap className="h-3.5 w-3.5" />
                Read by
              </div>
              <p className="font-heading text-3xl font-semibold">12,400+</p>
              <p className="text-xs text-muted-foreground mt-1">Builders, writers & operators</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── TRUSTED-BY MARQUEE ───────── */}
      <section className="border-y bg-muted/40 py-5 overflow-hidden">
        <div className="flex gap-12 whitespace-nowrap animate-marquee text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex gap-12 shrink-0">
              <span>— Featured in The Daily Read</span>
              <span>— Product Hunt #1 of the Week</span>
              <span>— 4.9 ★ average reader rating</span>
              <span>— Adopted by 300+ teams</span>
              <span>— "Quietly brilliant" — IndieHackers</span>
              <span>— Translated in 6 languages</span>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── FEATURED LIBRARY ───────── */}
      <section className="py-section">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">
                The Library
              </p>
              <h2 className="text-4xl sm:text-5xl font-heading font-semibold max-w-2xl text-balance">
                Short shelves. Long-lasting work.
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest link-underline pb-0.5 whitespace-nowrap"
              prefetch
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid collectionId={featured?.id} limit={6} />
        </div>
      </section>

      {/* ───────── EDITORIAL / STORY ───────── */}
      <section className="py-section bg-foreground text-background">
        <div className="container-custom grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src={EDITORIAL_IMAGE}
                alt="Reading by a window"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">
              Our Editorial Standard
            </p>
            <h2 className="text-4xl sm:text-5xl font-heading font-semibold text-balance leading-tight">
              We'd rather publish one book that works than ten that don't.
            </h2>
            <p className="text-background/70 text-lg leading-relaxed max-w-xl">
              Every Folio title is ruthlessly edited, privately tested with a closed reader
              panel, and revised until it passes one test: does applying this actually
              change the reader's output within 30 days?
            </p>
            <ul className="space-y-3 pt-4">
              {[
                'Research-backed — no motivational filler',
                'Field-tested with real operators before release',
                'Updated for life — every revision is free',
                'DRM-free PDF, EPUB & MOBI included',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-background/90">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" strokeWidth={1.75} />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── REVIEW PULL-QUOTE ───────── */}
      <section className="py-section">
        <div className="container-custom max-w-3xl text-center">
          <Quote className="h-10 w-10 mx-auto text-accent mb-8" strokeWidth={1.25} />
          <blockquote className="text-3xl sm:text-4xl font-heading font-medium italic leading-snug text-balance">
            "I've read a hundred productivity books. Folio is the first one I actually finished —
            and the first one that changed a single thing about my week."
          </blockquote>
          <p className="mt-8 text-sm uppercase tracking-[0.25em] text-muted-foreground">
            M. Ravenna · Engineering Director
          </p>
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section className="py-section bg-muted/40">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">
              How Folio Works
            </p>
            <h2 className="text-4xl sm:text-5xl font-heading font-semibold text-balance">
              From checkout to chapter one in 60 seconds.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: BookOpen,
                step: '01',
                title: 'Pick your title',
                body: 'Every Folio ebook is self-contained — start with the one that matches what you\'re working on now.',
              },
              {
                icon: Download,
                step: '02',
                title: 'Download instantly',
                body: 'PDF, EPUB, and MOBI land in your inbox the moment you check out. No waiting. No accounts.',
              },
              {
                icon: Smartphone,
                step: '03',
                title: 'Read anywhere',
                body: 'Kindle, iPad, phone, desktop — your Folio works everywhere, forever. Updates are always free.',
              },
            ].map(({ icon: Icon, step, title, body }) => (
              <div key={step} className="relative bg-background border p-8 hover:shadow-lg transition-shadow">
                <span className="absolute top-6 right-6 text-xs font-heading text-accent font-semibold tracking-widest">
                  {step}
                </span>
                <Icon className="h-8 w-8 text-foreground mb-6" strokeWidth={1.25} />
                <h3 className="font-heading text-xl font-semibold mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── REVIEW WALL (static, no module) ───────── */}
      <section className="py-section">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">
              From the Reader Panel
            </p>
            <h2 className="text-4xl sm:text-5xl font-heading font-semibold text-balance">
              Short reads. Loud reactions.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: 'Finally — a book that respects my time. 180 pages, zero padding, every chapter actionable.',
                name: 'J. Park',
                role: 'Founder, Grovewell',
              },
              {
                quote: 'Mind Over Matter turned my morning journaling from performance into an actual tool.',
                name: 'A. Mensah',
                role: 'Product Lead, Atlas',
              },
              {
                quote: 'The Complete Library paid for itself in the first week. I shipped more in 7 days than the prior month.',
                name: 'S. Oliveira',
                role: 'Indie Developer',
              },
            ].map((r) => (
              <figure key={r.name} className="border bg-background p-8 space-y-4">
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <svg key={i} className="h-4 w-4 fill-accent" viewBox="0 0 20 20">
                      <path d="M10 1l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L10 15.8 4.2 18.9l1.1-6.5L.6 7.8l6.5-.9L10 1z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed font-heading text-lg">
                  "{r.quote}"
                </blockquote>
                <figcaption className="pt-2 border-t">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── LIFESTYLE / FINAL CTA ───────── */}
      <section className="relative overflow-hidden">
        <div className="relative h-[60vh] min-h-[480px]">
          <Image
            src={READER_IMAGE}
            alt="Focused reading"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-foreground/70" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="text-center text-background max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-4">
                Start Today
              </p>
              <h2 className="text-4xl sm:text-6xl font-heading font-semibold leading-tight text-balance">
                The shortest distance between reading and doing.
              </h2>
              <Link
                href="/products"
                className="mt-10 inline-flex items-center gap-2 bg-background text-foreground px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Enter the Library
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── NEWSLETTER ───────── */}
      <section className="py-section bg-muted/40">
        <div className="container-custom max-w-xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">
            The Margin Notes
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-semibold text-balance">
            One email. Every Sunday. Worth your time.
          </h2>
          <p className="mt-4 text-muted-foreground">
            A single idea from our editors, a quote we're sitting with, and early
            access to new titles before they go public.
          </p>
          {subscribed ? (
            <p className="mt-8 inline-flex items-center gap-2 text-sm text-accent">
              <CheckCircle2 className="h-4 w-4" /> You're on the list. Check your inbox.
            </p>
          ) : (
            <form className="mt-8 flex gap-2" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 border-b border-foreground/30 bg-transparent px-1 py-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="bg-foreground text-background px-6 py-3 text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
          <p className="mt-4 text-xs text-muted-foreground">No spam, ever. Unsubscribe in one click.</p>
        </div>
      </section>
    </>
  )
}
