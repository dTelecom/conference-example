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

/** @public */
export type ParticipantTileProps = React.HTMLAttributes<HTMLDivElement> & {
  disableSpeakingIndicator?: boolean;
  participant?: Participant;
  source?: Track.Source;
  publication?: TrackPublication;
  onParticipantClick?: (event: ParticipantClickEvent) => void;
  onKick?: (identity: string) => void;
  onMute?: (identity: string, trackSid: string) => void;
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

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem"
                }}
              >
                {/*mutePublishedTrack(room: string, identity: string, trackSid: string, muted: boolean): Promise<TrackInfo>;*/}
                {audioTrack && !audioTrack.isMuted && onMute && (
                  <button
                    onClick={() => onMute(trackRef.participant.identity, audioTrack.trackSid)}
                    style={{ width: "auto" }}
                    className={"lk-participant-metadata-item lk-connection-quality"}
                  >
                    mute
                  </button>
                )}

                {onKick && (
                  <button
                    onClick={() => onKick(trackRef.participant.identity)}
                    style={{ width: "auto" }}
                    className={"lk-participant-metadata-item lk-connection-quality"}
                  >
                    kick
                  </button>
                )}
              </div>

              <ConnectionQualityIndicator className="lk-participant-metadata-item" />
            </div>
          </>
        )}
        <FocusToggle trackSource={trackRef.source} />
      </ParticipantContextIfNeeded>
    </div>
  );
};
