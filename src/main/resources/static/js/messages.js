/* =====================================================
   messages.js
   -----------------------------------------------------
   Chat messages
   Chat history
   Reply
   Edit
   Delete
   Typing
   Message status
===================================================== */


/* =====================================================
   MESSAGE STORE
   -----------------------------------------------------
   app.js already owns:
   stompClient
   loggedInUser
   currentChatUser
   typingTimer
   replyingToMessage
   lastDisplayedMessageDate

   DO NOT redeclare those variables here.
===================================================== */

let messageStore = {};

let editingMessageId = null;
let userIsNearBottom = true;
let newMessageCount = 0;

let selectedImageFile = null;

let selectedGeneralFile = null;

let mediaRecorder = null;
let recordedAudioChunks = [];
let forwardingMessage = null;

/* =====================================================
   JWT SESSION VALIDATION
===================================================== */

function isJwtExpired() {

    const token =
        localStorage.getItem("token");

    if (!token) {

        return true;
    }

    try {

        const payload =
            JSON.parse(
                atob(
                    token.split(".")[1]
                )
            );


        /*
         * JWT exp is in seconds.
         * Date.now() is in milliseconds.
         */

        if (
            !payload.exp
        ) {

            return true;
        }


        return (
            payload.exp * 1000
        ) <= Date.now();

    }
    catch (error) {

        

        return true;
    }
}


/* =====================================================
   HANDLE EXPIRED SESSION
===================================================== */

function handleExpiredSession() {

    


    /*
     * Stop reconnect timer
     */

    if (
        typeof reconnectTimer !==
        "undefined" &&
        reconnectTimer
    ) {

        clearTimeout(
            reconnectTimer
        );

        reconnectTimer = null;
    }


    /*
     * Disconnect WebSocket
     */

    if (
        typeof stompClient !==
            "undefined" &&
        stompClient &&
        stompClient.connected
    ) {

        try {

            stompClient.disconnect();

        }
        catch (error) {

            

        }

    }


    /*
     * Clear application session
     */

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "currentChatUser"
    );

    sessionStorage.clear();


    /*
     * Go to login page
     */

    if (
        !window.location.pathname
            .endsWith(
                "/login.html"
            )
    ) {

        window.location.replace(
            "/login.html"
        );

    }

}


/* =====================================================
   PROTECT CHAT PAGE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
         * Don't protect login page.
         */

        if (
            window.location.pathname
                .endsWith(
                    "/login.html"
                )
        ) {

            return;
        }


        /*
         * No token OR expired token
         */

        if (
            isJwtExpired()
        ) {

            handleExpiredSession();

            return;
        }


        /*
         * Token is currently valid.
         */

        

    }
);
/* =====================================================
   SEND MESSAGE
===================================================== */

function sendMessage() {

/*
     * =========================================
     * IMAGE SELECTED
     * =========================================
     */

    if (selectedImageFile) {

        sendSelectedImage();

        return;
    }
    if (selectedGeneralFile) {
    sendSelectedGeneralFile();
    return;
}

	const receiver =
		currentChatUser;

    if (blockedUsers && blockedUsers[receiver]) {
        showChatToast("User is blocked. Unblock to send messages.");
        return;
    }

	if (!receiver) {

		alert(
			"Please select a user."
		);

		return;
	}


	if (
		!stompClient ||
		!stompClient.connected
	) {

		alert(
			"WebSocket is not connected."
		);

		return;
	}


	const input =
		document.getElementById(
			"message"
		);


	if (!input) {

		

		return;
	}


	const content =
		input.value.trim();


	if (!content) {

		return;
	}


	/*
	 * Reply information
	 */

	let replyToMessageId =
		null;

	let replyToContent =
		null;


	if (
		replyingToMessage
	) {

		replyToMessageId =
			replyingToMessage.messageId;


		replyToContent =
			replyingToMessage.content;

	}


	/*
	 * Send message
	 */

	stompClient.send(

		"/app/send",

		{},

		JSON.stringify({

			receiver:
				receiver,

			content:
				content,

			replyToMessageId:
				replyToMessageId,

			replyToContent:
				replyToContent

		})

	);


	/*
	 * Clear input
	 */

	input.value = "";


	/*
	 * Clear reply
	 */

	cancelReply();


	/*
	 * Focus input
	 */

	input.focus();

}


/* =====================================================
   ENTER KEY + TYPING INDICATOR
===================================================== */

document.addEventListener(
	"DOMContentLoaded",
	function() {

		const input =
			document.getElementById(
				"message"
			);


		if (!input) {

			return;
		}


		/*
		 * Enter = Send
		 */

		input.addEventListener(
			"keydown",
			function(event) {

				if (
					event.key ===
					"Enter"
				) {

					event.preventDefault();

					/*
					 * If editing, save edit.
					 * Otherwise send new message.
					 */

					if (
						editingMessageId !==
						null
					) {

						saveEditedMessage();

					}
					else {

						if (selectedImageFile) {

    sendSelectedImage();

}
else if (selectedGeneralFile) {

    sendSelectedGeneralFile();

}
else {

    sendMessage();

}

					}

				}

			}
		);


		/*
		 * Typing indicator
		 */

		input.addEventListener(
			"input",
			function() {

				if (
					typeof sendTyping !==
					"function"
				) {

					return;
				}


				if (
					!currentChatUser
				) {

					return;
				}


				sendTyping(true);


				clearTimeout(
					typingTimer
				);


				typingTimer =
					setTimeout(
						function() {

							sendTyping(false);

						},
						1000
					);

			}
		);

	}
);


/* =====================================================
   LOAD CONVERSATION / CHAT HISTORY
===================================================== */

function loadConversation(
	username
) {
	const token =
    localStorage.getItem(
        "token"
    );


if (
    !token ||
    isJwtExpired()
) {

    

    handleExpiredSession();

    return;
}


	const url =
		"/messages/conversation?receiver=" +
		encodeURIComponent(
			username
		);


	fetch(
		url,
		{

			method: "GET",

			headers: {

				"Authorization":
					"Bearer " + token,

				"Content-Type":
					"application/json"

			}

		}
	)

		.then(
			async function(response) {

				


				const text =
					await response.text();


				if (!response.ok) {

    


    if (
        response.status === 401 ||
        response.status === 403
    ) {

        handleExpiredSession();

        return [];
    }


    throw new Error(
        "Failed to load conversation. HTTP " +
        response.status
    );
}


				if (
					!text.trim()
				) {

					return [];

				}


				try {

					return JSON.parse(
						text
					);

				}
				catch (error) {

					

					throw error;

				}

			}
		)

		.then(
			function(messages) {

				


				const chat =
					document.getElementById(
						"chat"
					);


				if (!chat) {

					

					return;
				}


				/*
				 * Clear previous conversation
				 */

				chat.innerHTML = "";


				/*
				 * Reset date separator
				 */

				lastDisplayedMessageDate =
					null;


				/*
				 * Clear message store
				 */

				messageStore = {};


				/*
				 * No messages
				 */

				if (
					!Array.isArray(
						messages
					) ||
					messages.length === 0
				) {

					chat.innerHTML = `

                    <div
                        style="
                            height:100%;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            color:#999;
                            font-size:14px;
                            text-align:center;
                        "
                    >

                        <div>

                            <div
                                style="
                                    font-size:40px;
                                    margin-bottom:10px;
                                "
                            >
                                💬
                            </div>

                            No messages yet

                        </div>

                    </div>

                `;

					markAsRead();

					return;
				}


				/*
				 * Render history
				 */

				messages.forEach(
    function(message) {

        try {

            console.log(
                "Rendering message:",
                message
            );


            if (!message) {
                return;
            }


            /*
             * Make sure every message has
             * a usable message type.
             */
            if (!message.messageType) {

                message.messageType = "TEXT";

            }


            /*
             * Store message
             */
            if (message.id !== undefined &&
                message.id !== null) {

                messageStore[
                    message.id
                ] = message;

            }


            /*
             * Render message
             */
            appendMessage(
                message
            );

        }
        catch (error) {

            /*
             * IMPORTANT:
             * One broken attachment/message
             * must NOT stop the remaining
             * conversation from rendering.
             */

            console.error(
                "ERROR RENDERING MESSAGE:",
                message,
                error
            );


            /*
             * Render a safe fallback message
             */
            const chat =
                document.getElementById(
                    "chat"
                );


            if (chat) {

                const fallback =
                    document.createElement(
                        "div"
                    );


                fallback.style.cssText =
                    `
                    display:flex;
                    justify-content:${
                        message.sender === loggedInUser
                            ? "flex-end"
                            : "flex-start"
                    };
                    width:100%;
                    margin-bottom:10px;
                    padding:0 5px;
                    `;


                const bubble =
                    document.createElement(
                        "div"
                    );


                bubble.style.cssText =
                    `
                    background:${
                        message.sender === loggedInUser
                            ? "#dcf8c6"
                            : "#ffffff"
                    };
                    border:1px solid #ddd;
                    border-radius:12px;
                    padding:10px 12px;
                    max-width:85%;
                    word-break:break-word;
                    `;


                bubble.textContent =
                    message.content ||
                    "Unable to display this message";


                fallback.appendChild(
                    bubble
                );


                chat.appendChild(
                    fallback
                );
            }

        }

    }
);


				/*
				 * Scroll bottom
				 */

				chat.scrollTop =
					chat.scrollHeight;


				/*
				 * Mark incoming
				 * messages READ
				 */

				markAsRead();


				

			}
		)
.catch(
    function(error) {

        console.error(
            "Failed to load conversation:",
            error
        );


        const chat =
            document.getElementById("chat");


        if (!chat) {
            return;
        }


        chat.innerHTML = `
            <div
                style="
                    height:100%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    color:#999;
                    font-size:14px;
                    text-align:center;
                "
            >
                <div>
                    <div
                        style="
                            font-size:35px;
                            margin-bottom:10px;
                        "
                    >
                        ⚠️
                    </div>

                    Unable to load chat messages
                </div>
            </div>
        `;

    }
);
}


/* =====================================================
   APPEND MESSAGE
===================================================== */

function appendMessage(
	message
) {

	const wasNearBottom =
		isChatNearBottom();

	const chat =
		document.getElementById(
			"chat"
		);


	if (!chat) {

		

		return;
	}


	/*
	 * Store message
	 */

	messageStore[
		message.id
	] = message;


	/*
	 * Prevent duplicate
	 */

	if (
		document.getElementById(
			"message-" +
			message.id
		)
	) {

		return;
	}


	/* =================================================
	   DATE SEPARATOR
	================================================= */

	if (
		message.timestamp
	) {

		const messageDate =
			new Date(
				message.timestamp
			);


		if (
			!isNaN(
				messageDate.getTime()
			)
		) {

			const dateKey =
				messageDate.toDateString();


			if (
				lastDisplayedMessageDate !==
				dateKey
			) {

				const today =
					new Date();


				const yesterday =
					new Date();


				yesterday.setDate(
					today.getDate() - 1
				);


				let separatorText;


				if (
					messageDate.toDateString() ===
					today.toDateString()
				) {

					separatorText =
						"Today";

				}

				else if (
					messageDate.toDateString() ===
					yesterday.toDateString()
				) {

					separatorText =
						"Yesterday";

				}

				else {

					separatorText =
						messageDate.toLocaleDateString(
							[],
							{

								day:
									"2-digit",

								month:
									"long",

								year:
									"numeric"

							}
						);

				}


				chat.innerHTML += `

                    <div
                        style="
                            display:flex;
                            justify-content:center;
                            margin:15px 0;
                        "
                    >

                        <span
                            style="
                                background:#e5e5e5;
                                color:#666;
                                padding:5px 12px;
                                border-radius:12px;
                                font-size:11px;
                            "
                        >

                            ${separatorText}

                        </span>

                    </div>

                `;


				lastDisplayedMessageDate =
					dateKey;

			}

		}

	}


	/* =================================================
	   DELETED MESSAGE
	================================================= */

	if (
		message.status ===
		"DELETED"
	) {

		chat.innerHTML += `

            <div
                id="message-${message.id}"

                style="
                    display:flex;
                    justify-content:center;
                    width:100%;
                    margin:10px 0;
                "
            >

                <div
                    style="
                        color:#999;
                        font-style:italic;
                        font-size:13px;
                        padding:8px 12px;
                    "
                >

                    🗑 This message was deleted

                </div>

            </div>

        `;


		return;
	}


	/* =================================================
	   SENDER / RECEIVER
	================================================= */

	const isMyMessage =
		message.sender ===
		loggedInUser;


	/* =================================================
	   TIMESTAMP
	================================================= */

	let timeText =
		"";


	if (
		message.timestamp
	) {

		const date =
			new Date(
				message.timestamp
			);


		if (
			!isNaN(
				date.getTime()
			)
		) {

			timeText =
				date.toLocaleTimeString(
					[],
					{

						hour:
							"2-digit",

						minute:
							"2-digit"

					}
				);

		}

	}


	/* =================================================
	   STATUS
	   Sender only
	================================================= */

	let statusHTML =
		"";


	if (
		isMyMessage
	) {

		let statusIcon =
			"✓";


		let statusColor =
			"#777";


		if (
			message.status ===
			"DELIVERED"
		) {

			statusIcon =
				"✓✓";

		}


		if (
			message.status ===
			"READ"
		) {

			statusIcon =
				"✓✓";


			statusColor =
				"#2196F3";

		}


		statusHTML = `

            <span
                id="status-${message.id}"

                style="
                    margin-left:4px;
                    color:${statusColor};
                    font-weight:bold;
                "
            >

                ${statusIcon}

            </span>

        `;

	}


	/* =================================================
	   REPLY PREVIEW INSIDE MESSAGE
	================================================= */

	let replyHTML =
		"";


	if (
		message.replyToMessageId &&
		message.replyToContent
	) {

		replyHTML = `

            <div
                style="
                    padding:7px;
                    margin-bottom:7px;
                    border-left:3px solid #2196F3;
                    background:#f5f5f5;
                    border-radius:4px;
                    font-size:12px;
                    color:#555;
                "
            >

                <b>
                    ↩ Reply
                </b>

                <br>

                <span>
                    ${escapeHtml(
			message.replyToContent
		)}
                </span>

            </div>

        `;

	}


	/* =================================================
	   THREE DOT MENU
	   BOTH SENDER + RECEIVER
	================================================= */

	let menuHTML = `

        <div
            style="
                position:relative;
                display:inline-block;
                flex-shrink:0;
                margin-left:4px;
            "
        >

            <button
                type="button"

                onclick="
                    event.stopPropagation();
                    toggleMessageMenu(
                        ${message.id}
                    );
                "

                style="
                    border:none;
                    background:transparent;
                    cursor:pointer;
                    font-size:18px;
                    width:28px;
                    height:28px;
                    padding:0;
                    line-height:20px;
                    color:#555;
                "
            >

                ⋮

            </button>


            <div
    id="menu-${message.id}"

    style="
        display:none;
        position:fixed;
        width:180px;
        max-width:calc(100vw - 30px);

        background:#ffffff;

        border:1px solid #ddd;

        border-radius:8px;

        box-shadow:
            0 4px 15px
            rgba(0,0,0,.25);

        overflow:hidden;

        z-index:999999;
    "
>

<!-- REPLY: BOTH SENDER + RECEIVER -->

<button
    type="button"
    onclick="
        event.stopPropagation();

        replyToMessage(
            ${message.id}
        );
    "
    style="
        display:block;
        width:100%;
        padding:11px 12px;
        border:none;
        background:white;
        text-align:left;
        cursor:pointer;
        font-size:14px;
    "
>
    ↩ Reply
</button>

<!-- REACT: BOTH SENDER + RECEIVER -->

<button
    type="button"
    onclick="
        event.stopPropagation();

        showReactionPicker(
            ${message.id}
        );

        closeAllMessageMenus();
    "
    style="
        display:block;
        width:100%;
        padding:11px 12px;
        border:none;
        background:white;
        text-align:left;
        cursor:pointer;
        font-size:14px;
    "
>
    😊 React
</button>

<!-- FORWARD: BOTH SENDER + RECEIVER -->

<button
    type="button"
    onclick="
        event.stopPropagation();

        openForwardDialog(
            ${message.id}
        );

        closeAllMessageMenus();
    "
    style="
        display:block;
        width:100%;
        padding:11px 12px;
        border:none;
        background:white;
        text-align:left;
        cursor:pointer;
        font-size:14px;
    "
>
    ↗ Forward
</button>
${isMyMessage
    ?
    `
        <!-- EDIT: SENDER ONLY -->

        <button
            type="button"
            onclick="
                event.stopPropagation();

                editMessage(
                    ${message.id}
                );
            "
            style="
                display:block;
                width:100%;
                padding:11px 12px;
                border:none;
                background:white;
                text-align:left;
                cursor:pointer;
                font-size:14px;
            "
        >
            ✏️ Edit
        </button>


        <!-- DELETE FOR ME -->

        <button
            type="button"
            onclick="
                event.stopPropagation();

                deleteMessage(
                    ${message.id}
                );
            "
            style="
                display:block;
                width:100%;
                padding:11px 12px;
                border:none;
                background:white;
                text-align:left;
                cursor:pointer;
                font-size:14px;
            "
        >
            🗑 Delete For Me
        </button>


        <!-- DELETE FOR EVERYONE -->

        <button
            type="button"
            onclick="
                event.stopPropagation();

                deleteForEveryone(
                    ${message.id}
                );
            "
            style="
                display:block;
                width:100%;
                padding:11px 12px;
                border:none;
                background:white;
                text-align:left;
                cursor:pointer;
                font-size:14px;
            "
        >
            🗑 Delete For Everyone
        </button>
    `
    :
    `
        <!-- RECEIVER -->

        <button
            type="button"
            onclick="
                event.stopPropagation();

                deleteMessage(
                    ${message.id}
                );
            "
            style="
                display:block;
                width:100%;
                padding:11px 12px;
                border:none;
                background:white;
                text-align:left;
                cursor:pointer;
                font-size:14px;
            "
        >
            🗑 Delete For Me
        </button>
    `
}

            </div>

        </div>

    `;


	/* =================================================
	   MESSAGE BUBBLE
	================================================= */

	chat.innerHTML += `

        <div
            id="message-${message.id}"

            style="
                display:flex;

                justify-content:
                    ${isMyMessage
			? "flex-end"
			: "flex-start"
		};

                width:100%;

                box-sizing:border-box;

                margin-bottom:10px;

                padding:0 5px;
            "
        >

            <div
                style="
                    position:relative;

                    width:fit-content;

                    max-width:85%;

                    min-width:80px;

                    padding:10px 12px;

                    border-radius:12px;

                    background:
                        ${isMyMessage
			? "#dcf8c6"
			: "#ffffff"
		};

                    border:1px solid #ddd;

                    word-break:break-word;

                    overflow-wrap:anywhere;

                    box-sizing:border-box;
                "
            >

                ${replyHTML}

${message.forwarded
    ?
    `
        <div
            style="
                font-size:11px;
                color:#777;
                font-style:italic;
                margin-bottom:5px;
            "
        >
            Forwarded
        </div>
    `
    :
    ""
}



<div
    class="message-content"
    style="
        line-height:1.4;
        font-size:14px;
    "
>

  ${message.messageType &&
  message.messageType.toUpperCase() === "CALL"

?

`
    ${(() => {

        const callType =
            (
                message.callType ||
                "VOICE"
            ).toUpperCase();


        const callStatus =
            (
                message.callStatus ||
                "COMPLETED"
            ).toUpperCase();


        /*
         * Determine direction from sender.
         *
         * This is more reliable because
         * backend may send OUTGOING for
         * both users.
         */

        const isOutgoingCall =
            message.sender === loggedInUser;


        /*
         * Icon
         */

        let callIcon =
            callType === "VIDEO"

                ? "fa-video"

                : "fa-phone";


        /*
         * Main title
         */

        let callTitle =
            "";


        /*
         * COMPLETED
         */

        if (
            callStatus === "COMPLETED"
        ) {

            callTitle =
                isOutgoingCall

                    ? "Outgoing "

                    : "Incoming ";


            callTitle +=

                callType === "VIDEO"

                    ? "Video Call"

                    : "Voice Call";

        }


        /*
         * MISSED
         */

        else if (
            callStatus === "MISSED"
        ) {

            callTitle =
                "Missed " +

                (
                    callType === "VIDEO"

                        ? "Video Call"

                        : "Voice Call"
                );

        }


        /*
         * REJECTED
         */

        else if (
            callStatus === "REJECTED"
        ) {

            callTitle =
                "Call Rejected";

        }


        /*
         * CANCELLED
         */

        else if (
            callStatus === "CANCELLED"
        ) {

            callTitle =
                "Call Cancelled";

        }


        /*
         * Default
         */

        else {

            callTitle =
                callType === "VIDEO"

                    ? "Video Call"

                    : "Voice Call";

        }


        /*
         * CALL DURATION
         */

        const duration =
            Number(
                message.callDuration || 0
            );


        let durationText =
            "";


        if (
            duration > 0
        ) {

            const hours =
                Math.floor(
                    duration / 3600
                );


            const minutes =
                Math.floor(
                    (
                        duration % 3600
                    ) / 60
                );


            const seconds =
                duration % 60;


            if (
                hours > 0
            ) {

                durationText =
                    String(hours)
                        .padStart(2, "0")

                    +

                    ":"

                    +

                    String(minutes)
                        .padStart(2, "0")

                    +

                    ":"

                    +

                    String(seconds)
                        .padStart(2, "0");

            }

            else {

                durationText =
                    String(minutes)
                        .padStart(2, "0")

                    +

                    ":"

                    +

                    String(seconds)
                        .padStart(2, "0");

            }

        }


        /*
         * Return Call UI
         */

        return `

            <div
                class="call-message-card"
                style="
                    display:flex;
                    align-items:center;
                    gap:12px;
                    min-width:220px;
                    padding:4px 2px;
                "
            >

                <!-- CALL ICON -->

                <div
                    style="
                        width:38px;
                        height:38px;

                        display:flex;
                        align-items:center;
                        justify-content:center;

                        border-radius:50%;

                        background:

                        ${callStatus === "MISSED"

                            ? "#ffe5e5"

                            : "#f1f3f5"
                        };

                        font-size:16px;
                    "
                >

                    <i
                        class="fa-solid ${callIcon}"
                    ></i>

                </div>


                <!-- CALL DETAILS -->

                <div
                    style="
                        display:flex;
                        flex-direction:column;
                        gap:3px;
                        min-width:0;
                    "
                >

                    <!-- TITLE -->

                    <div
                        style="
                            font-size:14px;
                            font-weight:600;
                        "
                    >

                        ${callTitle}

                    </div>


                    <!-- STATUS -->

                    <div
                        style="
                            font-size:11px;
                            color:#777;
                        "
                    >

                        ${durationText

                            ? "Duration: " + durationText

                            : callStatus
                        }

                    </div>

                </div>

            </div>

        `;

    })()}
`

:

message.messageType &&
message.messageType.toUpperCase() === "IMAGE"

?

    `
        <img
            src="${escapeHtml(message.content)}"
            alt="Image"
            style="
                display:block;
                max-width:280px;
                max-height:300px;
                width:auto;
                height:auto;
                border-radius:10px;
                object-fit:cover;
                cursor:pointer;
            "
            onclick="
                window.open(
                    '${escapeHtml(message.content)}',
                    '_blank'
                );
            "
        />
    `

    :

    message.messageType &&
    message.messageType.toUpperCase() === "AUDIO"

    ?

    `
       <div
    class="audio-message-wrapper"
    data-audio-url="${escapeHtml(message.content)}"
    style="
        display:flex;
        flex-direction:column;
        gap:5px;
        max-width:280px;
    "
>

    <audio
        controls
        preload="metadata"
        style="
            display:block;
            max-width:260px;
        "
        onerror="
            this.style.display='none';
            this.parentElement
                .querySelector('.audio-unavailable')
                .style.display='block';
        "
    >

        <source
            src="${escapeHtml(message.content)}"
            type="audio/webm"
        />

    </audio>


    <span
        class="audio-unavailable"
        style="
            display:none;
            color:#888;
            font-size:12px;
            font-style:italic;
        "
    >
        🎵 Audio no longer available
    </span>

</div>
    `

    :

    message.messageType &&
    message.messageType.toUpperCase() === "FILE"

    ?

    `
        <div
            style="
                display:flex;
                flex-direction:column;
                gap:7px;
                padding:8px 10px;
                background:#f5f5f5;
                border:1px solid #ddd;
                border-radius:8px;
                color:#333;
                font-size:14px;
            "
        >
            📎 ${escapeHtml(message.fileName || "Download File")}

            <span style="display:flex; gap:12px;">
                <a
    href="javascript:void(0)"
    onclick="
        openAttachment(
            '${escapeHtml(message.content)}',
            '${escapeHtml(message.fileName || "file")}'
        )
    "
    style="
        color:#1976d2;
        text-decoration:none;
    "
>
    Preview
</a>
                <a
                    href="${escapeHtml(message.content)}"
                    download="${escapeHtml(message.fileName || "file")}" 
                    style="color:#1976d2; text-decoration:none;"
                >
                    Download
                </a>
            </span>
        </div>
    `

    :

    escapeHtml(
        message.content
    )
}


    ${message.edited
			?

			`
        <span
            class="edited-label"
            style="
                color:#777;
                font-size:10px;
                margin-left:5px;
                font-style:italic;
            "
        >
            (edited)
        </span>
        `

			:

			""
		}

</div>

                <!-- TIME / STATUS / MENU -->

                <div
                    style="
                        display:flex;
                        justify-content:flex-end;
                        align-items:center;

                        margin-top:5px;

                        font-size:11px;

                        color:#888;
                    "
                >

                    <span>

                        ${timeText}

                        ${statusHTML}

                        ${message.expiresAt ? `<span id="disappear-timer-${message.id}" class="disappearing-timer"></span>` : ""}

                    </span>

                    ${menuHTML}

                </div>

            </div>

        </div>

    `;


    if (message.expiresAt) {
        startDisappearingTimer(message);
    }

	/*
	 * Keep latest message visible
	 */

	if (wasNearBottom) {

		scrollChatToBottom();

	}
	else {

		newMessageCount++;

		showNewMessageButton();

	}

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(
	value
) {

	if (
		value === null ||
		value === undefined
	) {

		return "";

	}


	return String(value)

		.replace(
			/&/g,
			"&amp;"
		)

		.replace(
			/</g,
			"&lt;"
		)

		.replace(
			/>/g,
			"&gt;"
		)

		.replace(
			/"/g,
			"&quot;"
		)

		.replace(
			/'/g,
			"&#039;"
		);

}


/* =====================================================
   CLOSE ALL MESSAGE MENUS
===================================================== */

function closeAllMessageMenus() {

	document
		.querySelectorAll(
			'[id^="menu-"]'
		)
		.forEach(
			function(menu) {

				menu.style.display =
					"none";

			}
		);

}

/* =====================================================
   FORWARD MESSAGE
===================================================== */

function openForwardDialog(messageId) {

    const message =
        messageStore[messageId];

    if (!message) {
        alert("Message not found.");
        return;
    }

    forwardingMessage = message;

    const existing =
        document.getElementById(
            "forwardDialog"
        );

    if (existing) {
        existing.remove();
    }

    const dialog =
        document.createElement("div");

    dialog.id =
        "forwardDialog";

    dialog.style.position =
        "fixed";

    dialog.style.left =
        "0";

    dialog.style.top =
        "0";

    dialog.style.width =
        "100%";

    dialog.style.height =
        "100%";

    dialog.style.background =
        "rgba(0,0,0,.45)";

    dialog.style.display =
        "flex";

    dialog.style.alignItems =
        "center";

    dialog.style.justifyContent =
        "center";

    dialog.style.zIndex =
        "999999";

    dialog.innerHTML = `

        <div
            style="
                width:360px;
                max-width:90%;
                max-height:80vh;
                background:white;
                border-radius:12px;
                box-shadow:0 8px 30px rgba(0,0,0,.25);
                overflow:hidden;
                display:flex;
                flex-direction:column;
            "
        >

            <div
                style="
                    padding:15px;
                    border-bottom:1px solid #ddd;
                    font-size:17px;
                    font-weight:600;
                "
            >
                ↗ Forward Message
            </div>


            <div
                style="
                    padding:12px;
                    background:#f5f7fb;
                    border-bottom:1px solid #ddd;
                "
            >

                <div
                    style="
                        font-size:12px;
                        color:#777;
                        margin-bottom:5px;
                    "
                >
                    Message
                </div>

                <div
                    style="
                        background:white;
                        padding:10px;
                        border-radius:8px;
                        font-size:13px;
                        word-break:break-word;
                    "
                >
                    ${getForwardPreview(message)}
                </div>

            </div>


            <div
                id="forwardUsers"
                style="
                    flex:1;
                    overflow-y:auto;
                    padding:8px;
                "
            >
                Loading users...
            </div>


            <div
                style="
                    display:flex;
                    justify-content:flex-end;
                    gap:8px;
                    padding:12px;
                    border-top:1px solid #ddd;
                "
            >

                <button
                    type="button"
                    onclick="closeForwardDialog()"
                    style="
                        border:none;
                        background:#eee;
                        padding:9px 15px;
                        border-radius:7px;
                        cursor:pointer;
                    "
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onclick="forwardSelectedMessage()"
                    style="
                        border:none;
                        background:#2196f3;
                        color:white;
                        padding:9px 15px;
                        border-radius:7px;
                        cursor:pointer;
                    "
                >
                    Forward
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(dialog);

    loadForwardUsers();
}

/* =====================================================
   TOGGLE MESSAGE MENU
   -----------------------------------------------------
   Keeps the menu INSIDE the chat panel.
   It will never overlap the Users panel.
===================================================== */

function toggleMessageMenu(messageId) {

	const menu =
		document.getElementById(
			"menu-" + messageId
		);

	if (!menu) {
		return;
	}


	const button =
		event.currentTarget;

	if (!button) {
		return;
	}


	const isOpen =
		menu.style.display === "block";


	/*
	 * Close all other menus
	 */

	closeAllMessageMenus();


	/*
	 * If already open,
	 * simply close it.
	 */

	if (isOpen) {
		return;
	}


	/*
	 * Chat panel
	 */

	const chat =
		document.getElementById(
			"chat"
		);

	if (!chat) {
		return;
	}


	/*
	 * Get screen positions
	 */

	const buttonRect =
		button.getBoundingClientRect();

	const chatRect =
		chat.getBoundingClientRect();


	/*
	 * Show temporarily to calculate size
	 */

	menu.style.display =
		"block";

	menu.style.visibility =
		"hidden";


	const menuRect =
		menu.getBoundingClientRect();


	/*
	 * Chat boundaries
	 */

	const chatLeft =
		chatRect.left + 5;

	const chatRight =
		chatRect.right - 5;

	const chatTop =
		chatRect.top + 5;

	const chatBottom =
		chatRect.bottom - 5;


	/*
	 * ================================
	 * HORIZONTAL POSITION
	 * ================================
	 */

	let left =
		buttonRect.right -
		menuRect.width;


	/*
	 * Never go into Users panel
	 */

	if (
		left <
		chatLeft
	) {

		left =
			chatLeft;

	}


	/*
	 * Never go outside chat panel
	 */

	if (
		left +
		menuRect.width >
		chatRight
	) {

		left =
			chatRight -
			menuRect.width;

	}


	/*
	 * ================================
	 * VERTICAL POSITION
	 * ================================
	 */

	let top =
		buttonRect.bottom + 5;


	/*
	 * If menu doesn't fit below,
	 * open above the button.
	 */

	if (
		top +
		menuRect.height >
		chatBottom
	) {

		top =
			buttonRect.top -
			menuRect.height -
			5;

	}


	/*
	 * If still above chat,
	 * keep it inside chat.
	 */

	if (
		top <
		chatTop
	) {

		top =
			chatTop;

	}


	/*
	 * ================================
	 * APPLY POSITION
	 * ================================
	 */

	menu.style.left =
		left + "px";

	menu.style.top =
		top + "px";

	menu.style.right =
		"auto";

	menu.style.bottom =
		"auto";

	menu.style.visibility =
		"visible";

}
/* =====================================================
   REPLY TO MESSAGE
   BOTH SENDER + RECEIVER
===================================================== */

function replyToMessage(
	messageId
) {

	const message =
		messageStore[
		messageId
		];


	if (!message) {

		

		return;

	}


	/*
	 * Close menu
	 */

	closeAllMessageMenus();


	/*
	 * Store reply
	 */

	replyingToMessage = {

		messageId:
			message.id,

		sender:
			message.sender,

		content:
			message.content

	};


	/*
	 * Find preview
	 */

	let preview =
		document.getElementById(
			"replyPreview"
		);


	/*
	 * If index.html already has it,
	 * use it.
	 */

	if (!preview) {

		const input =
			document.getElementById(
				"message"
			);


		if (
			input &&
			input.parentElement
		) {

			preview =
				document.createElement(
					"div"
				);


			preview.id =
				"replyPreview";


			input.parentElement.insertBefore(
				preview,
				input
			);

		}

	}


	if (!preview) {

		return;

	}


	/*
	 * Show preview
	 */

	preview.style.display =
		"block";


	preview.innerHTML = `

        <div
            style="
                position:relative;

                padding:8px 35px 8px 10px;

                border-left:4px solid #2196F3;

                background:#f1f1f1;

                border-radius:5px;

                box-sizing:border-box;
            "
        >

            <button
                type="button"

                onclick="
                    cancelReply();
                "

                style="
                    position:absolute;
                    right:6px;
                    top:5px;

                    border:none;

                    background:transparent;

                    cursor:pointer;

                    font-size:16px;

                    color:#666;
                "
            >

                ✕

            </button>


            <div
                style="
                    font-size:11px;
                    color:#2196F3;
                    font-weight:bold;
                    margin-bottom:3px;
                "
            >

                Replying to
                ${escapeHtml(
		message.sender
	)}

            </div>


            <div
                style="
                    color:#555;
                    font-size:13px;

                    white-space:nowrap;

                    overflow:hidden;

                    text-overflow:ellipsis;
                "
            >

                ${escapeHtml(
		message.content
	)}

            </div>

        </div>

    `;


	const input =
		document.getElementById(
			"message"
		);


	if (input) {

		input.focus();

	}

}


/* =====================================================
   CANCEL REPLY
===================================================== */

function cancelReply() {

	replyingToMessage =
		null;


	const preview =
		document.getElementById(
			"replyPreview"
		);


	if (preview) {

		preview.innerHTML =
			"";

		preview.style.display =
			"none";

	}

}


/* =====================================================
   MARK MESSAGES AS READ
===================================================== */

function markAsRead() {

	if (
		!currentChatUser
	) {

		return;

	}


	/*
	 * Immediately remove
	 * local unread badge.
	 */

	if (
		typeof updateUnreadBadge ===
		"function"
	) {

		updateUnreadBadge(
			currentChatUser,
			0
		);

	}


	/*
	 * WebSocket
	 */

	if (
		!stompClient ||
		!stompClient.connected
	) {

		

		return;

	}


	stompClient.send(

		"/app/read",

		{},

		JSON.stringify({

			sender:
				currentChatUser

		})

	);


	

}


/* =====================================================
   DELETE FOR ME
===================================================== */

function deleteMessage(
	messageId
) {

	closeAllMessageMenus();


	const token =
		localStorage.getItem(
			"token"
		);


	if (!token) {

		return;

	}


	fetch(
		"/messages/delete/" +
		messageId,
		{

			method:
				"DELETE",

			headers: {

				"Authorization":
					"Bearer " + token

			}

		}
	)

		.then(
			function(response) {

				if (!response.ok) {

					throw new Error(
						"Delete For Me failed. HTTP " +
						response.status
					);

				}


				const messageDiv =
					document.getElementById(
						"message-" +
						messageId
					);


				if (
					messageDiv
				) {

					messageDiv.remove();

				}


				/*
				 * Remove from local store
				 */

				delete messageStore[
					messageId
				];

			}
		)

		.catch(
			function(error) {

				

			}
		);

}


/* =====================================================
   DELETE FOR EVERYONE
===================================================== */

function deleteForEveryone(
	messageId
) {

	closeAllMessageMenus();


	if (
		!stompClient ||
		!stompClient.connected
	) {

		

		return;

	}


	const message =
		messageStore[
		messageId
		];


	if (!message) {

		

		return;

	}


	/*
	 * Only sender can do this.
	 */

	if (
		message.sender !==
		loggedInUser
	) {

		

		return;

	}


	stompClient.send(

		"/app/deleteForEveryone",

		{},

		JSON.stringify({

			messageId:
				messageId

		})

	);

}


/* =====================================================
   EDIT MESSAGE
===================================================== */

function editMessage(
	messageId
) {

	const message =
		messageStore[
		messageId
		];


	if (!message) {

		

		return;

	}


	/*
	 * Sender only
	 */

	if (
		message.sender !==
		loggedInUser
	) {

		

		return;

	}


	/*
	 * Deleted message
	 */

	if (
		message.status ===
		"DELETED"
	) {

		

		return;

	}


	closeAllMessageMenus();


	/*
	 * Store edit ID
	 */

	editingMessageId =
		messageId;


	const input =
		document.getElementById(
			"message"
		);


	if (!input) {

		editingMessageId =
			null;

		

		return;

	}


	/*
	 * Put old content
	 * into input.
	 */

	input.value =
		message.content;


	input.focus();


	/*
	 * Move cursor to end.
	 */

	input.setSelectionRange(
		input.value.length,
		input.value.length
	);


	/*
	 * Change Send -> Save
	 */

	setEditMode(
		true
	);


	

}


/* =====================================================
   EDIT MODE
===================================================== */

function setEditMode(
	isEditing
) {

	const sendButton =
		document.querySelector(
			".send-button"
		);


	if (!sendButton) {

		

		return;

	}


	if (
		isEditing
	) {

		/*
		 * Save icon
		 */

		sendButton.innerHTML =
			'<i class="fa-solid fa-check"></i>';


		sendButton.title =
			"Save Edit";


		/*
		 * Replace onclick
		 */

		sendButton.onclick =
			saveEditedMessage;


		/*
		 * Cancel button
		 */

		if (
			!document.getElementById(
				"cancelEditButton"
			)
		) {

			const cancelButton =
				document.createElement(
					"button"
				);


			cancelButton.id =
				"cancelEditButton";


			cancelButton.type =
				"button";


			cancelButton.innerHTML =
				'<i class="fa-solid fa-xmark"></i>';


			cancelButton.title =
				"Cancel Edit";


			cancelButton.style.cssText = `

                width:45px;

                height:45px;

                min-width:45px;

                border:none;

                border-radius:50%;

                background:#e0e0e0;

                color:#555;

                cursor:pointer;

                font-size:16px;

            `;


			cancelButton.onclick =
				cancelEdit;


			const row =
				sendButton.parentElement;


			if (row) {

				row.insertBefore(
					cancelButton,
					sendButton
				);

			}

		}

	}

	else {

		/*
		 * Normal send icon
		 */

		sendButton.innerHTML =
			'<i class="fa-solid fa-paper-plane"></i>';


		sendButton.title =
			"Send message";


		sendButton.onclick =
			sendMessage;


		/*
		 * Remove cancel button
		 */

		const cancelButton =
			document.getElementById(
				"cancelEditButton"
			);


		if (
			cancelButton
		) {

			cancelButton.remove();

		}

	}

}


/* =====================================================
   SAVE EDIT
===================================================== */

function saveEditedMessage() {

	if (
		editingMessageId ===
		null
	) {

		

		return;

	}


	const input =
		document.getElementById(
			"message"
		);


	if (!input) {

		return;

	}


	const newContent =
		input.value.trim();


	if (!newContent) {

		alert(
			"Message cannot be empty."
		);

		input.focus();

		return;

	}


	if (
		!stompClient ||
		!stompClient.connected
	) {

		alert(
			"WebSocket is not connected."
		);

		return;

	}


	const messageId =
		editingMessageId;


	const message =
		messageStore[
		messageId
		];


	if (!message) {

		

		return;

	}


	if (
		message.sender !==
		loggedInUser
	) {

		

		return;

	}


	/*
	 * Send edit request.
	 */

	stompClient.send(

		"/app/edit",

		{},

		JSON.stringify({

			messageId:
				messageId,

			content:
				newContent

		})

	);


	/*
	 * Update local store immediately.
	 *
	 * WebSocket event will update
	 * the final UI.
	 */

	message.content =
		newContent;


	/*
	 * Clear input.
	 */

	input.value =
		"";


	/*
	 * Exit edit mode.
	 */

	editingMessageId =
		null;


	setEditMode(
		false
	);


	input.focus();


	

}


/* =====================================================
   CANCEL EDIT
===================================================== */

function cancelEdit() {

	editingMessageId =
		null;


	const input =
		document.getElementById(
			"message"
		);


	if (input) {

		input.value =
			"";

	}


	setEditMode(
		false
	);


	if (input) {

		input.focus();

	}

}


/* =====================================================
   UPDATE EDITED MESSAGE
   -----------------------------------------------------
   Called by websocket.js
===================================================== */

function updateEditedMessage(
	event
) {

	


	if (
		!event ||
		event.messageId ===
		undefined ||
		event.messageId ===
		null
	) {

		

		return;

	}


	const messageId =
		event.messageId;


	/*
	 * Update local store.
	 */

	if (
		!messageStore[
		messageId
		]
	) {

		messageStore[
			messageId
		] = {};

	}


	messageStore[
		messageId
	].id =
		messageId;


	messageStore[
		messageId
	].content =
		event.content;


	messageStore[
		messageId
	].edited =
		event.edited !==
		false;


	/*
	 * Find message in UI.
	 */

	const messageDiv =
		document.getElementById(
			"message-" +
			messageId
		);


	if (!messageDiv) {

		

		return;

	}


	const contentElement =
		messageDiv.querySelector(
			".message-content"
		);


	if (!contentElement) {

		return;

	}


	/*
	 * Replace text safely.
	 */

	contentElement.innerHTML =
		escapeHtml(
			event.content
		);


	/*
	 * Add edited label.
	 */

	if (
		event.edited !== false
	) {

		const label =
			document.createElement(
				"span"
			);


		label.className =
			"edited-label";


		label.style.cssText = `

            color:#777;

            font-size:10px;

            margin-left:5px;

            font-style:italic;

        `;


		label.textContent =
			"(edited)";


		contentElement.appendChild(
			label
		);

	}


	

}


/* =====================================================
   UPDATE DELETED MESSAGE
   -----------------------------------------------------
   Called by websocket.js
===================================================== */

function updateDeletedMessage(
	messageId
) {

	


	const messageDiv =
		document.getElementById(
			"message-" +
			messageId
		);


	if (
		messageDiv
	) {

		messageDiv.innerHTML = `

            <div
                style="
                    color:#999;
                    font-style:italic;
                    font-size:13px;
                    padding:8px;
                "
            >

                🗑 This message was deleted

            </div>

        `;

	}


	/*
	 * Update local store.
	 */

	if (
		messageStore[
		messageId
		]
	) {

		messageStore[
			messageId
		].content =
			"This message was deleted";


		messageStore[
			messageId
		].status =
			"DELETED";

	}

}

/* =====================================================
   CHAT AUTO-SCROLL
===================================================== */

function isChatNearBottom() {

	const chat =
		document.getElementById("chat");

	if (!chat) {
		return true;
	}

	const distanceFromBottom =
		chat.scrollHeight -
		chat.scrollTop -
		chat.clientHeight;

	return distanceFromBottom <= 80;
}


/* =====================================================
   CHAT SCROLL LISTENER
===================================================== */

document.addEventListener(
	"DOMContentLoaded",
	function() {

		const chat =
			document.getElementById("chat");

		if (!chat) {
			return;
		}

		chat.addEventListener(
			"scroll",
			function() {

				userIsNearBottom =
					isChatNearBottom();

				/*
				 * If user reaches bottom,
				 * remove new-message indicator.
				 */

				if (userIsNearBottom) {

					newMessageCount = 0;

					hideNewMessageButton();

				}

			}
		);

	}
);


/* =====================================================
   SCROLL TO BOTTOM
===================================================== */

function scrollChatToBottom() {

	const chat =
		document.getElementById("chat");

	if (!chat) {
		return;
	}

	chat.scrollTo({

		top:
			chat.scrollHeight,

		behavior:
			"smooth"

	});

	userIsNearBottom = true;

	newMessageCount = 0;

	hideNewMessageButton();

}


/* =====================================================
   NEW MESSAGE BUTTON
===================================================== */

function showNewMessageButton() {

    let button = document.getElementById("newMessageButton");

    if (!button) {
        button = document.createElement("button");
        button.id = "newMessageButton";
        button.type = "button";
        button.setAttribute("aria-label", "Scroll to latest message");
        button.title = "Scroll to latest message";

        /* Arrow only - no new message count/text. */
        button.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';

        button.style.cssText = `
            position:absolute;
            bottom:12px;
            left:50%;
            transform:translateX(-50%);
            z-index:100;
            width:42px;
            height:42px;
            border:none;
            border-radius:50%;
            background:#2196F3;
            color:white;
            font-size:16px;
            cursor:pointer;
            box-shadow:0 2px 8px rgba(0,0,0,.25);
            display:flex;
            align-items:center;
            justify-content:center;
        `;

        button.onclick = scrollChatToBottom;

        const chat = document.getElementById("chat");
        if (chat && chat.parentElement) {
            const parent = chat.parentElement;
            if (getComputedStyle(parent).position === "static") {
                parent.style.position = "relative";
            }
            parent.appendChild(button);
        }
    }

    /* Always keep this as an arrow only. */
    button.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
    button.style.display = "flex";
}


/* =====================================================
   HIDE NEW MESSAGE BUTTON
===================================================== */

function hideNewMessageButton() {

	const button =
		document.getElementById(
			"newMessageButton"
		);

	if (button) {

		button.style.display =
			"none";

	}

}

/* =====================================================
   MESSAGE SEARCH
   -----------------------------------------------------
   Searches the currently loaded conversation.
===================================================== */

let messageSearchMatches = [];

let messageSearchIndex = -1;


/* =====================================================
   OPEN SEARCH
===================================================== */

function openMessageSearch() {

	const searchBar =
		document.getElementById(
			"messageSearchBar"
		);

	const input =
		document.getElementById(
			"messageSearchInput"
		);

	if (!searchBar || !input) {

		

		return;

	}

	searchBar.style.display =
		"block";

	input.value =
		"";

	input.focus();


	input.oninput =
		function() {

			searchMessages(
				input.value
			);

		};

}


/* =====================================================
   CLOSE SEARCH
===================================================== */

function closeMessageSearch() {

	const searchBar =
		document.getElementById(
			"messageSearchBar"
		);

	const input =
		document.getElementById(
			"messageSearchInput"
		);


	if (input) {

		input.value =
			"";

	}


	if (searchBar) {

		searchBar.style.display =
			"none";

	}


	clearSearchHighlights();


	messageSearchMatches =
		[];

	messageSearchIndex =
		-1;

}


/* =====================================================
   SEARCH LOADED CONVERSATION
===================================================== */

function searchMessages(
	searchText
) {

	clearSearchHighlights();


	messageSearchMatches =
		[];

	messageSearchIndex =
		-1;


	const search =
		searchText
			.trim()
			.toLowerCase();


	if (!search) {

		return;

	}


	/*
	 * Search directly inside
	 * messageStore.
	 *
	 * DO NOT check receiver here.
	 *
	 * Chat history was already loaded
	 * for the selected conversation.
	 */

	Object.values(
		messageStore
	).forEach(
		function(message) {

			if (!message) {

				return;

			}


			const content =
				String(
					message.content ||
					""
				);


			if (
				content
					.toLowerCase()
					.includes(search)
			) {

				messageSearchMatches.push(
					message.id
				);

			}

		}
	);


	

	

	

	

	


	/*
	 * Nothing found
	 */

	if (
		messageSearchMatches.length ===
		0
	) {

		showSearchResultMessage(
			"No messages found"
		);

		return;

	}


	/*
	 * Show result count
	 */

	showSearchResultMessage(

		messageSearchMatches.length +
		(
			messageSearchMatches.length ===
				1
				? " message found"
				: " messages found"
		)

	);


	/*
	 * First result
	 */

	messageSearchIndex =
		0;


	scrollToSearchResult();

}


/* =====================================================
   SHOW SEARCH RESULT COUNT
===================================================== */

function showSearchResultMessage(
	text
) {

	let result =
		document.getElementById(
			"messageSearchResult"
		);


	if (!result) {

		const searchBar =
			document.getElementById(
				"messageSearchBar"
			);


		if (!searchBar) {

			return;

		}


		result =
			document.createElement(
				"div"
			);


		result.id =
			"messageSearchResult";


		result.style.cssText = `

            margin-top:5px;

            color:#777;

            font-size:12px;

        `;


		searchBar.appendChild(
			result
		);

	}


	result.textContent =
		text;

}


/* =====================================================
   SCROLL TO SEARCH RESULT
===================================================== */

function scrollToSearchResult() {

	if (
		messageSearchMatches.length ===
		0
	) {

		return;

	}


	if (
		messageSearchIndex < 0 ||
		messageSearchIndex >=
		messageSearchMatches.length
	) {

		return;

	}


	clearSearchHighlights();


	const messageId =
		messageSearchMatches[
		messageSearchIndex
		];


	const messageElement =
		document.getElementById(
			"message-" +
			messageId
		);


	if (!messageElement) {

		

		return;

	}


	/*
	 * Scroll to message
	 */

	messageElement.scrollIntoView({

		behavior:
			"smooth",

		block:
			"center"

	});


	/*
	 * Highlight entire message
	 */

	messageElement.style.outline =
		"2px solid #2196F3";


	messageElement.style.borderRadius =
		"10px";


	/*
	 * Highlight matching text
	 */

	highlightSearchText(
		messageElement,
		document
			.getElementById(
				"messageSearchInput"
			)
			?.value || ""
	);

}


/* =====================================================
   HIGHLIGHT SEARCH TEXT
===================================================== */

function highlightSearchText(
	messageElement,
	searchText
) {

	const content =
		messageElement.querySelector(
			".message-content"
		);


	if (!content) {

		return;

	}


	const search =
		searchText.trim();


	if (!search) {

		return;

	}


	/*
	 * Save original text once
	 */

	if (
		!content.dataset.originalText
	) {

		content.dataset.originalText =
			content.textContent;

	}


	const originalText =
		content.dataset.originalText;


	const escapedSearch =
		search.replace(
			/[.*+?^${}()|[\]\\]/g,
			"\\$&"
		);


	const regex =
		new RegExp(
			"(" +
			escapedSearch +
			")",
			"gi"
		);


	/*
	 * Don't use innerHTML directly
	 * with the user's search text.
	 */

	const highlighted =
		escapeHtml(
			originalText
		).replace(

			regex,

			`<mark
                style="
                    background:#ffeb3b;
                    color:#222;
                    padding:1px 2px;
                    border-radius:2px;
                "
            >$1</mark>`

		);


	content.innerHTML =
		highlighted;

}


/* =====================================================
   CLEAR SEARCH HIGHLIGHTS
===================================================== */

function clearSearchHighlights() {

	document
		.querySelectorAll(
			'[id^="message-"]'
		)
		.forEach(
			function(messageElement) {

				messageElement.style.outline =
					"";

				messageElement.style.borderRadius =
					"";


				const content =
					messageElement.querySelector(
						".message-content"
					);


				if (
					content &&
					content.dataset.originalText
				) {

					content.textContent =
						content.dataset.originalText;


					delete content.dataset
						.originalText;

				}

			}
		);

}


/* =====================================================
   NEXT RESULT
===================================================== */

function nextSearchResult() {

	if (
		messageSearchMatches.length ===
		0
	) {

		return;

	}


	messageSearchIndex++;


	if (
		messageSearchIndex >=
		messageSearchMatches.length
	) {

		messageSearchIndex =
			0;

	}


	scrollToSearchResult();

}


/* =====================================================
   PREVIOUS RESULT
===================================================== */

function previousSearchResult() {

	if (
		messageSearchMatches.length ===
		0
	) {

		return;

	}


	messageSearchIndex--;


	if (
		messageSearchIndex < 0
	) {

		messageSearchIndex =
			messageSearchMatches.length - 1;

	}


	scrollToSearchResult();

}

/* =====================================================
   IMAGE SELECTION
   -----------------------------------------------------
   Select image first.
   Image will be sent when user presses Enter.
===================================================== */

function uploadImage() {

    const input =
        document.getElementById("imageInput");

    if (!input) {
        return;
    }

    const file =
        input.files[0];

    if (!file) {
        return;
    }

    if (!currentChatUser) {

        alert("Please select a user first.");

        input.value = "";

        return;
    }

    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {

        alert("Please select an image.");

        input.value = "";

        return;
    }

    if (file.size > 5 * 1024 * 1024) {

        alert(
            "Image must be less than 5 MB."
        );

        input.value = "";

        return;
    }


    /*
     * Store selected image
     */
    selectedImageFile = file;


    /*
     * Upload and send immediately
     */
    sendSelectedImage();

}
/* =====================================================
   SEND SELECTED IMAGE
===================================================== */

function sendSelectedImage() {

    if (!selectedImageFile) {
        return;
    }

    const token =
        localStorage.getItem("token");

    if (!token) {

        alert(
            "Session expired. Please login again."
        );

        return;
    }

    if (
        !stompClient ||
        !stompClient.connected
    ) {

        alert(
            "WebSocket is not connected."
        );

        return;
    }

    if (!currentChatUser) {

        alert(
            "Please select a user first."
        );

        return;
    }

    const file =
        selectedImageFile;

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    

    fetch(
        "/files/upload-image",
        {
            method: "POST",

            headers: {
                "Authorization":
                    "Bearer " + token
            },

            body: formData
        }
    )
    .then(
        async response => {

            const text =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    text ||
                    "Image upload failed"
                );

            }

            try {

                return JSON.parse(
                    text
                );

            }
            catch (error) {

                throw new Error(
                    "Invalid server response"
                );

            }

        }
    )
    .then(
        data => {

            

            if (!data.fileUrl) {

                throw new Error(
                    "Image URL not received"
                );

            }

            /*
             * Send image through
             * WebSocket.
             */

            sendImageMessage(
                data.fileUrl
            );

            /*
             * Clear selected image.
             */

            selectedImageFile =
                null;

            const input =
                document.getElementById(
                    "imageInput"
                );

            if (input) {
                input.value = "";
            }

            /*
             * Restore normal input.
             */

            const messageInput =
                document.getElementById(
                    "message"
                );

            if (messageInput) {

                messageInput.placeholder =
                    "Type a message...";

                messageInput.value =
                    "";

                messageInput.focus();

            }

        }
    )
    .catch(
        error => {

            

            alert(
                "Image upload failed: " +
                error.message
            );

        }
    );

}

/* =====================================================
   SEND IMAGE MESSAGE
===================================================== */

function sendImageMessage(
	imageUrl
) {

	if (
		!stompClient ||
		!stompClient.connected
	) {

		alert(
			"WebSocket is not connected."
		);

		return;
	}


	if (!currentChatUser) {

		alert(
			"Please select a user."
		);

		return;
	}


	/*
	 * =========================================
	 * BUILD IMAGE MESSAGE
	 * =========================================
	 */

	const imageMessage = {

		receiver:
			currentChatUser,

		content:
			imageUrl,

		messageType:
			"IMAGE",

		replyToMessageId:
			replyingToMessage
				? replyingToMessage.messageId
				: null,

		replyToContent:
			replyingToMessage
				? replyingToMessage.content
				: null

	};


	


	/*
	 * =========================================
	 * SEND THROUGH EXISTING WEBSOCKET
	 * =========================================
	 */

	stompClient.send(

		"/app/send",

		{},

		JSON.stringify(
			imageMessage
		)

	);


	/*
	 * =========================================
	 * CLEAR REPLY
	 * =========================================
	 */

	if (
		typeof cancelReply ===
		"function"
	) {

		cancelReply();

	}

}

/* =====================================================
   GENERAL FILE SELECTION
===================================================== */

function uploadGeneralFile(sourceInputId) {

    const input =
        document.getElementById(
            sourceInputId || "fileInput"
        );

    if (!input) {
        return;
    }


    const file =
        input.files[0];

    if (!file) {
        return;
    }


    if (!currentChatUser) {

        alert(
            "Please select a user first."
        );

        input.value = "";

        return;
    }


    if (file.size > 10 * 1024 * 1024) {

        alert(
            "File must be less than 10 MB."
        );

        input.value = "";

        return;
    }


    /*
     * Store selected file
     */
    selectedGeneralFile = file;


    /*
     * Upload and send immediately
     */
    sendSelectedGeneralFile();

}

/* =====================================================
   ATTACHMENT MENU
===================================================== */

function toggleAttachmentMenu() {

	const menu =
		document.getElementById(
			"attachmentMenu"
		);

	if (!menu) {

		return;
	}


	if (
		menu.style.display ===
		"block"
	) {

		menu.style.display =
			"none";

	}
	else {

		menu.style.display =
			"block";

	}

}


/* =====================================================
   CLOSE ATTACHMENT MENU
===================================================== */

function closeAttachmentMenu() {

	const menu =
		document.getElementById(
			"attachmentMenu"
		);

	if (menu) {

		menu.style.display =
			"none";

	}

}


/* =====================================================
   CLOSE ATTACHMENT MENU
   WHEN CLICKING OUTSIDE
===================================================== */

document.addEventListener(
	"click",
	function(event) {

		const menu =
			document.getElementById(
				"attachmentMenu"
			);

		const button =
			document.getElementById(
				"attachmentButton"
			);


		if (!menu || !button) {

			return;
		}


		if (
			menu.contains(
				event.target
			)
		) {

			return;
		}


		if (
			button.contains(
				event.target
			)
		) {

			return;
		}


		menu.style.display =
			"none";

	}
);


/* =====================================================
   VOICE MESSAGE
===================================================== */

function startVoiceRecording() {

    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        return;
    }

    if (!currentChatUser) {
        alert("Please select a user first.");
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Voice recording is not supported by this browser.");
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {

            const options =
                window.MediaRecorder &&
                MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                    ? { mimeType: "audio/webm;codecs=opus" }
                    : undefined;

            mediaRecorder = new MediaRecorder(stream, options);
            recordedAudioChunks = [];

            mediaRecorder.ondataavailable = function(event) {
                if (event.data && event.data.size > 0) {
                    recordedAudioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = function() {
                stream.getTracks().forEach(function(track) {
                    track.stop();
                });

                resetVoiceButton();

                const audioBlob = new Blob(
                    recordedAudioChunks,
                    { type: mediaRecorder.mimeType || "audio/webm" }
                );

                if (audioBlob.size > 0) {
                    uploadVoiceRecording(audioBlob);
                }
            };

            mediaRecorder.start();
            setVoiceButtonRecordingState();
        })
        .catch(function() {
            alert("Microphone permission is required to record a voice message.");
        });
}

function setVoiceButtonRecordingState() {

    const button = document.getElementById("micButton");

    if (button) {
        button.textContent = "■";
        button.title = "Stop recording";
        button.style.color = "#f44336";
    }
}

function resetVoiceButton() {

    const button = document.getElementById("micButton");

    if (button) {
        button.textContent = "🎤";
        button.title = "Voice message";
        button.style.color = "#555";
    }
}

function uploadVoiceRecording(audioBlob) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        alert(
            "Session expired. Please login again."
        );

        return;
    }


    if (!currentChatUser) {

        alert(
            "Please select a user first."
        );

        return;
    }


    if (
        !stompClient ||
        !stompClient.connected
    ) {

        alert(
            "WebSocket is not connected."
        );

        return;
    }


    if (
        !audioBlob ||
        audioBlob.size === 0
    ) {

        alert(
            "No voice recording was captured."
        );

        return;
    }


    const audioFile =
        new File(
            [audioBlob],
            "voice-message-" +
            Date.now() +
            ".webm",
            {
                type:
                    audioBlob.type ||
                    "audio/webm"
            }
        );


    const formData =
        new FormData();


    formData.append(
        "file",
        audioFile
    );


    fetch(
        "/files/upload-file",
        {
            method: "POST",

            headers: {
                "Authorization":
                    "Bearer " + token
            },

            body: formData
        }
    )
    .then(
        async function(response) {

            const text =
                await response.text();


            if (!response.ok) {

                throw new Error(
                    text ||
                    (
                        "Voice upload failed. HTTP " +
                        response.status
                    )
                );

            }


            try {

                return JSON.parse(text);

            }
            catch (error) {

                throw new Error(
                    "Invalid response from file upload server."
                );

            }

        }
    )
    .then(
        function(data) {

            if (!data.fileUrl) {

                throw new Error(
                    "Voice file URL was not returned by server."
                );

            }


            sendVoiceMessage(
                data.fileUrl,
                audioFile.name
            );

        }
    )
    .catch(
        function(error) {

            console.error(
                "Voice upload error:",
                error
            );


            alert(
                "Voice message failed: " +
                error.message
            );

        }
    );

}
function sendVoiceMessage(
    fileUrl,
    fileName
) {

    if (
        !stompClient ||
        !stompClient.connected
    ) {

        alert(
            "WebSocket is not connected."
        );

        return;
    }


    if (!currentChatUser) {

        alert(
            "Please select a user."
        );

        return;
    }


    const voiceMessage = {

        receiver:
            currentChatUser,

        content:
            fileUrl,

        messageType:
            "AUDIO",

        fileName:
            fileName,

        replyToMessageId:
            replyingToMessage
                ? replyingToMessage.messageId
                : null,

        replyToContent:
            replyingToMessage
                ? replyingToMessage.content
                : null

    };


    console.log(
        "Sending voice message:",
        voiceMessage
    );


    stompClient.send(

        "/app/send",

        {},

        JSON.stringify(
            voiceMessage
        )

    );


    if (
        typeof cancelReply ===
        "function"
    ) {

        cancelReply();

    }

}
/* =====================================================
   RENDER MESSAGE CONTENT
===================================================== */

function renderMessageContent(message) {

	const messageType =
		message.messageType || "TEXT";

	const content =
		message.content || "";

/* =====================================================
   CALL HISTORY MESSAGE

   ADDITIVE FEATURE

   Does not affect:
   - TEXT
   - IMAGE
   - DOCUMENT
   - FILE
   - AUDIO
   - Existing message functionality
===================================================== */

if (

    messageType.toUpperCase() === "CALL"

) {

    const callWrapper =

        document.createElement(

            "div"

        );


    callWrapper.className =

        "call-history-message";


    /* =================================================
       CALL TYPE
    ================================================= */

    const callType =

        (

            message.callType ||

            "VOICE"

        ).toUpperCase();


    /* =================================================
       CALL STATUS
    ================================================= */

    const callStatus =

        (

            message.callStatus ||

            "COMPLETED"

        ).toUpperCase();


    /* =================================================
       CALL DIRECTION
    ================================================= */

    const isOutgoing =

        currentUsername &&

        message.sender === currentUsername;


    const callDirection =

        message.callDirection ||

        (

            isOutgoing

                ? "OUTGOING"

                : "INCOMING"

        );


    /* =================================================
       ICON
    ================================================= */

    let icon =

        callType === "VIDEO"

            ? "fa-video"

            : "fa-phone";


    /* =================================================
       TITLE
    ================================================= */

    let title = "";


    if (

        callStatus === "MISSED"

    ) {

        title =

            "Missed " +

            (

                callType === "VIDEO"

                    ? "Video Call"

                    : "Voice Call"

            );

    }

    else if (

        callStatus === "REJECTED"

    ) {

        title =

            "Call Rejected";

    }

    else if (

        callStatus === "CANCELLED"

    ) {

        title =

            "Call Cancelled";

    }

    else {

        title =

            callDirection === "OUTGOING"

                ? "Outgoing "

                : "Incoming ";


        title +=

            callType === "VIDEO"

                ? "Video Call"

                : "Voice Call";

    }


    /* =================================================
       FORMAT DURATION
    ================================================= */

    const duration =

        Number(

            message.callDuration ||

            0

        );


    let durationText = "";


    if (

        duration > 0

    ) {

        const minutes =

            Math.floor(

                duration / 60

            );


        const seconds =

            duration %

            60;


        durationText =

            String(

                minutes

            ).padStart(

                2,

                "0"

            )

            +

            ":"

            +

            String(

                seconds

            ).padStart(

                2,

                "0"

            );

    }


    /* =================================================
       CREATE HTML
    ================================================= */

    callWrapper.innerHTML = `

        <div class="call-history-icon">

            <i class="fa-solid ${icon}"></i>

        </div>

        <div class="call-history-details">

            <div class="call-history-title">

                ${title}

            </div>

            <div class="call-history-subtitle">

                ${durationText

                    ? "Duration: " + durationText

                    : callStatus
                }

            </div>

        </div>

    `;


    /* =================================================
       INLINE UI
    ================================================= */

    callWrapper.style.cssText = `

        display:flex;

        align-items:center;

        gap:12px;

        min-width:220px;

        padding:10px 12px;

        border-radius:12px;

        cursor:default;

    `;


    return callWrapper;

}
	/* =================================================
	   IMAGE MESSAGE
	================================================= */

	if (
		messageType.toUpperCase() ===
		"IMAGE"
	) {

		const imageWrapper =
			document.createElement(
				"div"
			);


		imageWrapper.style.cssText = `
            max-width:280px;
            cursor:pointer;
        `;


		const image =
			document.createElement(
				"img"
			);


		image.src =
			content;


		image.alt =
			"Image";


		image.style.cssText = `
            display:block;

            max-width:280px;
            max-height:300px;

            width:auto;
            height:auto;

            border-radius:10px;

            object-fit:cover;
        `;


		/*
		 * Open full image
		 * when clicked.
		 */

		image.onclick =
			function() {

				window.open(
					content,
					"_blank"
				);

			};


		imageWrapper.appendChild(
			image
		);


		return imageWrapper;
	}


	/* =================================================
	   NORMAL TEXT MESSAGE
	================================================= */

	const text =
		document.createElement(
			"span"
		);


	text.textContent =
		content;


	return text;
}

/* =====================================================
   SEND GENERAL FILE MESSAGE
===================================================== */

function sendGeneralFileMessage(
    fileUrl,fileName
) {

    if (
        !stompClient ||
        !stompClient.connected
    ) {

        alert(
            "WebSocket is not connected."
        );

        return;
    }


    if (!currentChatUser) {

        alert(
            "Please select a user."
        );

        return;
    }


    const fileMessage = {

		
    
        receiver:
            currentChatUser,

        content:
            fileUrl,

        messageType:
            "FILE",
         fileName:
    fileName,

        replyToMessageId:
            replyingToMessage
                ? replyingToMessage.messageId
                : null,

        replyToContent:
            replyingToMessage
                ? replyingToMessage.content
                : null

    };


    


    stompClient.send(

        "/app/send",

        {},

        JSON.stringify(
            fileMessage
        )

    );


    /* =================================================
       CLEAR REPLY
    ================================================= */

    if (
        typeof cancelReply ===
        "function"
    ) {

        cancelReply();

    }

}

/* =====================================================
   SEND SELECTED GENERAL FILE
===================================================== */

function sendSelectedGeneralFile() {

    if (!selectedGeneralFile) {
        return;
    }

 
    const token =
        localStorage.getItem("token");

    if (!token) {

        alert(
            "Session expired. Please login again."
        );

        return;
    }

    if (
        !stompClient ||
        !stompClient.connected
    ) {

        alert(
            "WebSocket is not connected."
        );

        return;
    }

    if (!currentChatUser) {

        alert(
            "Please select a user."
        );

        return;
    }

    const file =
        selectedGeneralFile;

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    

    fetch(
        "/files/upload-file",
        {
            method: "POST",

            headers: {
                "Authorization":
                    "Bearer " + token
            },

            body: formData
        }
    )
    .then(
        async response => {

            const text =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    text ||
                    "File upload failed"
                );

            }

            try {

                return JSON.parse(
                    text
                );

            }
            catch (error) {

                throw new Error(
                    "Invalid server response"
                );

            }

        }
    )
    .then(
        data => {

            

            if (!data.fileUrl) {

                throw new Error(
                    "File URL not received"
                );

            }

           sendGeneralFileMessage(
    data.fileUrl,
    file.name
);
            /* =========================================
               CLEAR SELECTED FILE
            ========================================= */

            selectedGeneralFile =
                null;

            ["fileInput", "documentInput"].forEach(
                function(inputId) {

                    const input =
                        document.getElementById(
                            inputId
                        );

                    if (input) {
                        input.value = "";
                    }

                }
            );

            /* =========================================
               RESTORE NORMAL INPUT
            ========================================= */

            const messageInput =
                document.getElementById(
                    "message"
                );

            if (messageInput) {

                messageInput.placeholder =
                    "Type a message...";

                messageInput.value =
                    "";

                messageInput.focus();

            }

        }
    )
    .catch(
        error => {

            

            alert(
                "File upload failed: " +
                error.message
            );

        }
    );

}


/* =====================================================
   REACTION PICKER
===================================================== */
function showReactionPicker(messageId) {

    closeReactionPicker();

    const picker =
        document.createElement("div");

    picker.id = "reaction-picker";

    picker.style.position = "fixed";
    picker.style.zIndex = "999999";
    picker.style.background = "#ffffff";
    picker.style.border = "1px solid #ddd";
    picker.style.borderRadius = "22px";
    picker.style.padding = "6px 8px";
    picker.style.boxShadow =
        "0 4px 15px rgba(0,0,0,.25)";

    picker.innerHTML = `

        <button
            class="quick-reaction"
            onclick="sendReaction(${messageId}, '👍')"
        >
            👍
        </button>

        <button
            class="quick-reaction"
            onclick="sendReaction(${messageId}, '❤️')"
        >
            ❤️
        </button>

        <button
            class="quick-reaction"
            onclick="sendReaction(${messageId}, '😂')"
        >
            😂
        </button>

        <button
            class="quick-reaction"
            onclick="sendReaction(${messageId}, '😮')"
        >
            😮
        </button>

        <button
            class="quick-reaction"
            onclick="sendReaction(${messageId}, '😢')"
        >
            😢
        </button>

        <!-- PLUS -->
        <button
            class="quick-reaction"
            onclick="
                event.stopPropagation();
                showAllEmojiPicker(${messageId});
            "
        >
            ➕
        </button>
    `;

    document.body.appendChild(picker);

    picker
        .querySelectorAll(".quick-reaction")
        .forEach(button => {

            button.style.border = "none";
            button.style.background = "transparent";
            button.style.cursor = "pointer";
            button.style.fontSize = "21px";
            button.style.padding = "4px 5px";

        });


    const messageElement =
        document.getElementById(
            "message-" + messageId
        );

    if (messageElement) {

        const rect =
            messageElement.getBoundingClientRect();

        picker.style.left =
            Math.max(
                10,
                rect.left
            ) + "px";

        picker.style.top =
            Math.max(
                10,
                rect.top - 55
            ) + "px";
    }
}


function showAllEmojiPicker(messageId) {

    closeReactionPicker();

    const picker =
        document.createElement("div");

    picker.id = "reaction-picker";

    picker.style.position = "fixed";
    picker.style.zIndex = "999999";
    picker.style.width = "320px";
    picker.style.maxWidth =
        "calc(100vw - 30px)";
    picker.style.maxHeight = "300px";
    picker.style.overflowY = "auto";
    picker.style.background = "#ffffff";
    picker.style.border = "1px solid #ddd";
    picker.style.borderRadius = "12px";
    picker.style.padding = "10px";
    picker.style.boxShadow =
        "0 4px 15px rgba(0,0,0,.25)";


    const emojis = [

        // Smileys
        "😀","😃","😄","😁","😆","😅",
        "😂","🤣","😊","😇","🙂","🙃",
        "😉","😌","😍","🥰","😘","😗",
        "😙","😚","😋","😛","😝","😜",
        "🤪","🤨","🧐","🤓","😎","🤩",
        "🥳","😏","😒","😞","😔","😟",
        "😕","🙁","☹️","😣","😖","😫",
        "😩","🥺","😢","😭","😤","😠",
        "😡","🤬","🤯","😳","🥵","🥶",
        "😱","😨","😰","😥","😓","🤗",
        "🤔","🫡","🤭","🤫","🤥","😶",
        "😐","😑","😬","🙄","😯","😦",
        "😧","😮","😲","🥱","😴","🤤",
        "😪","😵","🤐","🥴","🤢","🤮",

        // Hands
        "👍","👎","👌","✌️","🤞","🤟",
        "🤘","🤙","👋","👏","🙌","👐",
        "🤲","🙏","💪","🫶","☝️","👇",
        "👆","👉","👈","✋","🤚","🖐️",
        "🖖","👊","✊",

        // Hearts
        "❤️","🧡","💛","💚","💙","💜",
        "🖤","🤍","🤎","💔","❣️","💕",
        "💞","💓","💗","💖","💘","💝",
        "💟","❤️‍🔥",

        // Objects / symbols
        "🔥","⭐","🌟","✨","💯","🎉",
        "🎊","🎁","🏆","🥇","🚀","💡",
        "💰","💎","⚡","☀️","🌈",
        "☕","🍕","🍔","🍎","🍺",
        "⚽","🏏","🎮","🎵","🎶",

        // Animals
        "🐶","🐱","🐭","🐹","🐰","🦊",
        "🐻","🐼","🐨","🐯","🦁","🐮",
        "🐷","🐸","🐵","🙈","🙉","🙊",
        "🐔","🐧","🐦","🦄","🐝",
        "🦋","🐢","🐍","🐬","🐳"

    ];


    picker.innerHTML = `

        <div
            style="
                display:grid;
                grid-template-columns:
                    repeat(8, 1fr);
                gap:4px;
            "
        >

            ${emojis.map(
                emoji => `

                    <button
                        onclick="
                            sendReaction(
                                ${messageId},
                                '${emoji}'
                            )
                        "
                        style="
                            border:none;
                            background:transparent;
                            cursor:pointer;
                            font-size:23px;
                            padding:5px;
                            border-radius:6px;
                        "
                        onmouseover="
                            this.style.background='#f0f0f0'
                        "
                        onmouseout="
                            this.style.background='transparent'
                        "
                    >
                        ${emoji}
                    </button>

                `
            ).join("")}

        </div>
    `;


    document.body.appendChild(picker);


    const messageElement =
        document.getElementById(
            "message-" + messageId
        );


    if (messageElement) {

        const rect =
            messageElement.getBoundingClientRect();

        let left =
            rect.left;

        let top =
            rect.top - 310;


        if (top < 10) {

            top =
                rect.bottom + 10;

        }


        if (
            left + 320 >
            window.innerWidth
        ) {

            left =
                window.innerWidth - 330;

        }


        picker.style.left =
            Math.max(
                10,
                left
            ) + "px";

        picker.style.top =
            Math.max(
                10,
                top
            ) + "px";
    }
}

/* =====================================================
   MESSAGE REACTIONS
   ===================================================== */

/*
 * SEND REACTION
 *
 * Works for BOTH:
 * - Sender
 * - Receiver
 */
function sendReaction(messageId, reaction) {

    if (!messageId) {
        console.error("Reaction message ID is missing");
        return;
    }

    if (!reaction) {
        console.error("Reaction is missing");
        return;
    }

    if (
        !stompClient ||
        !stompClient.connected
    ) {
        console.error(
            "WebSocket is not connected"
        );

        return;
    }

    console.log(
        "Sending reaction:",
        messageId,
        reaction
    );

    stompClient.send(
        "/app/react",
        {},
        JSON.stringify({

            messageId:
                Number(messageId),

            reaction:
                reaction

        })
    );

    /*
     * Close emoji picker after selection.
     */
    closeReactionPicker();
}


/*
 * CLOSE REACTION PICKER
 */
function closeReactionPicker() {

    const picker =
        document.getElementById(
            "reaction-picker"
        );

    if (picker) {

        picker.remove();

    }
}


/*
 * UPDATE REACTION UI
 */
function updateMessageReaction(
    reactionEvent
) {

    if (!reactionEvent) {
        return;
    }

    const messageId =
        reactionEvent.messageId;

    if (!messageId) {
        return;
    }

    console.log(
        "Reaction received:",
        reactionEvent
    );


    /*
     * Store reaction information.
     */
    if (
        typeof messageStore !==
        "undefined"
    ) {

        if (
            messageStore[messageId]
        ) {

            messageStore[
                messageId
            ].reaction =
                reactionEvent.reaction;

            messageStore[
                messageId
            ].reactionUser =
                reactionEvent.username;
        }
    }


    /*
     * Find message element.
     */
    const messageElement =
        document.getElementById(
            "message-" + messageId
        );

    if (!messageElement) {

        console.warn(
            "Message element not found:",
            messageId
        );

        return;
    }


    /*
     * Find/create reaction display.
     */
    let reactionDisplay =
        document.getElementById(
            "reaction-display-" +
            messageId
        );


    /*
     * Reaction removed.
     */
    if (
        !reactionEvent.reaction
    ) {

        if (reactionDisplay) {

            reactionDisplay.remove();

        }

        return;
    }


    /*
     * Create reaction display
     * if it doesn't exist.
     */
    if (!reactionDisplay) {

        reactionDisplay =
            document.createElement(
                "div"
            );

        reactionDisplay.id =
            "reaction-display-" +
            messageId;

       reactionDisplay.style.position =
    "absolute";

reactionDisplay.style.bottom =
    "-10px";


const storedMessage =
    messageStore[messageId];

const isMyReactionMessage =
    storedMessage &&
    storedMessage.sender ===
        loggedInUser;


if (isMyReactionMessage) {

    reactionDisplay.style.left =
        "auto";

    reactionDisplay.style.right =
        "10px";

}
else {

    reactionDisplay.style.right =
        "auto";

    reactionDisplay.style.left =
        "10px";

}


reactionDisplay.style.background =
    "#ffffff";

reactionDisplay.style.border =
    "1px solid #ddd";

reactionDisplay.style.borderRadius =
    "12px";

        /*
         * Make message container
         * position relative.
         */
        const computed =
            window.getComputedStyle(
                messageElement
            );

        if (
            computed.position ===
                "static"
        ) {

            messageElement.style.position =
                "relative";
        }


        messageElement.appendChild(
            reactionDisplay
        );
    }


    /*
     * Display selected emoji.
     */
    reactionDisplay.textContent =
        reactionEvent.reaction;
}

function getForwardPreview(message) {

    if (!message) {
        return "";
    }

    if (
        message.messageType ===
        "IMAGE"
    ) {

        return "🖼️ Image";

    }

    if (
        message.messageType ===
        "DOCUMENT"
    ) {

        return "📄 " +
            (
                message.fileName ||
                "Document"
            );

    }

    if (
        message.messageType ===
        "FILE"
    ) {

        return "📎 " +
            (
                message.fileName ||
                "File"
            );

    }

    if (
        message.messageType ===
        "VOICE"
    ) {

        return "🎤 Voice message";

    }

    return escapeHtmlSafe(
        message.content ||
        ""
    );
}

function loadForwardUsers() {

    const token =
        localStorage.getItem(
            "token"
        );

    const container =
        document.getElementById(
            "forwardUsers"
        );

    if (!container) {
        return;
    }

    fetch(
        "/user/all",
        {
            method: "GET",

            headers: {
                "Authorization":
                    "Bearer " + token
            }
        }
    )

    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Unable to load users"
            );
        }

        return response.json();

    })

    .then(users => {

        container.innerHTML = "";

        users.forEach(
            user => {

                /*
                 * Don't show logged-in user
                 * as forwarding target.
                 */

                if (
                    user.username ===
                    loggedInUser
                ) {
                    return;
                }

                const row =
                    document.createElement(
                        "label"
                    );

                row.style.display =
                    "flex";

                row.style.alignItems =
                    "center";

                row.style.gap =
                    "10px";

                row.style.padding =
                    "10px";

                row.style.cursor =
                    "pointer";

                row.style.borderBottom =
                    "1px solid #eee";

                row.innerHTML = `

                    <input
                        type="checkbox"
                        class="forward-user"
                        value="${escapeHtmlSafe(
                            user.username
                        )}"
                    >

                    <span>
                        👤
                        ${escapeHtmlSafe(
                            user.username
                        )}
                    </span>

                `;

                container.appendChild(
                    row
                );

            }
        );

    })

    .catch(error => {

        console.error(
            "Forward users error:",
            error
        );

        container.innerHTML = `
            <div
                style="
                    padding:15px;
                    color:#d32f2f;
                    text-align:center;
                "
            >
                Unable to load users.
            </div>
        `;

    });
}

function closeForwardDialog() {

    const dialog =
        document.getElementById(
            "forwardDialog"
        );

    if (dialog) {
        dialog.remove();
    }

    forwardingMessage =
        null;
}

function forwardSelectedMessage() {

    if (!forwardingMessage) {
        alert("No message selected.");
        return;
    }

    const selectedUsers =
        Array.from(
            document.querySelectorAll(
                ".forward-user:checked"
            )
        ).map(
            checkbox =>
                checkbox.value
        );

    if (
        selectedUsers.length === 0
    ) {

        alert(
            "Please select at least one user."
        );

        return;
    }

    if (
        !stompClient ||
        !stompClient.connected
    ) {

        alert(
            "WebSocket is not connected."
        );

        return;
    }


    selectedUsers.forEach(
        receiver => {

            const forwardedMessage = {

                receiver:
                    receiver,

                content:
                    forwardingMessage.content,

                messageType:
                    forwardingMessage.messageType ||
                    "TEXT",

                fileName:
                    forwardingMessage.fileName ||
                    null,

                replyToMessageId:
                    null,

                replyToContent:
                    null,

                forwarded:
                    true

            };


            stompClient.send(

                "/app/send",

                {},

                JSON.stringify(
                    forwardedMessage
                )

            );

        }
    );


    closeForwardDialog();

   
}

let blockedUsers={};let disappearingTimers={};
function apiFetch(url,options){const token=localStorage.getItem("token");options=options||{};options.headers=Object.assign({},options.headers||{}, {"Authorization":"Bearer "+token});return fetch(url,options);}
function showChatToast(text){let t=document.getElementById("chatToast");if(!t){t=document.createElement("div");t.id="chatToast";t.style.cssText="position:fixed;left:50%;bottom:85px;transform:translateX(-50%);background:#333;color:white;padding:9px 14px;border-radius:8px;font-size:12px;z-index:5000;box-shadow:0 4px 15px rgba(0,0,0,.25);";document.body.appendChild(t);}t.textContent=text;t.style.display="block";clearTimeout(window.chatToastTimer);window.chatToastTimer=setTimeout(()=>t.style.display="none",2500);}
function toggleProfileMenu(e){if(e)e.stopPropagation();const m=document.getElementById("profileMenu");if(!m)return;m.style.display=m.style.display==="block"?"none":"block";closeChatHeaderMenu();}
function getProfileImageUrl(url) {
    if (!url) return "";
    const separator = url.includes("?") ? "&" : "?";
    return url + separator + "v=" + Date.now();
}

function applyMyProfileToUI(user) {
    if (!user) return;

    window.currentProfile = user;
    try {
        localStorage.setItem("currentProfile", JSON.stringify(user));
    } catch (e) {}

    const profileButton = document.getElementById("profileButton");
    if (profileButton) {
        if (user.profilePicture) {
            profileButton.innerHTML = '<img src="' + getProfileImageUrl(user.profilePicture) + '" alt="Profile">';
            profileButton.classList.add("has-profile-image");
        } else {
            profileButton.innerHTML = '<i class="fa-solid fa-user"></i>';
            profileButton.classList.remove("has-profile-image");
        }
    }
}

function previewSelectedProfilePicture() {
    const input = document.getElementById("profilePictureFile");
    const img = document.getElementById("profilePicturePreview");
    if (!input || !img || !input.files || !input.files[0]) return;

    const objectUrl = URL.createObjectURL(input.files[0]);
    img.src = objectUrl;
    img.style.display = "block";
}

function openSettingsModal(){
 const m=document.getElementById("profileMenu");if(m)m.style.display="none";
 const n=document.getElementById("settingsUsername");if(n)n.textContent=loggedInUser||"";
 apiFetch("/user/me").then(r=>{if(!r.ok)throw new Error("Unable to load profile");return r.json();}).then(u=>{
  document.getElementById("profileDisplayName").value=u.displayName||"";
  document.getElementById("profileEmail").value=u.email||"";
  document.getElementById("profileBio").value=u.bio||"";
  const fileInput=document.getElementById("profilePictureFile");
  if(fileInput) fileInput.value="";
  const img=document.getElementById("profilePicturePreview");
  if(img){
   if(u.profilePicture){img.src=getProfileImageUrl(u.profilePicture);img.style.display="block";}
   else {img.removeAttribute("src");img.style.display="none";}
  }
  applyMyProfileToUI(u);
 }).catch(e=>showChatToast(e.message||"Unable to load profile"));
 document.getElementById("settingsModal").style.display="flex";
}

async function saveMyProfile(){
 try{
  const fileInput=document.getElementById("profilePictureFile");
  let profilePicture=window.currentProfile&&window.currentProfile.profilePicture ? window.currentProfile.profilePicture : undefined;
  const file=fileInput&&fileInput.files?fileInput.files[0]:null;

  if(file){
   const fd=new FormData();fd.append("file",file);
   const token=localStorage.getItem("token");
   const upload=await fetch("/files/upload-image",{method:"POST",headers:{Authorization:"Bearer "+token},body:fd});
   if(!upload.ok) throw new Error(await upload.text()||"Profile image upload failed");
   const data=await upload.json();
   profilePicture=data.fileUrl||data.imageUrl||data.url;
   if(!profilePicture) throw new Error("Profile image URL was not returned");
  }

  const body={
   displayName:document.getElementById("profileDisplayName").value.trim(),
   email:document.getElementById("profileEmail").value.trim(),
   bio:document.getElementById("profileBio").value.trim()
  };
  if(profilePicture!==undefined) body.profilePicture=profilePicture;

  const r=await apiFetch("/user/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!r.ok) throw new Error(await r.text()||"Unable to update profile");

  const updated=await r.json();
  applyMyProfileToUI(updated);

  const img=document.getElementById("profilePicturePreview");
  if(img&&updated.profilePicture){img.src=getProfileImageUrl(updated.profilePicture);img.style.display="block";}

  showChatToast("Profile updated successfully");
  setTimeout(()=>closeChatModal("settingsModal"),350);
 }catch(e){showChatToast(e.message||"Unable to update profile");}
}

function toggleChatHeaderMenu(e){if(e)e.stopPropagation();const m=document.getElementById("chatHeaderMenu");if(!m||!currentChatUser)return;m.style.display=m.style.display==="block"?"none":"block";if(m.style.display==="block")loadBlockStatus(currentChatUser);const p=document.getElementById("profileMenu");if(p)p.style.display="none";}
function closeChatHeaderMenu(){const m=document.getElementById("chatHeaderMenu");if(m)m.style.display="none";}function closeChatModal(id){const m=document.getElementById(id);if(m)m.style.display="none";}function closeModalOnOverlay(e,id){if(e&&e.target&&e.target.id===id)closeChatModal(id);}
function loadBlockStatus(u){if(!u)return;apiFetch("/user/block/status/"+encodeURIComponent(u)).then(r=>r.json()).then(d=>{blockedUsers[u]=!!d.blocked;updateBlockMenuLabel();updateChatInputBlockedState();}).catch(()=>{});}
function updateBlockMenuLabel(){const b=document.getElementById("blockUserMenuButton");if(!b||!currentChatUser)return;b.innerHTML=blockedUsers[currentChatUser]?'<i class="fa-solid fa-ban"></i> Unblock':'<i class="fa-solid fa-ban"></i> Block';}
function updateChatInputBlockedState(){const b=!!blockedUsers[currentChatUser];["message","sendButton","micButton","attachmentButton"].forEach(id=>{const e=document.getElementById(id);if(e)e.disabled=b;});const i=document.getElementById("message");if(i)i.placeholder=b?"User blocked":"Type a message...";}
function toggleBlockCurrentUser(){if(!currentChatUser)return;const u=currentChatUser,b=!!blockedUsers[u];const req=b?apiFetch("/user/block/"+encodeURIComponent(u),{method:"DELETE"}):apiFetch("/user/block/"+encodeURIComponent(u),{method:"POST"});req.then(async r=>{if(!r.ok)throw new Error(await r.text());return r.json();}).then(d=>{blockedUsers[u]=!!d.blocked;updateBlockMenuLabel();updateChatInputBlockedState();showChatToast(blockedUsers[u]?"User blocked":"User unblocked");}).catch(e=>showChatToast(e.message||"Unable to update block status"));}
function openUserProfile(u){if(!u)return;apiFetch("/user/profile/"+encodeURIComponent(u)).then(r=>{if(!r.ok)throw new Error("Unable to load user profile");return r.json();}).then(x=>{document.getElementById("profileInfoName").textContent=x.username;document.getElementById("profileInfoStatus").textContent=x.online?"🟢 Online":"🔴 Offline";document.getElementById("profileInfoLastSeen").textContent=x.online?"Active now":"Last Seen: "+(x.lastSeen?new Date(x.lastSeen).toLocaleString():"Not available");document.getElementById("profileInfoModal").style.display="flex";}).catch(e=>showChatToast(e.message));}
function openSharedMedia(){if(!currentChatUser)return;renderSharedCategory("media");document.getElementById("sharedMediaModal").style.display="flex";}
function renderSharedCategory(category) {

    const box = document.getElementById("sharedMediaContent");

    if (!box) {
        return;
    }

    const messages = Object.values(messageStore || {})
        .filter(function(message) {

            return message &&
                (
                    message.sender === currentChatUser ||
                    message.receiver === currentChatUser
                );

        });

    let filteredMessages = [];

    if (category === "media") {

        filteredMessages = messages.filter(function(message) {

            const type =
                (message.messageType || "").toUpperCase();

            return type === "IMAGE" ||
                   type === "AUDIO";

        });

    }

    else if (category === "documents") {

        filteredMessages = messages.filter(function(message) {

            const type =
                (message.messageType || "").toUpperCase();

            return type === "FILE" ||
                   type === "DOCUMENT";

        });

    }

    else if (category === "links") {

        filteredMessages = messages.filter(function(message) {

            return /https?:\/\/\S+/i.test(
                message.content || ""
            );

        });

    }


    if (!filteredMessages.length) {

        box.innerHTML =
            '<div class="modal-muted" style="padding:25px;">' +
            'No shared ' +
            escapeHtml(category) +
            ' found.' +
            '</div>';

        return;
    }


    /*
     * Newest attachment first
     */
    filteredMessages.sort(function(a, b) {

        return new Date(b.timestamp || 0) -
               new Date(a.timestamp || 0);

    });


    box.innerHTML = filteredMessages.map(function(message) {

        const type =
            (message.messageType || "").toUpperCase();

        let displayName =
            message.fileName ||
            message.content ||
            "Shared item";


        /*
         * Better display text
         */
        if (type === "IMAGE") {

            displayName =
                message.fileName ||
                "Image";

        }

        else if (type === "AUDIO") {

            displayName =
                message.fileName ||
                "Voice message";

        }

        else if (
            type === "FILE" ||
            type === "DOCUMENT"
        ) {

            displayName =
                message.fileName ||
                "Document";

        }


        const sender =
            escapeHtml(message.sender || "");

        const timestamp =
            message.timestamp
                ? new Date(message.timestamp)
                    .toLocaleString()
                : "";


        return `

            <div
                class="shared-item"
                onclick="goToSharedMessage(${message.id})"
                title="Go to this message"
                style="
                    cursor:pointer;
                    transition:background .15s;
                "
                onmouseenter="this.style.background='#f5f7fb'"
                onmouseleave="this.style.background='white'"
            >

                <b>
                    ${sender}
                </b>

                ·

                ${escapeHtml(timestamp)}

                <br>

                <span
                    style="
                        display:inline-block;
                        margin-top:4px;
                        color:#1976d2;
                    "
                >
                    ${escapeHtml(displayName)}
                </span>

            </div>

        `;

    }).join("");

}

function goToSharedMessage(messageId) {

    /*
     * Close Media / Links / Documents popup
     */
    closeChatModal(
        "sharedMediaModal"
    );


    /*
     * Find exact message element
     */
    const messageElement =
        document.getElementById(
            "message-" + messageId
        );


    if (!messageElement) {

        showChatToast(
            "Message is not currently loaded."
        );

        return;
    }


    /*
     * Scroll to exact message
     */
    messageElement.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    /*
     * Highlight message
     */
    const oldOutline =
        messageElement.style.outline;

    const oldBackground =
        messageElement.style.background;


    messageElement.style.transition =
        "background 0.2s, outline 0.2s";


    messageElement.style.outline =
        "3px solid rgba(33,150,243,0.45)";


    messageElement.style.background =
        "rgba(33,150,243,0.10)";


    /*
     * Remove highlight
     */
    setTimeout(
        function() {

            messageElement.style.outline =
                oldOutline;

            messageElement.style.background =
                oldBackground;

        },
        2000
    );

}

function openDisappearingMenu() {

    if (!currentChatUser) {
        return;
    }


    const modal =
        document.getElementById(
            "disappearingModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display = "flex";


    /*
     * Load current setting from backend
     */
    apiFetch(
        "/api/chat/settings/" +
        encodeURIComponent(
            currentChatUser
        )
    )
    .then(function(response) {

        if (!response.ok) {

            throw new Error(
                "Unable to load disappearing message setting"
            );

        }

        return response.json();

    })
    .then(function(data) {

        console.log(
            "Current disappearing time:",
            data.disappearingSeconds
        );

    })
    .catch(function(error) {

        console.error(
            "Disappearing setting error:",
            error
        );

    });
}
function setDisappearingTime(
    seconds,
    label
) {

    if (!currentChatUser) {
        return;
    }


    seconds = Number(seconds);


    if (seconds < 0) {
        return;
    }


    apiFetch(
        "/api/chat/settings/" +
        encodeURIComponent(
            currentChatUser
        ) +
        "?seconds=" +
        encodeURIComponent(seconds),
        {
            method: "POST"
        }
    )
    .then(function(response) {

        if (!response.ok) {

            throw new Error(
                "Unable to update disappearing messages"
            );

        }

        return response.json();

    })
    .then(function(data) {

        console.log(
            "Disappearing setting saved:",
            data.disappearingSeconds
        );


        closeChatModal(
            "disappearingModal"
        );


        if (seconds === 0) {

            addSystemChatNotice(
                "Disappearing messages turned off"
            );

        }
        else {

            addSystemChatNotice(
                "Disappearing messages: " +
                label
            );

        }

    })
    .catch(function(error) {

        console.error(
            error
        );

        showChatToast(
            error.message ||
            "Unable to update disappearing messages"
        );

    });
}
function setCustomDisappearingTime() {

    const value =
        Number(
            document.getElementById(
                "customDisappearValue"
            ).value
        );


    const unit =
        Number(
            document.getElementById(
                "customDisappearUnit"
            ).value
        );


    if (!value || value < 1) {

        showChatToast(
            "Enter a valid custom time"
        );

        return;
    }


    const seconds =
        value * unit;


    const label =
        value +
        " " +
        (
            unit === 1
                ? "seconds"
                : unit === 60
                    ? "minutes"
                    : "hours"
        );


    setDisappearingTime(
        seconds,
        label
    );
}function addSystemChatNotice(t){const c=document.getElementById("chat");if(!c)return;const d=document.createElement("div");d.style.cssText="text-align:center;color:#777;font-size:11px;margin:8px 0;";d.textContent="⏱ "+t;c.appendChild(d);c.scrollTop=c.scrollHeight;}
function formatDuration(seconds) {

    seconds = Math.max(
        0,
        Number(seconds)
    );


    if (seconds < 60) {

        return seconds + " seconds";

    }


    if (seconds < 3600) {

        const minutes =
            Math.floor(seconds / 60);

        const remainingSeconds =
            seconds % 60;


        if (remainingSeconds > 0) {

            return (
                minutes +
                " min " +
                remainingSeconds +
                " sec"
            );

        }


        return minutes + " min";

    }


    const hours =
        Math.floor(seconds / 3600);

    const remainingMinutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    if (remainingMinutes > 0) {

        return (
            hours +
            " hr " +
            remainingMinutes +
            " min"
        );

    }


    return hours + " hr";
}function startDisappearingTimer(message) {

    if (!message || !message.expiresAt) {
        return;
    }


    const timerElement =
        document.getElementById(
            "disappear-timer-" + message.id
        );


    if (!timerElement) {
        return;
    }


    /*
     * Clear an existing timer
     */
    if (disappearingTimers[message.id]) {

        clearInterval(
            disappearingTimers[message.id]
        );

    }


    const updateTimer = function () {

        const expiresAt =
            Number(message.expiresAt);

        const remainingSeconds =
            Math.max(
                0,
                Math.ceil(
                    (expiresAt - Date.now()) / 1000
                )
            );


        /*
         * Message expired
         */
        if (remainingSeconds <= 0) {

            clearInterval(
                disappearingTimers[message.id]
            );

            delete disappearingTimers[
                message.id
            ];


            const messageElement =
                document.getElementById(
                    "message-" + message.id
                );


            if (messageElement) {

                messageElement.remove();

            }


            if (messageStore) {

                delete messageStore[
                    message.id
                ];

            }


            return;
        }


        /*
         * Update visible timer
         */
        timerElement.textContent =
            "Disappears in " +
            formatDuration(
                remainingSeconds
            );

    };


    /*
     * Run immediately
     */
    updateTimer();


    /*
     * Update every second
     */
    disappearingTimers[message.id] =
        setInterval(
            updateTimer,
            1000
        );
}
document.addEventListener("click",()=>{const p=document.getElementById("profileMenu");if(p)p.style.display="none";closeChatHeaderMenu();});
function openAttachment(url, fileName) {

    if (!url) {
        showChatToast("Attachment is not available.");
        return;
    }

    fetch(url, {
        method: "HEAD"
    })
    .then(function(response) {

        if (!response.ok) {

            showChatToast(
                "This attachment is no longer available."
            );

            return;
        }

        window.open(
            url,
            "_blank",
            "noopener"
        );

    })
    .catch(function() {

        showChatToast(
            "Unable to open this attachment."
        );

    });
}

/* =====================================================
   CALL HISTORY IN CHAT
   ADDITIONAL FUNCTIONALITY
   ===================================================== */

/*
 * Add call history message to the main chat area.
 *
 * Example:
 *
 * Outgoing Voice Call
 * Incoming Video Call
 * Missed Voice Call
 */

function addCallHistoryMessage(
    username,
    callType,
    direction,
    status
) {

    console.log(
        "Adding call history:",
        username,
        callType,
        direction,
        status
    );

    /*
     * Do not add history if
     * username is empty.
     */

    if (
        !username
    ) {

        return;

    }


    /*
     * Find chat messages container.
     *
     * Multiple possible IDs are checked
     * to avoid affecting your existing
     * messages.js functionality.
     */

    const messagesContainer =
        document.getElementById(
            "messages"
        )
        ||
        document.getElementById(
            "chatMessages"
        )
        ||
        document.getElementById(
            "messageArea"
        )
        ||
        document.querySelector(
            ".messages"
        )
        ||
        document.querySelector(
            ".chat-messages"
        );


    /*
     * If message container
     * does not exist,
     * safely return.
     */

    if (
        !messagesContainer
    ) {

        console.warn(
            "Call history container not found"
        );

        return;

    }


    /*
     * Get current time.
     */

    const now =
        new Date();


    const time =
        now.toLocaleTimeString(
            [],
            {
                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        );


    /*
     * Determine icon.
     */

    let icon =
        "fa-phone";


    if (
        callType === "VIDEO"
    ) {

        icon =
            "fa-video";

    }


    /*
     * Determine call direction text.
     */

    let callText =
        "";


    /*
     * OUTGOING CALL
     */

    if (
        direction === "OUTGOING"
    ) {

        if (
            callType === "VIDEO"
        ) {

            callText =
                "Outgoing Video Call";

        }

        else {

            callText =
                "Outgoing Voice Call";

        }

    }


    /*
     * INCOMING CALL
     */

    else if (
        direction === "INCOMING"
    ) {

        if (
            callType === "VIDEO"
        ) {

            callText =
                "Incoming Video Call";

        }

        else {

            callText =
                "Incoming Voice Call";

        }

    }


    /*
     * MISSED CALL
     */

    else if (
        direction === "MISSED"
    ) {

        if (
            callType === "VIDEO"
        ) {

            callText =
                "Missed Video Call";

        }

        else {

            callText =
                "Missed Voice Call";

        }

    }


    /*
     * REJECTED CALL
     */

    else if (
        direction === "REJECTED"
    ) {

        if (
            callType === "VIDEO"
        ) {

            callText =
                "Video Call Rejected";

        }

        else {

            callText =
                "Voice Call Rejected";

        }

    }


    /*
     * ENDED CALL
     */

    else if (
        direction === "ENDED"
    ) {

        if (
            callType === "VIDEO"
        ) {

            callText =
                "Video Call Ended";

        }

        else {

            callText =
                "Voice Call Ended";

        }

    }


    /*
     * Default.
     */

    else {

        callText =
            "Call";

    }


    /*
     * Create call history element.
     */

    const callMessage =
        document.createElement(
            "div"
        );


    /*
     * CSS classes.
     */

    callMessage.className =
        "call-history-message";


    /*
     * Store information.
     */

    callMessage.dataset.username =
        username;


    callMessage.dataset.callType =
        callType;


    callMessage.dataset.direction =
        direction;


    callMessage.dataset.status =
        status ||
        "";


    /*
     * Create HTML.
     */

    callMessage.innerHTML =
        `

        <div class="call-history-content">

            <div class="call-history-icon">

                <i
                    class="fa-solid ${icon}"
                ></i>

            </div>


            <div class="call-history-info">

                <div
                    class="call-history-title"
                >

                    ${callText}

                </div>


                <div
                    class="call-history-user"
                >

                    ${username}

                </div>

            </div>


            <div
                class="call-history-time"
            >

                ${time}

            </div>

        </div>

        `;


    /*
     * Add to chat.
     */

    messagesContainer.appendChild(
        callMessage
    );


    /*
     * Scroll chat down.
     */

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;


    console.log(
        "Call history added successfully"
    );

}