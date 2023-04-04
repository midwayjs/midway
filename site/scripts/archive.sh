#!/bin/bash

# 创建 build 目录
mkdir -p build

# 压缩 docs, i18n 和 blog 等目录，并将压缩文件放入 build 目录
zip -r build/document_archive.zip docs i18n blog versioned_docs versioned_sidebars

echo "All files have been compressed to $zip_name"
