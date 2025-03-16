import Layout from '@/components/Layout'
import Image from 'next/image'

export default function About() {
  return (
    <Layout title="About - ChrisOC Photo">
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="glass-card p-8 rounded-2xl mb-8">
          <h1 className="text-3xl font-light mb-8 border-b pb-2">About Me</h1>
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="lg:w-1/3">
              <div className="rounded-lg overflow-hidden shadow-lg">
                {/* Replace with your headshot image */}
                <div className="bg-gray-200 h-80 w-full relative">
                  <Image 
                    src="/images/placeholder/image-placeholder.jpg" 
                    alt="Chris OC - Photographer" 
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
            
            <div className="lg:w-2/3">
              <h2 className="text-2xl font-light mb-4">Hi, I'm Chris</h2>
              <p className="text-lg leading-relaxed mb-4">
                Professional photographer based in [Your Location] specializing in landscape, portrait, and event photography. With [X] years of experience behind the lens, I've developed a unique style that captures both the beauty of natural environments and the authentic emotions of human subjects.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                My passion for photography began when [brief story about how you got started]. Since then, I've had the privilege of [mention notable experiences, travels, or achievements related to your photography].
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-opacity-20 bg-blue-500 rounded-full text-sm">Landscapes</span>
                <span className="px-3 py-1 bg-opacity-20 bg-green-500 rounded-full text-sm">Portraits</span>
                <span className="px-3 py-1 bg-opacity-20 bg-purple-500 rounded-full text-sm">Events</span>
                <span className="px-3 py-1 bg-opacity-20 bg-amber-500 rounded-full text-sm">Nature</span>
                <span className="px-3 py-1 bg-opacity-20 bg-red-500 rounded-full text-sm">Wildlife</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-8 rounded-2xl mb-8">
          <h2 className="text-2xl font-light mb-4 border-b pb-2">My Approach</h2>
          <p className="text-lg leading-relaxed mb-4">
            I believe photography is about [your philosophy on photography]. When I work with clients or on personal projects, I focus on [what's important to you in your photography process].
          </p>
          <p className="text-lg leading-relaxed mb-4">
            Whether I'm capturing sweeping landscapes at golden hour or intimate moments at a wedding, my goal is always to [what you aim to achieve with your photography].
          </p>
        </div>
        
        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-light mb-4 border-b pb-2">Equipment & Expertise</h2>
          <p className="text-lg leading-relaxed mb-4">
            I primarily shoot with [your camera equipment], paired with [favorite lenses]. For post-processing, I use [software you use] to ensure every image meets my high standards.
          </p>
          
          <h3 className="text-xl font-light mt-6 mb-3">Areas of Expertise:</h3>
          <ul className="list-disc pl-5 text-lg space-y-2">
            <li>Landscape Photography - [brief description of your approach]</li>
            <li>Portrait Photography - [brief description of your style]</li>
            <li>Event Coverage - [what makes your event photography special]</li>
            <li>[Any other specialty] - [brief description]</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
