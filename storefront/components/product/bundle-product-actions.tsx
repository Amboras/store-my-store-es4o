'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/hooks/use-cart'
import {
  Minus,
  Plus,
  Check,
  Loader2,
  Sparkles,
  ShieldCheck,
  Lock,
  Download,
  Infinity as InfinityIcon,
  Flame,
} from 'lucide-react'
import { toast } from 'sonner'
import ProductPrice, { type VariantExtension } from './product-price'
import { formatPrice } from '@/lib/utils/format-price'
import { trackAddToCart } from '@/lib/analytics'
import { trackMetaEvent, toMetaCurrencyValue } from '@/lib/meta-pixel'
import type { Product } from '@/types'

type LooseProduct = Product & {
  thumbnail?: string | null
  metadata?: Record<string, unknown> | null
}

interface BundleOffer {
  id: 'single' | 'bundle'
  label: string
  subLabel: string
  priceCents: number
  compareAtCents?: number | null
  badge?: string
  variantId: string
  productTitle: string
  productThumbnail?: string | null
  perks: string[]
  saves?: string
}

interface BundleProductActionsProps {
  product: LooseProduct
  variantExtensions?: Record<string, VariantExtension>
  /** The bundle / upsell product (Complete Library) */
  bundleProduct?: LooseProduct | null
  bundleVariantExtensions?: Record<string, VariantExtension>
}

interface VariantWithPrice {
  id: string
  calculated_price?:
    | { calculated_amount?: number; currency_code?: string }
    | number
  [key: string]: unknown
}

function getVariantPriceAmount(variant: VariantWithPrice | undefined): number | null {
  const cp = variant?.calculated_price
  if (!cp) return null
  return typeof cp === 'number' ? cp : cp.calculated_amount ?? null
}

export default function BundleProductActions({
  product,
  variantExtensions,
  bundleProduct,
  bundleVariantExtensions,
}: BundleProductActionsProps) {
  const variants = useMemo(
    () => ((product.variants || []) as unknown as VariantWithPrice[]),
    [product.variants],
  )
  const primaryVariant = variants[0]
  const primaryPrice = getVariantPriceAmount(primaryVariant) ?? 0
  const primaryExt = primaryVariant?.id ? variantExtensions?.[primaryVariant.id] : null
  const currency =
    (primaryVariant?.calculated_price && typeof primaryVariant.calculated_price !== 'number'
      ? primaryVariant.calculated_price.currency_code
      : undefined) || 'usd'

  const bundleVariants = useMemo(
    () => ((bundleProduct?.variants || []) as unknown as VariantWithPrice[]),
    [bundleProduct],
  )
  const bundleVariant = bundleVariants[0]
  const bundlePrice = getVariantPriceAmount(bundleVariant) ?? 0
  const bundleExt = bundleVariant?.id ? bundleVariantExtensions?.[bundleVariant.id] : null

  // Stock + inventory for single product
  const allowBackorder = primaryExt?.allow_backorder ?? false
  const inventoryQuantity = primaryExt?.inventory_quantity
  const isOutOfStock =
    !allowBackorder && inventoryQuantity != null && inventoryQuantity <= 0

  // Build offers
  const offers: BundleOffer[] = []
  if (primaryVariant?.id) {
    offers.push({
      id: 'single',
      label: 'Just this title',
      subLabel: product.title || 'Digital Edition',
      priceCents: primaryPrice,
      compareAtCents: primaryExt?.compare_at_price,
      variantId: primaryVariant.id,
      productTitle: product.title || '',
      productThumbnail: product.thumbnail,
      perks: ['PDF, EPUB & MOBI', 'Lifetime access'],
    })
  }
  if (bundleVariant?.id && bundleProduct) {
    const savings =
      bundleExt?.compare_at_price != null
        ? bundleExt.compare_at_price - bundlePrice
        : null
    offers.push({
      id: 'bundle',
      label: bundleProduct.title || 'The Complete Library',
      subLabel: 'All 3 titles + exclusive bonus',
      priceCents: bundlePrice,
      compareAtCents: bundleExt?.compare_at_price,
      badge: 'Best Value',
      variantId: bundleVariant.id,
      productTitle: bundleProduct.title || '',
      productThumbnail: bundleProduct.thumbnail,
      perks: [
        '3 full titles + bonus ebook',
        'Save ' + (savings ? formatPrice(savings, currency) : '55%'),
      ],
      saves: savings ? formatPrice(savings, currency) : undefined,
    })
  }

  const [selectedOfferId, setSelectedOfferId] = useState<'single' | 'bundle'>(
    offers.find((o) => o.id === 'bundle') ? 'bundle' : 'single',
  )
  const selectedOffer = offers.find((o) => o.id === selectedOfferId) || offers[0]

  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const { addItem, isAddingItem } = useCart()

  const handleAddToCart = () => {
    if (!selectedOffer || isOutOfStock) return
    addItem(
      { variantId: selectedOffer.variantId, quantity },
      {
        onSuccess: () => {
          setJustAdded(true)
          toast.success(
            selectedOffer.id === 'bundle'
              ? 'Complete Library added to bag'
              : 'Added to bag',
          )
          const metaValue = toMetaCurrencyValue(selectedOffer.priceCents)
          trackAddToCart(
            selectedOffer.id === 'bundle' ? bundleProduct?.id || '' : product.id || '',
            selectedOffer.variantId,
            quantity,
            selectedOffer.priceCents,
          )
          trackMetaEvent('AddToCart', {
            content_ids: [selectedOffer.variantId],
            content_type: 'product',
            content_name: selectedOffer.productTitle,
            value: metaValue,
            currency,
            contents: [
              { id: selectedOffer.variantId, quantity, item_price: metaValue },
            ],
            num_items: quantity,
          })
          setTimeout(() => setJustAdded(false), 2000)
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to add to bag')
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero price + compare-at for currently selected offer */}
      <div className="space-y-1">
        <ProductPrice
          amount={selectedOffer?.priceCents ?? null}
          currency={currency}
          compareAtPrice={selectedOffer?.compareAtCents}
          size="detail"
        />
        {selectedOffer?.saves && (
          <p className="text-xs text-accent font-semibold uppercase tracking-widest">
            You save {selectedOffer.saves}
          </p>
        )}
      </div>

      {/* Urgency: low stock / limited launch pricing */}
      {isOutOfStock ? (
        <p className="text-sm font-semibold text-destructive">Currently unavailable</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {inventoryQuantity != null && inventoryQuantity < 60 && (
            <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-2.5 py-1.5 font-semibold uppercase tracking-widest">
              <Flame className="h-3.5 w-3.5" strokeWidth={2} />
              Launch price — only {inventoryQuantity} at this price
            </span>
          )}
          <LaunchCountdown />
        </div>
      )}

      {/* Bundle / Single Offer Selector */}
      {offers.length > 1 && (
        <fieldset className="space-y-3">
          <legend className="text-xs uppercase tracking-widest font-semibold mb-2">
            Choose Your Option
          </legend>
          {offers.map((offer) => {
            const selected = selectedOfferId === offer.id
            return (
              <button
                key={offer.id}
                type="button"
                onClick={() => setSelectedOfferId(offer.id)}
                aria-pressed={selected}
                className={`w-full text-left group relative border transition-all p-4 flex items-start gap-4 ${
                  selected
                    ? 'border-foreground bg-foreground/[0.03] ring-2 ring-foreground/10'
                    : 'border-border hover:border-foreground/50'
                }`}
              >
                {/* Radio indicator */}
                <div
                  className={`mt-1 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    selected ? 'border-foreground' : 'border-muted-foreground'
                  }`}
                >
                  {selected && (
                    <div className="h-2 w-2 rounded-full bg-foreground" />
                  )}
                </div>

                {/* Thumbnail */}
                {offer.productThumbnail && (
                  <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden bg-muted rounded-sm">
                    <Image
                      src={offer.productThumbnail}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-heading font-semibold text-base leading-tight">
                          {offer.label}
                        </p>
                        {offer.badge && (
                          <span className="inline-flex items-center gap-1 bg-accent text-accent-foreground text-[10px] uppercase tracking-widest px-1.5 py-0.5 font-semibold">
                            <Sparkles className="h-3 w-3" strokeWidth={2} />
                            {offer.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {offer.subLabel}
                      </p>
                      <ul className="mt-2 space-y-0.5">
                        {offer.perks.map((perk) => (
                          <li
                            key={perk}
                            className="text-xs flex items-start gap-1.5 text-foreground/80"
                          >
                            <Check className="h-3 w-3 text-accent mt-0.5" strokeWidth={2.5} />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {offer.compareAtCents && offer.compareAtCents > offer.priceCents && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(offer.compareAtCents, currency)}
                        </p>
                      )}
                      <p className="font-heading text-lg font-semibold">
                        {formatPrice(offer.priceCents, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </fieldset>
      )}

      {/* Quantity + Add to Cart */}
      <div className="flex gap-3">
        <div className="flex items-center border">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 hover:bg-muted transition-colors"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium tabular-nums">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-3 hover:bg-muted transition-colors"
            disabled={isOutOfStock}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingItem || !selectedOffer}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold uppercase tracking-widest transition-all ${
            isOutOfStock
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : justAdded
                ? 'bg-green-700 text-white'
                : 'bg-foreground text-background hover:opacity-90'
          }`}
        >
          {isAddingItem ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : justAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added
            </>
          ) : isOutOfStock ? (
            'Sold Out'
          ) : selectedOffer?.id === 'bundle' ? (
            <>Unlock the Library · {formatPrice(selectedOffer.priceCents, currency)}</>
          ) : (
            <>Add to Bag · {formatPrice(selectedOffer?.priceCents ?? 0, currency)}</>
          )}
        </button>
      </div>

      {/* Money-back guarantee */}
      <div className="border bg-muted/30 p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-accent mt-0.5 shrink-0" strokeWidth={1.75} />
        <div>
          <p className="text-sm font-semibold">30-Day Full Refund Guarantee</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Read it. Apply it. If Folio doesn't change your week, email us for a full refund — no questions.
          </p>
        </div>
      </div>

      {/* Trust row */}
      <div className="grid grid-cols-4 gap-2 pt-2">
        {[
          { icon: Download, label: 'Instant Download' },
          { icon: Lock, label: 'Secure Checkout' },
          { icon: InfinityIcon, label: 'Lifetime Access' },
          { icon: ShieldCheck, label: '30-Day Refund' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="text-center">
            <Icon className="h-4 w-4 mx-auto mb-1.5" strokeWidth={1.5} />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ──────────────── Launch Countdown ──────────────── */
function LaunchCountdown() {
  // Fixed window: counts down to end of current week (Sunday 23:59)
  // Stable across renders without hydration mismatch — uses a client-only effect.
  const [remaining, setRemaining] = useState<{ h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    const compute = () => {
      const now = new Date()
      const end = new Date(now)
      const day = now.getDay() // 0 = Sun
      const daysUntilEndOfSunday = (7 - day) % 7
      end.setDate(now.getDate() + daysUntilEndOfSunday)
      end.setHours(23, 59, 59, 999)
      const diff = Math.max(0, end.getTime() - now.getTime())
      const h = Math.floor(diff / 1000 / 60 / 60)
      const m = Math.floor((diff / 1000 / 60) % 60)
      const s = Math.floor((diff / 1000) % 60)
      setRemaining({ h, m, s })
    }
    compute()
    const iv = setInterval(compute, 1000)
    return () => clearInterval(iv)
  }, [])

  if (!remaining) return null

  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <span className="inline-flex items-center gap-2 bg-foreground text-background px-2.5 py-1.5 font-semibold uppercase tracking-widest">
      <Flame className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
      Sale ends in {pad(remaining.h)}:{pad(remaining.m)}:{pad(remaining.s)}
    </span>
  )
}
