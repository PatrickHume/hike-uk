import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link';
import Logo from '@/components/icons/Logo';
import { supabase, fetcher } from '@/lib/initSupabase';
import { Auth } from '@supabase/ui';
import { User } from '@supabase/supabase-js';
import useSWR from 'swr';
import { OverridableComponent } from '@mui/material/OverridableComponent';

import s from './Navbar.module.css';

const StyledLink = styled(Link)({
  textDecoration: 'none',
  color: 'white',
}) as typeof Link;

const Navbar = () => {
  const { user, session } = Auth.useUser();

  return (
    <nav className={s.root}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex justify-between align-center flex-row py-4 md:py-6 relative">
          <div className="flex flex-1 items-center">
            <div className="col-span-1 lg:col-span-2">
              <Link
                href="/"
                className="flex flex-initial items-center font-bold md:mr-12"
                style={{ textDecoration: 'none' }}
              >
                <div className="rounded-full border border-zinc-700 mr-2">
                  <Logo />
                </div>
                <div className="text-white font-bold">HIKEUK</div>
              </Link>
            </div>
            <nav className="space-x-2 ml-4 flex items-center">
              {user && (
                <>
                  <StyledLink href="/account" className={s.link}>
                    Account
                  </StyledLink>

                  {/* Conditionally display the hello message */}
                  <div
                    className={`${
                      // Hide the hello message on screens smaller than lg
                      user.email && 'hidden md:inline'
                    } text-white italic pl-2 inline-block md:inline-block whitespace-nowrap`}
                  >
                    Hello, {user.email}!
                  </div>
                </>
              )}
            </nav>
          </div>

          <div className="flex justify-end flex-1 space-x-8">
            {user ? (
              <StyledLink
                component="button"
                onClick={() => supabase.auth.signOut()}
                className={s.link}
              >
                Sign out
              </StyledLink>
            ) : (
              <StyledLink href="/signin" className={s.link}>
                Sign in
              </StyledLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

Navbar.displayName = 'Navbar';
export default Navbar;
