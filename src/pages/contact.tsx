import Layout from '@/components/Layout'

export default function Contact() {
  return (
    <Layout title="Contact - ChrisOC Photo">
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="glass-card p-8 rounded-2xl">
          <h1 className="text-3xl font-light mb-6">Contact</h1>
          <form className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/20"
            />
            <textarea
              placeholder="Message"
              rows={4}
              className="w-full px-4 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/20"
            />
            <button className="ios-button">Send Message</button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
