// components/footer.jsx
import { Icon } from "@iconify/react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:school" className="text-2xl text-blue-400" />
              <span className="font-bold text-lg">EduSearch</span>
            </div>
            <p className="text-gray-400 text-sm">
              Find the best consultancy for your course abroad and kickstart
              your international education journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/register"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  Register
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  Login
                </a>
              </li>
              <li>
                <a
                  href="/profile"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  Profile
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  Study Abroad
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  Countries
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  Courses
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Icon icon="mdi:email" className="text-blue-400" />
                <a
                  href="mailto:info@edusearch.com"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  info@edusearch.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Icon icon="mdi:phone" className="text-blue-400" />
                <a
                  href="tel:+1234567890"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  +1 (234) 567-890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} EduSearch. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition"
                title="Facebook"
              >
                <Icon icon="mdi:facebook" className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition"
                title="Twitter"
              >
                <Icon icon="mdi:twitter" className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition"
                title="LinkedIn"
              >
                <Icon icon="mdi:linkedin" className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition"
                title="Instagram"
              >
                <Icon icon="mdi:instagram" className="text-xl" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
