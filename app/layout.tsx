import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import 'katex/dist/katex.min.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Resistencia de Materiales | Universidad Nacional de Ingeniería (UNI)',
  description: 'Textbook interactivo de Resistencia de Materiales para estudiantes de ingeniería.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* MutationObserver that strips browser-extension attributes (bis_skin_checked,
            bis_register, __processed_*) in real-time as they are injected, before React
            hydrates. This prevents false-positive hydration mismatch errors. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=['bis_skin_checked','bis_register'];var o=new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];if(m.type==='attributes'){var n=m.attributeName;if(d.indexOf(n)!==-1||n.indexOf('__processed_')===0){m.target.removeAttribute(n)}}else if(m.type==='childList'){for(var j=0;j<m.addedNodes.length;j++){var el=m.addedNodes[j];if(el.nodeType===1){for(var k=0;k<d.length;k++){if(el.hasAttribute(d[k]))el.removeAttribute(d[k])}for(var a=el.attributes.length-1;a>=0;a--){if(el.attributes[a].name.indexOf('__processed_')===0)el.removeAttribute(el.attributes[a].name)}}}}}});o.observe(document.documentElement,{attributes:true,attributeFilter:d.concat(['__processed_']),childList:true,subtree:true})}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
