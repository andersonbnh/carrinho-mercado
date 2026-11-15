declare const BarcodeDetector: any

/** Abre a câmera e resolve com o código lido (ou null se cancelado). */
export function scanCode(): Promise<string | null> {
  return new Promise(async (resolve) => {
    const box = document.createElement('div')
    box.id = 'scanner'
    box.innerHTML = `<video playsinline muted></video><div class="row" style="padding:0 16px"><button class="btn" id="sx" style="flex:1">Cancelar</button><button class="btn" id="sm" style="flex:1">Digitar código</button></div>`
    document.body.append(box)
    const video = box.querySelector('video')!
    let stream: MediaStream | undefined
    let stop = false
    const end = (code: string | null) => {
      if (stop) return
      stop = true
      stream?.getTracks().forEach((t) => t.stop())
      box.remove()
      resolve(code)
    }
    box.querySelector('#sx')!.addEventListener('click', () => end(null))
    box.querySelector('#sm')!.addEventListener('click', () => end(prompt('Digite o código de barras:')?.trim() || null))
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      video.srcObject = stream
      await video.play()
      if (typeof BarcodeDetector !== 'undefined') {
        const det = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] })
        const loop = async () => {
          if (stop) return
          try {
            const r = await det.detect(video)
            if (r.length) return end(r[0].rawValue)
          } catch { /* frame não pronto */ }
          setTimeout(loop, 150)
        }
        loop()
      } else {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const reader = new BrowserMultiFormatReader()
        const tick = async () => {
          if (stop) return
          try { end(reader.decode(video).getText()) } catch { setTimeout(tick, 200) }
        }
        tick()
      }
    } catch {
      end(prompt('Câmera indisponível. Digite o código de barras:')?.trim() || null)
    }
  })
}
