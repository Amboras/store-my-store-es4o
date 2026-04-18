'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface ProductAccordionProps {
  description?: string | null
  details?: Record<string, string>
}

function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        <div className="text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function ProductAccordion({ description, details }: ProductAccordionProps) {
  return (
    <div className="border-t">
      {description && (
        <AccordionItem title="Description" defaultOpen>
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </AccordionItem>
      )}

      <AccordionItem title="Delivery & Formats">
        <ul className="space-y-2">
          <li>Instant delivery — download links emailed the moment your order clears</li>
          <li>PDF, EPUB, and MOBI included in every purchase</li>
          <li>Works on Kindle, iPad, Kobo, Android, iPhone, Mac, PC</li>
          <li>DRM-free — store, back up, and read on unlimited devices</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="Refund Policy">
        <ul className="space-y-2">
          <li>30-day, no-questions-asked refund — full amount, back to your card</li>
          <li>Keep the files, we trust you</li>
          <li>Email hello@folio.shop with your order number to initiate</li>
          <li>Lifetime access and free updates to every future revision</li>
        </ul>
      </AccordionItem>
    </div>
  )
}
