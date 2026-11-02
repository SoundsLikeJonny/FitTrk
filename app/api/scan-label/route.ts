export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.ABACUSAI_API_KEY) {
    console.error('ABACUSAI_API_KEY environment variable is not set')
    return NextResponse.json({ error: 'AI service not configured. Set ABACUSAI_API_KEY.' }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const response = await fetch('https://routellm.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gemma-4-31b-it',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this nutrition label image. Extract the following information and respond in JSON format only:\n{\n  "name": "Product name if visible, otherwise describe the product",\n  "servingSizeG": serving size in grams (number),\n  "cal": calories per serving (number),\n  "fatG": total fat in grams per serving (number),\n  "carbG": total carbohydrates in grams per serving (number),\n  "proteinG": protein in grams per serving (number),\n  "typicalG": typical eaten amount in grams (same as serving size unless you can infer otherwise) (number)\n}\nRespond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`,
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
            ],
          },
        ],
        stream: true,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('LLM API error:', response.status, errText)
      let message = 'Failed to analyze image'
      if (response.status === 403) message = 'Invalid or expired API key. Check ABACUSAI_API_KEY.'
      else if (response.status === 429) message = 'Rate limit exceeded. Try again in a moment.'
      else if (response.status === 400) message = 'The AI could not process this image. Try a clearer photo.'
      else if (response.status === 404) message = 'Model not found. The configured model id may be incorrect.'
      // Surface the provider's actual error detail so we can diagnose credits vs rate-limit vs bad model id
      try {
        const parsed = JSON.parse(errText)
        const detail = parsed?.error?.message || parsed?.message || parsed?.error || ''
        if (detail) message = `${message} (${String(detail).slice(0, 180)})`
      } catch { /* non-JSON body; ignore */ }
      return NextResponse.json({ error: message, status: response.status }, { status: 500 })
    }

    const reader = response.body?.getReader()
    if (!reader) return NextResponse.json({ error: 'No response stream' }, { status: 500 })

    const decoder = new TextDecoder()
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = ''
        let partialRead = ''
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            partialRead += decoder.decode(value, { stream: true })
            const lines = partialRead.split('\n')
            partialRead = lines.pop() ?? ''
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  try {
                    const finalResult = JSON.parse(buffer)
                    const finalData = JSON.stringify({ status: 'completed', result: finalResult })
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
                  } catch {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'completed', result: { raw: buffer } })}\n\n`))
                  }
                  return
                }
                try {
                  const parsed = JSON.parse(data)
                  buffer += parsed.choices?.[0]?.delta?.content ?? ''
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'processing', message: 'Analyzing label...' })}\n\n`))
                } catch { /* skip */ }
              }
            }
          }
          // If we got here without [DONE], try to parse buffer
          if (buffer) {
            try {
              const finalResult = JSON.parse(buffer)
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'completed', result: finalResult })}\n\n`))
            } catch {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'completed', result: { raw: buffer } })}\n\n`))
            }
          }
        } catch (error: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'error', message: error?.message ?? 'Stream error' })}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Scan label error:', error)
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
  }
}
