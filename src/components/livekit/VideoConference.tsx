/* eslint-disable */
// @ts-nocheck
import * as React from "react";
import type { WidgetState } from "@livekit/components-core";
import { isEqualTrackRef, isTrackReference, log } from "@livekit/components-core";
import { RoomEvent, Track } from "livekit-client";
import type { MessageFormatter } from "@livekit/components-react";
import {
  Chat,
  ConnectionStateToast,
  FocusLayout,
  FocusLayoutContainer,
  GridLayout,
  LayoutContextProvider,
  RoomAudioRenderer,
  useCreateLayoutContext,
  usePinnedTracks,
  useTracks
} from "@livekit/components-react";
import { ParticipantTile } from "@/components/livekit/ParticipantTile";
import { CarouselLayout } from "./CarouselLayout";
import { ControlBar } from "@/components/livekit/ControlBar";

/**
 * @public
 */
export interface VideoConferenceProps extends React.HTMLAttributes<HTMLDivElement> {
  chatMessageFormatter?: MessageFormatter;
  onKick?: (identity: string) => void;
  onMute?: (identity: string, trackSid: string) => void;
  isAdmin?: boolean;
}

/**
 * This component is the default setup of a classic LiveKit video conferencing app.
 * It provides functionality like switching between participant grid view and focus view.
 *
 * @remarks
 * The component is implemented with other LiveKit components like `FocusContextProvider`,
 * `GridLayout`, `ControlBar`, `FocusLayoutContainer` and `FocusLayout`.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <VideoConference />
 * <LiveKitRoom>
 * ```
 * @public
 */
export function VideoConference({ chatMessageFormatter, onKick, onMute, isAdmin, ...props }: VideoConferenceProps) {
  const [widgetState, setWidgetState] = React.useState<WidgetState>({ showChat: false });

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false }
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged] }
  );

  const widgetUpdate = (state: WidgetState) => {
    log.debug("updating widget state", state);
    setWidgetState(state);
  };

  const layoutContext = useCreateLayoutContext();

  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter((track) => track.publication.source === Track.Source.ScreenShare);

  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter((track) => !isEqualTrackRef(track, focusTrack));

  React.useEffect(() => {
    // if screen share tracks are published, and no pin is set explicitly, auto set the screen share
    if (screenShareTracks.length > 0 && focusTrack === undefined) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      layoutContext.pin.dispatch?.({ msg: "set_pin", trackReference: screenShareTracks[0] });
    } else if (
      (screenShareTracks.length === 0 && focusTrack?.source === Track.Source.ScreenShare) ||
      tracks.length <= 1
    ) {
      layoutContext.pin.dispatch?.({ msg: "clear_pin" });
    }
  }, [
    JSON.stringify(screenShareTracks.map((ref) => ref.publication.trackSid)),
    tracks.length,
    focusTrack?.publication?.trackSid
  ]);

  return (
    <div className="lk-video-conference" {...props}>
      <LayoutContextProvider
        value={layoutContext}
        // onPinChange={handleFocusStateChange}
        onWidgetChange={widgetUpdate}
      >
        <div className="lk-video-conference-inner">
          {!focusTrack ? (
            <div className="lk-grid-layout-wrapper">
              <GridLayout tracks={tracks}>
                <ParticipantTile
                  onKick={!isAdmin ? onKick : undefined}
                  onMute={!isAdmin ? onMute : undefined}
                />
              </GridLayout>
            </div>
          ) : (
            <div className="lk-focus-layout-wrapper">
              <FocusLayoutContainer>
                <CarouselLayout tracks={carouselTracks}>
                  <ParticipantTile
                    onKick={!isAdmin ? onKick : undefined}
                    onMute={!isAdmin ? onMute : undefined}
                  />
                </CarouselLayout>
                {focusTrack && <FocusLayout track={focusTrack} />}
              </FocusLayoutContainer>
            </div>
          )}
          <ControlBar
            isAdmin={isAdmin}
            controls={{ chat: true }}
          />
        </div>
        <Chat
          style={{ display: widgetState.showChat ? "flex" : "none" }}
          messageFormatter={chatMessageFormatter}
        />
      </LayoutContextProvider>
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}
