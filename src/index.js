import React from 'react'
import ReactDOM from 'react-dom'

import RealitioInterace from './containers/realitio'


const App = () => (
  <>
    <RealitioInterace />
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
