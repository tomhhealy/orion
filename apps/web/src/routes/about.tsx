import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Runtime Notes</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Orion web is the authenticated surface area.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          Keep product routes, authenticated data flows, and the renderer-side
          desktop bridge integration here. The marketing site remains separate,
          and Electron only wraps this app instead of reimplementing it.
        </p>
      </section>
    </main>
  )
}
