import Layout from '@/components/Layout'

export default function Admin() {
  return (
    <Layout title="Admin - ChrisOC Photo">
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="glass-card p-8 rounded-2xl">
          <h1 className="text-3xl font-light mb-6">Admin Panel</h1>
          <p className="text-lg">Please log in to access admin features.</p>
        </div>
      </div>
    </Layout>
  )
}
