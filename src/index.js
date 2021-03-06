import React, { Component, createContext } from 'react'
import isFunction from 'lodash.isfunction'
export { default as AdapterGlobal } from './persist-adapter/PersistAdapter'
export { default as AdapterLocalStorage } from './persist-adapter/LocalStorage'

export default (config = {}) => {

  const { data, methods = {}, reducer, calculateChangedBits, persist } = config

  const context = createContext({}, calculateChangedBits)
  const { Provider, Consumer } = context

  class StoreComponent extends Component {
    state = getDefaultState()
    methods = {}
    reducer = reducer

    constructor(props) {
      super(props)
      Object.keys(methods).forEach(x => {
        this.methods[x] = (...args) => {
          const state = { ...this.state }
          methods[x].apply(state, args)
          this.setState(state)
          if (persist) {
            persist.set(state)
          }
        }
      })
    }

    render() {
      return (<Provider value={{
        data: this.state,
        methods: this.methods,
        dispatch: this.dispatch.bind(this),
      }}>{this.props.children}</Provider>)
    }

    dispatch(action) {
      const newState = this.reducer(this.state, action)
      this.setState(newState)
    }
  }

  return {
    context,
    Provider: StoreComponent,
    Consumer,
  }

  function getDefaultState() {
    if (persist) {
      const val = persist.get()
      if (val) {
        return val
      }
    }
    const val = isFunction(data) ? data() : data
    if (persist) {
      persist.set(val)
    }
    return val
  }
}