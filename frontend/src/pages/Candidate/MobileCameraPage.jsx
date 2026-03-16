import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Smartphone, CheckCircle2, ShieldAlert, CameraOff, PowerOff } from 'lucide-react';
import useMobilePairing from '../../hooks/useMobilePairing';

const MobileCameraPage = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);

    // false -> we are the guest (mobile device sending video)
    const { localStream, isMobileConnected, connecting, error, disconnectMobile } = useMobilePairing(interviewId, false);
    const [streamActive, setStreamActive] = useState(false);

    // Bind the local stream to the video element so the user can see what they are streaming
    useEffect(() => {
        if (localStream && videoRef.current) {
            videoRef.current.srcObject = localStream;
            setStreamActive(true);
        }
    }, [localStream]);

    const handleDisconnect = () => {
        disconnectMobile();
        setStreamActive(false);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <ShieldAlert size={48} className="text-red-500 mb-4" />
                <h1 className="text-xl font-bold mb-2">Camera Access Denied</h1>
                <p className="text-gray-400 text-sm mb-8">
                    We could not access your mobile camera. Please ensure you have granted camera permissions in your mobile browser.
                </p>
                <p className="text-xs text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                    {error.message || "Unknown hardware error"}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center safe-area-pt">
            {/* Header */}
            <div className="w-full bg-gray-900 p-4 border-b border-gray-800 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <Smartphone size={20} className="text-blue-400" />
                    <span className="font-bold text-sm tracking-wide">NextGen Proctoring</span>
                </div>
                {isMobileConnected ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Connected
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-full border border-yellow-500/30">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        {connecting ? "Connecting..." : "Waiting for Laptop"}
                    </div>
                )}
            </div>

            {/* Camera Viewport */}
            <div className="flex-1 w-full relative flex flex-col items-center justify-center bg-gray-950">
                {!streamActive ? (
                    <div className="flex flex-col items-center justify-center text-gray-500 animate-pulse">
                        <CameraOff size={48} className="mb-4 opacity-50" />
                        <p className="font-medium">Initializing Camera...</p>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Overlay elements over video */}
                        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

                        <div className="absolute top-6 w-full px-6 flex flex-col items-center text-center pointer-events-none drop-shadow-md">
                            <h2 className="font-bold text-lg text-white mb-1 drop-shadow-sm">Secondary Camera Active</h2>
                            <p className="text-xs text-gray-200">Please position your phone to capture a side-profile view of yourself and your desk.</p>
                        </div>
                    </>
                )}
            </div>

            {/* Controls */}
            <div className="w-full bg-gray-900 p-6 pb-8 border-t border-gray-800 flex flex-col items-center z-10">
                {isMobileConnected ? (
                    <div className="w-full">
                        <div className="flex items-center justify-center gap-2 mb-4 text-green-400 text-sm font-medium">
                            <CheckCircle2 size={16} />
                            Streaming to your laptop
                        </div>
                        <button
                            onClick={handleDisconnect}
                            className="w-full py-3.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/30 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <PowerOff size={18} />
                            Disconnect Phone
                        </button>
                    </div>
                ) : (
                    <div className="text-center w-full">
                        <div className="text-sm text-gray-400 mb-2">Keep this screen open</div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-1/3 animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileCameraPage;
