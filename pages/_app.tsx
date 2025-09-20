import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import '../app/globals.css'
import '../lib/i18n'

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize i18n on app start
    import('../lib/i18n')
  }, [])
  
  return <Component {...pageProps} />
}

export default MyApp
