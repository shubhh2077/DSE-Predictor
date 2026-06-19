import { PredictionForm } from './components/PredictionForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-purple-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            DSE College Predictor
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
            Predict your Direct Second Year Engineering admission chances using historical CAP cutoff data.
          </p>
        </div>

        <PredictionForm />

        <footer className="mt-24 text-center border-t border-white/10 pt-8 pb-4">
          <p className="text-sm text-zinc-500 max-w-3xl mx-auto">
            Disclaimer: Predictions are based on historical CAP cutoff data and are for informational purposes only. Admission is not guaranteed.
          </p>
        </footer>
      </main>
    </div>
  )
}
