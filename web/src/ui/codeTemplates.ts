import type { LanguageId } from '../runtime/runtime'

export function defaultTemplate(lang: LanguageId): string {
  switch (lang) {
    case 'python':
      return `# Добро пожаловать в CODEWORLD.
# Нет кнопок управления. Только код.
#
# Доступные команды:
#   move(dx, dy)      dx/dy: -1..1
#   say("text")       сообщение как событие мира
#   set_tile(x, y, t) t: "floor" | "wall" | "neon"
#   async sleep(ms)   для async main()
#
# Подсказка: можно определить async main().

say("Сканирование мира...")
move(1, 0)
move(1, 0)
move(0, 1)
say("Я управляю реальностью через код.")
`
    case 'java':
      return `// Java runtime скоро появится.
// Сейчас включи Python в переключателе языка и попробуй оживить мир.
class Main {
  public static void main(String[] args) {
    // TODO
  }
}
`
    case 'cpp':
      return `// C++ runtime скоро появится.
// Сейчас включи Python в переключателе языка и попробуй оживить мир.
#include <iostream>
int main() {
  // TODO
  return 0;
}
`
    default:
      return ''
  }
}

export function monacoLanguage(lang: LanguageId): string {
  switch (lang) {
    case 'python':
      return 'python'
    case 'java':
      return 'java'
    case 'cpp':
      return 'cpp'
    default:
      return 'plaintext'
  }
}

