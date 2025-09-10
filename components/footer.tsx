import Link from "next/link"
import '@/styles/shared.css'

export default function Footer() {
  return (
    <footer className="relative py-12 px-4 md:px-8 bg-black overflow-hidden">
      <div className="absolute inset-0 footer-background-image"></div>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      <div className="relative z-10 text-center text-gray-400">
        <p className="text-lg font-mono mb-4 text-[#FF324A]">INWO - Illuminati: New World Order</p>
        <p>&copy; {new Date().getFullYear()} All Rights Reserved. The Conspiracy Continues.</p>
        <div className="flex justify-center space-x-6 mt-6">
          <Link href="#" className="hover:text-[#FF324A] transition-colors cursor-pointer">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-[#FF324A] transition-colors cursor-pointer">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-[#FF324A] transition-colors cursor-pointer">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  )
}
