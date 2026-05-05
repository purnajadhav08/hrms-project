import { Linkedin, Twitter, Globe, Mail } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: "#0f2137" }} className="text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">CBC</span>
              </div>
              <span className="text-white font-bold text-sm">CBC Labs. Inc</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Human Resource Management System.<br />
              Empowering teams, streamlining HR operations.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Contact</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <a href="mailto:hr@cbcinc.ai" className="hover:text-white transition-colors">hr@cbcinc.ai</a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <a href="https://cbcinc.ai" target="_blank" rel="noreferrer"
                  className="hover:text-white transition-colors">cbcinc.ai</a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Follow Us</h4>
            <div className="flex items-center gap-3">
              <a href="https://linkedin.com/company/cbcinc" target="_blank" rel="noreferrer"
                className="w-8 h-8 bg-gray-700 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4 text-white" />
              </a>
              <a href="https://twitter.com/cbcinc" target="_blank" rel="noreferrer"
                className="w-8 h-8 bg-gray-700 hover:bg-sky-500 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4 text-white" />
              </a>
              <a href="https://cbcinc.ai" target="_blank" rel="noreferrer"
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                <Globe className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {year} CBC Labs. Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-400 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
