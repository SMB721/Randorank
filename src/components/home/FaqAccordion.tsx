"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl divide-y divide-trail-200 rounded-2xl border border-trail-200 bg-white">
      {items.map((item, index) => {
        const isOpen = index === openIndex;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-semibold text-trail-900">{item.question}</span>
              <span
                aria-hidden="true"
                className={`shrink-0 text-xl text-summit-500 transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <p className="px-6 pb-5 text-sm leading-relaxed text-trail-700">{item.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}