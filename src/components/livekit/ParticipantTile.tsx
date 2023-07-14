import * as React from "react";
import type { Participant, TrackPublication } from "livekit-client";
import { Track } from "livekit-client";
import type { ParticipantClickEvent, TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { isParticipantSourcePinned, setupParticipantTile } from "@livekit/components-core";
import {
  AudioTrack,
  ConnectionQualityIndicator,
  FocusToggle,
  ParticipantContext,
  ParticipantName,
  TrackMutedIndicator,
  useEnsureParticipant,
  useIsMuted,
  useIsSpeaking,
  useMaybeLayoutContext,
  useMaybeParticipantContext,
  useMaybeTrackContext,
  VideoTrack
} from "@livekit/components-react";
import { ScreenShareIcon } from "lucide-react";
import { mergeProps } from "./mergeProps";
import SvgParticipantPlaceholder from "@/assets/images/ParticipantPlaceholder";
import { CameraDisabledIcon } from "@livekit/components-react/src/assets/icons";

/** @public */
export type ParticipantTileProps = React.HTMLAttributes<HTMLDivElement> & {
  disableSpeakingIndicator?: boolean;
  participant?: Participant;
  source?: Track.Source;
  publication?: TrackPublication;
  onParticipantClick?: (event: ParticipantClickEvent) => void;
  onKick?: (identity: string) => void;
  onMute?: (identity: string, trackSid: string) => void;
  localIdentity?: string;
};

/** @public */
export type UseParticipantTileProps<T extends HTMLElement> = TrackReferenceOrPlaceholder & {
  disableSpeakingIndicator?: boolean;
  publication?: TrackPublication;
  onParticipantClick?: (event: ParticipantClickEvent) => void;
  htmlProps: React.HTMLAttributes<T>;
};

/** @public */
export function useParticipantTile<T extends HTMLElement>({
                                                            participant,
                                                            source,
                                                            publication,
                                                            onParticipantClick,
                                                            disableSpeakingIndicator,
                                                            htmlProps
                                                          }: UseParticipantTileProps<T>) {
  const p = useEnsureParticipant(participant);
  const mergedProps = React.useMemo(() => {
    const { className } = setupParticipantTile();
    return mergeProps(htmlProps, {
      className,
      onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        htmlProps.onClick?.(event);
        if (typeof onParticipantClick === "function") {
          const track = publication ?? p.getTrack(source);
          onParticipantClick({ participant: p, track });
        }
      }
    });
  }, [htmlProps, source, onParticipantClick, p, publication]);
  const isVideoMuted = useIsMuted(Track.Source.Camera, { participant });
  const isAudioMuted = useIsMuted(Track.Source.Microphone, { participant });
  const isSpeaking = useIsSpeaking(participant);
  return {
    elementProps: {
      "data-lk-audio-muted": isAudioMuted,
      "data-lk-video-muted": isVideoMuted,
      "data-lk-speaking": disableSpeakingIndicator === true ? false : isSpeaking,
      "data-lk-local-participant": participant.isLocal,
      "data-lk-source": source,
      ...mergedProps
    } as unknown as React.HTMLAttributes<HTMLDivElement>
  };
}

/** @public */
export function ParticipantContextIfNeeded(
  props: React.PropsWithChildren<{
    participant?: Participant;
  }>
) {
  const hasContext = !!useMaybeParticipantContext();
  return props.participant && !hasContext ? (
    <ParticipantContext.Provider value={props.participant}>
      {props.children}
    </ParticipantContext.Provider>
  ) : (
    <>{props.children}</>
  );
}

/**
 * The ParticipantTile component is the base utility wrapper for displaying a visual representation of a participant.
 * This component can be used as a child of the `TrackLoop` component or by spreading a track reference as properties.
 *
 * @example
 * ```tsx
 * <ParticipantTile source={Track.Source.Camera} />
 *
 * <ParticipantTile {...trackReference} />
 * ```
 * @public
 */
export const ParticipantTile = ({
                                  participant,
                                  children,
                                  source = Track.Source.Camera,
                                  onParticipantClick,
                                  publication,
                                  disableSpeakingIndicator,
                                  onMute,
                                  onKick,
                                  localIdentity,
                                  ...htmlProps
                                }: ParticipantTileProps) => {
  const p = useEnsureParticipant(participant);
  const trackRef: TrackReferenceOrPlaceholder = useMaybeTrackContext() ?? {
    participant: p,
    source,
    publication
  };

  const { elementProps } = useParticipantTile<HTMLDivElement>({
    participant: trackRef.participant,
    htmlProps,
    source: trackRef.source,
    publication: trackRef.publication,
    disableSpeakingIndicator,
    onParticipantClick
  });

  const layoutContext = useMaybeLayoutContext();

  const handleSubscribe = React.useCallback(
    (subscribed: boolean) => {
      if (
        trackRef.source &&
        !subscribed &&
        layoutContext &&
        layoutContext.pin.dispatch &&
        isParticipantSourcePinned(trackRef.participant, trackRef.source, layoutContext.pin.state)
      ) {
        layoutContext.pin.dispatch({ msg: "clear_pin" });
      }
    },
    [trackRef.participant, layoutContext, trackRef.source]
  );

  const audioTrack = trackRef.participant.getTrack(Track.Source.Microphone);
  const videoTrack = trackRef.participant.getTrack(Track.Source.Camera);
  const localUser = trackRef.participant.identity === localIdentity;

  return (
    <div style={{ position: "relative" }} {...elementProps}>
      <ParticipantContextIfNeeded participant={trackRef.participant}>
        {children ?? (
          <>
            {trackRef.publication?.kind === "video" ||
            trackRef.source === Track.Source.Camera ||
            trackRef.source === Track.Source.ScreenShare ? (
              <VideoTrack
                participant={trackRef.participant}
                source={trackRef.source}
                publication={trackRef.publication}
                onSubscriptionStatusChanged={handleSubscribe}
              />
            ) : (
              <AudioTrack
                participant={trackRef.participant}
                source={trackRef.source}
                publication={trackRef.publication}
                onSubscriptionStatusChanged={handleSubscribe}
              />
            )}
            <div className="lk-participant-placeholder">
              <SvgParticipantPlaceholder />
            </div>
            <div className="lk-participant-metadata">
              <div className="lk-participant-metadata-item">
                {trackRef.source === Track.Source.Camera ? (
                  <>
                    <TrackMutedIndicator
                      source={Track.Source.Microphone}
                      show={"muted"}
                    ></TrackMutedIndicator>
                    <ParticipantName />
                  </>
                ) : (
                  <>
                    <ScreenShareIcon style={{ marginRight: "0.25rem" }} />
                    <ParticipantName>&apos;s screen</ParticipantName>
                  </>
                )}
              </div>



              <ConnectionQualityIndicator className="lk-participant-metadata-item" />
            </div>
          </>
        )}

        <div style={{
          position: 'absolute',
          top: '0.25rem',
          right: 'calc(26px + 0.25rem + 0.5rem)',
          height: '26px',
          display: "flex",
          gap: "0.5rem"
        }}>
          {!localUser && onKick && (
            <button
              onClick={() => onKick(trackRef.participant.identity)}
              style={{ position: "initial" }}
              className={"lk-participant-metadata-item lk-focus-toggle-button"}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.75 0H4.25C2.975 0 2 1.04 2 2.4V7.2H8.45L6.725 5.36C6.425 5.04 6.425 4.56 6.725 4.24C7.025 3.92 7.475 3.92 7.775 4.24L10.775 7.44C11.075 7.76 11.075 8.24 10.775 8.56L7.775 11.76C7.475 12.08 7.025 12.08 6.725 11.76C6.425 11.44 6.425 10.96 6.725 10.64L8.45 8.8H2V13.6C2 14.96 2.975 16 4.25 16H11.75C13.025 16 14 14.96 14 13.6V2.4C14 1.04 13.025 0 11.75 0Z" fill="white"/>
              </svg>

            </button>
          )}

          {/*mutePublishedTrack(room: string, identity: string, trackSid: string, muted: boolean): Promise<TrackInfo>;*/}
          {!localUser && audioTrack && !audioTrack.isMuted && onMute && (
            <button
              onClick={() => onMute(trackRef.participant.identity, audioTrack.trackSid)}
              style={{ position: "initial" }}
              className={"lk-participant-metadata-item lk-focus-toggle-button"}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.95371 10.6208C9.62109 10.6208 10.9717 9.2719 10.9717 7.60659V3.99592L13.7639 1.20718C13.9859 0.985382 13.9859 0.625355 13.7639 0.403559C13.5472 0.187214 13.1996 0.181764 12.9775 0.3872C12.9721 0.392653 12.9666 0.399881 12.9612 0.405334L1.50828 11.846C1.50828 11.846 1.49736 11.8569 1.49012 11.8624C1.28443 12.086 1.28989 12.4314 1.5065 12.6477C1.61748 12.7586 1.76311 12.815 1.90874 12.815C2.05438 12.815 2.20001 12.7605 2.31098 12.6477L3.96197 10.9988C4.79935 12.0077 6.01342 12.6968 7.38598 12.8458V14.862H5.29631C4.98142 14.862 4.7266 15.1165 4.7266 15.431C4.7266 15.7455 4.98143 16 5.29631 16H10.7044C11.0193 16 11.2741 15.7455 11.2741 15.431C11.2741 15.1165 11.0192 14.862 10.7044 14.862H8.6147V12.8458C11.2067 12.5623 13.229 10.3625 13.229 7.69896V7.21174C13.229 6.89725 12.9742 6.64274 12.6593 6.64274C12.3444 6.64274 12.0896 6.89725 12.0896 7.21174V7.69896C12.0896 9.92607 10.2748 11.7404 8.04315 11.7404H7.95401C6.6635 11.7404 5.51125 11.1333 4.77038 10.1915L5.5421 9.42077C6.09366 10.1498 6.96735 10.6225 7.95388 10.6225L7.95371 10.6208Z" fill="white"/>
                <path d="M7.95371 0.000183105C6.28634 0.000183105 4.93575 1.3491 4.93575 3.01442V6.81403L10.4439 1.31265C9.89974 0.520065 8.98761 0.000183105 7.95371 0.000183105Z" fill="white"/>
                <path d="M3.91113 7.83764C3.91113 7.79224 3.90935 7.74494 3.90935 7.69941V7.21219C3.90935 6.89769 3.65452 6.64319 3.33965 6.64319C3.02477 6.64319 2.76995 6.8977 2.76995 7.21219V7.69941C2.76995 8.09392 2.8154 8.47755 2.8992 8.84835L3.91113 7.83764Z" fill="white"/>
              </svg>

            </button>
          )}

          {!localUser && videoTrack && !videoTrack.isMuted && onMute && (
            <button
              onClick={() => onMute(trackRef.participant.identity, videoTrack.trackSid)}
              style={{ position: "initial" }}
              className={"lk-participant-metadata-item lk-focus-toggle-button"}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3.57113V11.4287C16 11.6144 15.933 11.7941 15.8109 11.9359C15.6887 12.0778 15.5193 12.1725 15.3328 12.2033C15.1463 12.2341 14.9547 12.1991 14.7921 12.1044L12.0001 10.4621V10.6428C12.0001 11.268 11.7472 11.8676 11.2971 12.3097C10.8469 12.7517 10.2365 13 9.60004 13H2.40001C1.76346 13 1.153 12.7517 0.702861 12.3097C0.252859 11.8676 0 11.268 0 10.6428V4.35719C0 3.732 0.252859 3.13243 0.702861 2.69032C1.153 2.24835 1.76346 2 2.40001 2H9.60004C10.2365 2 10.8469 2.24835 11.2971 2.69032C11.7472 3.13243 12.0001 3.732 12.0001 4.35719V4.53793L14.7921 2.89577C14.9547 2.80106 15.1463 2.76594 15.3328 2.79672C15.5193 2.8275 15.6888 2.92221 15.8109 3.06414C15.933 3.20594 16 3.38542 16 3.57113Z" fill="white"/>
              </svg>

            </button>
          )}
        </div>
        <FocusToggle trackSource={trackRef.source} />

      </ParticipantContextIfNeeded>
    </div>
  );
};
