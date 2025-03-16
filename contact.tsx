import Layout from '@/components/Layout'
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa'

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
          
          <div className="mt-8 pt-6 border-t border-white/20">
            <h2 className="text-xl font-light mb-4">Connect With Me</h2>
            <div className="flex space-x-4">
              <a href="https://instagram.com/chrisocphoto" target="_blank" rel="noopener noreferrer" 
                 className="p-3 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition-all">
                <FaInstagram size={24} />
              </a>
              <a href="https://facebook.com/chrisocphoto" target="_blank" rel="noopener noreferrer"
                 className="p-3 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition-all">
                <FaFacebook size={24} />
              </a>
              <a href="https://twitter.com/chrisocphoto" target="_blank" rel="noopener noreferrer"
                 className="p-3 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition-all">
                <FaTwitter size={24} />
              </a>
              <a href="https://linkedin.com/in/chrisocphoto" target="_blank" rel="noopener noreferrer"
                 className="p-3 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition-all">
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
