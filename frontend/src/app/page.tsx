'use client'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => { window.location.href = '/partselect-landing.html' }, [])
  return null
}