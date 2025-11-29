// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const Currency = () => {
  const [selected, setSelected] = useState('USD')

  const currencies = [
    {
      code: 'USD',
      name: 'United States Dollar',
      flag: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACILqqJcrsDbsumcqQ9NNubbbCs3Bp6iIg5zfVIg8xYgrZNWOoO5203Y3eRNDLQWr7i8bu9AKE0JHoYH0nrgnNQka2-KpR7IKpvV-54q6Rl7w4N-4W_NvzyqtmLuTKACRXtRxkYWblcbguL8LbNszFk2wD66xUE8aqWGQ-pSreYIamOAZaJRwG6Xl2wV_3Ccn61na__C_s9rsDn-KuI4m4nufJADMgHP_IxGQxY-Q4ghQOMY2EteFI1KW0FjFhTT-eUvOIZpfv4LM',
    },
    {
      code: 'EUR',
      name: 'Euro',
      flag: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDj1swKMzaC4gqpAZxTH7zjqVk3kyiLV8B9jDUHIzr91MS1YVJRu8i0G_WkODC3osCwTBtGEIHai_9admn9ByY4Exx9YRFyNehYLsc5_LmuNQxEQ_0LZhKabztKMYhcj-fxWX1EmowYxiaCGhD20kkMPzKGiYquJRZzF-I02PA0EfSoWsyaZjIuIk0NQYZXNsbJSSpxmObxZMupx8SCzK4Jpng79ozIzV7ohwo99OcK_tFxtrnTzkVo712gvHeJ7_IdBCHT4npiAaU',
    },
    {
      code: 'GBP',
      name: 'British Pound',
      flag: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_9QFrh5UCsq3IRS92AKEffHXvAfhF06sr9aSFtUKiwr3ehVmC4qttZzW91bfDQgZluprlCPh1uzTSoB6iZHHt5A0ssf4ld4WSRdpUsLiXBcOcEEuVkc7syTJ0DKEyJPxIh-u1uukU7FQES3b0ilfXDAnFknsfoG88zE4CvMTE6wy8DzWMFRUvC2EFkD3DviGVaHERMixPyIJANb1rOs2E5srl8qOSdgm3xJL_Ol18gYb8YBnDu3FMEyJ7qel9MRTT_GXC0zIiT9U',
    },
    {
      code: 'CAD',
      name: 'Canadian Dollar',
      flag: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT3xZNSaUVVfyJmrzGdy7b4j8hwCRR5gFNEh2LzEQTZjvARuNdMwmKAeSM1D2cfzv09nQwrmH6ckVzoQL_erZrGjRBbO5qY5cf8YLuG-AZedFwHXa9xROnz3xHsO0WAUssz_RmTbDIGJDZWWiQCG1RhGWGj2kGQjzXJVUjuE6SpfNOCw476i-s8JRIMFXVUsaPj5MS2Vo3IqDFeGw_vgjtLjBFlFYPz0vP6toFvHUC8SQrVFOtxtMKpQRIceWG9kFYHxFC3Of7bRw',
    },
    {
      code: 'AUD',
      name: 'Australian Dollar',
      flag: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXG4ByEqeWRfjdoV9PFibpshaBsu6ZFMwpjhMDJYmV4J-OrPt4RhDeUjzzhZYsjn8DPtWPw1LrVwl6AB4po0ZFCqWWUcem_9z0Nl4_lqIdaH-23rrywFvJcqGgqxO9cyKF3ykIKwlXrKAB0aKtVcfrYoHcBxeQU_O_Cn6J0lVbqg9TyIbRElxO-oEoXH1xxqYT4jYE_8L6O7KrL9pvPl9zQYRygmOwsdkLHUl-AAIpRPDKBRC_maR1f1PMI-5lUSlPSTEQWE6uBm4',
    },
  ]

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile" className="p-2 rounded-full bg-surface-dark hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </Link>
        <h1 className="text-3xl font-bold text-white">Select Currency</h1>
      </div>

      <div className="bg-surface-dark rounded-2xl border border-white/5 p-4 md:p-8">
        <div className="space-y-4">
          {currencies.map(curr => (
            <label
              key={curr.code}
              className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all ${
                selected === curr.code
                  ? 'bg-background-dark border-primary ring-1 ring-primary'
                  : 'bg-background-dark border-white/5 hover:border-white/20'
              }`}
              onClick={() => {
                setSelected(curr.code)
              }}
            >
              <div className="flex items-center gap-4">
                <Image
                  src={curr.flag}
                  alt={curr.name}
                  width={40}
                  height={28}
                  className="object-cover rounded shadow-sm"
                />
                <div>
                  <p className="font-bold text-white">{curr.code}</p>
                  <p className="text-sm text-text-secondary-dark">{curr.name}</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === curr.code ? 'border-primary' : 'border-text-secondary-dark'}`}
              >
                {selected === curr.code && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
              </div>
            </label>
          ))}
        </div>
        <button className="w-full mt-8 bg-primary text-background-dark font-bold py-3.5 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default Currency
