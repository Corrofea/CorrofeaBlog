# 给 Claude Code 换脑：让 DeepSeek 跑在 Claude Code 上

> 2025.07.28 | AI · 工具链 · Claude Code

## 为什么要这么做

Claude Code 是 Anthropic 推出的命令行 AI 编程助手，默认使用 Claude 系列模型。它的交互体验做得很好——agentic loop、工具调用、文件编辑，整套流程非常流畅。

但 Claude 模型有一个不可回避的问题：对于某些场景，DeepSeek 的性价比更高。

能不能把 Claude Code 的"壳"和 DeepSeek 的"脑"结合起来？

答案是：可以，而且比想象中简单。

## 原理

Claude Code 支持通过环境变量或配置文件指定自定义 API endpoint。DeepSeek 提供了与 OpenAI 兼容的 API 接口。两者的桥梁就是 API 兼容层。

```bash
# 设置 API endpoint 指向 DeepSeek
export ANTHROPIC_BASE_URL="https://api.deepseek.com/v1"
export ANTHROPIC_API_KEY="your-deepseek-api-key"
```

但实际上，DeepSeek 的 API 并不是完全兼容 Anthropic 的 Messages API。我们需要一个中间代理来做转换。

## 搭建代理

使用一个轻量代理（比如自己写一个简单的 Node.js 服务），将 Claude Code 发出的 Anthropic-format 请求转换为 OpenAI-format，然后转发给 DeepSeek。

```javascript
// 核心转换逻辑
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

## 踩到的坑

1. **Tool use 格式不一致**：Anthropic 的 tool_use content block 和 OpenAI 的 tool_calls 结构不同，需要在代理中做双向转换。

2. **System prompt 处理**：Anthropic 的 system prompt 是顶层字段，OpenAI 放在 messages 数组里，需要注意角色映射。

3. **Stop reason 映射**：`end_turn` vs `stop`，`max_tokens` vs `length`，这些小差异会导致 Claude Code 无法正确判断对话是否结束。

4. **Token 计数**：Claude Code 依赖响应头中的 token 计数来做预算管理，需要代理层手动计算。

## 实际体验

换脑之后的 Claude Code 体验很微妙。DeepSeek 在代码生成速度上有优势，但在复杂多步推理时会偶尔"断片"。Claude Code 的 agentic 框架对这种不一致有很好的容错——它会自动重试或者换一种方式提问。

这其实揭示了一个有趣的事实：**AI 编程工具正在从前端模型解耦**。一个好的 agentic 框架，本身就是对底层模型缺陷的补偿层。

## 结论

能用，但需要接受一些 tradeoff。适合轻度编码任务和代码解释场景，对于重度重构和多文件编辑，原生 Claude 模型仍然是更可靠的选择。

---

*工具链的终极形态，是让你不必关心用的是哪个模型。*
