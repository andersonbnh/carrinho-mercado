const MAX_LADO = 1568 // maior lado útil para a IA; reduz custo e upload

/** Abre a câmera nativa e devolve a foto como JPEG base64 (sem prefixo), ou null se cancelar. */
export function takePhoto(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.addEventListener('cancel', () => resolve(null))
    input.addEventListener('change', async () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      try {
        const bmp = await createImageBitmap(file)
        const k = Math.min(1, MAX_LADO / Math.max(bmp.width, bmp.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(bmp.width * k)
        canvas.height = Math.round(bmp.height * k)
        canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1])
      } catch {
        resolve(null)
      }
    })
    input.click()
  })
}
