import { Telegraf } from 'telegraf'

const NOSANA_URL = 'https://5i8frj7ann99bbw9gzpprvzj2esugg39hxbb4unypskq.node.k8s.prd.nos.ci/v1/chat/completions'
const MODEL = 'Qwen3.5-9B-FP8'

const SYSTEM_PROMPT = `You are Vectra, an AI strategy agent that helps people turn ideas into real execution plans.

When someone shares an idea, analyze it and respond in this exact format. Write in simple, clear, everyday English — like you're talking to a smart friend, not writing a business report. No jargon, no corporate language.

## FEASIBILITY SCORE
[Number 0-100]/100 — [STRONG/VIABLE/RISKY/WEAK]
[One plain sentence on what this score means for this idea]

## WHAT THIS IS REALLY ABOUT
[3-4 sentences: What problem does this solve? Who has this problem? How bad is it? Is the timing right?]

## WHAT COULD GO WRONG
1. [Problem name] — [2 sentences explaining the risk in plain English and why it matters]
2. [Problem name] — [2 sentences explaining the risk in plain English and why it matters]  
3. [Problem name] — [2 sentences explaining the risk in plain English and why it matters]

## THE BEST DIRECTION TO TAKE
[Direction name] — [2-3 sentences on exactly what to build and why this beats other options]
Confidence: [percentage]%

## PATHS THAT WON'T WORK
- [Option]: [Why this fails for this specific idea, in plain English]
- [Option]: [Why this fails for this specific idea, in plain English]

## HOW TO EXECUTE THIS
1. [Phase name] — [What to do, what success looks like, how long it takes]
2. [Phase name] — [What to do, what success looks like, how long it takes]
3. [Phase name] — [What to do, what success looks like, how long it takes]

## WHAT TO BUILD FIRST
BUILD THESE: [5 things that are essential, comma-separated, in plain English]
SKIP THESE: [5 things that seem important but aren't, comma-separated, in plain English]

Rules:
- Write like you're texting a smart friend
- Be specific to THIS idea, not generic
- Be honest — if something is a bad idea, say so clearly
- No buzzwords, no corporate language
- Minimum 400 words total`

async function analyzeIdea(idea: string): Promise<string> {
  const res = await fetch(NOSANA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer nosana',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this idea: ${idea}` }
      ],
      max_tokens: 3000,
      temperature: 0.7,
      stream: false,
      chat_template_kwargs: { enable_thinking: false }
    }),
  })

  const data = await res.json()
  return data?.choices?.[0]?.message?.content || 'Analysis failed. Please try again.'
}

export function startTelegramBot(token: string) {
  const bot = new Telegraf(token)

  bot.start((ctx) => {
    ctx.reply(
      `Welcome to Vectra Strategic AI.\n\nI analyze ideas and turn them into execution strategies.\n\nSend me any idea or business concept and I will give you:\n- Feasibility score\n- Strategic reading\n- Critical weaknesses\n- Recommended direction\n- Execution roadmap\n- MVP scope\n\nWhat's your idea?`,
    )
  })

  bot.help((ctx) => {
    ctx.reply('Send me any idea and I will analyze it. Example:\n\n"I want to build a platform where African freelancers can find Web3 jobs"')
  })

  bot.on('text', async (ctx) => {
    const idea = ctx.message.text

    if (idea.startsWith('/')) return
    const greetings = ['hi', 'hello', 'hey', 'sup', 'yo', 'good morning', 'good evening', 'hola']
  const isGreeting = greetings.some(g => idea.toLowerCase().trim().startsWith(g))

  if (isGreeting) {
    await ctx.reply(
      `Hey! I'm Vectra — your AI strategy agent.\n\nTell me your idea and I'll analyze it for you. I'll give you:\n\n• A feasibility score\n• What could go wrong\n• The strongest direction to take\n• A clear execution plan\n• What to build first vs what to skip\n\nWhat's your idea?`
    )
    return
  }

    await ctx.reply('Analyzing your idea... This may take 20-30 seconds.')

    try {
      const result = await analyzeIdea(idea)

      // Split into chunks if too long for Telegram (4096 char limit)
      if (result.length > 4000) {
        const chunks = result.match(/.{1,4000}/gs) || [result]
        for (const chunk of chunks) {
          await ctx.reply(chunk)
        }
      } else {
        await ctx.reply(result)
      }
    } catch {
      await ctx.reply('Something went wrong. Please try again.')
    }
  })

  bot.launch()
  console.log('Vectra Telegram bot is running...')

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}