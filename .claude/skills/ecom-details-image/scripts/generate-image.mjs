#!/usr/bin/env node
/**
 * 图片生成脚本 — 调用 OpenAI 兼容 API
 * 用法: node generate-image.mjs --prompt "..." [选项]
 */

import fs from "fs";
import path from "path";
import { createHash } from "crypto";

const VALID_RATIOS = ["1:1", "3:2", "2:3", "4:3", "3:4", "5:4", "4:5",
                      "16:9", "9:16", "2:1", "1:2", "21:9", "9:21"];

function fail(msg, code = 1) {
  console.error(`错误：${msg}`);
  process.exit(code);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { prompt: "", outputDir: "generated-images", envFile: "",
                 size: "1:1", image: "", n: 1 };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--prompt": opts.prompt = args[++i] || ""; break;
      case "--prompt-file": {
        const f = args[++i];
        opts.prompt = f ? fs.readFileSync(f, "utf-8").trim() : "";
        break;
      }
      case "--output-dir": opts.outputDir = args[++i] || opts.outputDir; break;
      case "--env-file": opts.envFile = args[++i] || ""; break;
      case "--size": opts.size = args[++i] || opts.size; break;
      case "--image": opts.image = args[++i] || ""; break;
      case "--n": opts.n = parseInt(args[++i]) || 1; break;
    }
  }
  if (!opts.prompt) fail("prompt 不能为空");
  if (opts.size && !VALID_RATIOS.includes(opts.size)) fail(`不支持的比例: ${opts.size}`);
  return opts;
}

function loadEnv(envPath) {
  if (!envPath || !fs.existsSync(envPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    const val = rest.join("=").replace(/^['"]|['"]$/g, "").trim();
    if (key) env[key.trim()] = val;
  }
  return env;
}

function getConfig(env) {
  const baseUrl = env.IMG_BASE_URL || process.env.IMG_BASE_URL ||
                  env.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL ||
                  "https://api.openai.com/v1";
  const model = env.IMG_MODEL || process.env.IMG_MODEL ||
                env.OPENAI_IMAGE_MODEL || process.env.OPENAI_IMAGE_MODEL ||
                "gpt-image-2";
  const apiKey = env.IMG_API_KEY || process.env.IMG_API_KEY ||
                 env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) fail("缺少 API Key，请在 .env 中设置 IMG_API_KEY 或 OPENAI_API_KEY");
  return { baseUrl: baseUrl.replace(/\/+$/, ""), model, apiKey };
}

async function main() {
  const opts = parseArgs();
  const envPath = opts.envFile || path.join(process.cwd(), ".env");
  const env = loadEnv(envPath);
  const config = getConfig(env);

  const payload = {
    model: config.model,
    prompt: opts.prompt,
    n: opts.n,
    size: opts.size,
  };

  const endpoint = `${config.baseUrl}/images/generations`;
  console.error(`[API] POST ${endpoint} | model=${config.model} | size=${opts.size}`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    fail(`API 返回 ${response.status}: ${err.slice(0, 300)}`);
  }

  const result = await response.json();
  const images = result.data;
  if (!Array.isArray(images) || images.length === 0) {
    fail("接口返回中没有图片数据");
  }

  const outputDir = path.resolve(opts.outputDir);
  fs.mkdirSync(outputDir, { recursive: true });
  const saved = [];

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    const ts = Date.now();
    const hash = createHash("md5").update(String(ts + i)).digest("hex").slice(0, 8);
    const ext = opts.size === "1:1" ? "png" : "jpg";

    if (item.b64_json) {
      const buf = Buffer.from(item.b64_json, "base64");
      const filePath = path.join(outputDir, `image-${ts}-${i + 1}.${ext}`);
      fs.writeFileSync(filePath, buf);
      saved.push(filePath);
    } else if (item.url) {
      console.error(`  下载图片: ${item.url}`);
      const resp = await fetch(item.url);
      if (!resp.ok) fail(`下载图片失败: ${resp.status}`);
      const buf = Buffer.from(await resp.arrayBuffer());
      const filePath = path.join(outputDir, `image-${ts}-${i + 1}.${ext}`);
      fs.writeFileSync(filePath, buf);
      saved.push(filePath);
    }
  }

  console.log("生成完成：");
  saved.forEach((p) => console.log(p));
}

main().catch((e) => {
  console.error(`错误：${e.message}`);
  process.exit(1);
});
