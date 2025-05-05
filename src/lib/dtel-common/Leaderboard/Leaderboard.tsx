import type { CSSProperties } from "react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Leaderboard.module.scss";
import { ChainIcon, CloseIcon, InfoIcon, LeaderboardIcon, TickIcon } from "@/assets";
import axios from "axios";
import { clsx } from "clsx";
import { getInviteCode, INVITE_CODE_QUERY_KEY } from "@/lib/hooks/useInviteCode";
import { CopyIcon } from "lucide-react";
import { ADMIN_POINTS_MULTIPLIER, BASE_REWARDS_PER_MINUTE, REFERRAL_REWARD_PERCENTAGE } from "@/lib/constants";
import { getAccessToken } from "@privy-io/react-auth";

interface LeaderboardRecord {
  position: number;
  wallet?: string;
  points: number;
  isCurrentUser?: boolean;
}

interface Leaderboard {
  buttonStyle?: CSSProperties;
  showPoints?: boolean;
  isAdmin?: boolean;
}

const description = {
  title: "Use dMeet and Get Points",
  text: "We have launched a campaign for early adopters who use dMeet, create and participate in audio/video meetings.",
  rules: {
    title: "Point Earning Rules:",
    items: [
      {
        badge: "Host",
        text: `${BASE_REWARDS_PER_MINUTE * ADMIN_POINTS_MULTIPLIER} points/minute`,
        text2: "for hosting a meeting\n(with 1+ participant required)"
      },
      {
        badge: "Participant",
        text: `${BASE_REWARDS_PER_MINUTE} points/minute`,
        text2: "for attending\na meeting"
      },
      {
        badge: "Referral",
        text: `${REFERRAL_REWARD_PERCENTAGE}% of all points`,
        text2: "earned by\nthe invited participant"
      }
    ]
  },
  footer: {
    text: "Points will be exchanged for the utility token $DTEL.",
    text2: "We will 💎 reward the active campaign participants for their commitment to the dMeet."
  }
};

export const Leaderboard = ({ buttonStyle, showPoints, isAdmin }: Leaderboard) => {
  const [open, setOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>([]);
  const [instructionOpen, setInstructionOpen] = useState(false);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [initialRequestReturnedData, setInitialRequestReturnedData] = useState(false);
  const [animationActive, setAnimationActive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (showPoints) {
      const interval = setInterval(() => {
        setAnimationActive((prev) => !prev);
        setTimeout(() => {
          setAnimationActive(false);
        }, 3000);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [showPoints]);

  const getPoints = async () => {
    try {
      const authToken = await getAccessToken();
      const { data } = await axios.post<{
        top: LeaderboardRecord[];
        refCode: string | null;
      }>(`https://${process.env.NEXT_PUBLIC_POINTS_BACKEND_URL}/api/leaderboard`, {
        refCode: getInviteCode()
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setInitialRequestReturnedData(true);
      if (data.refCode) {
        setReferralLink(
          window.location.origin +
          "?" +
          INVITE_CODE_QUERY_KEY +
          "=" +
          data.refCode
        );
      }

      setLeaderboard(data.top);
    } catch (e) {
      if (!leaderboard) {
        setOpen(false);
      }

      timeoutRef.current = setTimeout(() => {
        void getPoints();
      }, 5000);
    }
  };

  useEffect(() => {
    void getPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentUserPoints = useMemo(() => {
    return leaderboard.find((r) => r.isCurrentUser)?.points || "";
  }, [leaderboard]);

  const onOpen = () => {
    setOpen(true);
    void getPoints();
  };

  const copy = async () => {
    if (!referralLink) return;
    const url = encodeURI(referralLink);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!initialRequestReturnedData) {
    return null;
  }

  return (
    <>
      <button
        style={buttonStyle}
        onClick={onOpen}
        className={clsx(styles.leaderBoardButton, animationActive && showPoints && styles.leaderBoardButtonAnimation)}
      >
        <LeaderboardIcon />
        <span className={styles.leaderBoardButtonText}>
            +{isAdmin ? ADMIN_POINTS_MULTIPLIER * BASE_REWARDS_PER_MINUTE : BASE_REWARDS_PER_MINUTE}
          </span>
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
            </div>

            <div className={styles.info}>
              <div className={styles.badge}>
                <span>Your Points:</span>&nbsp;
                <span>{currentUserPoints || 0}</span>
              </div>
              <button
                onClick={() => setInstructionOpen(true)}
                className={styles.infoButton}
              >
                <InfoIcon />
                How it works
              </button>
            </div>

            {referralLink && (
              <div
                onClick={() => {
                  void copy();
                }}
              >
                <div className={styles.linkTitle}>
                  <ChainIcon /> Referral Link
                </div>
                <div className={styles.linkCopy}>
                  {referralLink}
                  <button>{copied ? <TickIcon /> : <CopyIcon />}</button>
                </div>
              </div>
            )}

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
          <div className={styles.leaderboardInfoModalContainer}>
            <button
              onClick={() => {
                setInstructionOpen(false);
              }}
              className={styles.closeButton}
            >
              <CloseIcon />
            </button>

            <div className={styles.header}>
              <span className={styles.title}>{description.title}</span>
            </div>

            <p className={styles.description}>
              {description.text}
            </p>

            <div className={styles.block}>
              <div className={styles.blockHeader}>{description.rules.title}</div>

              <div className={styles.blockBody}>
                {description.rules.items.map((item, index) => (
                  <div
                    className={styles.blockRow}
                    key={index}
                  >
                    <span className={styles.blockBadge}>{item.badge}</span>
                    <div className={styles.rewardBlockWrapper}>
                      <div className={styles.rewardBlock}>
                        <div>
                          <span className={styles.rewardBlockGreenText}>{item.text.split("/minute")[0]}</span>
                          {item.text.includes("/minute") && "/minute"}&nbsp;
                          <span className={styles.rewardBlockGrayText}>{item.text2}</span>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p
              style={{
                marginBottom: "8px"
              }}
            >
              {description.footer.text}
            </p>

            <p>
              {description.footer.text2}
            </p>

            <a
              className={styles.learMoreLink}
              href={"https://www.dtelecom.org/airdrop"}
              target={"_blank"}
            >{"Learn More >"}</a>
          </div>
        </div>
      )}
    </>
  );
};
