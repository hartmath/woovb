import '../styles/globals.css'
import 'video.js/dist/video-js.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>WOOVB - Video Hosting Platform</title>
        <meta name="description" content="Modern video hosting platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.jpg" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

