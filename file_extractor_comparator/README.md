# 文件提取对比神器

本插件可批量解析 PPT、PDF、Word 文档，自动抽取产品价格、卖点、成分等关键信息，并爬取京东竞品数据，生成结构化分析报告（Markdown）。

## 环境安装

```bash
pip install -r requirements.txt
```

## 使用方法

1. 将待解析的 PPT、PDF、Word 文件放入 `samples/` 目录中。
2. 执行主程序：
   ```bash
   python main.py
   ```
3. 生成的 `analysis_report.md` 即可查看结果。

## 目录结构说明

- `parsers/`  文档解析模块
- `extractor/` 信息抽取模块
- `market/`    竞品抓取模块
- `report/`    报告生成模块

## 输出示例

```
# 产品与竞品分析报告

## 产品：产品A
- 价格：199
- 卖点：高性能，超稳定
- 成分：合金、塑料...

### 主要竞品：
- 京东某竞品1（￥299）
- 京东某竞品2（￥259）

---
```