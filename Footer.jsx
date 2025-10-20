import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-primary text-white p-6 text-center">
      <p>&copy; {new Date().getFullYear()} Caperone Enterprises Ltd. All rights reserved.</p>
      <div className="flex justify-center space-x-4 mt-2 text-accent">
        <a href="#">Facebook</a>
        <a href="#">LinkedIn</a>
        <a href="#">Instagram</a>
      </div>
    </footer>
  )
}