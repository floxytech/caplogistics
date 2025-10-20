import React from 'react'
export default function Contact() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-primary">Contact Us</h2>
      <form className="space-y-4 max-w-md">
        <input type="text" placeholder="Your Name" className="w-full p-2 border rounded" />
        <input type="email" placeholder="Your Email" className="w-full p-2 border rounded" />
        <textarea placeholder="Message" className="w-full p-2 border rounded"></textarea>
        <button className="bg-primary text-white px-4 py-2 rounded">Send Message</button>
      </form>
    </div>
  )
}