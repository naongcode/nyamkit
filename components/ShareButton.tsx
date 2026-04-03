'use client'

export default function ShareButton({ name }: { name: string }) {
  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: `냠킷 - ${name}`, text: `이거 땡기지 않음? 🍱`, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert('링크가 복사됐어요!')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="bg-white border border-orange-300 text-orange-500 py-3 px-5 rounded-full font-semibold text-sm"
    >
      공유 🔗
    </button>
  )
}
