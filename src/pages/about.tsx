import Layout from '@/components/Layout'

export default function About() {
  return (
    <Layout title="About - ChrisOC Photo">
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="glass-card p-8 rounded-2xl">
          <h1 className="text-3xl font-light mb-6">About Me</h1>
          <p className="text-lg leading-relaxed mb-4">
            Professional photographer specializing in landscape, portrait, and event photography.
          </p>
        </div>
      </div>
    </Layout>
  )
}
