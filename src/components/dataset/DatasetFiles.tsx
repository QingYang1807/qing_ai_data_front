'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload,
  Download,
  Trash2,
  Eye,
  File,
  Image,
  Video,
  Music,
  FileText,
  MoreHorizontal,
  Search,
  Filter,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileCode,
  FileSpreadsheet,
  FileText as FileWord,
  Presentation,
  RefreshCw
} from 'lucide-react';
import { useDatasetStore } from '@/stores/useDatasetStore';
import { Dataset, DatasetFile, FileStatus } from '@/types';
import { ToastContainer } from '@/components/common/Toast';
import { useToast } from '@/hooks/useToast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
// 导入文件处理库
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-docker';

// 代码文件扩展名映射 - 共享配置
const CODE_FILE_EXTENSIONS = {
  'js': 'javascript',
  'ts': 'typescript',
  'jsx': 'javascript',
  'tsx': 'typescript',
  'py': 'python',
  'java': 'java',
  'c': 'c',
  'cpp': 'cpp',
  'cs': 'csharp',
  'php': 'php',
  'rb': 'ruby',
  'go': 'go',
  'rs': 'rust',
  'sql': 'sql',
  'html': 'markup',
  'css': 'css',
  'scss': 'css',
  'less': 'css',
  'xml': 'markup',
  'yaml': 'yaml',
  'yml': 'yaml',
  'md': 'markdown',
  'sh': 'bash',
  'dockerfile': 'docker',
  'json': 'json'
} as const;

// 自动检测字符编码
function detectCharset(bytes: Uint8Array, hintCharset?: string): string {
  // 首先检查BOM标记
  if (bytes.length >= 3) {
    if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      return 'utf-8';
    } else if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
      return 'utf-16be';
    } else if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
      return 'utf-16le';
    }
  }

  // 如果有提示字符集，优先使用
  if (hintCharset) {
    const normalizedHint = hintCharset.toLowerCase();
    if (['utf-8', 'utf8', 'gbk', 'gb2312', 'gb18030', 'big5', 'iso-8859-1', 'latin1'].includes(normalizedHint)) {
      return normalizedHint;
    }
  }

  // 简单的字符编码检测
  let chineseCharCount = 0;
  let gbkCharCount = 0;
  let big5CharCount = 0;
  let utf8CharCount = 0;
  
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    
    // 检查UTF-8编码模式
    if (byte >= 0x80) {
      if (i + 1 < bytes.length && bytes[i + 1] >= 0x80 && bytes[i + 1] <= 0xBF) {
        // 可能是UTF-8
        utf8CharCount++;
      }
    }
    
    // 检查GBK编码模式
    if (byte >= 0x81 && byte <= 0xFE && i + 1 < bytes.length) {
      const byte2 = bytes[i + 1];
      if (byte2 >= 0x40 && byte2 <= 0xFE && byte2 !== 0x7F) {
        gbkCharCount++;
        chineseCharCount++;
        i++; // 跳过下一个字节
      }
    }
    
    // 检查BIG5编码模式
    if (byte >= 0xA1 && byte <= 0xFE && i + 1 < bytes.length) {
      const byte2 = bytes[i + 1];
      if ((byte2 >= 0x40 && byte2 <= 0x7E) || (byte2 >= 0xA1 && byte2 <= 0xFE)) {
        big5CharCount++;
        chineseCharCount++;
        i++; // 跳过下一个字节
      }
    }
  }

  // 如果有中文字符，根据编码模式判断
  if (chineseCharCount > 0) {
    if (gbkCharCount > big5CharCount && gbkCharCount > utf8CharCount) {
      return 'gbk';
    } else if (big5CharCount > gbkCharCount && big5CharCount > utf8CharCount) {
      return 'big5';
    } else if (utf8CharCount > gbkCharCount && utf8CharCount > big5CharCount) {
      return 'utf-8';
    }
  }

  // 默认使用UTF-8
  return 'utf-8';
}

// MHTML内容解码函数
function decodeMHTMLContent(arrayBuffer: ArrayBuffer, contentType: string | null): string {
  try {
    // 检查Content-Type中的字符编码
    let hintCharset = null;
    if (contentType) {
      const charsetMatch = contentType.match(/charset=([^;]+)/i);
      if (charsetMatch) {
        hintCharset = charsetMatch[1].trim().toLowerCase();
      }
    }

    // 转换ArrayBuffer为字符串
    const bytes = new Uint8Array(arrayBuffer);
    
    // 检查BOM标记
    if (bytes.length >= 3) {
      if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
        // UTF-8 BOM
        return new TextDecoder('utf-8').decode(bytes.slice(3));
      } else if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
        // UTF-16 BE BOM
        return new TextDecoder('utf-16be').decode(bytes.slice(2));
      } else if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
        // UTF-16 LE BOM
        return new TextDecoder('utf-16le').decode(bytes.slice(2));
      }
    }

    // 自动检测字符编码
    const detectedCharset = detectCharset(bytes, hintCharset || undefined);
    console.log(`Detected charset: ${detectedCharset}, hint: ${hintCharset}`);

    // 根据字符集解码
    try {
      switch (detectedCharset) {
        case 'utf-8':
        case 'utf8':
          return new TextDecoder('utf-8').decode(bytes);
        case 'gbk':
        case 'gb2312':
        case 'gb18030':
          // 尝试使用GBK解码，如果失败则回退到UTF-8
          try {
            // 由于浏览器不支持GBK，我们需要手动处理
            return decodeGBK(bytes);
          } catch (e) {
            console.warn('GBK decoding failed, falling back to UTF-8');
            return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
          }
        case 'big5':
          // 尝试使用BIG5解码
          try {
            return decodeBIG5(bytes);
          } catch (e) {
            console.warn('BIG5 decoding failed, falling back to UTF-8');
            return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
          }
        case 'iso-8859-1':
        case 'latin1':
          return new TextDecoder('iso-8859-1').decode(bytes);
        default:
          // 尝试UTF-8，如果失败则使用replacement字符
          return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      }
    } catch (e) {
      console.warn(`Failed to decode with charset ${detectedCharset}, trying fallback`);
      // 最后的回退方案
      return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    }
  } catch (error) {
    console.error('Content decoding error:', error);
    // 最后的回退方案
    return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(arrayBuffer));
  }
}

// 改进的GBK解码函数，使用更准确的编码映射
function decodeGBK(bytes: Uint8Array): string {
  let result = '';
  let i = 0;
  
  // GBK常见字符映射（简化版，包含常用中文字符）
  const gbkMap = new Map([
    // 常用中文字符 (0xB0A1-0xF7FE范围内的一些字符)
    [0xB0A1, '啊'], [0xB0A2, '阿'], [0xB0A3, '埃'], [0xB0A4, '挨'], [0xB0A5, '哎'],
    [0xB0A6, '唉'], [0xB0A7, '哀'], [0xB0A8, '皑'], [0xB0A9, '癌'], [0xB0AA, '蔼'],
    [0xB0AB, '矮'], [0xB0AC, '艾'], [0xB0AD, '碍'], [0xB0AE, '爱'], [0xB0AF, '隘'],
    [0xD6D0, '中'], [0xB9FA, '国'], [0xC8CB, '人'], [0xCDC4, '大'], [0xB5D8, '地'],
    [0xC9CF, '你'], [0xC3C5, '我'], [0xCBFB, '他'], [0xCBBE, '们'], [0xBAC3, '在'],
    [0xD5BB, '有'], [0xCACB, '是'], [0xB2BB, '不'], [0xC1CB, '了'], [0xB8F6, '就'],
    [0xC8B8, '和'], [0xB8DF, '个'], [0xD6BB, '上'], [0xC0D6, '来'], [0xD6D8, '到'],
    [0xB9FB, '这'], [0xD6BB, '个'], [0xC9B5, '那'], [0xD6D0, '中'], [0xC8CB, '人'],
    [0xD2BB, '一'], [0xB6FE, '二'], [0xC8FD, '三'], [0xCBCD, '四'], [0xCEE5, '五'],
    [0xC1F9, '六'], [0xC6DF, '七'], [0xB0CB, '八'], [0xBEC5, '九'], [0xCAAE, '十'],
    [0xD4DA, '的'], [0xBDB2, '要'], [0xC3BB, '以'], [0xC9B5, '那'], [0xD6BB, '个'],
    [0xB7BD, '与'], [0xD2BB, '也'], [0xB2BB, '不'], [0xB9FD, '还'], [0xCAAC, '是'],
    [0xD6BB, '个'], [0xB7BD, '与'], [0xD2BB, '也'], [0xB2BB, '不'], [0xB9FD, '还']
  ]);

  while (i < bytes.length) {
    const byte = bytes[i];
    
    if (byte <= 0x7F) {
      // ASCII字符
      result += String.fromCharCode(byte);
      i++;
    } else if (byte >= 0x81 && byte <= 0xFE && i + 1 < bytes.length) {
      // GBK双字节字符
      const byte2 = bytes[i + 1];
      if (byte2 >= 0x40 && byte2 <= 0xFE && byte2 !== 0x7F) {
        const codePoint = (byte << 8) | byte2;
        
        // 检查是否在映射表中
        if (gbkMap.has(codePoint)) {
          result += gbkMap.get(codePoint)!;
        } else if (codePoint >= 0x4E00 && codePoint <= 0x9FFF) {
          // 基本汉字Unicode范围
          result += String.fromCharCode(codePoint);
        } else {
          // 尝试直接转换为字符
          try {
            result += String.fromCharCode(codePoint);
          } catch {
            result += '?';
          }
        }
        i += 2;
      } else {
        result += String.fromCharCode(byte);
        i++;
      }
    } else {
      result += String.fromCharCode(byte);
      i++;
    }
  }
  
  return result;
}

// 改进的BIG5解码函数，使用更准确的编码映射
function decodeBIG5(bytes: Uint8Array): string {
  let result = '';
  let i = 0;
  
  // BIG5常见字符映射（简化版，包含常用繁体中文字符）
  const big5Map = new Map([
    // 常用繁体中文字符
    [0xA440, '一'], [0xA441, '丁'], [0xA442, '七'], [0xA443, '万'], [0xA444, '丈'],
    [0xA445, '三'], [0xA446, '上'], [0xA447, '下'], [0xA448, '不'], [0xA449, '与'],
    [0xA44A, '丐'], [0xA44B, '丑'], [0xA44C, '且'], [0xA44D, '丕'], [0xA44E, '世'],
    [0xA44F, '丘'], [0xA450, '丙'], [0xA451, '丞'], [0xA452, '乖'], [0xA453, '串'],
    [0xA454, '中'], [0xA455, '丟'], [0xA456, '丹'], [0xA457, '主'], [0xA458, '乃'],
    [0xA459, '久'], [0xA45A, '么'], [0xA45B, '之'], [0xA45C, '乍'], [0xA45D, '乎'],
    [0xA45E, '乏'], [0xA45F, '亭'], [0xA460, '亂'], [0xA461, '了'], [0xA462, '予'],
    [0xA463, '事'], [0xA464, '二'], [0xA465, '于'], [0xA466, '云'], [0xA467, '互'],
    [0xA468, '五'], [0xA469, '井'], [0xA46A, '亙'], [0xA46B, '亞'], [0xA46C, '些'],
    [0xA46D, '亟'], [0xA46E, '亡'], [0xA46F, '亢'], [0xA470, '交'], [0xA471, '亥'],
    [0xA472, '亦'], [0xA473, '亨'], [0xA474, '享'], [0xA475, '京'], [0xA476, '亮'],
    [0xA477, '亲'], [0xA478, '人'], [0xA479, '仁'], [0xA47A, '什'], [0xA47B, '仇'],
    [0xA47C, '今'], [0xA47D, '介'], [0xA47E, '仍'], [0xA4A1, '從'], [0xA4A2, '仔'],
    [0xA4A3, '他'], [0xA4A4, '仗'], [0xA4A5, '付'], [0xA4A6, '仙'], [0xA4A7, '代'],
    [0xA4A8, '令'], [0xA4A9, '以'], [0xA4AA, '仟'], [0xA4AB, '仵'], [0xA4AC, '件'],
    [0xA4AD, '任'], [0xA4AE, '份'], [0xA4AF, '仿'], [0xA4B0, '企'], [0xA4B1, '伊'],
    [0xA4B2, '伍'], [0xA4B3, '伏'], [0xA4B4, '伐'], [0xA4B5, '休'], [0xA4B6, '伙'],
    [0xA4B7, '會'], [0xA4B8, '企'], [0xA4B9, '伎'], [0xA4BA, '估'], [0xA4BB, '体'],
    [0xA4BC, '何'], [0xA4BD, '但'], [0xA4BE, '作'], [0xA4BF, '你'], [0xA4C0, '伯'],
    [0xA4C1, '低'], [0xA4C2, '住'], [0xA4C3, '伴'], [0xA4C4, '伶'], [0xA4C5, '余'],
    [0xA4C6, '佛'], [0xA4C7, '作'], [0xA4C8, '你'], [0xA4C9, '佣'], [0xA4CA, '何'],
    [0xA4CB, '你'], [0xA4CC, '你'], [0xA4CD, '來'], [0xA4CE, '們'], [0xA4CF, '侖'],
    [0xA4D0, '倆'], [0xA4D1, '偷'], [0xA4D2, '偉'], [0xA4D3, '偽'], [0xA4D4, '健'],
    [0xA4D5, '停'], [0xA4D6, '們'], [0xA4D7, '做'], [0xA4D8, '你'], [0xA4D9, '偵'],
    [0xA4DA, '偶'], [0xA4DB, '偷'], [0xA4DC, '偽'], [0xA4DD, '健'], [0xA4DE, '停'],
    [0xA4DF, '們'], [0xA4E0, '做'], [0xA4E1, '你'], [0xA4E2, '偵'], [0xA4E3, '偽'],
    [0xB0EA, '中'], [0xA6A1, '國'], [0xA448, '不'], [0xBAA7, '來'], [0xA45A, '了'],
    [0xA44F, '丘'], [0xA446, '上'], [0xA447, '下'], [0xA449, '與'], [0xA45B, '之'],
    [0xA477, '親'], [0xA478, '人'], [0xA479, '仁'], [0xA4A3, '他'], [0xA4CE, '們'],
    [0xA4C4, '你'], [0xA4D5, '們'], [0xA4D6, '做'], [0xA4D7, '你'], [0xA4D8, '偵'],
    [0xA4D9, '偽'], [0xA4DA, '健'], [0xA4DB, '停'], [0xA4DC, '們'], [0xA4DD, '做']
  ]);

  while (i < bytes.length) {
    const byte = bytes[i];
    
    if (byte <= 0x7F) {
      // ASCII字符
      result += String.fromCharCode(byte);
      i++;
    } else if (byte >= 0xA1 && byte <= 0xFE && i + 1 < bytes.length) {
      // BIG5双字节字符
      const byte2 = bytes[i + 1];
      if ((byte2 >= 0x40 && byte2 <= 0x7E) || (byte2 >= 0xA1 && byte2 <= 0xFE)) {
        const codePoint = (byte << 8) | byte2;
        
        // 检查是否在映射表中
        if (big5Map.has(codePoint)) {
          result += big5Map.get(codePoint)!;
        } else if (codePoint >= 0x4E00 && codePoint <= 0x9FFF) {
          // 基本汉字Unicode范围
          result += String.fromCharCode(codePoint);
        } else {
          // 尝试直接转换为字符
          try {
            result += String.fromCharCode(codePoint);
          } catch {
            result += '?';
          }
        }
        i += 2;
      } else {
        result += String.fromCharCode(byte);
        i++;
      }
    } else {
      result += String.fromCharCode(byte);
      i++;
    }
  }
  
  return result;
}

// MHTML解析函数
function parseMHTML(mhtmlContent: string): string {
  try {
    // MHTML文件通常以MIME头部开始
    const lines = mhtmlContent.split('\n');
    let boundary = '';
    let inHtmlPart = false;
    let htmlContent = '';
    let contentType = '';
    let contentTransferEncoding = '';
    let location = '';
    let charset = 'utf-8';

    // 查找boundary和全局字符编码
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('boundary=')) {
        boundary = line.split('=')[1].replace(/"/g, '');
      } else if (line.toLowerCase().startsWith('content-type:')) {
        const fullContentType = line.split(':')[1].trim();
        if (fullContentType.toLowerCase().includes('charset=')) {
          const charsetMatch = fullContentType.match(/charset=([^;]+)/i);
          if (charsetMatch) {
            charset = charsetMatch[1].trim().toLowerCase();
          }
        }
      }
    }

    // 如果没有找到boundary，尝试直接提取HTML
    if (!boundary) {
      // 尝试查找HTML内容
      const htmlMatch = mhtmlContent.match(/<html[^>]*>[\s\S]*?<\/html>/i);
      if (htmlMatch) {
        return htmlMatch[0];
      }
      return mhtmlContent;
    }

    // 按boundary分割内容
    const parts = mhtmlContent.split('--' + boundary);
    
    for (const part of parts) {
      const partLines = part.trim().split('\n');
      let isHtmlPart = false;
      let partContent = '';
      let skipHeaders = true;

      for (let i = 0; i < partLines.length; i++) {
        const line = partLines[i].trim();
        
        if (line === '') {
          skipHeaders = false;
          continue;
        }

        if (skipHeaders) {
          if (line.toLowerCase().startsWith('content-type:')) {
            contentType = line.split(':')[1].trim();
            if (contentType.toLowerCase().includes('text/html')) {
              isHtmlPart = true;
            }
            // 检查部分的字符编码
            if (contentType.toLowerCase().includes('charset=')) {
              const charsetMatch = contentType.match(/charset=([^;]+)/i);
              if (charsetMatch) {
                charset = charsetMatch[1].trim().toLowerCase();
              }
            }
          } else if (line.toLowerCase().startsWith('content-transfer-encoding:')) {
            contentTransferEncoding = line.split(':')[1].trim();
          } else if (line.toLowerCase().startsWith('content-location:')) {
            location = line.split(':')[1].trim();
          }
        } else {
          partContent += line + '\n';
        }
      }

      if (isHtmlPart && partContent) {
        // 处理编码
        if (contentTransferEncoding.toLowerCase() === 'base64') {
          try {
            htmlContent = atob(partContent.trim());
          } catch (e) {
            htmlContent = partContent;
          }
        } else if (contentTransferEncoding.toLowerCase() === 'quoted-printable') {
          htmlContent = decodeQuotedPrintable(partContent);
        } else {
          htmlContent = partContent;
        }
        break;
      }
    }

    // 如果没有找到HTML部分，尝试提取任何HTML内容
    if (!htmlContent) {
      const htmlMatch = mhtmlContent.match(/<html[^>]*>[\s\S]*?<\/html>/i);
      if (htmlMatch) {
        htmlContent = htmlMatch[0];
      } else {
        htmlContent = mhtmlContent;
      }
    }

    // 清理和修复HTML内容
    return cleanAndFixHTML(htmlContent);
  } catch (error) {
    console.error('MHTML parsing error:', error);
    // 如果解析失败，尝试直接提取HTML内容
    const htmlMatch = mhtmlContent.match(/<html[^>]*>[\s\S]*?<\/html>/i);
    if (htmlMatch) {
      return htmlMatch[0];
    }
    return mhtmlContent;
  }
}

// Quoted-Printable解码函数
function decodeQuotedPrintable(str: string): string {
  return str
    .replace(/=([0-9A-F]{2})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/=\r?\n/g, '')
    .replace(/_/g, ' ');
}

// 清理和修复HTML内容
function cleanAndFixHTML(html: string): string {
  let cleaned = html;

  // 移除MHTML特定的头部信息
  cleaned = cleaned.replace(/^From:.*$/gm, '');
  cleaned = cleaned.replace(/^Subject:.*$/gm, '');
  cleaned = cleaned.replace(/^Date:.*$/gm, '');
  cleaned = cleaned.replace(/^MIME-Version:.*$/gm, '');
  cleaned = cleaned.replace(/^Content-Type:.*$/gm, '');
  cleaned = cleaned.replace(/^Content-Transfer-Encoding:.*$/gm, '');
  cleaned = cleaned.replace(/^Content-Location:.*$/gm, '');

  // 移除boundary标记
  cleaned = cleaned.replace(/^--.*$/gm, '');

  // 清理空行
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

  // 确保HTML有完整的结构
  if (!cleaned.includes('<html')) {
    cleaned = `<html><head><meta charset="utf-8"></head><body>${cleaned}</body></html>`;
  } else if (!cleaned.includes('<head>')) {
    cleaned = cleaned.replace('<html', '<html><head><meta charset="utf-8"></head>');
  }

  // 修复相对路径
  cleaned = cleaned.replace(/href=["']\/([^"']*)["']/g, 'href="https://$1"');
  cleaned = cleaned.replace(/src=["']\/([^"']*)["']/g, 'src="https://$1"');

  return cleaned.trim();
}

interface DatasetFilesProps {
  dataset: Dataset;
}

/**
 * 数据集文件列表组件
 */
export default function DatasetFiles({ dataset }: DatasetFilesProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<DatasetFile | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'text' | 'html' | 'image' | 'pdf' | 'office' | 'code' | 'excel' | 'powerpoint' | 'audio' | 'video'>('text');
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const { toasts, showError, removeToast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {}
  });

  // 从store获取文件状态
  const {
    currentDatasetFiles: files,
    filesLoading: loading,
    filesTotal: total,
    filesCurrentPage: currentPage,
    filesPageSize: pageSize,
    fetchDatasetFiles,
    deleteFile,
    uploadFiles,
    getFileDownloadUrl
  } = useDatasetStore();

  // 文件状态配置
  const fileStatusConfig = {
    [FileStatus.UPLOADING]: { label: '上传中', color: 'bg-yellow-100 text-yellow-800' },
    [FileStatus.COMPLETED]: { label: '已完成', color: 'bg-green-100 text-green-800' },
    [FileStatus.PROCESSING]: { label: '处理中', color: 'bg-blue-100 text-blue-800' },
    [FileStatus.ERROR]: { label: '错误', color: 'bg-red-100 text-red-800' },
    [FileStatus.DELETED]: { label: '已删除', color: 'bg-gray-100 text-gray-800' },
  };

  // 加载文件列表
  const LoadFiles = async () => {
    try {
      await fetchDatasetFiles(dataset.id!);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  // 获取代码语言
  const getCodeLanguage = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    return CODE_FILE_EXTENSIONS[extension as keyof typeof CODE_FILE_EXTENSIONS] || 'text';
  };

  // 预览文件
  const HandlePreviewFile = async (file: DatasetFile, fileIndex?: number) => {
    setPreviewFile(file);
    setShowPreviewModal(true);
    setPreviewLoading(true);
    setPreviewContent(null);
    setPreviewType('text');
    
    if (fileIndex !== undefined) {
      setCurrentFileIndex(fileIndex);
    }

    try {
      // 获取文件下载URL
      const downloadUrl = await getFileDownloadUrl(file.id!);
      
      // 根据文件类型处理预览
      const fileName = file.originalName || file.fileName || '';
      const fileExtension = fileName.toLowerCase().split('.').pop() || '';
      const contentType = file.contentType || '';

      // 代码文件
      if (Object.keys(CODE_FILE_EXTENSIONS).includes(fileExtension)) {
        const response = await fetch(downloadUrl);
        const text = await response.text();
        setPreviewContent(text);
        setPreviewType('code');
      }
      // HTML文件
      else if (fileExtension === 'html' || fileExtension === 'htm') {
        const response = await fetch(downloadUrl);
        const html = await response.text();
        setPreviewContent(html);
        setPreviewType('html');
      }
      // MHTML文件
      else if (fileExtension === 'mhtml') {
        const response = await fetch(downloadUrl);
        const arrayBuffer = await response.arrayBuffer();
        const mhtmlContent = decodeMHTMLContent(arrayBuffer, response.headers.get('content-type'));
        const parsedHtml = parseMHTML(mhtmlContent);
        setPreviewContent(parsedHtml);
        setPreviewType('html');
      }
      // PowerPoint文件
      else if (['ppt', 'pptx'].includes(fileExtension)) {
        const response = await fetch(downloadUrl);
        const arrayBuffer = await response.arrayBuffer();
        // 将ArrayBuffer转换为base64字符串
        const bytes = new Uint8Array(arrayBuffer);
        const base64 = btoa(String.fromCharCode(...bytes));
        setPreviewContent(base64);
        setPreviewType('powerpoint');
      }
      // Excel文件
      else if (['xls', 'xlsx'].includes(fileExtension)) {
        const response = await fetch(downloadUrl);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // 获取所有工作表信息
        const sheets = workbook.SheetNames.map(name => ({
          name,
          data: XLSX.utils.sheet_to_html(workbook.Sheets[name])
        }));
        
        setPreviewContent(JSON.stringify(sheets));
        setPreviewType('excel');
      }
      // Word文档
      else if (['doc', 'docx'].includes(fileExtension)) {
        const response = await fetch(downloadUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setPreviewContent(result.value);
        setPreviewType('html');
      }
      // 文本类文件
      else if (contentType.startsWith('text/') || 
               ['md', 'markdown', 'txt', 'log', 'csv', 'tsv'].includes(fileExtension)) {
        const response = await fetch(downloadUrl);
        const text = await response.text();
        setPreviewContent(text);
        setPreviewType('text');
      }
      // JSON文件
      else if (contentType.includes('json') || fileExtension === 'json' || fileExtension === 'jsonl') {
        const response = await fetch(downloadUrl);
        const text = await response.text();
        setPreviewContent(text);
        setPreviewType('text');
      }
      // 图片文件
      else if (contentType.startsWith('image/') || 
               ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension)) {
        setPreviewContent(downloadUrl);
        setPreviewType('image');
      }
      // PDF文件
      else if (contentType.includes('pdf') || fileExtension === 'pdf') {
        setPreviewContent(downloadUrl);
        setPreviewType('pdf');
      }
      // 音频文件
      else if (contentType.startsWith('audio/') || 
               ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(fileExtension)) {
        setPreviewContent(downloadUrl);
        setPreviewType('audio');
      }
      // 视频文件
      else if (contentType.startsWith('video/') || 
               ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(fileExtension)) {
        setPreviewContent(downloadUrl);
        setPreviewType('video');
      }
      // 其他文件类型
      else {
        setPreviewContent(null);
        setPreviewType('text');
      }
    } catch (error) {
      console.error('Failed to preview file:', error);
      showError('预览失败', '无法预览此文件，请尝试下载后查看');
    } finally {
      setPreviewLoading(false);
    }
  };

  // 切换到上一个文件
  const HandlePreviousFile = () => {
    if (currentFileIndex > 0) {
      const prevFile = files[currentFileIndex - 1];
      HandlePreviewFile(prevFile, currentFileIndex - 1);
    }
  };

  // 切换到下一个文件
  const HandleNextFile = () => {
    if (currentFileIndex < files.length - 1) {
      const nextFile = files[currentFileIndex + 1];
      HandlePreviewFile(nextFile, currentFileIndex + 1);
    }
  };

  // 关闭预览弹窗
  const HandleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewFile(null);
    setPreviewContent(null);
    setPreviewType('text');
  };

  // 下载文件
  const HandleDownloadFile = async (fileId: number) => {
    try {
      const downloadUrl = await getFileDownloadUrl(fileId);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  // 删除文件
  const HandleDeleteFile = async (fileId: number) => {
    setConfirmDialog({
      visible: true,
      title: '删除文件',
      message: '确定要删除这个文件吗？此操作不可撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteFile(fileId);
          LoadFiles();
          setConfirmDialog(prev => ({ ...prev, visible: false }));
        } catch (error) {
          console.error('Failed to delete file:', error);
          showError('删除失败', '文件删除失败，请重试');
        }
      }
    });
  };

  // 批量删除文件
  const HandleBatchDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    setConfirmDialog({
      visible: true,
      title: '批量删除文件',
      message: `确定要删除选中的 ${selectedFiles.length} 个文件吗？此操作不可撤销。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          for (const fileId of selectedFiles) {
            await deleteFile(fileId);
          }
          setSelectedFiles([]);
          LoadFiles();
          setConfirmDialog(prev => ({ ...prev, visible: false }));
        } catch (error) {
          console.error('Failed to batch delete files:', error);
          showError('删除失败', '批量删除文件失败，请重试');
        }
      }
    });
  };

  // 选择/取消选择文件
  const HandleSelectFile = (fileId: number) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // 全选/取消全选
  const HandleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id!));
    }
  };

  // 格式化文件大小
  const FormatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const FormatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleString('zh-CN');
  };

  // 获取文件图标
  const GetFileIcon = (contentType?: string, fileName?: string) => {
    if (!contentType && !fileName) return File;
    
    const fileExtension = fileName?.toLowerCase().split('.').pop() || '';
    
    // 代码文件
    if (Object.keys(CODE_FILE_EXTENSIONS).includes(fileExtension)) {
      return FileCode;
    }
    
    // Office文档
    if (['doc', 'docx'].includes(fileExtension)) return FileWord;
    if (['xls', 'xlsx'].includes(fileExtension)) return FileSpreadsheet;
    if (['ppt', 'pptx'].includes(fileExtension)) return Presentation;
    
    // 其他文件类型
    if (contentType?.startsWith('image/')) return Image;
    if (contentType?.startsWith('video/')) return Video;
    if (contentType?.startsWith('audio/')) return Music;
    if (contentType?.includes('text/') || contentType?.includes('json') || contentType?.includes('csv')) return FileText;
    
    return File;
  };

  // 页面加载时获取文件
  useEffect(() => {
    LoadFiles();
  }, [dataset.id, currentPage]);

  // 过滤文件
  const filteredFiles = files.filter(file => 
    !searchKeyword || 
    file.originalName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    file.fileName?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      {/* 工具栏 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">文件管理</h2>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            上传文件
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文件..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </button>
        </div>

        {/* 批量操作 */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                已选择 {selectedFiles.length} 个文件
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={HandleBatchDelete}
                  className="flex items-center px-3 py-1 text-red-600 hover:text-red-800 text-sm"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  批量删除
                </button>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  取消选择
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 文件列表 */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-16">
            <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchKeyword ? '没有找到匹配的文件' : '暂无文件'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchKeyword ? '尝试调整搜索关键词' : '开始上传文件到这个数据集'}
            </p>
            {!searchKeyword && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                上传文件
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectedFiles.length === files.length && files.length > 0}
                        onChange={HandleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-88">
                      文件名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      大小
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      上传时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFiles.map((file, index) => {
                    const FileIcon = GetFileIcon(file.contentType, file.originalName || file.fileName);
                    const fileStatusConfig_ = fileStatusConfig[file.status as FileStatus];
                    const isSelected = selectedFiles.includes(file.id!);

                    return (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => HandleSelectFile(file.id!)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div
                             className="truncate overflow-hidden whitespace-nowrap"
                             title={file.originalName || file.fileName}
                            >
                              <div className="text-sm font-medium text-gray-900">
                                {file.originalName || file.fileName}
                              </div>
                              {file.originalName && file.fileName !== file.originalName && (
                                <div className="text-xs text-gray-500">{file.fileName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="truncate overflow-hidden whitespace-nowrap"
                          title={file.contentType || '-'}
                          >
                            {file.contentType || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {FormatFileSize(file.fileSize || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${fileStatusConfig_?.color || 'bg-gray-100 text-gray-800'}`}>
                            {fileStatusConfig_?.label || '未知'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {FormatTime(file.createTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => HandlePreviewFile(file, index)}
                              className="text-blue-600 hover:text-blue-900"
                              title="预览"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => file.id && HandleDownloadFile(file.id)}
                              className="text-green-600 hover:text-green-900"
                              title="下载"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => file.id && HandleDeleteFile(file.id)}
                              className="text-red-600 hover:text-red-900"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {total > pageSize && (
              <div className="px-6 py-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, total)} 项，共 {total} 项
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchDatasetFiles(dataset.id!, { page: Math.max(1, currentPage - 1) })}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      上一页
                    </button>
                    
                    <span className="text-sm text-gray-700">
                      第 {currentPage} 页，共 {Math.ceil(total / pageSize)} 页
                    </span>
                    
                    <button
                      onClick={() => fetchDatasetFiles(dataset.id!, { page: Math.min(Math.ceil(total / pageSize), currentPage + 1) })}
                      disabled={currentPage >= Math.ceil(total / pageSize)}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 文件上传模态框 */}
      {showUploadModal && (
        <FileUploadModal
          visible={showUploadModal}
          onCancel={() => setShowUploadModal(false)}
          dataset={dataset}
          onSuccess={() => {
            LoadFiles();
            setShowUploadModal(false);
          }}
        />
      )}

      {/* 文件预览弹窗 */}
      {showPreviewModal && previewFile && (
        <PreviewModal
          visible={showPreviewModal}
          onCancel={HandleClosePreview}
          file={previewFile}
          content={previewContent}
          loading={previewLoading}
          previewType={previewType}
          onDownload={() => previewFile.id && HandleDownloadFile(previewFile.id)}
          onPrevious={HandlePreviousFile}
          onNext={HandleNextFile}
        />
      )}

      {/* 确认对话框 */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}

// 文件上传模态框组件
function FileUploadModal({
  visible,
  onCancel,
  dataset,
  onSuccess,
}: {
  visible: boolean;
  onCancel: () => void;
  dataset: Dataset;
  onSuccess: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { showError } = useToast();

  const HandleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const HandleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const HandleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const HandleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const HandleUpload = async () => {
    if (!dataset.id || files.length === 0) return;

    setUploading(true);
    try {
      // 使用store中的uploadFiles方法
      const { uploadFiles } = useDatasetStore.getState();
      await uploadFiles(dataset.id, files);
      onSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
      showError('上传失败', '文件上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const FormatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            上传文件到 &ldquo;{dataset.name}&rdquo;
          </h3>

          {/* 文件选择区域 */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={HandleDrag}
            onDragLeave={HandleDrag}
            onDragOver={HandleDrag}
            onDrop={HandleDrop}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${
              dragActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <div className="text-lg font-medium text-gray-900 mb-2">
              {dragActive ? '释放文件以上传' : '拖拽文件到此处或点击选择'}
            </div>
            <p className="text-gray-500 mb-4">
              支持多文件上传，支持拖拽多个文件
            </p>
            <input
              type="file"
              multiple
              onChange={HandleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              选择文件
            </label>
          </div>

          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="max-h-64 overflow-y-auto mb-4">
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <File className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-sm">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {FormatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => HandleRemoveFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={uploading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={HandleUpload}
              disabled={files.length === 0 || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {uploading ? '上传中...' : `上传 ${files.length} 个文件`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 

// 文件预览内容组件
function FilePreviewContent({ 
  file, 
  content, 
  previewType 
}: { 
  file: DatasetFile; 
  content: string; 
  previewType: 'text' | 'html' | 'image' | 'pdf' | 'office' | 'code' | 'excel' | 'powerpoint' | 'audio' | 'video';
}) {
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [sheets, setSheets] = useState<Array<{name: string, data: string}>>([]);
  const fileName = file.originalName || file.fileName || '';
  const fileExtension = fileName.toLowerCase().split('.').pop() || '';
  const contentType = file.contentType || '';

  // 处理Excel数据
  useEffect(() => {
    if (fileExtension === 'xls' || fileExtension === 'xlsx') {
      try {
        const sheetsData = JSON.parse(content);
        setSheets(sheetsData);
        setCurrentSheetIndex(0);
      } catch (error) {
        console.error('Failed to parse Excel data:', error);
      }
    }
  }, [content, fileExtension]);

  // 获取代码语言
  const getCodeLanguage = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    return CODE_FILE_EXTENSIONS[extension as keyof typeof CODE_FILE_EXTENSIONS] || 'text';
  };

  // Markdown渲染函数
  const renderMarkdown = (content: string) => {
    return content
      // 处理标题
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      // 处理粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // 处理斜体
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // 处理代码块
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto my-3"><code>$1</code></pre>')
      // 处理行内代码
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      // 处理链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // 处理列表
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      // 处理换行
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br>')
      // 包装段落
      .replace(/^(.*)$/gm, '<p class="mb-3">$1</p>')
      // 清理空段落
      .replace(/<p class="mb-3"><\/p>/g, '')
      .replace(/<p class="mb-3"><br><\/p>/g, '');
  };

  // JSON格式化函数
  const formatJSON = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  };

  // CSV转表格函数
  const csvToTable = (content: string) => {
    const lines = content.trim().split('\n');
    if (lines.length === 0) return content;

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-900">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 代码高亮函数
  const highlightCode = (code: string, language: string) => {
    try {
      const highlighted = Prism.highlight(code, Prism.languages[language] || Prism.languages.text, language);
      return highlighted;
    } catch {
      return code;
    }
  };

  // 根据预览类型渲染内容
  if (previewType === 'image') {
    return (
      <div className="flex justify-center">
        <img 
          src={content} 
          alt={fileName} 
          className="max-w-full h-auto rounded-lg shadow-lg"
          style={{ maxHeight: '70vh' }}
        />
      </div>
    );
  }

  if (previewType === 'pdf') {
    return (
      <div className="w-full h-full">
        <iframe
          src={content}
          className="w-full h-full min-h-[600px] border-0 rounded-lg"
          title={fileName}
        />
      </div>
    );
  }

  if (previewType === 'powerpoint') {
    try {
      // 将base64转换回ArrayBuffer
      const binaryString = atob(content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // 创建blob URL用于预览
      const blob = new Blob([bytes], { 
        type: fileExtension === 'pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/vnd.ms-powerpoint' 
      });
      const blobUrl = URL.createObjectURL(blob);
      
      return (
        <div className="bg-white rounded-lg">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
            <div className="flex items-center space-x-2">
              <Presentation className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                PowerPoint 预览 - {fileName}
              </span>
            </div>
          </div>
          
          <div className="w-full h-full min-h-[600px]">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(blobUrl)}`}
              className="w-full h-full border-0 rounded-lg"
              title={fileName}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-center py-16">
          <Presentation className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            PowerPoint 文件预览失败
          </h3>
          <p className="text-gray-500 mb-6">
            无法预览此 PowerPoint 文件，请尝试下载后查看。
          </p>
        </div>
      );
    }
  }

  if (previewType === 'html' && (fileExtension === 'doc' || fileExtension === 'docx')) {
    return (
      <div className="prose max-w-none">
        <div 
          className="word-content text-gray-700 leading-relaxed bg-white p-6 rounded-lg border"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }

  if (previewType === 'excel') {
    if (sheets.length === 0) {
      return (
        <div className="text-center py-16">
          <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            加载Excel文件失败
          </h3>
          <p className="text-gray-500">无法解析Excel文件内容</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg">
        {/* Sheet页切换 */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">工作表:</span>
            <div className="flex space-x-1">
              {sheets.map((sheet, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSheetIndex(index)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentSheetIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* 表格内容 */}
        <div className="overflow-x-auto">
          <div 
            dangerouslySetInnerHTML={{ __html: sheets[currentSheetIndex]?.data || '' }} 
            className="min-w-full"
          />
        </div>
      </div>
    );
  }

  if (previewType === 'html' && ['html', 'htm'].includes(fileExtension)) {
    return (
      <div className="bg-white rounded-lg border">
        <iframe
          srcDoc={content}
          className="w-full h-full min-h-[600px] border-0 rounded-lg"
          title={fileName}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  }

  if (previewType === 'html' && fileExtension === 'mhtml') {
    return (
      <MHTMLPreview 
        file={file} 
        content={content} 
        fileName={fileName}
      />
    );
  }

  if (previewType === 'code') {
    const language = getCodeLanguage(fileName);
    const highlightedCode = highlightCode(content, language);
    
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <FileCode className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">{fileName}</span>
            <span className="text-xs text-gray-500">({language})</span>
          </div>
        </div>
        <pre className="p-4 m-0 overflow-x-auto">
          <code 
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    );
  }

  if (previewType === 'text' && (fileExtension === 'md' || fileExtension === 'markdown')) {
    return (
      <div className="prose max-w-none">
        <div 
          className="markdown-content text-gray-700 leading-relaxed bg-white p-6 rounded-lg border"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      </div>
    );
  }

  if (previewType === 'text' && (fileExtension === 'json' || fileExtension === 'jsonl')) {
    const formattedContent = fileExtension === 'json' ? formatJSON(content) : content;
    const highlightedCode = highlightCode(formattedContent, 'json');
    
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <FileCode className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">{fileName}</span>
            <span className="text-xs text-gray-500">(json)</span>
          </div>
        </div>
        <pre className="p-4 m-0 overflow-x-auto">
          <code 
            className="language-json"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    );
  }

  if (previewType === 'text' && (fileExtension === 'csv' || fileExtension === 'tsv')) {
    return (
      <div className="bg-white rounded-lg">
        {csvToTable(content)}
      </div>
    );
  }

  if (previewType === 'audio') {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center">
          <div className="mb-4">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {fileName}
            </h3>
            <p className="text-sm text-gray-500">
              音频文件预览
            </p>
          </div>
          <audio
            controls
            className="w-full max-w-md mx-auto"
            preload="metadata"
          >
            <source src={content} type={contentType} />
            您的浏览器不支持音频播放。
          </audio>
          <div className="mt-4 text-sm text-gray-500">
            <p>支持格式: MP3, WAV, OGG, M4A, FLAC, AAC, WMA</p>
          </div>
        </div>
      </div>
    );
  }

  if (previewType === 'video') {
    return (
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <Video className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {fileName}
            </span>
          </div>
        </div>
        <div className="p-4">
          <video
            controls
            className="w-full max-w-3xl mx-auto rounded-lg"
            preload="metadata"
            style={{ maxHeight: '70vh' }}
          >
            <source src={content} type={contentType} />
            您的浏览器不支持视频播放。
          </video>
          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>支持格式: MP4, AVI, MOV, WMV, FLV, WebM, MKV, M4V</p>
          </div>
        </div>
      </div>
    );
  }

  if (previewType === 'text' && (contentType.startsWith('text/') || ['txt', 'log'].includes(fileExtension))) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    );
  }

  // 默认文本显示
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
}

// 文件预览弹窗组件
function PreviewModal({
  visible,
  onCancel,
  file,
  content,
  loading,
  previewType,
  onDownload,
  onPrevious,
  onNext,
}: {
  visible: boolean;
  onCancel: () => void;
  file: DatasetFile;
  content: string | null;
  loading: boolean;
  previewType: 'text' | 'html' | 'image' | 'pdf' | 'office' | 'code' | 'excel' | 'powerpoint' | 'audio' | 'video';
  onDownload: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  // 格式化文件大小
  const FormatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const FormatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleString('zh-CN');
  };
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-full flex flex-col">
        <div className="p-6 flex justify-between items-center border-b">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              预览文件: {file.originalName || file.fileName}
            </h3>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <span>类型: {file.contentType || '未知'}</span>
              <span>大小: {FormatFileSize(file.fileSize || 0)}</span>
              <span>上传时间: {FormatTime(file.createTime)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* 文件切换按钮 */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onPrevious}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="上一个文件"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={onNext}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="下一个文件"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={onDownload}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              下载
            </button>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
          ) : content ? (
            <FilePreviewContent file={file} content={content} previewType={previewType} />
          ) : (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                无法预览此文件
              </h3>
              <p className="text-gray-500 mb-6">
                此文件类型不支持直接预览，请尝试下载后查看。
              </p>
                             <button
                 onClick={onDownload}
                 className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 <Download className="h-4 w-4 mr-2" />
                 下载文件
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// MHTML预览组件（带刷新功能）
function MHTMLPreview({ 
  file, 
  content, 
  fileName 
}: { 
  file: DatasetFile; 
  content: string; 
  fileName: string;
}) {
  const [iframeKey, setIframeKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setIframeKey(prev => prev + 1);
    
    // 模拟刷新延迟
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              MHTML 预览 - {fileName}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="刷新预览"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>
      </div>
      <div className="p-4">
        <iframe
          key={iframeKey}
          srcDoc={content}
          className="w-full h-full min-h-[600px] border-0 rounded-lg"
          title={fileName}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
} 