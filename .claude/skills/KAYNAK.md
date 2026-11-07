# Dış skiller

Bu klasördeki skiller iki açık kaynak projeden **değiştirilmeden** kopyalandı (MIT lisansı). Yalnızca Markdown dosyaları alındı; betikler, otomatik kancalar ve durum bandı alınmadı.

| Skill | Kaynak | Sürüm (commit) |
|---|---|---|
| using-superpowers, brainstorming, writing-plans, test-driven-development, systematic-debugging, verification-before-completion, requesting-code-review, dispatching-parallel-agents | https://github.com/obra/superpowers (Jesse Vincent) | 22f0b46 |
| ponytail, ponytail-review | https://github.com/DietrichGebert/ponytail (Dietrich Gebert) | 96608e0 |

Lisanslar: `LICENSE-superpowers`, `LICENSE-ponytail`.

Alınmayanlar ve nedeni:
- Superpowers `executing-plans` ve `subagent-driven-development`: yanlarındaki betiklere bağlı; betikler alınmadı.
- Superpowers `brainstorming` görsel yardımcı (`visual-companion.md`, `scripts/`): yerel sunucu başlatır.
- Superpowers `SessionStart` kancası ve Ponytail kancaları/durum bandı: tam eklenti kurulumu gerektirir.

Tam eklenti olarak kendi bilgisayarında kurmak istersen (Claude Code içinde):
- `/plugin install superpowers@claude-plugins-official`
- `/plugin marketplace add DietrichGebert/ponytail`, sonra `/plugin install ponytail@ponytail`
