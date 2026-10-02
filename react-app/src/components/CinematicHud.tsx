import React from 'react';
import { CinematicStage } from '../types';

interface CinematicHudProps {
  isActive: boolean;
  frameIndex: number;
  totalFrames: number;
  progressPercent: number;
  activeStage: CinematicStage;
}

export const CinematicHud: React.FC<CinematicHudProps> = ({
  isActive,
  frameIndex,
  totalFrames,
  progressPercent,
  activeStage,
}) => {
  return (
    <div id="cinematic-hud" className={isActive ? 'active' : ''}>
      <div className="hud-top">
        <div className="hud-frame-counter">
          <span className="frame-dot" />
          <span className="frame-text" id="hud-frame-num">
            FRAME {String(frameIndex).padStart(4, '0')} / {String(totalFrames).padStart(4, '0')}
          </span>
        </div>
        <div className="hud-stage-indicator" id="hud-stage-num">
          {activeStage.step} · {activeStage.title} {activeStage.subtitle}
        </div>
      </div>

      <div className="hud-bottom">
        <div className="stage-card" id="hud-stage-card">
          <div className="stage-step-tag">{activeStage.step} STAGE</div>
          <div className="stage-title">
            {activeStage.title} {activeStage.subtitle}
          </div>
          <div className="stage-desc">{activeStage.description}</div>
        </div>

        <div className="hud-progress-wrap">
          <div className="hud-progress-track">
            <div
              className="hud-progress-fill"
              id="hud-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="hud-progress-label" id="hud-progress-label">
            {progressPercent}% JOURNEY
          </span>
        </div>
      </div>
    </div>
  );
};
