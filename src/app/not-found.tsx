import Link from 'next/link'

export default function RootNotFound() {
  return (
    <html suppressHydrationWarning>
      <body>
        <main style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ 
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            <h1 style={{ 
              fontSize: '6rem', 
              margin: '0', 
              color: '#d4af37',
              fontWeight: 'bold'
            }}>
              404
            </h1>
            
            {/* French */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '2rem', 
                margin: '1rem 0',
                color: '#333'
              }}>
                Page introuvable
              </h2>
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#666',
                margin: '1rem 0'
              }}>
                Cette page n&apos;a pas pu être trouvée.
              </p>
            </div>

            {/* English */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '2rem', 
                margin: '1rem 0',
                color: '#333'
              }}>
                Page not found
              </h2>
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#666',
                margin: '1rem 0'
              }}>
                This page could not be found.
              </p>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              marginTop: '2rem'
            }}>
              <Link 
                href="/fr"
                style={{
                  display: 'inline-block',
                  padding: '1rem 2rem',
                  background: '#d4af37',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: '600',
                  transition: 'background 0.3s ease'
                }}
              >
                Retour à l&apos;accueil
              </Link>
              <Link 
                href="/en"
                style={{
                  display: 'inline-block',
                  padding: '1rem 2rem',
                  background: '#d4af37',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: '600',
                  transition: 'background 0.3s ease'
                }}
              >
                Back to home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
