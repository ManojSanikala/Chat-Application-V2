/* ============================================= */
/* API CONFIGURATION */
/* ============================================= */


/*
 * Change this endpoint only if your
 * Spring Boot controller uses a
 * different endpoint.
 */

const CALL_HISTORY_API =
    "/api/messages/history";



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



/* ============================================= */
/* LOAD CALL LOGS */
/* ============================================= */

async function loadCallLogs() {


    showLoading();


    try {


        console.log(
            "Loading call history..."
        );


        const response =
            await fetch(
                CALL_HISTORY_API
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Failed to load call history"
            );

        }


        const messages =
            await response.json();


        console.log(
            "All Messages:",
            messages
        );


        /*
         * =====================================
         * FILTER ONLY CALL MESSAGES
         * =====================================
         */

        const calls =
            messages.filter(
                message =>
                    message.messageType
                        &&
                    message.messageType
                        .toUpperCase()
                        === "CALL"
            );


        console.log(
            "Call Logs:",
            calls
        );


        /*
         * =====================================
         * SORT NEWEST FIRST
         * =====================================
         */

        calls.sort(
            (a, b) => {

                return b.id - a.id;

            }
        );


        updateSummary(
            calls
        );


        renderCallLogs(
            calls
        );


    }
    catch (
        error
    ) {


        console.error(
            "Error loading calls:",
            error
        );


        hideLoading();


        showError();


    }

}



/* ============================================= */
/* RENDER CALL LOGS */
/* ============================================= */

function renderCallLogs(
    calls
) {


    hideLoading();


    callList.innerHTML =
        "";


    if (
        !calls
        ||
        calls.length === 0
    ) {


        emptyState.style.display =
            "block";


        return;

    }


    emptyState.style.display =
        "none";


    calls.forEach(
        call => {


            const callItem =
                document.createElement(
                    "div"
                );


            callItem.className =
                "call-item";


            /*
             * =================================
             * CALL TYPE
             * =================================
             */

            const callType =
                call.callType
                ||
                "VOICE";


            let callIcon =
                "📞";


            if (
                callType
                    .toUpperCase()
                    === "VIDEO"
            ) {

                callIcon =
                    "📹";

            }



            /*
             * =================================
             * CALL STATUS
             * =================================
             */

            const callStatus =
                call.callStatus
                ||
                "COMPLETED";


            const statusClass =
                callStatus
                    .toLowerCase();



            /*
             * =================================
             * CALL DIRECTION
             * =================================
             */

            const callDirection =
                call.callDirection
                ||
                "OUTGOING";


            let directionText =
                "";


            if (
                callDirection
                    .toUpperCase()
                    === "INCOMING"
            ) {

                directionText =
                    "↙ Incoming";

            }
            else {

                directionText =
                    "↗ Outgoing";

            }



            /*
             * =================================
             * DURATION
             * =================================
             */

            const duration =
                formatDuration(
                    call.callDuration
                );



            /*
             * =================================
             * TIME
             * =================================
             */

            const callTime =
                formatTime(
                    call.timestamp
                );



            /*
             * =================================
             * MISSED CLASS
             * =================================
             */

            let iconClass =
                "call-icon";


            if (
                callStatus
                    .toUpperCase()
                    === "MISSED"
            ) {

                iconClass +=
                    " missed";

            }



            /*
             * =================================
             * HTML
             * =================================
             */

            callItem.innerHTML =
                `

                <div
                    class="${iconClass}"
                >

                    ${callIcon}

                </div>


                <div
                    class="call-details"
                >


                    <div
                        class="call-name"
                    >

                        ${escapeHtml(
                            call.sender
                            ||
                            "Unknown"
                        )}

                    </div>


                    <div
                        class="call-info"
                    >


                        <span>

                            ${directionText}

                        </span>


                        <span>

                            ${callType}

                        </span>


                        <span>

                            ${duration}

                        </span>


                    </div>


                    <div
                        class="
                            call-status
                            ${statusClass}
                        "
                    >

                        ${callStatus}

                    </div>


                </div>


                <div
                    class="call-time"
                >

                    ${callTime}

                </div>

                `;


            callList.appendChild(
                callItem
            );


        }
    );

}



/* ============================================= */
/* UPDATE SUMMARY */
/* ============================================= */

function updateSummary(
    calls
) {


    const total =
        calls.length;


    const incoming =
        calls.filter(
            call =>

                call.callDirection
                    &&
                call.callDirection
                    .toUpperCase()
                    === "INCOMING"
        ).length;


    const outgoing =
        calls.filter(
            call =>

                !call.callDirection
                ||
                call.callDirection
                    .toUpperCase()
                    === "OUTGOING"
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