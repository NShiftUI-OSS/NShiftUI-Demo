/** Live page of a `WebView` root inside a phone preview. */
export function WebViewPage({ url, interactive = true }: { url: string; interactive?: boolean }) {
  const valid = /^https?:\/\/[^/\s]+/.test(url) && !url.includes('{{')
  if (!valid) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 text-center text-xs text-[var(--scn-muted-foreground)]">
        {url.includes('{{')
          ? 'O endereço usa dados da rota; ele é montado no app.'
          : 'Informe um endereço https:// para ver a página.'}
      </div>
    )
  }
  return (
    <iframe
      data-web-view-preview=""
      title={url}
      src={url}
      loading="lazy"
      referrerPolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      className={interactive ? 'min-h-0 w-full flex-1 border-0 bg-white' : 'pointer-events-none min-h-0 w-full flex-1 border-0 bg-white'}
    />
  )
}
