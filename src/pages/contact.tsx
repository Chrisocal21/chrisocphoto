import Layout from '@/components/Layout'
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa'
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add actual form submission logic here
  };
  
  return (
    <Layout title="Contact - ChrisOC Photo">
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="glass-card p-8 rounded-2xl mb-8">
          <h1 className="text-3xl font-light mb-8 border-b pb-2">Get In Touch</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-light mb-4">Contact Information</h2>
              <p className="text-lg mb-6">
                I'd love to hear from you! Whether you're interested in booking a photoshoot, 
                purchasing prints, or just want to chat about photography.
              </p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <h3 className="text-lg font-medium">Email</h3>
                  <p className="text-white/70">info@chrisocphoto.com</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Based in</h3>
                  <p className="text-white/70">New York, NY</p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-3">Follow me</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-white/70 hover:text-white text-2xl">
                  <FaInstagram />
                </a>
                <a href="#" className="text-white/70 hover:text-white text-2xl">
                  <FaFacebook />
                </a>
                <a href="#" className="text-white/70 hover:text-white text-2xl">
                  <FaTwitter />
                </a>
                <a href="#" className="text-white/70 hover:text-white text-2xl">
                  <FaLinkedin />
                </a>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-light mb-4">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="neo-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="neo-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white/70 mb-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="neo-input"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Write your message here..."
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="neo-button py-2 px-6 w-full"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
