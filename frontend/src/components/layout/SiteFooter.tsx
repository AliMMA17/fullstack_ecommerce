import Link from "next/link";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-gray-50">
      {/* Top */}
      <div className="page-wrap py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <Link
            href="/"
            className="inline-block text-2xl font-semibold tracking-tight text-gray-900"
          >
            Ali Rashchi
          </Link>
          <p className="mt-3 text-sm text-gray-600">
            Quality goods, fast delivery, easy returns.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
              <span>
                123 Market Street, Suite 45
                <br />
                Your City, Country
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-600" />
              <a href="tel:+1234567890" className="hover:text-emerald-700">
                +1 (234) 567-890
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-600" />
              <a
                href="alirashchi7@gmail.com"
                className="hover:text-emerald-700"
              >
                alirashchi7@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Follow us</h3>
          <div className="mt-3 flex items-center gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition"
            >
              <Instagram className="h-4.5 w-4.5" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition"
            >
              <Twitter className="h-4.5 w-4.5" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition"
            >
              <Facebook className="h-4.5 w-4.5" />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition"
            >
              <Youtube className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t bg-white">
        <div className="page-wrap py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-gray-500">
          <span>© {year} Ali Rashchi. All rights reserved.</span>
          <span>Made with ♥ for shoppers everywhere.</span>
        </div>
      </div>
    </footer>
  );
}
