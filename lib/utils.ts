import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseAIResponse(content: string) {
  try {
    // 1. 尝试直接解析
    return JSON.parse(content);
  } catch (e) {
    // 2. 尝试提取 Markdown 代码块中的内容
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        console.error('Failed to parse extracted JSON:', e2);
      }
    }

    // 3. 尝试找到第一个 { 和最后一个 }
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const potentialJson = content.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(potentialJson);
      } catch (e3) {
        console.error('Failed to parse substring JSON:', e3);
      }
    }

    throw new Error(`AI 返回的数据格式不正确，无法解析 JSON。内容预览: ${content.substring(0, 100)}...`);
  }
}

/**
 * 尝试修复并解析可能被截断的 JSON 字符串
 */
export function tryRepairAndParseJson(content: string) {
  try {
    return parseAIResponse(content);
  } catch (e) {
    // 如果解析失败，尝试补全括号
    let repaired = content.trim();
    
    // 统计括号数量
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    
    // 补全缺失的括号
    if (openBrackets > closeBrackets) {
      repaired += ' ]'.repeat(openBrackets - closeBrackets);
    }
    if (openBraces > closeBraces) {
      repaired += ' }'.repeat(openBraces - closeBraces);
    }
    
    try {
      return JSON.parse(repaired);
    } catch (e2) {
      // 如果补全后仍然失败，抛出原始错误
      throw e;
    }
  }
}

/**
 * 下载文件到本地
 */
export function downloadFile(content: string, filename: string, type: string = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
