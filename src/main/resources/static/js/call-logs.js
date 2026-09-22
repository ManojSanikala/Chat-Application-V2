/* ============================================= */
/* API CONFIGURATION */
/* ============================================= */


/*
 * Change this endpoint only if your
 * Spring Boot controller uses a
 * different endpoint.
 */

const CALL_HISTORY_API =
    "/call/history";



/* ============================================= */
/* DOM ELEMENTS */
/* ============================================= */

const callList =
    document.getElementById(
        "callList"
    );


const loading =
    document.getElementById(
        "loading"
    );


const emptyState =
    document.getElementById(
        "emptyState"
    );


const totalCalls =
    document.getElementById(
        "totalCalls"
    );


const incomingCalls =
    document.getElementById(
        "incomingCalls"
    );


const outgoingCalls =
    document.getElementById(
        "outgoingCalls"
    );



/* ============================================= */
/* PAGE LOAD */
/* ============================================= */

document.addEventListener(
    "DOMContentLoaded",

    function () {

        loadCallLogs();

    }
);



/* =====================================================
   OPEN CALL LOGS
===================================================== */

function openCallLogs() {

    const modal =
        document.getElementById(
            "callLogsModal"
        );

    if (!modal) {

        console.error(
            "Call logs modal not found"
        );

        return;
    }

    modal.style.display =
        "flex";

    loadCallLogs();

}


/* =====================================================
   LOAD CALL LOGS

   Backend endpoint:

   GET /call/history
===================================================== */

function loadCallLogs() {

    const container =
        document.getElementById(
            "callLogsContent"
        );

    if (!container) {

        console.error(
            "callLogsContent not found"
        );

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
        localStorage.getItem(
            "token"
        );


    fetch(
        "/call/history",
        {

            method:
                "GET",

            headers:
                {

                    "Authorization":
                        "Bearer " + token,

                    "Content-Type":
                        "application/json"

                }

        }
    )

    .then(
        async response => {

            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(
                    "Call history API error:",
                    response.status,
                    errorText
                );

                throw new Error(
                    "Failed to load call history"
                );

            }


            return response.json();

        }
    )

    .then(
        data => {

            console.log(
                "CALL HISTORY RECEIVED:",
                data
            );


            renderCallLogs(
                Array.isArray(data)
                    ? data
                    : []
            );

        }
    )

    .catch(
        error => {

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

        }
    );

}


/* =====================================================
   RENDER CALL LOGS

   Backend MessageResponse fields:

   sender
   receiver
   timestamp
   callType
   callDirection
   callStatus
   callDuration
===================================================== */

function renderCallLogs(
    callLogs
) {

    const container =
        document.getElementById(
            "callLogsContent"
        );


    if (!container) {

        return;

    }


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


    container.innerHTML =
        "";


    callLogs.forEach(
        call => {


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "call-log-item";


            /* =============================================
               CALL TYPE
            ============================================= */

            const isVideo =

                call.callType ===
                "VIDEO";


            const icon =

                isVideo

                    ? "fa-video"

                    : "fa-phone";


            /* =============================================
               FIND OTHER USER

               loggedInUser already exists
               in your users.js
            ============================================= */

            let otherUser =
                "Unknown User";


            if (
                typeof loggedInUser !==
                "undefined"
            ) {

                if (
                    call.sender ===
                    loggedInUser
                ) {

                    otherUser =
                        call.receiver;

                }

                else {

                    otherUser =
                        call.sender;

                }

            }

            else {

                otherUser =
                    call.receiver ||
                    call.sender ||
                    "Unknown User";

            }


            /* =============================================
               CALL STATUS
            ============================================= */

            const status =
                call.callStatus ||
                "COMPLETED";


            /* =============================================
               CALL DIRECTION
            ============================================= */

            const direction =
                call.callDirection ||
                "";


            /* =============================================
               CALL DURATION
            ============================================= */

            const duration =
                formatCallDuration(
                    call.callDuration
                );


            /* =============================================
               CALL TIME
            ============================================= */

            const callTime =
                formatCallTime(
                    call.timestamp
                );


            /* =============================================
               STATUS TEXT
            ============================================= */

            let statusText =
                status;


            if (
                direction ===
                "OUTGOING"
            ) {

                statusText =
                    "Outgoing • " +
                    status;

            }

            else if (
                direction ===
                "INCOMING"
            ) {

                statusText =
                    "Incoming • " +
                    status;

            }


            /* =============================================
               CREATE UI
            ============================================= */

            item.innerHTML = `

                <div
                    class="call-log-left"
                >

                    <div
                        class="call-log-icon"
                    >

                        <i
                            class="
                                fa-solid
                                ${icon}
                            "
                        ></i>

                    </div>


                    <div>

                        <div
                            class="
                                call-log-name
                            "
                        >

                            ${escapeCallLogText(
                                otherUser
                            )}

                        </div>


                        <div
                            class="
                                call-log-info
                            "
                        >

                            ${statusText}

                            ${
                                duration
                                    ? " • " +
                                      duration
                                    : ""
                            }

                        </div>

                    </div>

                </div>


                <div
                    class="call-log-right"
                >

                    ${callTime}

                </div>

            `;


            container.appendChild(
                item
            );


        }
    );

}


/* =====================================================
   FORMAT CALL DURATION
===================================================== */

function formatCallDuration(
    seconds
) {

    if (
        seconds === null ||
        seconds === undefined
    ) {

        return "";

    }


    seconds =
        Number(seconds);


    if (
        isNaN(seconds) ||
        seconds <= 0
    ) {

        return "";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    return (

        "Duration: " +

        String(minutes)
            .padStart(
                2,
                "0"
            )

        +

        ":" +

        String(remainingSeconds)
            .padStart(
                2,
                "0"
            )

    );

}


/* =====================================================
   FORMAT CALL TIME
===================================================== */

function formatCallTime(
    dateValue
) {

    if (!dateValue) {

        return "";

    }


    const date =
        new Date(
            dateValue
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return dateValue;

    }


    return date.toLocaleString();

}


/* =====================================================
   ESCAPE CALL LOG TEXT
===================================================== */

function escapeCallLogText(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value);


    return div.innerHTML;

}
/* ============================================= */
/* UPDATE SUMMARY */
/* ============================================= */

function updateSummary(
    calls
) {

    const currentUser =
        typeof loggedInUser !==
        "undefined"
            ? loggedInUser
            : null;


    const total =
        calls.length;


    const incoming =
        calls.filter(
            call => {

                return (
                    currentUser &&
                    call.receiver ===
                    currentUser
                );

            }
        ).length;


    const outgoing =
        calls.filter(
            call => {

                return (
                    currentUser &&
                    call.sender ===
                    currentUser
                );

            }
        ).length;


    totalCalls.textContent =
        total;


    incomingCalls.textContent =
        incoming;


    outgoingCalls.textContent =
        outgoing;

}
/* ============================================= */
/* FORMAT DURATION */
/* ============================================= */

function formatDuration(
    seconds
) {


    if (
        !seconds
        ||
        seconds <= 0
    ) {

        return "0 sec";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    if (
        minutes > 0
    ) {

        return
            minutes
            + "m "
            + remainingSeconds
            + "s";

    }


    return
        remainingSeconds
        + " sec";

}



/* ============================================= */
/* FORMAT TIME */
/* ============================================= */

function formatTime(
    timestamp
) {


    if (
        !timestamp
    ) {

        return "";

    }


    try {


        const date =
            new Date(
                timestamp
            );


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return timestamp;

        }


        return date
            .toLocaleString();


    }
    catch (
        error
    ) {


        return timestamp;

    }

}



/* ============================================= */
/* SHOW LOADING */
/* ============================================= */

function showLoading() {


    loading.style.display =
        "block";


    emptyState.style.display =
        "none";


    callList.innerHTML =
        "";

}



/* ============================================= */
/* HIDE LOADING */
/* ============================================= */

function hideLoading() {


    loading.style.display =
        "none";

}



/* ============================================= */
/* SHOW ERROR */
/* ============================================= */

function showError() {


    emptyState.style.display =
        "block";


    emptyState.innerHTML =
        `

        <div
            class="empty-icon"
        >
            ⚠️
        </div>


        <h3>
            Unable to Load Call Logs
        </h3>


        <p>
            Please check your backend API.
        </p>

        `;

}



/* ============================================= */
/* GO BACK */
/* ============================================= */

function goBack() {


    window.history.back();

}



/* ============================================= */
/* ESCAPE HTML */
/* ============================================= */

function escapeHtml(
    text
) {


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}