import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#800000] text-slate-200 py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center lg:text-left">
        
        {/* Left - Brand */}
        <div>
          <h1 className="text-2xl font-bold text-white ">Divine Gems</h1>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed text-center lg:text-left">
            Discover timeless elegance with Divine Gems. Your one-stop
            destination for premium jewelry crafted with care and passion.
          </p>
        </div>

        {/* Middle - Categories */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white mb-3">Categories</h2>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li><a href="#" className="hover:text-white transition">Malas</a></li>
            <li><a href="#" className="hover:text-white transition">Necklaces</a></li>
            <li><a href="#" className="hover:text-white transition">Gemstones</a></li>
            <li><a href="#" className="hover:text-white transition">Bracelets</a></li>
            <li><a href="#" className="hover:text-white transition">Collections</a></li>
          </ul>
        </div>

        {/* Right - Contact & Social */}
        <div className="text-center lg:text-right">
          <h2 className="text-lg font-semibold text-white mb-3">Get in Touch</h2>
          <p className="text-slate-300 text-sm mb-3">📧 support@divinegems.com</p>
          <div className="flex justify-center lg:justify-end space-x-4 text-slate-200 text-lg">
            <a href="#" className="hover:text-white transition"><FaFacebookF /></a>
            <a href="#" className="hover:text-white transition"><FaInstagram /></a>
            <a href="#" className="hover:text-white transition"><FaTwitter /></a>
            <a href="#" className="hover:text-white transition"><FaYoutube /></a>
          </div>
        </div>

      </div>

      {/* Bottom line */}
      <div className="border-t border-slate-400/30 mt-8 pt-4 text-center text-slate-400 text-xs">
        © {new Date().getFullYear()} Divine Gems. All Rights Reserved.
      </div>
    </footer>
  );
}
