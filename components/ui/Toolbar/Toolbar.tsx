import Link from 'next/link';

import Logo from '@/components/icons/Logo';

import s from './Toolbar.module.css';

const Toolbar = ({ children }: { children: React.ReactNode }) => {

  return (
    <nav className={s.root}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex justify-between align-center flex-row py-1 relative">
          <div className="flex flex-1 items-center gap-2">
            {children}
          </div>

          <div className="flex flex-1 justify-end space-x-8">
            (
              <span
                className={s.link}
              >
                Sign out
              </span>
            ) : (
              <Link href="/signin" className={s.link}>
                Sign in
              </Link>
            )
          </div>
        </div>
      </div>
    </nav>
  );
};

Toolbar.displayName = 'Toolbar';
export default Toolbar;
