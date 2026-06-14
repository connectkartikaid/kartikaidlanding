import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const NotFound: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#FEFAE4',
      fontFamily: '"Josefin Sans", sans-serif',
      color: '#333',
      textAlign: 'center',
      padding: '20px'
    }}>
      <Helmet>
        <title>404 - Halaman Tidak Ditemukan | Kartika.id</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <img 
        src="/images/Kartika-logo.png" 
        alt="Kartika.id Logo" 
        style={{ width: '120px', marginBottom: '2rem' }} 
      />

      <h1 style={{ 
        fontFamily: '"Gelasio", serif', 
        fontSize: '4rem', 
        color: '#D04A02',
        margin: '0 0 10px 0'
      }}>
        404
      </h1>
      
      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
        Halaman Tidak Ditemukan
      </h2>
      
      <p style={{ maxWidth: '500px', lineHeight: '1.6', marginBottom: '30px' }}>
        Maaf, halaman yang Anda cari tidak tersedia. Mungkin URL yang diketik salah atau halaman sudah dipindahkan.
      </p>

      <Link 
        to="/" 
        style={{
          background: '#D04A02',
          color: '#FEFAE4',
          padding: '12px 24px',
          borderRadius: '25px',
          textDecoration: 'none',
          fontWeight: 'bold',
          transition: 'opacity 0.2s'
        }}
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}

export default NotFound
