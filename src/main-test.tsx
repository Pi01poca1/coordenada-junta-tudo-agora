console.log('🔍 main-test.tsx carregando...')

// Teste sem React para verificar se o problema é do React
const testDiv = document.createElement('div')
testDiv.innerHTML = `
  <div style="padding: 20px; background: yellow; margin: 20px; border-radius: 8px;">
    <h2>✅ JavaScript puro funcionando!</h2>
    <p>Este é um teste sem React para verificar se o problema é do build.</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
  </div>
`

// Adicionar ao DOM após 1 segundo
setTimeout(() => {
  document.body.appendChild(testDiv)
  console.log('🔍 Teste JS puro adicionado ao DOM')
}, 1000)

// Tentar carregar React depois
setTimeout(async () => {
  try {
    console.log('🔍 Tentando importar React...')
    const React = await import('react')
    const { createRoot } = await import('react-dom/client')
    
    console.log('🔍 React importado com sucesso:', React.version)
    
    const AppTest = () => {
      return React.createElement('div', {
        style: { padding: '20px', background: 'lightgreen', margin: '20px', borderRadius: '8px' }
      }, [
        React.createElement('h2', { key: 'h2' }, '✅ React funcionando!'),
        React.createElement('p', { key: 'p1' }, 'React carregado dinamicamente'),
        React.createElement('p', { key: 'p2' }, `React version: ${React.version}`)
      ])
    }
    
    const rootElement = document.getElementById('root')
    if (rootElement) {
      const root = createRoot(rootElement)
      root.render(React.createElement(AppTest))
      console.log('🔍 React renderizado com sucesso!')
    }
  } catch (error) {
    console.error('❌ Erro ao carregar React:', error)
    const errorDiv = document.createElement('div')
    errorDiv.innerHTML = `
      <div style="padding: 20px; background: red; color: white; margin: 20px; border-radius: 8px;">
        <h2>❌ Erro ao carregar React</h2>
        <pre>${error.message}</pre>
      </div>
    `
    document.body.appendChild(errorDiv)
  }
}, 2000)