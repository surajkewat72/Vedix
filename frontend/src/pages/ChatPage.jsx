import CosmicBackground from '../components/CosmicBackground'
import ChatInterface from '../components/ChatInterface'

export default function ChatPage() {
  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <CosmicBackground />

      <div style={{
        position: 'relative', zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '64px', // navbar height
      }}>
        <div style={{
          flex: 1,
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
          padding: '0 0',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}>
          <div style={{
            flex: 1,
            background: 'linear-gradient(135deg, rgba(17,13,30,0.92), rgba(10,6,18,0.92))',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--color-border)',
            borderBottom: 'none',
            borderRadius: '20px 20px 0 0',
            marginTop: '20px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  )
}
