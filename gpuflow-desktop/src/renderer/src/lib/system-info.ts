export interface SystemInfo {
  deviceId: string
  gpuName: string
  vramGB: number
  platform: string
  hostname: string
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const platform = window.navigator.platform
  const userAgent = window.navigator.userAgent
  
  // Generate a unique device ID based on hardware characteristics
  const deviceId = await generateDeviceId()
  
  // Detect GPU using WebGL
  const gpuInfo = detectGPU()
  
  return {
    deviceId,
    gpuName: gpuInfo.name,
    vramGB: gpuInfo.vram,
    platform,
    hostname: window.navigator.userAgent.split('(')[1]?.split(';')[0] || 'Unknown'
  }
}

async function generateDeviceId(): Promise<string> {
  // Create a fingerprint based on available system info
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  
  const fingerprint = [
    window.navigator.platform,
    window.navigator.hardwareConcurrency || 'unknown',
    window.screen.width,
    window.screen.height,
    window.screen.colorDepth,
    new Date().getTimezoneOffset(),
    window.navigator.language,
    // @ts-ignore
    gl?.getParameter(gl.RENDERER) || 'unknown'
  ].join('|')
  
  // Hash the fingerprint
  const encoder = new TextEncoder()
  const data = encoder.encode(fingerprint)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

function detectGPU(): { name: string; vram: number } {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (!gl) {
      return { name: 'No GPU detected', vram: 0 }
    }
    
    // @ts-ignore
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      // @ts-ignore
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      
      // Try to extract VRAM from renderer string
      let vram = 0
      const vramMatch = renderer.match(/(\d+)\s*(GB|MB)/i)
      if (vramMatch) {
        vram = parseInt(vramMatch[1])
        if (vramMatch[2].toUpperCase() === 'MB') {
          vram = Math.round(vram / 1024)
        }
      } else {
        // Estimate based on GPU name
        vram = estimateVRAM(renderer)
      }
      
      return {
        name: cleanGPUName(renderer),
        vram
      }
    }
    
    // Fallback to basic renderer
    // @ts-ignore
    const renderer = gl.getParameter(gl.RENDERER)
    return {
      name: cleanGPUName(renderer),
      vram: estimateVRAM(renderer)
    }
  } catch (error) {
    console.error('GPU detection failed:', error)
    return { name: 'GPU detection failed', vram: 0 }
  }
}

function cleanGPUName(renderer: string): string {
  // Remove common prefixes and clean up the name
  let name = renderer
    .replace(/ANGLE \(([^)]+)\)/, '$1')
    .replace(/Direct3D\d+\s+vs_\d+_\d+\s+ps_\d+_\d+/, '')
    .replace(/OpenGL Engine/, '')
    .trim()
  
  // If it's an NVIDIA GPU, clean it up
  if (name.includes('NVIDIA') || name.includes('GeForce')) {
    const match = name.match(/(GeForce\s+[A-Z]+\s+\d+\s*[A-Z]*\s*\d*)/i)
    if (match) {
      name = 'NVIDIA ' + match[1]
    }
  }
  
  // If it's an AMD GPU
  if (name.includes('AMD') || name.includes('Radeon')) {
    const match = name.match(/(Radeon\s+[A-Z0-9\s]+)/i)
    if (match) {
      name = 'AMD ' + match[1]
    }
  }
  
  // If it's an Intel GPU
  if (name.includes('Intel')) {
    const match = name.match(/(Intel.*(?:Graphics|HD|UHD|Iris)[^,]*)/i)
    if (match) {
      name = match[1]
    }
  }
  
  return name.trim()
}

function estimateVRAM(gpuName: string): number {
  const name = gpuName.toLowerCase()
  
  // High-end cards
  if (name.includes('4090') || name.includes('a100')) return 24
  if (name.includes('4080') || name.includes('3090')) return 24
  if (name.includes('3080 ti')) return 12
  if (name.includes('3080')) return 10
  if (name.includes('4070') || name.includes('3070')) return 8
  if (name.includes('4060') || name.includes('3060')) return 8
  if (name.includes('2080') || name.includes('2070')) return 8
  if (name.includes('1080') || name.includes('1070')) return 8
  
  // AMD cards
  if (name.includes('7900')) return 24
  if (name.includes('7800') || name.includes('6900')) return 16
  if (name.includes('6800') || name.includes('6700')) return 12
  if (name.includes('6600')) return 8
  
  // Mid-range
  if (name.includes('1660') || name.includes('1650')) return 6
  if (name.includes('1060')) return 6
  
  // Default for unknown
  return 4
}
