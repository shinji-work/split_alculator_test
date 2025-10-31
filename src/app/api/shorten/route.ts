import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')
const URL_STORE_FILE = path.join(DATA_DIR, 'url-store.json')

interface UrlEntry {
  data: string
  createdAt: number
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    // ディレクトリが既に存在する場合は無視
  }
}

async function loadUrlStore(): Promise<Map<string, UrlEntry>> {
  try {
    await ensureDataDir()
    const fileContent = await fs.readFile(URL_STORE_FILE, 'utf-8')
    const data = JSON.parse(fileContent)
    return new Map(Object.entries(data))
  } catch (error) {
    return new Map()
  }
}

async function saveUrlStore(store: Map<string, UrlEntry>) {
  try {
    await ensureDataDir()
    const data = Object.fromEntries(store)
    await fs.writeFile(URL_STORE_FILE, JSON.stringify(data), 'utf-8')
  } catch (error) {
    console.error('Error saving URL store:', error)
  }
}

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let id = ''
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}

async function cleanupOldEntries(store: Map<string, UrlEntry>) {
  const now = Date.now()
  const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000 // 24時間
  let hasChanges = false

  for (const [id, entry] of store.entries()) {
    if (now - entry.createdAt > CLEANUP_INTERVAL) {
      store.delete(id)
      hasChanges = true
    }
  }

  if (hasChanges) {
    await saveUrlStore(store)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data } = body

    if (!data) {
      return NextResponse.json({ error: 'Data is required' }, { status: 400 })
    }

    const urlStore = await loadUrlStore()
    await cleanupOldEntries(urlStore)

    // 一意のIDを生成
    let shortId: string
    do {
      shortId = generateShortId()
    } while (urlStore.has(shortId))

    // データを保存
    urlStore.set(shortId, {
      data,
      createdAt: Date.now()
    })

    await saveUrlStore(urlStore)

    return NextResponse.json({ shortId })
  } catch (error) {
    console.error('Error shortening URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

