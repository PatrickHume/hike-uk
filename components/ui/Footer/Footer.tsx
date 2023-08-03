import Link from 'next/link';

import Logo from '@/components/icons/Logo';
import GitHub from '@/components/icons/GitHub';

//import ViewCounter from '@/components/ViewCounter
import { Suspense } from 'react'
export const dynamic = 'force-dynamic'

import s from './Footer.module.css';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1920px] px-6 bg-zinc-900">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-zinc-600 py-12 text-white transition-colors duration-150 bg-zinc-900">
        <div className="col-span-1 lg:col-span-2">
          <Link
            href="/"
            className="flex flex-initial items-center font-bold md:mr-24"
          >
            <span className="rounded-full border border-zinc-700 mr-2">
              <Logo />
            </span>
            <span>HIKEUK</span>
          </Link>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-initial flex-col md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/"
                className="text-white hover:text-zinc-200 transition ease-in-out duration-150"
              >
                Home
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/about"
                className="text-white hover:text-zinc-200 transition ease-in-out duration-150"
              >
                About
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="https://patrickhume.vercel.app"
                className="text-white hover:text-zinc-200 transition ease-in-out duration-150"
              >
                Blog
              </Link>
            </li>
          </ul>
        </div>
        {/* <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-initial flex-col md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/"
                className="text-white hover:text-zinc-200 transition ease-in-out duration-150"
              >
                Privacy Policy
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/"
                className="text-white hover:text-zinc-200 transition ease-in-out duration-150"
              >
                Terms of Use
              </Link>
            </li>
          </ul>
        </div> */}
        <div className="col-span-1 lg:col-span-6 flex items-start lg:justify-end text-white">
          <div className="flex space-x-6 items-center h-10">
            <a
              aria-label="Github Repository"
              href="https://github.com/PatrickHume"
            >
              <GitHub />
            </a>
          </div>
        </div>
      </div>
      <div className="py-12 flex flex-col md:flex-row justify-between items-center space-y-4 bg-zinc-900">
        <div>
          <Link href='https://patrickhume.vercel.app'>Patrick Hume</Link>
        </div>
        <div className="flex items-center">
          <a href="https://vercel.com" aria-label="Vercel.com Link">
            <img
              src="/vercel.svg"
              alt="Vercel.com Logo"
              className="inline-block h-6 ml-4 text-white"
            />
          </a>
        </div>
      </div>
      <div>
      {/* View Counter temporarily removed due to counting error. */}
      {/* <div className='py-2 flex flex-col md:flex-row justify-center items-center space-y-4 bg-zinc-900'>
        <div className='flex items-center'>
          <Suspense>
            //@ts-expect-error Async Server Component
            <ViewCounter />
          </Suspense>
        </div>
      </div> */}
    </div>
    </footer>
  );
}
