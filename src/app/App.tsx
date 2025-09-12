import { Toaster } from 'react-hot-toast'
import Header from '@organisms/shared/Header'
import { Navigation } from '@/navigation'
import { useNavigationState } from '@/navigation'

function App() {
  const { state } = useNavigationState()

  return (
    <>
      {/* Show header only for main app */}
      {state === 'main-app' && <Header />}
      
      {/* Navigation component handles all routing logic */}
      <Navigation />
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: { 
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500'
          }
        }}
      />
    </>
  )
}

export default App
