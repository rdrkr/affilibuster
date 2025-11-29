// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Image from 'next/image'
import Link from 'next/link'

const EditProfile = () => {
  return (
    <div className="py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile" className="p-2 rounded-full bg-surface-dark hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </Link>
        <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
      </div>

      <div className="bg-surface-dark rounded-2xl border border-white/5 p-8">
        <div className="flex justify-center mb-8">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOHE4kfwcL91You39zVxg807UpJTDQFj6ZLPqMQbPuKSX3Tjag-PkqYBcItnaKfXN_sP6wA2pAggJn1DThs4_hsU3Y70igrBtXv1bawv3aXE0uNZqWbdGpjoPDuednNeV5htMti3NbyESseZ-kw0c-0xOyMgvfSEcJ9VxecO2oW2iQ8a9cO3QfxNvG7CSTGsrhfpzCUU4zvcCXYhoRuctB0P0Y1WLl0cbmo34rYxUu7t_3Avh6qx62F0NGldsTXOoUOzbJOdHnz08"
                alt="Profile"
                fill
                className="object-cover group-hover:opacity-75 transition-opacity"
                sizes="96px"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-2xl drop-shadow-lg">photo_camera</span>
            </div>
          </div>
        </div>

        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary-dark mb-2">First Name</label>
              <input
                type="text"
                defaultValue="Alex"
                className="w-full bg-background-dark border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary-dark mb-2">Last Name</label>
              <input
                type="text"
                defaultValue="Green"
                className="w-full bg-background-dark border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary-dark mb-2">Email</label>
            <input
              type="email"
              defaultValue="alex.green@example.com"
              className="w-full bg-background-dark border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary-dark mb-2">Bio</label>
            <textarea
              rows={4}
              defaultValue="Passionate about sustainable living and finding eco-friendly alternatives for everyday products."
              className="w-full bg-background-dark border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Link
              href="/profile"
              className="px-6 py-3 rounded-full font-medium text-text-secondary-dark hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </Link>
            <button className="bg-primary text-background-dark font-bold py-3 px-8 rounded-full hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfile
