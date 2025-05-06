"use client";

import styles from "./SummaryPage.module.scss";
import { NavBar } from "@/components/ui/NavBar/NavBar";
import { IsAuthorizedWrapper } from "@/lib/dtel-auth/components/IsAuthorizedWrapper";
import { Leaderboard } from "@/lib/dtel-common/Leaderboard/Leaderboard";
import { LoginButton } from "@/lib/dtel-auth/components";
import React, { useEffect } from "react";
import { Footer } from "@/components/ui/Footer/Footer";
import { useRouter, useSearchParams } from "next/navigation";
import { ADMIN_POINTS_MULTIPLIER, BASE_REWARDS_PER_MINUTE } from "@/lib/constants";
import { Button } from "@/components/ui";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import {
  ChevronRightIcon,
  DiscordIcon,
  LinkedInIcon,
  PointsIcon,
  StarIcon,
  TelegramIcon,
  TimeIcon,
  XIcon
} from "@/lib/dtel-common/assets/icons";
import axios from "axios";
import { isMobileBrowser } from "@dtelecom/components-core";
import aboutImage from "../assets/about.png";
import { Loader } from "@dtelecom/components-react";

const useParams = () => {
  const params = useSearchParams();
  const slug = params.get("slug") || "";
  const roomName = params.get("roomName") || "";
  const timeSec = parseInt(params.get("timeSec") || "0", 10);
  const isAdmin = params.get("isAdmin") === "true";

  const [roomState] = React.useState({
    slug,
    roomName,
    timeSec,
    isAdmin
  });
  return {
    ...roomState
  };
};

export const SummaryPage = () => {
  const { authenticated, login } = usePrivy();
  const router = useRouter();

  const isMobile = React.useMemo(() => isMobileBrowser(), []);
  const { slug, roomName, timeSec, isAdmin } = useParams();

  useEffect(() => {
    if (slug) {
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      router.replace("/");
    }
  }, [slug]);

  const [callQuality, setCallQuality] = React.useState({
    video: 0,
    audio: 0,
    latency: 0
  });
  const [comment, setComment] = React.useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hadViewers, setHadViewers] = React.useState(false);

  React.useEffect(() => {
    const needToCheckViewers = isAdmin && authenticated;
    const checkViewers = async () => {
      setIsLoading(true);
      const accessToken = await getAccessToken();
      await axios.post<boolean>("https://" + process.env.NEXT_PUBLIC_POINTS_BACKEND_URL + "/api/points/verify", {
        room: slug
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then((res) => {
        if (res.data) {
          setHadViewers(true);
        }
      }).finally(() => {
        setIsLoading(false);
      });
    };
    if (needToCheckViewers) {
      void checkViewers();
    } else {
      setIsLoading(false);
    }

  }, [authenticated, isAdmin, slug]);

  const timeFormatted = React.useMemo(() => {
    const minutes = Math.floor((timeSec % 3600) / 60);
    const seconds = timeSec % 60;
    const hours = Math.floor(timeSec / 3600);
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [timeSec]);

  const potentialPoints = React.useMemo(() => {
    if (isAdmin && authenticated && !hadViewers) {
      return "0";
    }
    const pointsPerMinute = BASE_REWARDS_PER_MINUTE * (isAdmin ? ADMIN_POINTS_MULTIPLIER : 1);
    const points = Math.floor(timeSec * pointsPerMinute / 60);

    return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [timeSec, isAdmin, hadViewers, authenticated]);

  const onFeedbackSubmit = async () => {
    const accessToken = await getAccessToken();
    const headers = authenticated ? {
      Authorization: `Bearer ${accessToken}`
    } : undefined;

    await axios.post("https://" + process.env.NEXT_PUBLIC_POINTS_BACKEND_URL + (authenticated ? "/api/review/user" : "/api/review/guest"), {
        ...callQuality,
        comment
      },
      {
        headers
      });
    setFeedbackSubmitted(true);
  };

  const isButtonDisabled = React.useMemo(() => {
    return !callQuality.video && !callQuality.audio && !callQuality.latency;
  }, [callQuality]);

  return (
    <>
      <NavBar
        small
        iconFull={!isMobile}
        title={roomName}
        smallTitle={isMobile}
      >
        <IsAuthorizedWrapper>
          <Leaderboard
            buttonStyle={{
              marginRight: "8px"
            }}
          />
        </IsAuthorizedWrapper>

        <LoginButton />
      </NavBar>

      {feedbackSubmitted ? (
        <ThankYouPage />
      ) : (
        <div className={styles.container}>
          <h1>Meeting Summary</h1>

          <div className={styles.meetingInfo}>
            <div className={styles.meetingInfoItem}>
              <div className={styles.meetingInfoDuration}>Duration</div>
              <div className={styles.meetingInfoValue}><TimeIcon />{timeFormatted}</div>
            </div>

            <div className={styles.meetingInfoItem}>
              <div className={styles.meetingInfoPoints}>{authenticated ? "Points Earned" : "Potential Points*"}</div>
              <div className={styles.meetingInfoValue}>
                {
                  isLoading ? <Loader /> : (
                    <><PointsIcon />{potentialPoints}</>
                  )
                }
              </div>
            </div>
          </div>

          <div className={styles.callQualityBlock}>
            <div className={styles.callQualityBlockTitle}>Rate the call quality and earn 10
              points{authenticated ? "" : "*"}:
            </div>
            <div className={styles.callQualityStats}>
              <div><span>Video</span> {
                Array.from({ length: 5 }, (_, index) => (
                  <button
                    key={index}
                    className={callQuality.video > index ? styles.activeStar : styles.star}
                    onClick={() => setCallQuality((prev) => ({ ...prev, video: index + 1 }))}
                  ><StarIcon /></button>
                ))
              }</div>
              <div><span>Voice</span> {
                Array.from({ length: 5 }, (_, index) => (
                  <button
                    key={index}
                    className={callQuality.audio > index ? styles.activeStar : styles.star}
                    onClick={() => setCallQuality((prev) => ({ ...prev, audio: index + 1 }))}
                  ><StarIcon /></button>
                ))
              }</div>
              <div><span>Latency</span> {
                Array.from({ length: 5 }, (_, index) => (
                  <button
                    key={index}
                    className={callQuality.latency > index ? styles.activeStar : styles.star}
                    onClick={() => setCallQuality((prev) => ({ ...prev, latency: index + 1 }))}
                  ><StarIcon /></button>
                ))
              }</div>
            </div>
          </div>

          <textarea
            className={styles.commentInput}
            placeholder="Leave a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className={styles.buttonsContainer}>
            <Button
              onClick={() => {
                router.push("/");
              }}
              className={styles.skipButton}
            >
              Skip
            </Button>
            <Button
              onClick={onFeedbackSubmit}
              className={styles.submitButton}
              disabled={isButtonDisabled}
            >
              Send
            </Button>
          </div>


          <div className={styles.meetingFooter}>
            <div>Share your feedback and make every call better!</div>

            {!authenticated && (
              <div className={styles.meetingInfoValue}>
                <span className={styles.star}>*</span>
                <button
                  onClick={login}
                  className={styles.signUpButton}
                >Sign up
                </button>
                now to start earning points
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};


const ThankYouPage = () => {
  const router = useRouter();
  return (
    <div className={styles.thankYouPage}>
      <div className={styles.videoBlock}>
        <div className={styles.thankYouText}>
          <h3>Thank you<br />for your feedback!</h3>
          <span>Join us in social networks</span>
        </div>

        <div className={styles.videoContainer}>
          <video
            muted
            autoPlay
            playsInline
            loop
            src={"/feedback.webm"}
          />
        </div>
      </div>

      <div className={styles.socialBlock}>
        <a
          href="https://x.com/DTEL_org"
          target="_blank"
          rel="noopener noreferrer"
        ><XIcon />X/Twitter</a>
        <a
          href="https://discord.gg/dtelecom"
          target="_blank"
          rel="noopener noreferrer"
        ><DiscordIcon />Discord</a>
        <a
          href="https://www.linkedin.com/company/dtel-org"
          target="_blank"
          rel="noopener noreferrer"
        ><LinkedInIcon />Linkedin</a>
        <a
          href="https://t.me/dTelecomNetwork"
          target="_blank"
          rel="noopener noreferrer"
        ><TelegramIcon />Telegram</a>
      </div>

      <div className={styles.buttonsContainer}>
        <Button
          onClick={() => {
            router.push("/");
          }}
          className={styles.createNewMeetingButton}
        >
          Create New Meeting
        </Button>

        <Button
          onClick={() => {
            window.open("https://www.dtelecom.org/airdrop", "_blank");
          }}
          className={styles.aboutButton}
        >
          About Points Program<ChevronRightIcon /><img
          src={aboutImage.src}
          alt="points"
        />
        </Button>
      </div>
    </div>
  );
};
