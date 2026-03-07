import React from 'react';

export function Ticker() {
  return (
    <div className="ticker">
      <div className="ticker-label">实时动态</div>
      <div style={{ overflow: 'hidden', flex: 1, display: 'flex' }}>
        <div className="ticker-track">
          <span className="ticker-item"><span>▲</span> Llama 3 8B 发布 · Meta开源新标杆</span>
          <span className="ticker-item"><span>◆</span> Stable Diffusion 3 · MMDiT架构突破</span>
          <span className="ticker-item"><span>▲</span> vLLM 吞吐量提升300% · PagedAttention</span>
          <span className="ticker-item"><span>◆</span> AHA指数今日 82.4 · +2.3% 较昨日</span>
          <span className="ticker-item"><span>▲</span> Llama 3 8B 发布 · Meta开源新标杆</span>
          <span className="ticker-item"><span>◆</span> Stable Diffusion 3 · MMDiT架构突破</span>
          <span className="ticker-item"><span>▲</span> vLLM 吞吐量提升300% · PagedAttention</span>
          <span className="ticker-item"><span>◆</span> AHA指数今日 82.4 · +2.3% 较昨日</span>
        </div>
      </div>
    </div>
  );
}
