import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected Routes
    // If user is NOT signed in and the current path is protected, redirect to /login
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        (//request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/profile') ||
            request.nextUrl.pathname.startsWith('/missions') ||
            request.nextUrl.pathname.startsWith('/training') ||
            request.nextUrl.pathname.startsWith('/shop') ||
            request.nextUrl.pathname.startsWith('/admin') ||
            request.nextUrl.pathname.startsWith('/achievements') ||
            request.nextUrl.pathname.startsWith('/leaderboard') ||
            request.nextUrl.pathname.startsWith('/learn') ||
            request.nextUrl.pathname.startsWith('/quiz'))
    ) {
        // Clone the url
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        // Optional: Add returnTo param
        url.searchParams.set('returnTo', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    return response
}
