import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // ISR: revalidate every hour
import { medusaServerClient } from '@/lib/medusa-client'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronRight,
  Download,
  Smartphone,
  Infinity as InfinityIcon,
  ShieldCheck,
  BookOpen,
  FileText,
  Star,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import ProductActions from '@/components/product/product-actions'
import BundleProductActions from '@/components/product/bundle-product-actions'
import ProductAccordion from '@/components/product/product-accordion'
import { ProductViewTracker } from '@/components/product/product-view-tracker'
import { getProductPlaceholder } from '@/lib/utils/placeholder-images'
import { type VariantExtension } from '@/components/product/product-price'

// Handle of the bundle / upsell product offered on every primary ebook's page.
const BUNDLE_HANDLE = 'the-complete-library'

async function getProduct(handle: string) {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) throw new Error('No region found')

    const response = await medusaServerClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '*variants.calculated_price',
    })
    return response.products?.[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getVariantExtensions(
  productId: string,
): Promise<Record<string, VariantExtension>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const headers: Record<string, string> = {}
    if (storeId) headers['X-Store-Environment-ID'] = storeId
    if (publishableKey) headers['x-publishable-api-key'] = publishableKey

    const res = await fetch(
      `${baseUrl}/store/product-extensions/products/${productId}/variants`,
      { headers, next: { revalidate: 30 } },
    )
    if (!res.ok) return {}

    const data = await res.json()
    const map: Record<string, VariantExtension> = {}
    for (const v of data.variants || []) {
      map[v.id] = {
        compare_at_price: v.compare_at_price,
        allow_backorder: v.allow_backorder ?? false,
        inventory_quantity: v.inventory_quantity,
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.title,
    description: product.description || `Shop ${product.title}`,
    openGraph: {
      title: product.title,
      description: product.description || `Shop ${product.title}`,
      ...(product.thumbnail ? { images: [{ url: product.thumbnail }] } : {}),
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  const variantExtensions = await getVariantExtensions(product.id)

  // Fetch bundle upsell (skip if this is the bundle itself)
  const isBundle = product.handle === BUNDLE_HANDLE
  const bundleProduct = isBundle ? null : await getProduct(BUNDLE_HANDLE)
  const bundleExtensions = bundleProduct ? await getVariantExtensions(bundleProduct.id) : {}

  const allImages = [
    ...(product.thumbnail ? [{ url: product.thumbnail }] : []),
    ...(product.images || []).filter((img: any) => img.url !== product.thumbnail),
  ]

  const displayImages =
    allImages.length > 0 ? allImages : [{ url: getProductPlaceholder(product.id) }]

  // Use the enhanced bundle-aware actions on all non-bundle ebook pages
  const useEnhanced = !isBundle && bundleProduct

  return (
    <>
      {/* Breadcrumbs */}
      <div className="border-b">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-foreground transition-colors">
              Library
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-sm">
              <Image
                src={displayImages[0].url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {/* Format badge */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-background/90 backdrop-blur px-3 py-1.5 text-[10px] uppercase tracking-widest font-semibold">
                <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
                Digital Ebook
              </div>
            </div>

            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {displayImages.slice(1, 5).map((image: any, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] overflow-hidden bg-muted rounded-sm"
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} ${idx + 2}`}
                      fill
                      sizes="12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Reader stats strip — social proof below images */}
            <div className="hidden lg:grid grid-cols-3 gap-3 pt-6">
              <div className="border p-4 text-center">
                <Users className="h-5 w-5 mx-auto mb-1.5" strokeWidth={1.5} />
                <p className="font-heading text-lg font-semibold">12,400+</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Readers
                </p>
              </div>
              <div className="border p-4 text-center">
                <Star className="h-5 w-5 mx-auto mb-1.5 fill-accent text-accent" strokeWidth={1.5} />
                <p className="font-heading text-lg font-semibold">4.9 / 5</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Reader Panel
                </p>
              </div>
              <div className="border p-4 text-center">
                <FileText className="h-5 w-5 mx-auto mb-1.5" strokeWidth={1.5} />
                <p className="font-heading text-lg font-semibold">3 Formats</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  PDF · EPUB · MOBI
                </p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Title & Subtitle */}
            <div>
              {product.subtitle && (
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  {product.subtitle}
                </p>
              )}
              <h1 className="text-4xl sm:text-5xl font-heading font-semibold leading-tight">
                {product.title}
              </h1>

              {/* Rating pill */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-accent text-accent"
                      strokeWidth={1}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  4.9 from 820+ readers
                </span>
              </div>
            </div>

            <ProductViewTracker
              productId={product.id}
              productTitle={product.title}
              variantId={product.variants?.[0]?.id || null}
              currency={product.variants?.[0]?.calculated_price?.currency_code || 'usd'}
              value={product.variants?.[0]?.calculated_price?.calculated_amount ?? null}
            />

            {/* Price + Variant + Bundle + Add to Cart */}
            {useEnhanced ? (
              <BundleProductActions
                product={product}
                variantExtensions={variantExtensions}
                bundleProduct={bundleProduct}
                bundleVariantExtensions={bundleExtensions}
              />
            ) : (
              <ProductActions product={product} variantExtensions={variantExtensions} />
            )}

            {/* "What you get" at-a-glance */}
            <div className="border-t pt-6">
              <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-4">
                What you'll receive
              </p>
              <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
                {[
                  { icon: Download, label: 'Instant download' },
                  { icon: FileText, label: 'PDF · EPUB · MOBI' },
                  { icon: Smartphone, label: 'Any device' },
                  { icon: InfinityIcon, label: 'Lifetime access' },
                  { icon: CheckCircle2, label: 'Free updates' },
                  { icon: Lock, label: 'DRM-free' },
                ].map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2.5 text-sm text-foreground/85"
                  >
                    <Icon className="h-4 w-4 text-accent shrink-0" strokeWidth={1.5} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Accordion Sections */}
            <ProductAccordion
              description={product.description}
              details={product.metadata as Record<string, string> | undefined}
            />
          </div>
        </div>
      </div>

      {/* ───────── FEATURED REVIEW QUOTE ───────── */}
      <section className="border-y bg-muted/40 py-16">
        <div className="container-custom max-w-3xl text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-5 w-5 fill-accent text-accent" strokeWidth={1} />
            ))}
          </div>
          <blockquote className="text-2xl sm:text-3xl font-heading font-medium italic leading-snug text-balance">
            "If I'd had this five years ago, I would have shipped three more products and
            finished two more side projects. It's that kind of book."
          </blockquote>
          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Jordan P. · Staff Engineer
          </p>
        </div>
      </section>

      {/* ───────── TRUST / FAQ TEASER ───────── */}
      <section className="py-16">
        <div className="container-custom max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border p-6 space-y-3">
              <ShieldCheck className="h-6 w-6 text-accent" strokeWidth={1.5} />
              <h3 className="font-heading text-lg font-semibold">
                30-day, no-questions-asked refund
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Read the whole thing. Try the systems. If it doesn't change a single thing
                about your work, reply to your order email and we'll refund you. Keep the
                files — we trust you.
              </p>
            </div>
            <div className="border p-6 space-y-3">
              <Lock className="h-6 w-6 text-accent" strokeWidth={1.5} />
              <h3 className="font-heading text-lg font-semibold">
                Secure checkout, instant delivery
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                256-bit SSL checkout processed by Stripe. Your download links land in your
                inbox the moment your payment clears — usually under 60 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
