import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/dist/client/components/navigation';
import {ReactNode} from 'react';
const AuthLayout = async ({children}: {children: ReactNode}) => { 
    const isUserAuthenticated = await isAuthenticated(); // Replace with actual authentication check
  //all the non user cant see the home page
    if(isUserAuthenticated) redirect('/');
  return (
    <div className="auth-layout">{children}</div>
  )
}

export default AuthLayout;
       