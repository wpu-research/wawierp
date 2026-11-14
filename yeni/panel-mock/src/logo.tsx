/* WawiERP logosu (wawib2b.com/assets/img/wawierp-logo.svg). Yazı rengi temaya uyar. */
export function Logo({ height = 28, markOnly, onDark }: { height?: number; markOnly?: boolean; onDark?: boolean }) {
  const mark = <g fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"><path d="m14 22.5 9.5 21L32 30" stroke="#F6FCFF" /><path d="m32 30 8.5 13.5L50 21m-8.5 3.5L50 21l3.5 8.5" stroke="#FFD168" /></g>
  if (markOnly) return <svg height={height} viewBox="0 0 64 64" role="img" aria-label="WawiERP">{mark}</svg>
  return (
    <svg height={height} viewBox="0 0 274 64" role="img" aria-label="WawiERP" style={{ display: 'block' }}>
      <rect width="64" height="64" rx="15" fill="#3048C8" />{mark}
      <g fill={onDark ? '#fff' : 'var(--ink)'}>
        <path d="M79 17h6.2l5.1 22 6.2-20.4h5.8l6.2 20.4 5.1-22h6.2l-7.9 30h-6.2l-6.3-19.7L93.1 47h-6.2z" />
        <path fillRule="evenodd" d="M132.5 24.8c-6.3 0-10.5 4.8-10.5 11.3s4.2 11.3 10.5 11.3c3.2 0 5.8-1.3 7.3-3.5V47h5.5V25.2h-5.5v3.1c-1.5-2.2-4.1-3.5-7.3-3.5zm1 5.1c3.6 0 6.4 2.7 6.4 6.2s-2.8 6.2-6.4 6.2-5.9-2.7-5.9-6.2 2.3-6.2 5.9-6.2z" />
        <path d="M148.6 25.2h5.6l3.8 15.1 4.4-15.1h5.1l4.4 15.1 3.7-15.1h5.5L174.9 47h-5.7L165 33.3 160.9 47h-5.8zM184.8 25.2h5.6V47h-5.6z" />
        <circle cx="187.6" cy="18.8" r="3.2" />
      </g>
      <g fill={onDark ? '#FFD168' : 'var(--brand)'}>
        <path d="M198 17h20v5.4h-14v6.8h12.4v5.2H204v7.2h14.2V47H198z" />
        <path fillRule="evenodd" d="M223 17h11.5c6.8 0 11.2 3.6 11.2 9.4 0 4.1-2.1 7-5.9 8.5l7.2 12.1h-6.8l-6.4-11.1H229V47h-6zm6 5.2v8.6h5.2c3.4 0 5.4-1.6 5.4-4.3s-2-4.3-5.4-4.3z" />
        <path fillRule="evenodd" d="M251 17h11c7 0 11.5 3.9 11.5 10s-4.5 10-11.5 10h-5v10h-6zm6 5.4v9.2h4.7c3.7 0 5.7-1.6 5.7-4.6s-2-4.6-5.7-4.6z" />
      </g>
    </svg>
  )
}
