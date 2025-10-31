'use client'

import { useState, useEffect, RefObject } from 'react'
import dynamic from 'next/dynamic'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CalculationResult } from '@/lib/types'
import { Copy, QrCode, Download, MessageSquare, ExternalLink } from 'lucide-react'
import { LineShareButton, LineIcon } from 'react-share'
import html2canvas from 'html2canvas'

const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), {
  ssr: false
})


interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  result: CalculationResult | null
  resultRef: RefObject<HTMLDivElement>
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, result, resultRef }) => {
  const [shareUrl, setShareUrl] = useState('')

  const handleDownloadImage = () => {
    if (resultRef.current) {
      html2canvas(resultRef.current).then(canvas => {
        const image = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = image
        link.download = 'split-result.png'
        link.click()
      })
    }
  }

  useEffect(() => {
    if (result) {
      const jsonString = JSON.stringify(result)
      const encodedData = btoa(encodeURIComponent(jsonString))
      const url = `${window.location.origin}/result?data=${encodedData}`
      setShareUrl(url)
    }
  }, [result])

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
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  プレビュー
              </Button>
            </a>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                <Copy className="mr-2 h-4 w-4" />
                リンクをコピー
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleDownloadImage}>
                <Download className="mr-2 h-4 w-4" />
                画像を保存
            </Button>
            <LineShareButton url={shareUrl} className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <LineIcon size={24} round className="mr-2" />
                LINEで共有
              </Button>
            </LineShareButton>
            <div className="text-center pt-4">
              <QRCodeSVG value={shareUrl} size={128} />
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
