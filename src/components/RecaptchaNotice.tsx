/**
 * reCAPTCHA のバッジを隠す代わりに出す、Google が求める小さな表記。
 * バッジは右下に固定で出て、スマホでは送信ボタンや下ナビと重なるため globals.css で隠している。
 * https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-badge.-what-is-allowed
 */
export function RecaptchaNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[9px] leading-snug opacity-60 ${className}`} data-testid="recaptcha-notice">
      This site is protected by reCAPTCHA and the Google{" "}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
        Privacy Policy
      </a>{" "}
      and{" "}
      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">
        Terms of Service
      </a>{" "}
      apply.
    </p>
  )
}

export default RecaptchaNotice
