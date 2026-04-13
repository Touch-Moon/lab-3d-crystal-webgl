#!/bin/bash
# ───────────────────────────────────────────────────────────────
# setup-hooks.sh  —  pre-commit hook 설치 (node_modules 커밋 방지)
# 사용법: bash setup-hooks.sh  (repo 루트에서 한 번만 실행)
# ───────────────────────────────────────────────────────────────

HOOK_PATH=".git/hooks/pre-commit"

cat > "$HOOK_PATH" << 'EOF'
#!/bin/bash
# pre-commit: node_modules, dist 커밋 차단

BLOCKED=$(git diff --cached --name-only | grep -E "^(node_modules|dist)/")
if [ -n "$BLOCKED" ]; then
  echo ""
  echo "❌  커밋 차단: 다음 경로가 staging에 포함되어 있어요:"
  echo "$BLOCKED"
  echo ""
  echo "   git rm -r --cached node_modules dist  을 실행하고 다시 시도하세요."
  echo ""
  exit 1
fi
exit 0
EOF

chmod +x "$HOOK_PATH"
echo "✅  pre-commit hook 설치 완료: $HOOK_PATH"
echo "    앞으로 node_modules/dist 커밋 시도 시 자동으로 차단됩니다."
