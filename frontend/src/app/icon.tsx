import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    React.createElement('div', {
      style: {
        fontSize: 24,
        background: 'linear-gradient(45deg, #3B82F6, #8B5CF6, #F59E0B)',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        borderRadius: '50%',
        fontWeight: 'bold',
      }
    }, '₿'),
    {
      ...size,
    }
  )
}