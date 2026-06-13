/// <reference types="vite/client" />

declare global {
  namespace JSX {
    interface IntrinsicElements extends import('react').JSX.IntrinsicElements {}
  }
}
