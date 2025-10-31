'use client'

import { useState, useEffect, RefObject } from 'react'
import dynamic from 'next/dynamic'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CalculationResult, CalculationInput } from '@/lib/types'
import { Copy, QrCode, Download, MessageSquare, ExternalLink } from 'lucide-react'
import { LineIcon, FacebookIcon, TwitterIcon } from 'react-share'
import html2canvas from 'html2canvas'

const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), {
  ssr: false
})


interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  result: CalculationResult | null
  resultRef: RefObject<HTMLDivElement>
  downloadRef?: RefObject<HTMLDivElement>
  input?: CalculationInput
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, result, resultRef, downloadRef, input }) => {
  const [shareUrl, setShareUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownloadImage = () => {
    const targetRef = downloadRef?.current || resultRef.current
    if (targetRef) {
      html2canvas(targetRef, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: targetRef.scrollWidth,
        windowHeight: targetRef.scrollHeight,
      }).then(canvas => {
        const image = canvas.toDataURL('image/png', 1.0)
        const link = document.createElement('a')
        link.href = image
        link.download = '割り勘計算明細書.png'
        link.click()
      })
    }
  }

  useEffect(() => {
    const generateShortUrl = async () => {
      if (!result) return

      setIsGenerating(true)
      try {
        const shareData = {
          result,
          input: input || null
        }
        const jsonString = JSON.stringify(shareData)
        const encodedData = btoa(encodeURIComponent(jsonString))

        // 短縮URLを生成
        const response = await fetch('/api/shorten', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: encodedData }),
        })

        if (response.ok) {
          const { shortId } = await response.json()
          const shortUrl = `${window.location.origin}/api/shorten/${shortId}`
          setShareUrl(shortUrl)
        } else {
          // エラーの場合は元の長いURLを使用
          const url = `${window.location.origin}/result?data=${encodedData}`
          setShareUrl(url)
        }
      } catch (error) {
        console.error('Error generating short URL:', error)
        // エラーの場合は元の長いURLを使用
        const shareData = {
          result,
          input: input || null
        }
        const jsonString = JSON.stringify(shareData)
        const encodedData = btoa(encodeURIComponent(jsonString))
        const url = `${window.location.origin}/result?data=${encodedData}`
        setShareUrl(url)
      } finally {
        setIsGenerating(false)
      }
    }

    generateShortUrl()
  }, [result, input])

  if (!result) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>結果を共有</DialogTitle>
          <DialogDescription>
            以下の方法で計算結果を共有できます。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
            {isGenerating ? (
              <Button variant="outline" className="w-full justify-start" disabled>
                <ExternalLink className="mr-2 h-4 w-4" />
                URL生成中...
              </Button>
            ) : (
              <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    プレビュー
                </Button>
              </a>
            )}
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              disabled={isGenerating || !shareUrl}
            >
                <Copy className="mr-2 h-4 w-4" />
                リンクをコピー
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleDownloadImage}>
                <Download className="mr-2 h-4 w-4" />
                画像を保存
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => {
                const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`
                window.open(lineUrl, '_blank', 'noopener,noreferrer')
              }}
            >
              <LineIcon size={24} round className="mr-2" />
              LINEで共有
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => {
                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
                window.open(facebookUrl, '_blank', 'noopener,noreferrer')
              }}
            >
              <FacebookIcon size={24} round className="mr-2" />
              Facebookで共有
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => {
                const tweetText = '割り勘計算の結果を共有します'
                const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(tweetText)}`
                window.open(twitterUrl, '_blank', 'noopener,noreferrer')
              }}
            >
              <TwitterIcon size={24} round className="mr-2" />
              X（旧Twitter）で共有
            </Button>
            <div className="text-center pt-4">
              <QRCodeSVG value={shareUrl} size={128} level="L" />
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
