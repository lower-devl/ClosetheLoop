let audioContext = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

export function playThrum() {
  const ctx = getAudioContext()
  
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  
  osc.type = 'sine'
  osc.frequency.setValueAtTime(80, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5)
  
  gain.gain.setValueAtTime(0.5, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
  
  osc.connect(gain)
  gain.connect(ctx.destination)
  
  osc.start()
  osc.stop(ctx.currentTime + 0.5)
}
