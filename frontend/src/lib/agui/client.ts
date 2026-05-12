import { HttpAgent } from '@ag-ui/client'
import type { AgentSubscriber } from '@ag-ui/client'
import type { RunAgentInput } from '@ag-ui/core'

export function runAGUIStream(
  url: string,
  input: RunAgentInput,
  subscriber: AgentSubscriber,
): () => void {
  const agent = new HttpAgent({
    url,
    threadId: input.threadId,
    initialMessages: input.messages,
  })
  agent.runAgent(input, subscriber).catch((err: Error) => {
    if (err.name !== 'AbortError') console.error('[AG-UI]', err)
  })
  return () => agent.abortRun()
}
