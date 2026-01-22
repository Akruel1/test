import './ui.css'

export function BootScreen({ progress }: { progress: number }) {
  return (
    <div className="BootRoot pixelScanlines pixelNoise">
      <div className="BootCard uiPanel">
        <div className="BootTitle">
          <span className="BootTitleNeon">NEON</span> BYTE <span className="BootTitleNeon2">WORLD</span>
        </div>
        <div className="BootSub">Запуск симуляции… подключение интерфейса управления реальностью</div>

        <div className="BootBar">
          <div className="BootBarFill" style={{ width: `${progress}%` }} />
          <div className="BootBarGlow" style={{ width: `${progress}%` }} />
        </div>
        <div className="BootMeta">
          <span className="uiBadge">PIXEL//BOOT</span>
          <span className="BootPct">{progress}%</span>
        </div>
      </div>
    </div>
  )
}

