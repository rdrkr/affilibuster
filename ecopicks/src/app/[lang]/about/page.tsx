// Copyright (c) 2025 Affilibuster by Ronen Druker.

import Image from 'next/image'

const About = () => {
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Making Sustainable Shopping <span className="text-primary">Simple</span>
          </h1>
          <p className="text-lg text-text-secondary-dark max-w-2xl mx-auto">
            Our core mission is to empower consumers to make environmentally conscious decisions effortlessly.
          </p>
        </div>

        <div className="mb-16 rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative h-80">
          <Image
            alt="Forest canopy looking up"
            className="object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmgVvBmOOVWoBETpzPo1TF72IwO4zSdGoq3d70sb2UVLu8FemW89Kop1NGHble_fOf4Q3k70L1j8aCxL01WunEcilQYrQq4FMAi175dqZOdwLVulpoYm1En0R083GNqkihKN0wvJnQEx3Fwph55tSTH7o9svSQc79w9zIFudI9tgNzXpEdRcR8FRVibsdubAqV92o6x9b6BvQOPHgW4HRJ5p8vp10Os5oHyzgVW1mZwpw1GX-pWnlTX7C3BXr2RNa7iYZpwQJGYro"
            fill
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">The Story Behind the App</h2>
            <div className="prose prose-invert text-text-secondary-dark">
              <p className="mb-4">
                It started with a simple question: &quot;How can we make it easier for everyone to support businesses
                that are doing good for the planet?&quot;
              </p>
              <p>
                We saw a gap between people wanting to shop sustainably and the difficulty of finding truly eco-friendly
                products. That&apos;s why we built this platform—to bridge that gap and create a community dedicated to
                conscious consumerism.
              </p>
            </div>
          </div>
          <div className="space-y-6">
            {[
              {
                title: 'Planet First',
                icon: 'public',
                desc: 'Prioritizing the health of our ecosystem in every decision we make.',
              },
              {
                title: 'Ethical Partnerships',
                icon: 'handshake',
                desc: 'We partner exclusively with brands that meet high standards.',
              },
              {
                title: 'Empowering Consumers',
                icon: 'groups',
                desc: 'Providing tools and knowledge to shop with your values.',
              },
            ].map(value => (
              <div key={value.title} className="bg-surface-dark p-6 rounded-xl border border-white/5 flex gap-4">
                <div className="bg-background-dark p-3 rounded-full h-fit text-primary">
                  <span className="material-symbols-outlined">{value.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-text-secondary-dark text-sm">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-12">The People Driving Change</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                name: 'Alex Johnson',
                role: 'Founder & CEO',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6IPClW4mWWlHDlBL_-xLxtNj9T-py2VGJ2x-rcPewdrt3unKPLZnV2BDCRY9AIbQ--81Rf57BzGzqcOXBVrMVkogbaAecdtAEKneR-KnQ4FJ26mbpBjIEfdUU5NVq_vG351mO2ei8rg6uOwzT5p5tCiUE5HM07YE_EjfoBV67k00uPlXoosBuM5yYla-G_VQymtGQTa2QOl9VThd330ZHla1KyzUdL1AEWPCg89zMlVZvDWL-7EmgG_f7Zz8BAuEjyinimDIcTUI',
              },
              {
                name: 'Maria Garcia',
                role: 'Head of Sustainability',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5nyEFjd2j2Lo6jGCMVNsPr8eZ_if92EOfJ1AJLL82yFosed73YsRJolbIz_wC8cd90mUtLDGRAR40_m4q3KbdbwFIP0YyEiUSLnquqXZJuI-fgnDoieiw31bMMT1O05f42Tw-Lzqty6duYeFIO7OfQ3jIrgZ6G5lKlHBh7BH7vQDZmrptdfEB-aTqozZxCqsnYjxuywDtYH1aYXgz8jAzamM4i9nkvr3Uespxs5mMcJzXu7p5VBEa8gINiMv_FmgSjxgWl5iahtM',
              },
              {
                name: 'David Chen',
                role: 'Lead Developer',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR7i2yKzxvLOvP1yJOCAoHYM-jNNXsx-4OXmcO3wEtNICHCgEeSkbiK8nkCnxDIWSiWgleqY8BwcqNkLepxYdLp_30t2vhhqWS-V_DDIpc0tiSwu2dsT4sZiT642x6XhnQ0T5W-83vvXA5patIrWsExXibSWbTN9nVr28FtpC9fIsXv-dVXjYLyzgG4RxJXvW8ylfRCDgZXMnK16fBTXwzkc2ysn8VE4wxzENaYx6IsSg6MavqR_2DqMoIttMVr7BPPLSGtjQqwfQ',
              },
            ].map(person => (
              <div
                key={person.name}
                className="bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-primary p-1 relative">
                  <Image src={person.img} alt={person.name} fill className="rounded-full object-cover" sizes="96px" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {person.name}
                </h3>
                <p className="text-text-secondary-dark text-sm mt-1">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
