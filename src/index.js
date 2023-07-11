import React from 'react'
import ReactDOM from 'react-dom'

import RealitioInterface from './containers/realitio'


const App = () => (
  <>
    <RealitioInterface />
  </>
)

const render = () => {
  ReactDOM.render(<App />, document.getElementById('root'))
}

render(App)

if (module.hot)
  module.hot.accept(App, () => {
    render(App)
  })
