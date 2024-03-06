import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import styles from "./Leaderboard.module.scss";
import { CloseIcon, InfoIcon, LeaderboardIcon, PlusIcon } from "@/assets";
import axios from "axios";
import { clsx } from "clsx";
import type { LeaderboardRecord } from "@/pages/api/leaderboard";

interface Leaderboard {
  buttonStyle?: CSSProperties;
}

export const Leaderboard = ({ buttonStyle }: Leaderboard) => {
  const [open, setOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>([]);
  const [instructionOpen, setInstructionOpen] = useState(false);

  const getPoints = async () => {
    try {
      const { data } = await axios.get<LeaderboardRecord[]>("/api/leaderboard");

      setLeaderboard(data);
    } catch (e) {
      setOpen(false);
    }
  };

  const currentUserPoints = useMemo(() => {
    return leaderboard.find((r) => r.isCurrentUser)?.points || "";
  }, [leaderboard]);

  const onOpen = () => {
    setOpen(true);
    void getPoints();
  };

  return (
    <>
      <button
        style={buttonStyle}
        onClick={onOpen}
        className={styles.leaderBoardButton}
      >
        <LeaderboardIcon />
      </button>

      {open && !instructionOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
          className={styles.leaderboardModalWrapper}
        >
          <div className={styles.leaderboardModalContainer}>
            <button
              onClick={() => {
                setOpen(false);
              }}
              className={styles.closeButton}
            >
              <CloseIcon />
            </button>
            <div className={styles.header}>
              <span className={styles.title}>Leaderboard</span>
              <button
                onClick={() => setInstructionOpen(true)}
                className={styles.infoButton}
              >
                <InfoIcon />
              </button>
            </div>

            <div className={styles.badge}>
              <span>Your Points:</span>&nbsp;
              <span>{currentUserPoints || 0}</span>
            </div>

            {leaderboard.length > 0 && (
              <div className={styles.table}>
                <div className={styles.tableHeader}>
                  <span>#</span>
                  <span>Wallet</span>
                  <span>Points</span>
                </div>

                {leaderboard.map((row, index) => {
                  return (
                    <div
                      className={clsx(
                        styles.row,
                        row.isCurrentUser ? styles.activeRow : ""
                      )}
                      key={index}
                    >
                      <span>{row.position}</span>
                      <span>{row.wallet}</span>
                      <span>{row.points}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {instructionOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setInstructionOpen(false);
            }
          }}
          className={styles.leaderboardModalWrapper}
        >
          <div className={styles.leaderboardModalContainer}>
            <button
              onClick={() => {
                setInstructionOpen(false);
              }}
              className={styles.closeButton}
            >
              <CloseIcon />
            </button>

            <div className={styles.header}>
              <span className={styles.title}>Use dMeet and Get Points</span>
            </div>

            <p className={styles.description}>
              We have launched a campaign for early adopters who use dMeet,
              create and participate in audio/video meetings.
            </p>

            <div className={styles.block}>
              <div className={styles.blockHeader}>Point Earning Rules:</div>

              <div className={styles.blockBody}>
                <div className={styles.blockRow}>
                  <span className={styles.blockBadge}>Host</span>
                  <div className={styles.rewardBlockWrapper}>
                    <div className={styles.rewardBlock}>
                      <div>
                        <span>2 points</span>/min.
                      </div>
                      <span>as a host</span>
                    </div>
                    <div className={styles.plusIcon}>
                      <PlusIcon />
                    </div>
                    <div className={styles.rewardBlock}>
                      <div>
                        <span>1 point</span>/min.
                      </div>
                      <span>for each invited participant</span>
                    </div>
                  </div>
                </div>

                <div className={styles.blockRow}>
                  <span className={styles.blockBadge}>Participant</span>
                  <div className={styles.rewardBlock}>
                    <div>
                      <span>1 point</span>/min.
                    </div>
                    <span>as a participant</span>
                  </div>
                </div>
              </div>
            </div>

            <p
              style={{
                marginBottom: "16px",
              }}
            >
              Points will be exchanged for the utility token $DTEL.
            </p>

            <p>
              We will 💎 reward the active campaign participants for their
              commitment to the dMeet.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
