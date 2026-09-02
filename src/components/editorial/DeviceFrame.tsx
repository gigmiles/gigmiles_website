import type {ReactNode} from 'react'
import './device-frame.css'

// Phone frame for real app captures: teal-tinted bezel with a glare, a dark
// inset lip, a dynamic-island pill and a status-bar-height band above the
// capture (the offline captures have no status bar of their own). Nothing
// drawn here is app UI; the screen content is always a real capture.
export function DeviceFrame({children, className = ''}: {children: ReactNode; className?: string}) {
  return <div className={`product-device ${className}`.trim()}>
    <span className="device-island" aria-hidden="true"/>
    <div className="device-screen">{children}</div>
  </div>
}
