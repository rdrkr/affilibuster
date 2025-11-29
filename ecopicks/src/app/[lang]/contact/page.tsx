// Copyright (c) 2025 Affilibuster by Ronen Druker.

const Contact = () => {
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contact & Support</h1>
          <p className="text-text-secondary-dark text-lg">
            We&apos;re here to help. Check our FAQs or send us a message.
          </p>
        </div>

        <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden mb-12">
          <div className="flex border-b border-white/5">
            <button className="flex-1 py-4 text-center font-bold text-primary border-b-2 border-primary bg-white/5">
              Contact Us
            </button>
            <button className="flex-1 py-4 text-center font-bold text-text-secondary-dark hover:text-white transition-colors">
              FAQs
            </button>
          </div>

          <div className="p-8 md:p-12">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary-dark mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full bg-background-dark border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary-dark mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full bg-background-dark border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Your email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary-dark mb-2">Message</label>
                <textarea
                  rows={6}
                  className="w-full bg-background-dark border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button className="w-full bg-primary text-background-dark font-bold py-4 rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface-dark p-8 rounded-2xl border border-white/5">
            <span className="material-symbols-outlined text-4xl text-primary mb-4">mail</span>
            <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
            <p className="text-text-secondary-dark mb-4">For general inquiries and support.</p>
            <a href="mailto:support@ecopicks.com" className="text-primary font-semibold hover:underline">
              support@ecopicks.com
            </a>
          </div>
          <div className="bg-surface-dark p-8 rounded-2xl border border-white/5">
            <span className="material-symbols-outlined text-4xl text-primary mb-4">call</span>
            <h3 className="text-xl font-bold text-white mb-2">Call Us</h3>
            <p className="text-text-secondary-dark mb-4">Mon-Fri from 9am to 5pm EST.</p>
            <a href="tel:+15551234567" className="text-primary font-semibold hover:underline">
              +1 (555) 123-4567
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
