import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')
const URL_STORE_FILE = path.join(DATA_DIR, 'url-store.json')

interface UrlEntry {
  data: string
  createdAt: number
}

async function loadUrlStore(): Promise<Map<string, UrlEntry>> {
  try {
    const fileContent = await fs.readFile(URL_STORE_FILE, 'utf-8')
    const data = JSON.parse(fileContent)
    return new Map(Object.entries(data))
  } catch (error) {
    return new Map()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const urlStore = await loadUrlStore()
    const entry = urlStore.get(id)

    if (!entry) {
      return NextResponse.json({ error: 'Short URL not found' }, { status: 404 })
    }

    // リダイレクトURLを構築
    const redirectUrl = `/result?data=${entry.data}`

    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error) {
    console.error('Error retrieving short URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

