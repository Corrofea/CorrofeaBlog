# Giving Claude Code a Brain Transplant: Running DeepSeek on Claude Code

> 2025.07.28 | AI · Toolchain · Claude Code

## Why Do This

Claude Code is Anthropic's command-line AI programming assistant, using Claude models by default. Its interaction experience is excellent — agentic loops, tool calls, file editing — the whole workflow is remarkably smooth.

But Claude models have one unavoidable issue: for certain scenarios, DeepSeek offers better cost efficiency.

Can we combine Claude Code's "shell" with DeepSeek's "brain"?

The answer: yes, and it's simpler than you'd think.

## How It Works

Claude Code supports custom API endpoints through environment variables or config files. DeepSeek provides an OpenAI-compatible API. The bridge between them is an API compatibility layer.

```bash
# Point API endpoint to DeepSeek
export ANTHROPIC_BASE_URL="https://api.deepseek.com/v1"
export ANTHROPIC_API_KEY="your-deepseek-api-key"
```

In practice, though, DeepSeek's API isn't fully compatible with Anthropic's Messages API. We need an intermediate proxy for translation.

## Building the Proxy

Using a lightweight proxy (a simple Node.js service), we transform Claude Code's Anthropic-format requests into OpenAI format, then forward them to DeepSeek.

```javascript
// Core transformation logic
function anthropicToOpenAI(request) {
  return {
    model: 'deepseek-chat',
    messages: request.messages.map(m => ({
      role: m.role,
      content: m.content
    })),
    max_tokens: request.max_tokens,
    temperature: request.temperature,
    stream: request.stream
  };
}
```

## Pitfalls Encountered

1. **Tool use format mismatch**: Anthropic's `tool_use` content blocks and OpenAI's `tool_calls` have different structures. Bidirectional translation is needed in the proxy.

2. **System prompt handling**: Anthropic uses a top-level `system` field; OpenAI puts it in the `messages` array. Role mapping matters.

3. **Stop reason mapping**: `end_turn` vs `stop`, `max_tokens` vs `length` — these small differences can prevent Claude Code from correctly determining whether a conversation has ended.

4. **Token counting**: Claude Code relies on token counts in response headers for budget management. The proxy layer needs to calculate these manually.

## Real-World Experience

After the transplant, Claude Code's behavior is... nuanced. DeepSeek has an edge in code generation speed but occasionally "loses the thread" during complex multi-step reasoning. Claude Code's agentic framework handles this inconsistency gracefully — it auto-retries or rephrases its approach.

This reveals something interesting: **AI programming tools are decoupling from their frontend models**. A good agentic framework is, in itself, a compensation layer for underlying model imperfections.

## Conclusion

It works, but you need to accept some tradeoffs. Good for light coding tasks and code explanation; for heavy refactoring and multi-file edits, native Claude models remain the more reliable choice.

---

*The ultimate form of a toolchain is one where you never need to care which model is running underneath.*
