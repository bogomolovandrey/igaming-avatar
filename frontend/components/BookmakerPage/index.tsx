"use client";

import { useState } from "react";

import { Header } from "./Header";
import { ALL_LEAGUES, LeagueSidebar } from "./LeagueSidebar";
import { Feed } from "./Feed";
import { SessionChip } from "./SessionChip";
import { BackdropMobile } from "./BackdropMobile";

type Props = {
  balance: number;
  balanceFlash?: boolean;
  freebetBadge?: { amount: number; expiresInLabel: string } | null;
  sessionId?: string;
  onPanelClick?: () => void;
};

export function BookmakerPage(props: Props) {
  const [activeLeague, setActiveLeague] = useState<string>(ALL_LEAGUES);

  return (
    <>
      <div className="desktop-only">
        <DesktopBackdrop
          {...props}
          activeLeague={activeLeague}
          onSelectLeague={setActiveLeague}
        />
      </div>
      <div className="mobile-only">
        <BackdropMobile
          balance={props.balance}
          balanceFlash={props.balanceFlash}
          freebetBadge={props.freebetBadge}
          sessionId={props.sessionId}
        />
      </div>
    </>
  );
}

function DesktopBackdrop({
  balance,
  balanceFlash,
  freebetBadge,
  sessionId,
  onPanelClick,
  activeLeague,
  onSelectLeague,
}: Props & {
  activeLeague: string;
  onSelectLeague: (l: string) => void;
}) {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Header
        balance={balance}
        balanceFlash={balanceFlash}
        freebetBadge={freebetBadge}
        onPanelClick={onPanelClick}
      />
      <div
        style={{ display: "flex", flex: 1, minHeight: 0, minWidth: 0 }}
      >
        <LeagueSidebar
          activeLeague={activeLeague}
          onSelect={onSelectLeague}
        />
        <Feed
          league={activeLeague === ALL_LEAGUES ? null : activeLeague}
        />
      </div>
      {sessionId && <SessionChip id={sessionId} />}
    </div>
  );
}
