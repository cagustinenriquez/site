// Sample answers for local preview only (`npm run dev` has no /api/chat). The chat widget
// loads this file only in development, so none of it ships to the live site.
import { clientWork, contact, coreStack, projects } from '@/content/profile'

export function previewReply(question: string): string {
  const q = question.toLowerCase()
  const tag = '[preview, not AI] '
  if (/stack|skill|tech|python|aws|tools?\b|know/.test(q)) {
    return `${tag}His main stack is ${coreStack.slice(0, 4).join(', ')}, plus ${coreStack.slice(4).join(', ')} on the frontend. He also works with AWS, Docker, Kubernetes, Kafka and RabbitMQ.`
  }
  if (/remote|time ?zone|hire|available|availability|work with/.test(q)) {
    return `${tag}Yep, he's open to remote work across US, EU and Asia timezones. He's based in ${contact.location}.`
  }
  if (/contact|email|reach|linkedin|talk/.test(q)) {
    return `${tag}The fastest way is email: ${contact.email}. He's on LinkedIn too.`
  }
  if (/project|built|example|experience/.test(q)) {
    return `${tag}A few of his projects: ${projects
      .slice(0, 3)
      .map((p) => `${p.name} (${p.summary.split(':')[0].replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase())})`)
      .join('; ')}. ${clientWork}`
  }
  return `${tag}Once the AI is connected I'll answer that properly. For now: ask about his stack, remote work, projects or how to reach him.`
}
