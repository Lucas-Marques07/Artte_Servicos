import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#006633" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Artte" />
  <meta name="description" content="Sistema de Terceirização Artte" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
  <link rel="icon" sizes="192x192" href="/artte1.png" />
  <link rel="icon" sizes="512x512" href="/artte1.png" />
</Head>



      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
