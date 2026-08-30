'use client'
import {useEffect,useRef,type ReactNode} from 'react'
import {installCalculator} from './calculator-controller'

export function CalculatorSurface({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null)
 useEffect(()=>root.current ? installCalculator(root.current) : undefined,[])
 return <><noscript><p className="wrap small-note">Enable JavaScript to calculate an estimate. The model limits are explained below.</p></noscript><div className="wrap calculator-grid" ref={root}>{children}</div></>
}
