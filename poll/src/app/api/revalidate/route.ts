import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json()
    
    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Invalid path parameter' },
        { status: 400 }
      )
    }

    revalidatePath(path)
    
    return NextResponse.json({ revalidated: true })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}