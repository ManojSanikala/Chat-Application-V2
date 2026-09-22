/* =====================================================

   call.js

   COMPLETE REAL-TIME WEBRTC CALL SYSTEM

   Features:

   - Voice Call
   - Video Call
   - Incoming Call
   - Accept
   - Reject
   - Cancel Before Answer
   - End Call
   - Mute / Unmute
   - Call Timer
   - WebRTC Offer
   - WebRTC Answer
   - ICE Candidates

===================================================== */


/* =====================================================
   CALL VARIABLES
===================================================== */

let activeCallUser = "";

let activeCallType = "";

let incomingCall = null;

let callState = "IDLE";

let callDirection = "";


/* =====================================================
   WEBRTC VARIABLES
===================================================== */

let isMuted = false;

let callSeconds = 0;

let peerConnection = null;

let localStream = null;

let pendingIceCandidates = [];

let callTimerInterval = null;

let callStartTime = null;


/* =====================================================
   SUBSCRIPTION VARIABLE

   Prevent duplicate subscriptions
===================================================== */

let callSubscription = null;


/* =====================================================
   WEBRTC CONFIGURATION

   STUN Server
===================================================== */

const rtcConfiguration = {

    iceServers: [

        {
            urls: "stun:stun.l.google.com:19302"
        },

        {
            urls: "stun:stun1.l.google.com:19302"
        }

    ]

};


/* =====================================================
   START CALL
===================================================== */

function startCall(callType) {

    console.log(
        "Starting call:",
        callType
    );

 /*
     * RESET CALL HISTORY
     * FOR NEW CALL
     */

    resetCallHistoryFlag();

    /*
     * Check selected user
     */

    if (!currentChatUser) {

        alert(
            "Please select a user first."
        );

        return;
    }


    /*
     * Cannot call yourself
     */

    if (

        loggedInUser &&

        currentChatUser === loggedInUser

    ) {

        alert(
            "You cannot call yourself."
        );

        return;
    }


    /*
     * Already in call
     */

    if (

        callState !== "IDLE"

    ) {

        alert(
            "A call is already in progress."
        );

        return;
    }


    /*
     * Check WebSocket
     */

    if (

        !stompClient ||

        !stompClient.connected

    ) {

        alert(
            "WebSocket is not connected. Please wait and try again."
        );

        return;
    }


    /*
     * Save call information
     */

    activeCallUser =
        currentChatUser;

    activeCallType =
        callType;

    callState =
        "OUTGOING";
        callDirection =
    "OUTGOING";

/*
 * ADD OUTGOING CALL HISTORY
 */

/*if (
    typeof addCallHistoryMessage ===
    "function"
) {

    addCallHistoryMessage(
        currentChatUser,
        callType,
        "OUTGOING",
        "CALLING"
    );

}*/
    /*
     * Show outgoing UI FIRST
     *
     * Caller gets End Call button immediately.
     */

    showOutgoingCallModal(

        activeCallUser,

        activeCallType

    );


    /*
     * Send call request
     */

    sendCallSignal(

        activeCallUser,

        activeCallType,

        "CALL_REQUEST"

    );


    console.log(
        "Call request sent"
    );

}


/* =====================================================
   SEND NORMAL CALL SIGNAL
===================================================== */

function sendCallSignal(

    receiver,

    callType,

    action

) {

    if (

        !stompClient ||

        !stompClient.connected

    ) {

        console.warn(
            "Cannot send call signal. WebSocket disconnected."
        );

        return;
    }


    const signal = {

        receiver:
            receiver,

        callType:
            callType,

        action:
            action

    };


    stompClient.send(

        "/app/call/signal",

        {},

        JSON.stringify(signal)

    );


    console.log(
        "Call signal sent:",
        signal
    );

}


/* =====================================================
   SEND WEBRTC SIGNAL
===================================================== */

function sendWebRTCSignal(signal) {

    if (

        !stompClient ||

        !stompClient.connected

    ) {

        console.error(
            "WebSocket not connected"
        );

        return;
    }


    stompClient.send(

        "/app/call/signal",

        {},

        JSON.stringify(signal)

    );


    console.log(
        "WebRTC signal sent:",
        signal.action
    );

}


/* =====================================================
   SUBSCRIBE TO CALL SIGNALS
===================================================== */

function subscribeToCalls() {

    if (

        !stompClient ||

        !stompClient.connected

    ) {

        console.warn(
            "Cannot subscribe to calls. WebSocket disconnected."
        );

        return;
    }


    /*
     * Prevent duplicate subscription
     */

    if (callSubscription) {

        try {

            callSubscription.unsubscribe();

        }
        catch (error) {

            console.warn(
                "Old call subscription error:",
                error
            );

        }

    }


    callSubscription =

        stompClient.subscribe(

            "/user/queue/call",

            function(message) {

                let signal;


                try {

                    signal =
                        JSON.parse(
                            message.body
                        );

                }

                catch (error) {

                    console.error(
                        "Invalid call signal:",
                        message.body
                    );

                    return;
                }


                console.log(
                    "Call signal received:",
                    signal
                );


                handleCallSignal(
                    signal
                );

            }

        );


    console.log(
        "Subscribed to call signals"
    );

}


/* =====================================================
   HANDLE ALL CALL SIGNALS
===================================================== */

function handleCallSignal(signal) {

    if (!signal) {

        return;
    }


    const action =
        signal.action;


    console.log(
        "Handling action:",
        action
    );


    /* =====================================
       CALL REQUEST
    ===================================== */

    if (

        action === "CALL_REQUEST"

    ) {

        handleIncomingCall(
            signal
        );

        return;
    }


    /* =====================================
       CALL ACCEPT
    ===================================== */

    if (

        action === "CALL_ACCEPT"

    ) {

        handleCallAccepted(
            signal
        );

        return;
    }


    /* =====================================
       CALL REJECT
    ===================================== */

    if (

        action === "CALL_REJECT"

    ) {

        handleCallRejected(
            signal
        );

        return;
    }


    /* =====================================
       CALL END
    ===================================== */

    if (

        action === "CALL_END"

    ) {

        handleCallEnded(
            signal
        );

        return;
    }


    /* =====================================
       WEBRTC OFFER
    ===================================== */

    if (

        action === "WEBRTC_OFFER"

    ) {

        handleWebRTCOffer(
            signal
        );

        return;
    }


    /* =====================================
       WEBRTC ANSWER
    ===================================== */

    if (

        action === "WEBRTC_ANSWER"

    ) {

        handleWebRTCAnswer(
            signal
        );

        return;
    }


    /* =====================================
       ICE CANDIDATE
    ===================================== */

    if (

        action === "ICE_CANDIDATE"

    ) {

        handleIceCandidate(
            signal
        );

        return;
    }

}


/* =====================================================
   HANDLE INCOMING CALL
===================================================== */

function handleIncomingCall(signal) {

    console.log(
        "Incoming call from:",
        signal.sender
    );


    /*
     * Reject if already busy
     */

    if (

        callState !== "IDLE"

    ) {

        console.log(
            "Already busy. Rejecting call."
        );


        sendCallSignal(

            signal.sender,

            signal.callType,

            "CALL_REJECT"

        );

        return;
    }


    /*
     * Save incoming call
     */

    incomingCall =
        signal;


    activeCallUser =
        signal.sender;


    activeCallType =
        signal.callType;


    callState =
        "INCOMING";
	callDirection =
    "INCOMING";
/*
 * ADD INCOMING CALL HISTORY
 

if (
    typeof addCallHistoryMessage ===
    "function"
) {

    addCallHistoryMessage(
        signal.sender,
        signal.callType,
        "INCOMING",
        "RINGING"
    );

}*/
    /*
     * Show Answer / Reject
     */

    showIncomingCallModal(

        signal.sender,

        signal.callType

    );

}


/* =====================================================
   SHOW OUTGOING CALL MODAL
===================================================== */

function showOutgoingCallModal(

    username,

    callType

) {

    const modal =
        document.getElementById(
            "callModal"
        );


    const title =
        document.getElementById(
            "callModalTitle"
        );


    const user =
        document.getElementById(
            "callModalUser"
        );


    const status =
        document.getElementById(
            "callModalStatus"
        );


    const icon =
        document.getElementById(
            "callModalIcon"
        );


    const incomingActions =
        document.getElementById(
            "incomingCallActions"
        );


    const activeActions =
        document.getElementById(
            "activeCallActions"
        );


    const muteButton =
        document.getElementById(
            "muteCallButton"
        );



    const timer =
        document.getElementById(
            "callTimer"
        );


    if (!modal) {

        console.error(
            "callModal not found"
        );

        return;
    }


    /*
     * Title
     */

    if (title) {

        title.textContent =

            callType === "VIDEO"

                ? "Video Call"

                : "Voice Call";

    }


    /*
     * Username
     */

    if (user) {

        user.textContent =
            username;

    }


    /*
     * Status
     */

    if (status) {

        status.textContent =
            "Calling...";

    }


    /*
     * Icon
     */

    if (icon) {

        icon.innerHTML =

            callType === "VIDEO"

                ? '<i class="fa-solid fa-video"></i>'

                : '<i class="fa-solid fa-phone"></i>';

    }


    /*
     * Hide incoming buttons
     */

    if (incomingActions) {

        incomingActions.style.display =
            "none";

    }


    /*
     * Show active actions
     *
     * Caller gets End Call immediately.
     */

    if (activeActions) {

        activeActions.style.display =
            "flex";

    }


    /*
     * Mute disabled before connection
     */

    if (muteButton) {

        muteButton.style.display =
            "none";

    }



    /*
     * Timer hidden
     */

    if (timer) {

        timer.style.display =
            "none";

        timer.textContent =
            "00:00";

    }


    const videoContainer = document.getElementById("callVideoContainer");
    if (videoContainer) videoContainer.style.display = callType === "VIDEO" ? "block" : "none";

    modal.style.display = "flex";

}


/* =====================================================
   SHOW INCOMING CALL MODAL
===================================================== */

function showIncomingCallModal(

    username,

    callType

) {

    const modal =
        document.getElementById(
            "callModal"
        );


    const title =
        document.getElementById(
            "callModalTitle"
        );


    const user =
        document.getElementById(
            "callModalUser"
        );


    const status =
        document.getElementById(
            "callModalStatus"
        );


    const icon =
        document.getElementById(
            "callModalIcon"
        );


    const incomingActions =
        document.getElementById(
            "incomingCallActions"
        );


    const activeActions =
        document.getElementById(
            "activeCallActions"
        );


    const timer =
        document.getElementById(
            "callTimer"
        );


    if (!modal) {

        return;

    }


    /*
     * Title
     */

    if (title) {

        title.textContent =

            "Incoming " +

            (

                callType === "VIDEO"

                    ? "Video Call"

                    : "Voice Call"

            );

    }


    /*
     * User
     */

    if (user) {

        user.textContent =
            username;

    }


    /*
     * Status
     */

    if (status) {

        status.textContent =
            "is calling you";

    }


    /*
     * Icon
     */

    if (icon) {

        icon.innerHTML =

            callType === "VIDEO"

                ? '<i class="fa-solid fa-video"></i>'

                : '<i class="fa-solid fa-phone"></i>';

    }


    /*
     * Show Answer / Reject
     */

    if (incomingActions) {

        incomingActions.style.display =
            "flex";

    }


    /*
     * Hide active actions
     */

    if (activeActions) {

        activeActions.style.display =
            "none";

    }


    /*
     * Hide timer
     */

    if (timer) {

        timer.style.display =
            "none";

        timer.textContent =
            "00:00";

    }


    const videoContainer = document.getElementById("callVideoContainer");
    if (videoContainer) videoContainer.style.display = callType === "VIDEO" ? "block" : "none";

    modal.style.display = "flex";

}


/* =====================================================
   SHOW ACTIVE CALL MODAL

   IMPORTANT:
   TIMER DOES NOT START HERE
===================================================== */

function showActiveCallModal(

    username,

    callType

) {

    const modal =
        document.getElementById(
            "callModal"
        );


    const title =
        document.getElementById(
            "callModalTitle"
        );


    const user =
        document.getElementById(
            "callModalUser"
        );


    const status =
        document.getElementById(
            "callModalStatus"
        );


    const incomingActions =
        document.getElementById(
            "incomingCallActions"
        );


    const activeActions =
        document.getElementById(
            "activeCallActions"
        );


    const muteButton =
        document.getElementById(
            "muteCallButton"
        );



    const timer =
        document.getElementById(
            "callTimer"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }


    if (title) {

        title.textContent =

            callType === "VIDEO"

                ? "Video Call"

                : "Voice Call";

    }


    if (user) {

        user.textContent =
            username;

    }


    /*
     * Still connecting
     */

    if (status) {

        status.textContent =
            "Connecting...";

    }


    /*
     * Hide incoming actions
     */

    if (incomingActions) {

        incomingActions.style.display =
            "none";

    }


    /*
     * Show active actions
     */

    if (activeActions) {

        activeActions.style.display =
            "flex";

    }


    /*
     * Show mute
     */

    if (muteButton) {

        muteButton.style.display =
            "inline-flex";

    }



    /*
     * IMPORTANT
     *
     * Hide timer while connecting
     */

    if (timer) {

        timer.style.display =
            "none";

        timer.textContent =
            "00:00";

    }

}


/* =====================================================
   ACCEPT INCOMING CALL
===================================================== */

function acceptIncomingCall() {

    if (!incomingCall) {

        console.warn(
            "No incoming call"
        );

        return;
    }


    console.log(
        "Accepting call"
    );


    activeCallUser =
        incomingCall.sender;


    activeCallType =
        incomingCall.callType;


    callState =
        "ACTIVE";


    /*
     * Show Connecting
     */

    showActiveCallModal(

        activeCallUser,

        activeCallType

    );


    /*
     * Send CALL_ACCEPT
     *
     * Caller will create WebRTC Offer
     */

    sendCallSignal(

        activeCallUser,

        activeCallType,

        "CALL_ACCEPT"

    );


    incomingCall =
        null;


    console.log(
        "CALL_ACCEPT sent"
    );

}


/* =====================================================
   REJECT INCOMING CALL
===================================================== */

function rejectIncomingCall() {

    if (!incomingCall) {
		/*
 * ADD MISSED CALL HISTORY
 */

/*if (
    typeof addCallHistoryMessage ===
    "function"
) {

    addCallHistoryMessage(
        incomingCall.sender,
        incomingCall.callType,
        "MISSED",
        "REJECTED"
    );

}*/
        closeCallModal();

        resetCallState();

        return;
    }


    sendCallSignal(

        incomingCall.sender,

        incomingCall.callType,

        "CALL_REJECT"

    );


    closeCallModal();


    resetCallState();


    console.log(
        "Call rejected"
    );

}


/* =====================================================
   CALL ACCEPTED

   CALLER STARTS WEBRTC
===================================================== */

function handleCallAccepted(signal) {

    console.log(
        "Call accepted by:",
        signal.sender
    );


    /*
     * Only caller processes accept
     */

    if (

        callState !== "OUTGOING"

    ) {

        console.warn(
            "Ignoring CALL_ACCEPT. State:",
            callState
        );

        return;
    }


    activeCallUser =
        signal.sender;


    activeCallType =
        signal.callType;


    callState =
        "ACTIVE";


    /*
     * Show connecting
     */

    showActiveCallModal(

        activeCallUser,

        activeCallType

    );


    /*
     * Caller creates OFFER
     */

    startWebRTCCall();

}


/* =====================================================
   CALL REJECTED
===================================================== */

function handleCallRejected(signal) {

    console.log(
        "Call rejected by:",
        signal.sender
    );


    /*
     * Only handle outgoing call
     */

    if (

        callState !== "OUTGOING"

    ) {

        return;
    }

/*
 * SAVE REJECTED CALL
 *
 * Permanent database history.
 */

saveRejectedCallHistory(

    signal.sender,

    signal.callType

);    const status =
        document.getElementById(
            "callModalStatus"
        );


    if (status) {

        status.textContent =

            signal.sender +

            " rejected the call.";

    }


    setTimeout(

        function() {

            cleanupWebRTC();

            closeCallModal();

            resetCallState();

        },

        1500

    );

}


/* =====================================================
   END CURRENT CALL

   ADDITION:
   Save call history before cleanup

===================================================== */

function endCurrentCall() {

    console.log(
        "Ending current call"
    );


    /*
     * Save values BEFORE cleanup/reset
     */

    const receiver =
        activeCallUser;

    const callType =
        activeCallType;

    const previousCallState =
        callState;

    const direction =
        callDirection;

    const duration =
        getCurrentCallDuration();


    /*
     * =================================================
     * SAVE CALL HISTORY
     *
     * Direction is preserved even after Answer.
     * =================================================
     */

    if (receiver) {

        if (
            previousCallState === "CONNECTED"
        ) {

            saveCallHistory(
                receiver,
                callType,
                "COMPLETED",
                duration,
                direction
            );

        }

        else if (
            previousCallState === "OUTGOING"
        ) {

            saveCallHistory(
                receiver,
                callType,
                "CANCELLED",
                0,
                direction
            );

        }

        else if (
            previousCallState === "INCOMING"
        ) {

            saveCallHistory(
                receiver,
                callType,
                "MISSED",
                0,
                direction
            );

        }

    }


    /*
     * Send end signal
     */

    if (activeCallUser) {

        sendCallSignal(
            activeCallUser,
            activeCallType,
            "CALL_END"
        );

    }


    /*
     * Cleanup
     */

    cleanupWebRTC();

    closeCallModal();

    resetCallState();

}
/* =====================================================
   HANDLE CALL ENDED BY OTHER USER
===================================================== */

function handleCallEnded(signal) {

    console.log(
        "Call ended by:",
        signal.sender
    );


    /*
     * Ignore unrelated call
     */

    if (

        callState === "IDLE"

    ) {

        return;

    }


    /*
     * SAVE STATE BEFORE RESET
     */

    const previousCallState =
        callState;


    const receiver =
        activeCallUser;


    const callType =
        activeCallType;


    const duration =
        getCurrentCallDuration();


    /*
     * STATUS MESSAGE
     */

    const status =
        document.getElementById(
            "callModalStatus"
        );


    if (status) {

        status.textContent =

            signal.sender

            ?

            signal.sender + " ended the call."

            :

            "Call ended.";

    }


    /*
 * CALL HISTORY
 *
 * Do not save history when the other user
 * sends CALL_END.
 *
 * The user who ends/cancels the call is
 * responsible for saving the history.
 *
 * This prevents duplicate call records.
 */

    /*
     * CLEANUP
     */

    setTimeout(

        function() {

            cleanupWebRTC();

            closeCallModal();

            resetCallState();

        },

        1000

    );

}
/* =====================================================
   CLOSE CALL MODAL
===================================================== */

function closeCallModal() {

    const modal =
        document.getElementById(
            "callModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    hideVideoElements();

}


/* =====================================================
   RESET CALL STATE
===================================================== */

function resetCallState() {

    activeCallUser =
        "";

    activeCallType =
        "";

    incomingCall =
        null;

    callState =
        "IDLE";


    /*
     * Reset original direction
     */

    callDirection =
        "";


    isMuted =
        false;

    callSeconds =
        0;

    callStartTime =
        null;


    console.log(
        "Call state reset"
    );

}
/* =====================================================
   START WEBRTC CALL

   CALLED ONLY BY CALLER
===================================================== */

async function startWebRTCCall() {

    try {

        console.log(
            "Starting WebRTC call..."
        );


        /*
         * Clean old WebRTC connection
         * BEFORE requesting microphone/camera
         */

        if (peerConnection) {

            try {

                peerConnection.ontrack = null;
                peerConnection.onicecandidate = null;
                peerConnection.onconnectionstatechange = null;
                peerConnection.close();

            } catch (error) {

                console.warn(
                    "Old peer connection cleanup error:",
                    error
                );

            }

            peerConnection = null;
        }


        /*
         * Stop old media
         */

        if (localStream) {

            localStream
                .getTracks()
                .forEach(function(track) {

                    track.stop();

                });

            localStream = null;
        }


        /*
         * Get microphone / camera
         */

        localStream =
            await getLocalMediaStream(
                activeCallType
            );

        console.log(
            "Local media connected"
        );


        /*
         * Show local video
         */

        if (

            activeCallType === "VIDEO"

        ) {

            showLocalVideo(
                localStream
            );

        }


        /*
         * Create peer connection
         */

        createPeerConnection();


        /*
         * Add local tracks
         */

        addLocalTracks();


        /*
         * Create offer
         */

        const offer =

            await peerConnection.createOffer();


        /*
         * Set local description
         */

        await peerConnection.setLocalDescription(

            offer

        );


        /*
         * Send offer
         */

        sendWebRTCSignal({

            receiver:
                activeCallUser,

            callType:
                activeCallType,

            action:
                "WEBRTC_OFFER",

            sdp:
                offer.sdp

        });


        console.log(
            "WebRTC offer sent"
        );

    }

  catch (error) {

    console.error("=================================");
    console.error("WEBRTC START ERROR");
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Full error:", error);
    console.error("=================================");

    const status =
        document.getElementById(
            "callModalStatus"
        );

    let message =
        "Connection error.";

    if (error?.name === "NotReadableError") {

        message =
            "Camera or microphone is already in use.";

    }
    else if (error?.name === "NotAllowedError") {

        message =
            "Camera or microphone permission denied.";

    }
    else if (error?.name === "NotFoundError") {

        message =
            "Camera or microphone not found.";

    }
    else if (error?.name === "OverconstrainedError") {

        message =
            "Camera or microphone does not support the requested settings.";

    }
    else if (error?.message) {

        message =
            "Connection error: " +
            error.message;

    }

    if (status) {

        status.textContent =
            message;

    }

    /*
     * Release anything already acquired
     */

    cleanupWebRTC();

    closeCallModal();

    resetCallState();

}
}


/* =====================================================
   GET LOCAL MEDIA
===================================================== */

async function getLocalMediaStream(callType) {

    console.log("=================================");
    console.log("GET LOCAL MEDIA");
    console.log("Call type:", callType);
    console.log("=================================");

    /*
     * Stop any previous stream
     */
    if (localStream) {

        localStream
            .getTracks()
            .forEach(function(track) {

                console.log(
                    "Stopping old track:",
                    track.kind,
                    track.label
                );

                track.stop();

            });

        localStream = null;
    }


    /*
     * VOICE CALL
     */
    if (callType !== "VIDEO") {

        console.log("Requesting MICROPHONE...");

        try {

            const stream =
                await navigator.mediaDevices.getUserMedia({

                    audio: true,

                    video: false

                });

            console.log(
                "MICROPHONE SUCCESS:",
                stream.getAudioTracks()[0]?.label
            );

            return stream;

        }

        catch (error) {

            console.error(
                "MICROPHONE FAILED:",
                error.name,
                error.message
            );

            throw error;

        }

    }


    /*
     * VIDEO CALL
     */

    console.log("Finding available cameras...");

    let devices;

    try {

        devices =
            await navigator.mediaDevices.enumerateDevices();

    }

    catch (error) {

        console.error(
            "DEVICE ENUMERATION FAILED:",
            error
        );

        throw error;

    }


    const cameras =
        devices.filter(function(device) {

            return device.kind === "videoinput";

        });


    console.log(
        "Available cameras:",
        cameras
    );


    if (cameras.length === 0) {

        throw new Error(
            "No camera detected by browser."
        );

    }


    /*
     * Use first available camera explicitly
     */

    const cameraId =
        cameras[0].deviceId;


    console.log(
        "Selected camera:",
        cameras[0].label,
        cameraId
    );


    /*
     * Request CAMERA
     */

    let videoStream;

    try {

        videoStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    deviceId: {
                        exact: cameraId
                    },

                    width: {
                        ideal: 1280
                    },

                    height: {
                        ideal: 720
                    }

                },

                audio: false

            });

        console.log(
            "CAMERA SUCCESS:",
            videoStream
                .getVideoTracks()[0]
                ?.label
        );

    }

    catch (error) {

        console.error(
            "================================="
        );

        console.error(
            "CAMERA FAILED"
        );

        console.error(
            "Error name:",
            error?.name
        );

        console.error(
            "Error message:",
            error?.message
        );

        console.error(
            "Camera:",
            cameras[0]?.label
        );

        console.error(
            "Camera ID:",
            cameraId
        );

        console.error(
            "================================="
        );

        throw new Error(
            "Camera failed: " +
            (error?.name || error?.message)
        );

    }


    /*
     * Request MICROPHONE
     */

    let audioStream;

    try {

        audioStream =
            await navigator.mediaDevices.getUserMedia({

                audio: true,

                video: false

            });

        console.log(
            "MICROPHONE SUCCESS:",
            audioStream
                .getAudioTracks()[0]
                ?.label
        );

    }

    catch (error) {

        console.error(
            "MICROPHONE FAILED:",
            error?.name,
            error?.message
        );

        videoStream
            .getTracks()
            .forEach(function(track) {

                track.stop();

            });

        throw new Error(
            "Microphone failed: " +
            (error?.name || error?.message)
        );

    }


    /*
     * Combine CAMERA + MICROPHONE
     */

    const combinedStream =
        new MediaStream([

            ...videoStream.getVideoTracks(),

            ...audioStream.getAudioTracks()

        ]);


    console.log(
        "CAMERA + MICROPHONE SUCCESS"
    );


    return combinedStream;

}
/* =====================================================
   CREATE PEER CONNECTION
===================================================== */

function createPeerConnection() {

    /*
     * Close old connection
     */

    if (peerConnection) {

        try {

            peerConnection.close();

        }

        catch (error) {

            console.warn(
                "Old connection close error:",
                error
            );

        }

    }


    /*
     * Create connection
     */

    peerConnection =
        new RTCPeerConnection(
            rtcConfiguration
        );


    console.log(
        "Peer connection created"
    );


    /* =====================================
       REMOTE TRACK
    ===================================== */

    peerConnection.ontrack =
        function(event) {

            console.log(
                "Remote track received"
            );


            if (

                !event.streams ||

                !event.streams[0]

            ) {

                return;
            }


            const remoteStream =
                event.streams[0];


            /*
             * Remote audio
             */

            const audio =
                document.getElementById(
                    "remoteAudio"
                );


            if (audio) {

                audio.srcObject =
                    remoteStream;


                audio.play()

                    .catch(

                        function(error) {

                            console.warn(
                                "Audio play blocked:",
                                error
                            );

                        }

                    );

            }


            /*
             * Remote video
             */

            if (

                activeCallType === "VIDEO"

            ) {

                showRemoteVideo(
                    remoteStream
                );

            }

        };


    /* =====================================
       ICE CANDIDATE
    ===================================== */

    peerConnection.onicecandidate =
        function(event) {

            if (!event.candidate) {

                return;
            }


            sendWebRTCSignal({

                receiver:
                    activeCallUser,

                callType:
                    activeCallType,

                action:
                    "ICE_CANDIDATE",

                candidate:
                    event.candidate.candidate,

                sdpMid:
                    event.candidate.sdpMid,

                sdpMLineIndex:
                    event.candidate.sdpMLineIndex

            });

        };


    /* =====================================
       ICE CONNECTION STATE
    ===================================== */

    peerConnection.oniceconnectionstatechange =
        function() {

            console.log(
                "ICE state:",
                peerConnection.iceConnectionState
            );

        };


    /* =====================================
       CONNECTION STATE

       TIMER STARTS ONLY HERE
    ===================================== */

    peerConnection.onconnectionstatechange =
        function() {

            if (!peerConnection) {

                return;
            }


            const state =
                peerConnection.connectionState;


            console.log(
                "WebRTC state:",
                state
            );


            const status =
                document.getElementById(
                    "callModalStatus"
                );


            const timer =
                document.getElementById(
                    "callTimer"
                );


            /* =========================
               CONNECTING
            ========================= */

            if (

                state === "connecting"

            ) {

                if (status) {

                    status.textContent =
                        "Connecting...";

                }

            }


            /* =========================
               CONNECTED

               START TIMER HERE ONLY
            ========================= */

           if (

    state === "connected"

) {

    console.log(
        "REAL WEBRTC CALL CONNECTED"
    );


    /*
     * CALL IS NOW ACTUALLY CONNECTED
     *
     * Added for call history.
     */

    callState =
        "CONNECTED";


    if (status) {

        status.textContent =
            "Call connected";

    }


    if (timer) {

        timer.style.display =
            "block";

    }


    /*
     * Start timer
     */

    if (
        !callTimerInterval
    ) {

        startCallTimer();

    }

}
            /* =========================
               DISCONNECTED
            ========================= */

            if (

                state === "disconnected"

            ) {

                console.log(
                    "Connection disconnected"
                );


                if (status) {

                    status.textContent =
                        "Connection lost...";

                }

            }


            /* =========================
               FAILED
            ========================= */

            if (

                state === "failed"

            ) {

                console.error(
                    "WebRTC connection failed"
                );


                if (status) {

                    status.textContent =
                        "Connection failed";

                }


                stopCallTimer();

            }


            /* =========================
               CLOSED
            ========================= */

            if (

                state === "closed"

            ) {

                stopCallTimer();

            }

        };

}


/* =====================================================
   ADD LOCAL TRACKS
===================================================== */

function addLocalTracks() {

    if (

        !peerConnection ||

        !localStream

    ) {

        return;
    }


    localStream

        .getTracks()

        .forEach(

            function(track) {

                peerConnection.addTrack(

                    track,

                    localStream

                );

            }

        );


    console.log(
        "Local tracks added"
    );

}


/* =====================================================
   RECEIVE WEBRTC OFFER

   RECEIVER PROCESS
===================================================== */

async function handleWebRTCOffer(signal) {

    try {

        console.log("=================================");
        console.log("WEBRTC OFFER RECEIVED");
        console.log("Signal:", signal);


        if (callState !== "ACTIVE") {

            console.warn(
                "Received offer while call is not ACTIVE.",
                "Current state:",
                callState
            );

            return;
        }


        activeCallUser = signal.sender;
        activeCallType = signal.callType;


        if (!signal.sdp) {

            throw new Error(
                "WebRTC offer SDP is missing."
            );

        }


        /*
         * Close old peer connection FIRST
         */

        if (peerConnection) {

            try {

                peerConnection.ontrack = null;
                peerConnection.onicecandidate = null;
                peerConnection.onconnectionstatechange = null;
                peerConnection.close();

            } catch (error) {

                console.warn(
                    "Old peer connection cleanup error:",
                    error
                );

            }

            peerConnection = null;
        }


        /*
         * Stop old media FIRST
         */

        if (localStream) {

            localStream
                .getTracks()
                .forEach(function(track) {

                    track.stop();

                });

            localStream = null;
        }


        /*
         * Create new peer connection
         */

        createPeerConnection();


        if (!peerConnection) {

            throw new Error(
                "Peer connection could not be created."
            );

        }


        /*
         * Set remote offer BEFORE creating answer
         */

        await peerConnection.setRemoteDescription({

            type: "offer",

            sdp: signal.sdp

        });


        console.log(
            "Remote offer set successfully."
        );


        /*
         * Now request microphone / camera
         */

        localStream =
            await getLocalMediaStream(
                activeCallType
            );


        if (!localStream) {

            throw new Error(
                "Local media stream is null."
            );

        }


        console.log(
            "Receiver media connected"
        );


        /*
         * Show local video
         */

        if (
            activeCallType === "VIDEO"
        ) {

            showLocalVideo(
                localStream
            );

        }


        /*
         * Add local tracks
         */

        addLocalTracks();


        /*
         * Add pending ICE

         */

        await addPendingIceCandidates();


        /*
         * Create answer
         */

        const answer =
            await peerConnection.createAnswer();


        /*
         * Set local answer
         */

        await peerConnection.setLocalDescription(
            answer
        );


        /*
         * Send answer

         */

        sendWebRTCSignal({

            receiver:
                signal.sender,

            callType:
                signal.callType,

            action:
                "WEBRTC_ANSWER",

            sdp:
                answer.sdp

        });


        console.log(
            "WEBRTC ANSWER SENT SUCCESSFULLY"
        );


    }

    catch (error) {

        console.error(
            "WEBRTC OFFER ERROR"
        );

        console.error(
            "Error name:",
            error?.name
        );

        console.error(
            "Error message:",
            error?.message
        );

        console.error(
            "Full error:",
            error
        );


        const status =
            document.getElementById(
                "callModalStatus"
            );


        if (status) {

            status.textContent =
                "Connection error: " +
                (
                    error?.message ||
                    "Unknown WebRTC error"
                );

        }

    }

}
/* =====================================================
   RECEIVE WEBRTC ANSWER

   CALLER PROCESS
===================================================== */

async function handleWebRTCAnswer(signal) {

    try {

        console.log(
            "WebRTC answer received"
        );


        if (!peerConnection) {

            console.error(
                "Peer connection not available"
            );

            return;
        }


        /*
         * Set remote answer
         */

        await peerConnection.setRemoteDescription({

            type:
                "answer",

            sdp:
                signal.sdp

        });


        /*
         * Add pending ICE
         */

        await addPendingIceCandidates();


        console.log(
            "Remote answer set successfully"
        );

    }

    catch (error) {

        console.error(
            "WebRTC answer error:",
            error
        );

    }

}


/* =====================================================
   RECEIVE ICE CANDIDATE
===================================================== */

async function handleIceCandidate(signal) {

    if (!signal.candidate) {

        return;
    }


    const candidate =
        new RTCIceCandidate({

            candidate:
                signal.candidate,

            sdpMid:
                signal.sdpMid,

            sdpMLineIndex:
                signal.sdpMLineIndex

        });


    /*
     * Peer connection not ready
     */

    if (

        !peerConnection ||

        !peerConnection.remoteDescription ||

        !peerConnection.remoteDescription.type

    ) {

        console.log(
            "ICE queued"
        );


        pendingIceCandidates.push(
            candidate
        );

        return;
    }


    try {

        await peerConnection.addIceCandidate(
            candidate
        );


        console.log(
            "ICE candidate added"
        );

    }

    catch (error) {

        console.error(
            "ICE candidate error:",
            error
        );

    }

}


/* =====================================================
   ADD PENDING ICE CANDIDATES
===================================================== */

async function addPendingIceCandidates() {

    if (

        !peerConnection ||

        !peerConnection.remoteDescription

    ) {

        return;
    }


    while (

        pendingIceCandidates.length > 0

    ) {

        const candidate =
            pendingIceCandidates.shift();


        try {

            await peerConnection.addIceCandidate(
                candidate
            );

        }

        catch (error) {

            console.error(
                "Pending ICE error:",
                error
            );

        }

    }


    console.log(
        "Pending ICE candidates processed"
    );

}


/* =====================================================
   MUTE / UNMUTE
===================================================== */

function toggleMute() {

    if (!localStream) {

        console.warn(
            "Microphone not ready"
        );

        return;
    }


    const audioTracks =
        localStream.getAudioTracks();


    if (

        audioTracks.length === 0

    ) {

        return;
    }


    /*
     * Toggle state
     */

    isMuted =
        !isMuted;


    /*
     * Enable / Disable tracks
     */

    audioTracks.forEach(

        function(track) {

            track.enabled =
                !isMuted;

        }

    );


    /*
     * Update button
     */

    const muteButton =
        document.getElementById(
            "muteCallButton"
        );


    if (muteButton) {

        if (isMuted) {

            muteButton.innerHTML =

                '<i class="fa-solid fa-microphone-slash"></i> Unmute';

        }

        else {

            muteButton.innerHTML =

                '<i class="fa-solid fa-microphone"></i> Mute';

        }

    }


    console.log(

        isMuted

            ? "Microphone muted"

            : "Microphone unmuted"

    );

}


/* =====================================================
   START CALL TIMER

   Only called after WebRTC CONNECTED
===================================================== */

function startCallTimer() {

    /*
     * Prevent duplicate timer
     */

    if (callTimerInterval) {

        console.log(
            "Timer already running"
        );

        return;
    }


    callSeconds =
        0;


    callStartTime =
        Date.now();


    const timer =
        document.getElementById(
            "callTimer"
        );


    if (timer) {

        timer.style.display =
            "block";

        timer.textContent =
            "00:00";

    }


    callTimerInterval =

        setInterval(

            function() {

                callSeconds++;


                const minutes =

                    Math.floor(
                        callSeconds / 60
                    );


                const seconds =

                    callSeconds % 60;


                const formattedMinutes =

                    String(
                        minutes
                    ).padStart(
                        2,
                        "0"
                    );


                const formattedSeconds =

                    String(
                        seconds
                    ).padStart(
                        2,
                        "0"
                    );


                if (timer) {

                    timer.textContent =

                        formattedMinutes +

                        ":" +

                        formattedSeconds;

                }

            },

            1000

        );


    console.log(
        "Call timer started"
    );

}


/* =====================================================
   STOP CALL TIMER
===================================================== */

function stopCallTimer() {

    if (callTimerInterval) {

        clearInterval(
            callTimerInterval
        );

    }


    callTimerInterval =
        null;


    callSeconds =
        0;


    callStartTime =
        null;


    console.log(
        "Call timer stopped"
    );

}


/* =====================================================
   SHOW LOCAL VIDEO
===================================================== */

function showCallVideoContainer() {
    const container = document.getElementById("callVideoContainer");
    if (container) container.style.display = "block";
}

function showLocalVideo(stream) {

    const localVideo =
        document.getElementById(
            "localVideo"
        );


    if (!localVideo) {

        return;
    }


    showCallVideoContainer();
    localVideo.srcObject = stream;
    localVideo.muted = true;
    localVideo.playsInline = true;
    localVideo.style.display = "block";


    localVideo.play()

        .catch(

            function(error) {

                console.warn(
                    "Local video error:",
                    error
                );

            }

        );

}


/* =====================================================
   SHOW REMOTE VIDEO
===================================================== */

function showRemoteVideo(stream) {

    const remoteVideo =
        document.getElementById(
            "remoteVideo"
        );


    if (!remoteVideo) {

        return;
    }


    showCallVideoContainer();
    remoteVideo.srcObject = stream;
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.style.display = "block";


    remoteVideo.play()

        .catch(

            function(error) {

                console.warn(
                    "Remote video error:",
                    error
                );

            }

        );

}


/* =====================================================
   HIDE VIDEO ELEMENTS
===================================================== */

function hideVideoElements() {

    const localVideo =
        document.getElementById(
            "localVideo"
        );


    const remoteVideo =
        document.getElementById(
            "remoteVideo"
        );


    if (localVideo) {

        localVideo.pause();

        localVideo.srcObject =
            null;

        localVideo.style.display =
            "none";

    }


    if (remoteVideo) {
        remoteVideo.pause();
        remoteVideo.srcObject = null;
        remoteVideo.style.display = "none";
    }

    const container = document.getElementById("callVideoContainer");
    if (container) container.style.display = "none";

}


/* =====================================================
   CLEANUP WEBRTC
===================================================== */

function cleanupWebRTC() {

    console.log(
        "Cleaning up WebRTC"
    );


    /*
     * Stop timer
     */

    stopCallTimer();


    /*
     * Reset mute
     */

    isMuted =
        false;


    /*
     * Stop local media
     */

    if (localStream) {

        localStream

            .getTracks()

            .forEach(

                function(track) {

                    track.stop();

                }

            );

    }


    localStream =
        null;


    /*
     * Close peer connection
     */

    if (peerConnection) {

        try {

            peerConnection.ontrack =
                null;

            peerConnection.onicecandidate =
                null;

            peerConnection.onconnectionstatechange =
                null;

            peerConnection.close();

        }

        catch (error) {

            console.warn(
                "Peer cleanup error:",
                error
            );

        }

    }


    peerConnection =
        null;


    /*
     * Clear ICE candidates
     */

    pendingIceCandidates =
        [];


    /*
     * Stop remote audio
     */

    const audio =
        document.getElementById(
            "remoteAudio"
        );


    if (audio) {

        audio.pause();

        audio.srcObject =
            null;

    }


    /*
     * Hide videos
     */

    hideVideoElements();


    /*
     * Reset mute button
     */

    const muteButton =
        document.getElementById(
            "muteCallButton"
        );


    if (muteButton) {

        muteButton.innerHTML =

            '<i class="fa-solid fa-microphone"></i> Mute';

    }


    /*
     * Hide timer
     */

    const timer =
        document.getElementById(
            "callTimer"
        );


    if (timer) {

        timer.style.display =
            "none";

        timer.textContent =
            "00:00";

    }


    console.log(
        "WebRTC cleanup complete"
    );


}


/* =====================================================
   OPTIONAL:
   CLEANUP WHEN PAGE CLOSES
===================================================== */

window.addEventListener(

    "beforeunload",

    function() {

        if (

            callState !== "IDLE"

        ) {

            cleanupWebRTC();

        }

    }

);

/* =====================================================
   CALL HISTORY

   ADDITIVE FEATURE

   Does not change existing:

   - Voice call
   - Video call
   - WebRTC
   - Timer
   - Mute
   - Accept
   - Reject
   - End call
   - UI

===================================================== */


/* =====================================================
   CALL HISTORY VARIABLES
===================================================== */

let callHistorySaved = false;


/* =====================================================
   RESET CALL HISTORY FLAG

   Call this when starting a NEW call.
===================================================== */

function resetCallHistoryFlag() {

    callHistorySaved = false;

}


/* =====================================================
   SAVE CALL HISTORY

   Sends history to:

   /app/call/history

===================================================== */
function saveCallHistory(
    receiver,
    callType,
    callStatus,
    callDuration
) {

    if (
        callHistorySaved
    ) {

        console.log(
            "Call history already saved"
        );

        return;

    }


    if (
        !receiver
        ||
        String(receiver).trim() === ""
    ) {

        console.warn(
            "Call history not saved: receiver missing"
        );

        return;

    }


    if (
        typeof stompClient === "undefined"
        ||
        !stompClient
        ||
        !stompClient.connected
    ) {

        console.warn(
            "Call history not saved: WebSocket disconnected"
        );

        return;

    }


    const historyData = {

        receiver: receiver,

        callType:
            callType || "VOICE",

        callStatus:
            callStatus || "COMPLETED",

        callDuration:
            Number(callDuration) || 0

    };


    try {

        stompClient.send(

            "/app/call/history",

            {},

            JSON.stringify(historyData)

        );


        callHistorySaved = true;


        console.log(
            "Call history saved:",
            historyData
        );

    }

    catch (error) {

        console.error(
            "Call history save error:",
            error
        );

    }

}
/* =====================================================
   GET CURRENT CALL DURATION

   Uses existing callSeconds.

   Does NOT modify timer.
===================================================== */

function getCurrentCallDuration() {

    if (

        typeof callSeconds !== "undefined"

        &&

        callSeconds

    ) {

        return Number(

            callSeconds

        );

    }


    return 0;

}


/* =====================================================
   SAVE COMPLETED CALL HISTORY

===================================================== */

function saveCompletedCallHistory() {

    if (

        !activeCallUser

    ) {

        return;

    }


    saveCallHistory(

        activeCallUser,

        activeCallType,

        "COMPLETED",

        getCurrentCallDuration()

    );

}


/* =====================================================
   SAVE CANCELLED CALL HISTORY

   Caller ended before receiver answered.
===================================================== */

function saveCancelledCallHistory() {

    if (

        !activeCallUser

    ) {

        return;

    }


    saveCallHistory(

        activeCallUser,

        activeCallType,

        "CANCELLED",

        0

    );

}


/* =====================================================
   SAVE REJECTED CALL HISTORY

===================================================== */

function saveRejectedCallHistory(

    receiver,

    callType

) {

    saveCallHistory(

        receiver,

        callType,

        "REJECTED",

        0

    );

}


/* =====================================================
   SAVE MISSED CALL HISTORY

===================================================== */

function saveMissedCallHistory(

    receiver,

    callType

) {

    saveCallHistory(

        receiver,

        callType,

        "MISSED",

        0

    );

}
function openCallLogs() {

    const modal =
        document.getElementById("callLogsModal");

    if (!modal) {

        console.error(
            "Call logs modal not found"
        );

        return;
    }

    modal.style.display = "flex";

    loadCallLogs();
}
function loadCallLogs() {

    const container =
        document.getElementById("callLogsContent");

    if (!container) {

        return;
    }

    container.innerHTML = `
        <div
            style="
                text-align:center;
                padding:30px;
                color:#888;
            "
        >
            Loading call history...
        </div>
    `;

    const token =
        localStorage.getItem("token");

    fetch("/call/history", {

        method: "GET",

        headers: {

            "Authorization":
                "Bearer " + token,

            "Content-Type":
                "application/json"

        }

    })

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "Failed to load call logs"
            );
        }

        return response.json();
    })

    .then(data => {

        renderCallLogs(data);
    })

    .catch(error => {

        console.error(
            "Call log error:",
            error
        );

        container.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:30px;
                    color:#f44336;
                "
            >

                Unable to load call history

            </div>

        `;
    });

}function renderCallLogs(callLogs) {

    const container =
        document.getElementById(
            "callLogsContent"
        );

    if (!container) {

        return;

    }


    /*
     * =====================================================
     * NO CALL HISTORY
     * =====================================================
     */

    if (

        !callLogs ||

        callLogs.length === 0

    ) {

        container.innerHTML = `

            <div

                style="
                    text-align:center;
                    padding:30px;
                    color:#888;
                "

            >

                <i

                    class="
                        fa-solid
                        fa-phone-slash
                    "

                    style="
                        font-size:35px;
                        margin-bottom:10px;
                    "

                ></i>

                <div>

                    No call history found

                </div>

            </div>

        `;

        return;

    }


    /*
     * =====================================================
     * CLEAR OLD CONTENT
     * =====================================================
     */

    container.innerHTML = "";


    /*
     * =====================================================
     * GET LOGGED-IN USERNAME
     *
     * IMPORTANT:
     *
     * Replace this variable if your project stores
     * the logged-in username using a different variable.
     * =====================================================
     */

    const loggedInUsername =
        window.currentUsername ||
        localStorage.getItem("username");


    /*
     * =====================================================
     * RENDER CALL LOGS
     * =====================================================
     */

    callLogs.forEach(call => {


        /*
         * =================================================
         * CREATE ITEM
         * =================================================
         */

        const item =
            document.createElement("div");


        item.className =
            "call-log-item";


        /*
         * =================================================
         * CALL TYPE
         * =================================================
         */

        const isVideo =

            call.callType === "VIDEO";


        const icon =

            isVideo

                ? "fa-video"

                : "fa-phone";


        /*
         * =================================================
         * FIND OTHER USER
         *
         * If logged-in user is sender,
         * receiver is the other user.
         *
         * Otherwise sender is the other user.
         * =================================================
         */

        let otherUser =
            "Unknown User";


        if (

            loggedInUsername

        ) {

            if (

                call.senderUsername ===
                loggedInUsername

            ) {

                otherUser =
                    call.receiverUsername;

            }

            else {

                otherUser =
                    call.senderUsername;

            }

        }

        else {

            /*
             * Fallback
             */

            otherUser =
                call.receiverUsername ||
                call.senderUsername ||
                "Unknown User";

        }


        /*
         * =================================================
         * CALL DIRECTION
         * =================================================
         */

        const isOutgoing =

            call.senderUsername ===
            loggedInUsername;


        /*
         * =================================================
         * CALL STATUS
         *
         * Backend returns callStatus.
         * =================================================
         */

        const callStatus =

            call.callStatus ||

            "Completed";


        /*
         * =================================================
         * CALL DIRECTION TEXT
         * =================================================
         */

        const directionText =

            isOutgoing

                ? "Outgoing"

                : "Incoming";


        /*
         * =================================================
         * FINAL DISPLAY TEXT
         * =================================================
         */

        const callInfo =

            `${directionText} • ${callStatus}`;


        /*
         * =================================================
         * BUILD HTML
         * =================================================
         */

        item.innerHTML = `

            <div class="call-log-left">

                <div class="call-log-icon">

                    <i

                        class="
                            fa-solid
                            ${icon}
                        "

                    ></i>

                </div>


                <div>


                    <div class="call-log-name">

                        ${otherUser}

                    </div>


                    <div class="call-log-info">

                        ${callInfo}

                    </div>


                </div>


            </div>


            <div class="call-log-right">


                ${

                    formatCallTime(

                        call.timestamp

                    )

                }


            </div>

        `;


        /*
         * =================================================
         * ADD TO CONTAINER
         * =================================================
         */

        container.appendChild(
            item
        );


    });

}function formatCallTime(dateValue) {

    if (!dateValue) {

        return "";
    }

    const date =
        new Date(dateValue);

    return date.toLocaleString();
}