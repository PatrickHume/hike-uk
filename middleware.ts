import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export default function middleware(req: NextRequest) {

    // const url = req.nextUrl.clone()   
    // if (url.pathname.startsWith('/view/') || url.pathname === '/view') {
    //     url.pathname = '/'
    //     return NextResponse.rewrite(url)  
    // }

  return NextResponse.next()
}