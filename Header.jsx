import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-primary text-white flex justify-between items-center px-6 py-4 shadow-md">
      <div className="flex items-center space-x-2">
        <div className="bg-accent text-primary font-bold text-lg w-10 h-10 flex items-center justify-center rounded-md">CE</div>
        <h1 className="font-semibold text-xl">CAPERONE ENTERPRISES LTD</h1>
      </div>
      <nav className="space-x-6">
        <Link to="/" className="hover:text-accent">Home</Link>
        <Link to="/about" className="hover:text-accent">About</Link>
        <Link to="/services" className="hover:text-accent">Services</Link>
        <Link to="/portfolio" className="hover:text-accent">Portfolio</Link>
        <Link to="/blog" className="hover:text-accent">Blog</Link>
        <Link to="/contact" className="hover:text-accent">Contact</Link>
        <Link to="/faq" className="hover:text-accent">FAQ</Link>
      </nav>
    </header>
  )
}