import React from 'react'

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-64 bg-white border-r p-4">
      <h2 className="font-semibold mb-4 text-primary">Quick Links</h2>
      <ul className="space-y-2 text-gray-700">
        <li>Dashboards</li>
        <li>Partners</li>
        <li>Feedback</li>
        <li>CSR</li>
      </ul>
    </aside>
  )
}