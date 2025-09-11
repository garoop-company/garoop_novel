"use client"

import Link from "next/link"
import { FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa"
import { motion } from "framer-motion"

export default function Footer() {
  return (
    <footer className="text-center mt-12">
      <Link href="/" className="text-red-500 hover:underline">
        &larr; Back to the Entrance
      </Link>
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-1/3 text-center md:text-left mb-6 md:mb-0">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
              株式会社Garoop
            </h3>
            <p className="mt-2 text-sm">子供たちの創造力を育む、生成AIコンテンツ生成＆掲載プラットフォーム</p>
          </div>
          <div className="w-full md:w-1/3 text-center mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-2">各種案内</h4>
            <ul className="space-y-2">
              <li>
                <Link href="https://www.garoop.jp/" className="hover:text-pink-400 transition-colors duration-300">
                  会社概要
                </Link>
              </li>
              <li>
                <Link href="https://create.garoop.jp/" className="hover:text-pink-400 transition-colors duration-300">
                  Garoop
                </Link>
              </li>
              <li>
                <Link href="https://yuitv-lp.vercel.app/" className="hover:text-pink-400 transition-colors duration-300">
                  松下由依とコラボ
                </Link>
              </li>
              <li>
                <Link href="https://garooptv-lp.vercel.app/" className="hover:text-pink-400 transition-colors duration-300">
                  GaroopTV
                </Link>
              </li>
              <li>
                <Link href="https://garoop.notion.site/e49ed6d78ffc464f917792c822b4239f?source=copy_link" className="hover:text-pink-400 transition-colors duration-300">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="https://docs.google.com/forms/d/e/1FAIpQLScAQyFYrJD2ELoDTNyjVhIh3KsMPN35Rm-kpTXcpt06_wQbcA/viewform" className="hover:text-pink-400 transition-colors duration-300">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/3 text-center md:text-right">
            <h4 className="text-lg font-semibold mb-2">フォローする</h4>
            <div className="flex justify-center md:justify-end space-x-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.2 }}
                className="text-white hover:text-blue-400 transition-colors duration-300"
              >
                <FaTwitter size={24} href="https://x.com/garoop_company" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2 }}
                className="text-white hover:text-blue-600 transition-colors duration-300"
              >
                <FaFacebook size={24} href="https://www.facebook.com/garoopgiftshop" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2 }}
                className="text-white hover:text-pink-400 transition-colors duration-300"
              >
                <FaInstagram size={24} href="https://www.instagram.com/garuchan_wakuwaku/" />
              </motion.a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} 株式会社Garoop. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

