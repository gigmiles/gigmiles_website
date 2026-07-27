'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function CallbackInner() {
  const params = useSearchParams()
  const code = params.get('code')
  const error = params.get('error')
  const errorDescription = params.get('error_description')

  return (
    <div className="min-h-screen bg-[#0E4F4F] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a
          href="/"
          className="text-[#5EEAD4] text-sm font-medium hover:text-[#5EEAD4] transition-colors"
        >
          ← GigMiles
        </a>
        <h1 className="text-2xl font-semibold text-white mt-8 mb-6">
          TikTok authorization
        </h1>

        {code ? (
          <>
            <p className="mb-4">
              Authorization worked. Copy the code below and send it to whoever
              asked you to open this link — that is the whole job of this page.
            </p>
            <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto break-all whitespace-pre-wrap text-[#5EEAD4] text-sm">
              {code}
            </pre>
          </>
        ) : error ? (
          <>
            <p className="mb-4">TikTok returned an error instead of a code:</p>
            <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto break-all whitespace-pre-wrap text-red-300 text-sm">
              {error}
              {errorDescription ? `\n${errorDescription}` : ''}
            </pre>
          </>
        ) : (
          <p>
            Nothing to see here — this page only does something at the end of a
            TikTok authorization link.
          </p>
        )}
      </div>
    </div>
  )
}

export default function CallbackClient() {
  // useSearchParams requires a Suspense boundary during prerender.
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  )
}
