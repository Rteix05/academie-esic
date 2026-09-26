import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Académie E.S.I.C.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0F291E',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.08)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999,
            padding: '8px 20px',
            marginBottom: 32,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>
            Approfondir sa foi
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: -2,
            lineHeight: 1.1,
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          ACADÉMIE E.S.I.C.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: 'rgba(167, 243, 208, 0.8)',
            textAlign: 'center',
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Équipement · Spiritualité · Identité · Croissance
        </div>
      </div>
    ),
    { ...size }
  );
}
