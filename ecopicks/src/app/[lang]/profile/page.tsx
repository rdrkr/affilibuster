// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Image from 'next/image'
import Link from 'next/link'

const Profile = () => {
  return (
    <div className="py-8 max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <div className="relative inline-block mb-4 group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-dark shadow-xl relative">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOHE4kfwcL91You39zVxg807UpJTDQFj6ZLPqMQbPuKSX3Tjag-PkqYBcItnaKfXN_sP6wA2pAggJn1DThs4_hsU3Y70igrBtXv1bawv3aXE0uNZqWbdGpjoPDuednNeV5htMti3NbyESseZ-kw0c-0xOyMgvfSEcJ9VxecO2oW2iQ8a9cO3QfxNvG7CSTGsrhfpzCUU4zvcCXYhoRuctB0P0Y1WLl0cbmo34rYxUu7t_3Avh6qx62F0NGldsTXOoUOzbJOdHnz08"
              alt="Profile"
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <Link
            href="/profile/edit"
            className="absolute bottom-0 right-0 bg-primary text-background-dark p-2 rounded-full hover:scale-110 transition-transform shadow-lg"
          >
            <span className="material-symbols-outlined text-lg block">edit</span>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white">Alex Green</h1>
        <p className="text-text-secondary-dark mt-1">alex.green@example.com</p>
      </div>

      <div className="space-y-8">
        <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
          <h2 className="text-sm font-bold text-text-secondary-dark uppercase tracking-wider px-6 pt-6 pb-2">
            Account Settings
          </h2>
          <div className="divide-y divide-white/5">
            <Link
              href="/profile/edit"
              className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-text-secondary-dark">person</span>
                <span className="font-semibold text-white">Edit Profile</span>
              </div>
              <span className="material-symbols-outlined text-text-secondary-dark">chevron_right</span>
            </Link>
            <Link
              href="/profile/currency"
              className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-text-secondary-dark">payments</span>
                <span className="font-semibold text-white">Currency</span>
              </div>
              <span className="material-symbols-outlined text-text-secondary-dark">chevron_right</span>
            </Link>
            <Link
              href="/profile/wishlist"
              className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-text-secondary-dark">favorite</span>
                <span className="font-semibold text-white">Wishlist</span>
              </div>
              <span className="material-symbols-outlined text-text-secondary-dark">chevron_right</span>
            </Link>
          </div>
        </div>

        <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            <button className="w-full flex items-center justify-between p-6 hover:bg-red-500/10 transition-colors group">
              <div className="flex items-center gap-4 text-red-400 group-hover:text-red-500">
                <span className="material-symbols-outlined">logout</span>
                <span className="font-semibold">Log Out</span>
              </div>
            </button>
            <Link
              href="/profile/delete"
              className="w-full flex items-center justify-between p-6 hover:bg-red-500/10 transition-colors group"
            >
              <div className="flex items-center gap-4 text-text-secondary-dark group-hover:text-red-400">
                <span className="material-symbols-outlined">delete</span>
                <span className="font-semibold">Delete Account</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
