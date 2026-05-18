import Header from '../components/Header'
import React from 'react'
import hero from '../assets/hero.png';

type Props = {
  onEnter: () => void
}

export default function Landing({ onEnter }: Props) {
  return (
    <div className='min-h-screen p-4'>

      <Header />

      <div className='flex flex-col-reverse md:flex-row justify-between p-4 gap-8'>
        <div className='flex flex-col items-start'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl'>Build a CV that stands out</h1>
          <span className='block mt-2'>Create a clean CV in minutes and stand out from the crowd.</span>

          <button
            type='button'
            className='bg-red-500 p-1 my-5 rounded-md cursor-pointer'
            onClick={onEnter}
          >
            Get Started
          </button>
        </div>

        <div className='flex justify-center'>
          <img
            src={hero}
            alt="hero"
            className='w-full max-w-sm md:max-w-md object-contain'
          />
        </div>
      </div>

    </div>
  )
}
