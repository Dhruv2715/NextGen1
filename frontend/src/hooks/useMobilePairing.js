import { useEffect, useRef, useState, useCallback } from 'react';
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.PROD ? (import.meta.env.VITE_API_URL || "https://api.myapp.com") : "/";

/**
 * Hook to handle secondary camera pairing via WebRTC
 * @param {string} roomId - The interview ID used as the secure room
 * @param {boolean} isHost - If true, this is the laptop receiving the video. If false, it's the mobile sending the video.
 */
export default function useMobilePairing(roomId, isHost) {
  const [localStream, setLocalStream] = useState(null); // Only used by mobile (Guest)
  const [remoteStream, setRemoteStream] = useState(null); // Only used by laptop (Host)
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileConnected, setIsMobileConnected] = useState(false);

  const socketRef = useRef();
  const peerRef = useRef();
  const localStreamRef = useRef(null);

  // Uniquely identify the room for local pairing to not collide with standard interview
  const pairingRoom = `mobile-pair-${roomId}`;

  useEffect(() => {
    let isMounted = true;

    const startAndConnect = async () => {
      try {
        let stream = null;

        // If this is the mobile phone (guest), we need to capture the camera to send it.
        // We prefer the rear-facing camera. Audio is explicitly OFF to prevent piercing echo/feedback
        // because the laptop's mic is already capturing audio.
        if (!isHost) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: "environment" }, // Prefer rear camera
              audio: false // STRICTLY FALSE. WE DO NOT WANT ECHO.
            });
            if (!isMounted) {
              stream.getTracks().forEach(track => track.stop());
              return;
            }
            setLocalStream(stream);
            localStreamRef.current = stream;
          } catch (err) {
            console.error("Mobile camera access failed:", err);
            if (isMounted) setError(err);
            return;
          }
        }

        // Initialize Socket
        if (socketRef.current) {
          socketRef.current.disconnect();
        }

        socketRef.current = io(SOCKET_SERVER_URL, { transports: ['websocket'] });

        // Build standard ICE servers
        const iceServers = [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ];

        // If metered turn servers are provided in env, add them for fallback
        const meteredUsername = import.meta.env.VITE_METERED_USERNAME;
        const meteredCredential = import.meta.env.VITE_METERED_CREDENTIAL;
        if (meteredUsername && meteredCredential) {
          iceServers.push(
            { urls: "turn:standard.relay.metered.ca:80", username: meteredUsername, credential: meteredCredential },
            { urls: "turn:standard.relay.metered.ca:443", username: meteredUsername, credential: meteredCredential }
          );
        }

        const peerConfig = { iceServers };

        // ==========================================
        // HOST (Laptop) LOGIC: Waits for mobile to join
        // ==========================================
        if (isHost) {
          socketRef.current.on('user-joined', () => {
            console.log("[MobilePairing] Mobile device joined! Initiating Peer connection.");
            
            if (peerRef.current) peerRef.current.destroy();

            // Host receives video, but doesn't send stream
            const peer = new SimplePeer({
              initiator: true, 
              trickle: false,
              config: peerConfig,
              offerOptions: {
                offerToReceiveAudio: false, // Don't want audio feedback
                offerToReceiveVideo: true
              }
            });

            peer.on('signal', signal => {
              console.log("[MobilePairing] Laptop signaling offer to mobile");
              socketRef.current.emit('signal', { room: pairingRoom, signal });
            });

            peer.on('connect', () => {
              console.log("[MobilePairing] Connect event fired (Laptop)");
              if (isMounted) {
                setConnecting(false);
                setIsMobileConnected(true);
              }
            });

            peer.on('stream', (rStream) => {
              console.log("[MobilePairing] Received Mobile Camera Stream!");
              if (isMounted) setRemoteStream(rStream);
            });

            peer.on('close', () => {
              console.log("[MobilePairing] Mobile disconnected");
              if (isMounted) {
                setIsMobileConnected(false);
                setRemoteStream(null);
                setConnecting(true);
              }
            });

            peer.on('error', (err) => console.error('[MobilePairing] Host peer error:', err));

            peerRef.current = peer;
          });

          socketRef.current.on('signal', ({ signal }) => {
            console.log("[MobilePairing] Laptop received answer signal");
            if (peerRef.current && !peerRef.current.destroyed) {
              peerRef.current.signal(signal);
            }
          });
        } 
        
        // ==========================================
        // GUEST (Mobile) LOGIC: Answers the host's offer
        // ==========================================
        else {
          socketRef.current.on('other-user', ({ signal }) => {
            console.log("[MobilePairing] Mobile received offer from Laptop");
            
            if (peerRef.current) peerRef.current.destroy();

            // Mobile SENDS video stream
            const peer = new SimplePeer({
              initiator: false,
              trickle: false,
              stream: stream, // <--- Attach mobile camera
              config: peerConfig,
            });

            peer.on('signal', answerSignal => {
              console.log("[MobilePairing] Mobile signaling answer back to laptop");
              socketRef.current.emit('signal', { room: pairingRoom, signal: answerSignal });
            });

            peer.on('connect', () => {
              console.log("[MobilePairing] Connect event fired (Mobile)");
              if (isMounted) {
                setConnecting(false);
                setIsMobileConnected(true);
              }
            });

            peer.on('close', () => {
              console.log("[MobilePairing] Laptop closed connection");
              if (isMounted) {
                setIsMobileConnected(false);
                setConnecting(true);
              }
            });

            peer.on('error', (err) => console.error('[MobilePairing] Guest peer error:', err));

            peer.signal(signal);
            peerRef.current = peer;
            if (isMounted) setConnecting(false);
          });
          
          socketRef.current.on('signal', ({ signal }) => {
             // Shouldn't hit this heavily as initiator=false fires 'other-user' mostly, 
             // but catches standard ICE trickle if enabled later
             if (peerRef.current && !peerRef.current.destroyed) {
               peerRef.current.signal(signal);
             }
          });
        }

        socketRef.current.on('disconnect', () => {
          console.log("[MobilePairing] Socket Disconnected");
          if (isMounted) {
            setIsMobileConnected(false);
          }
        });

        // Finally, join the pairing room!
        // The mobile device emits 'join-room', the server will emit 'user-joined', 
        // triggering the Host to create the offer.
        console.log(`[MobilePairing] Joining Room: ${pairingRoom} as ${isHost ? 'HOST' : 'GUEST'}`);
        socketRef.current.emit('join-room', { room: pairingRoom });

      } catch (e) {
         console.error("[MobilePairing] Setup failed:", e);
         if (isMounted) setError(e);
      }
    };

    startAndConnect();

    // Cleanup function when component unmounts
    return () => {
      isMounted = false;
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off();
        socketRef.current = null;
      }
      if (localStreamRef.current && !isHost) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        localStreamRef.current = null;
      }
    };
  }, [roomId, isHost]);

  // Expose a manual disconnect for the mobile device
  const disconnectMobile = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    if (localStreamRef.current && !isHost) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      setLocalStream(null);
    }
    setIsMobileConnected(false);
    setConnecting(true);
  }, [isHost]);

  return {
    localStream, // Mobile camera feed (available to mobile)
    remoteStream, // Mobile camera feed (available to laptop)
    connecting,
    isMobileConnected,
    error,
    disconnectMobile
  };
}
