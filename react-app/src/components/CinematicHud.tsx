import React from 'react';
import { CinematicStage } from '../types';

interface CinematicHudProps {
  isActive: boolean;
  progressPercent: number;
  activeStage: CinematicStage;
}

export const CinematicHud: React.FC<CinematicHudProps> = ({
  isActive,
  progressPercent,
  activeStage,
}) => {
  return (
    <div id="cinematic-hud" className={isActive ? 'active' : ''}>
      <div className="hud-top">
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
