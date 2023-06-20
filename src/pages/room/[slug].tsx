import type {LocalUserChoices} from "@livekit/components-react"
import {formatChatMessageLinks, LiveKitRoom, PreJoin, VideoConference} from "@livekit/components-react"
import {api} from "@/lib/api"
import React, {useMemo, useState} from "react"
import type {GetServerSideProps, NextPage} from "next"
import type {RoomOptions} from "livekit-client"
import {LogLevel, VideoPresets} from "livekit-client"
import {useRouter} from "next/router"
import {DebugMode} from "@/lib/Debug"

interface Props {
  slug: string;
}

const RoomWrapper: NextPage<Props> = ({slug}) => {
  const router = useRouter()

  const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | undefined>(undefined)
  return (
    <>

      {slug && preJoinChoices ? (
        <ActiveRoom
          roomName={slug}
          userChoices={preJoinChoices}
          onLeave={() => {
            void router.push('/')
          }}
        ></ActiveRoom>
      ) : (
        <div style={{display: 'grid', placeItems: 'center', height: '100%'}}>
          <PreJoin
            onError={(err) => console.log('error while setting up prejoin', err)}
            defaults={{
              username: '',
              videoEnabled: true,
              audioEnabled: true,
            }}
            onSubmit={(values) => {
              console.log('Joining with: ', values)
              setPreJoinChoices(values)
            }}
            onValidate={(values) => {
              if (!values.username || values.username.length < 3) {
                return false
              }
              return true
            }}
          ></PreJoin>
        </div>
      )}

    </>
  )
}

export default RoomWrapper


export const getServerSideProps: GetServerSideProps<Props> = async ({params}) => {
  return Promise.resolve({
    props: {
      slug: params?.slug as string,
    },
  })
}

interface ActiveRoomProps {
  userChoices: LocalUserChoices;
  roomName: string;
  region?: string;
  onLeave?: () => void;
}

function ActiveRoom({roomName, userChoices, onLeave}: ActiveRoomProps) {
  const [token, setToken] = useState("")
  const [wsUrl, setWsUrl] = useState("")

  api.token.get.useQuery(
    {
      roomName: roomName,
      identity: userChoices.username,
    },
    {
      onSuccess: (data) => {
        setToken(data?.token)
        setWsUrl(data?.url)
        // sessionStorage.setItem(SESSION_VIEWER_TOKEN_KEY, data?.token)
      },
      enabled: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    }
  )

  const router = useRouter()
  const {hq} = router.query

  const roomOptions = useMemo((): RoomOptions => {
    return {
      videoCaptureDefaults: {
        deviceId: userChoices.videoDeviceId ?? undefined,
        resolution: hq === 'true' ? VideoPresets.h2160 : VideoPresets.h720,
      },
      publishDefaults: {
        videoSimulcastLayers:
          hq === 'true'
            ? [VideoPresets.h1080, VideoPresets.h720]
            : [VideoPresets.h540, VideoPresets.h216],
      },
      audioCaptureDefaults: {
        deviceId: userChoices.audioDeviceId ?? undefined,
      },
      adaptiveStream: {pixelDensity: 'screen'},
      dynacast: false,
    }
  }, [userChoices, hq])

  return (
    <>
      {wsUrl && (
        <LiveKitRoom
          token={token}
          serverUrl={wsUrl}
          options={roomOptions}
          video={userChoices?.videoEnabled}
          audio={userChoices?.audioEnabled}
          onDisconnected={onLeave}
        >
          <VideoConference chatMessageFormatter={formatChatMessageLinks}/>
          <DebugMode logLevel={LogLevel.info}/>
        </LiveKitRoom>
      )}
    </>
  )
}
