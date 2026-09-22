const token = localStorage.getItem("token");


function authHeaders(extra = {}) {

    return Object.assign(
        {
            "Authorization":
                "Bearer " + token
        },
        extra
    );
}


function showMessage(message) {

    const box =
        document.getElementById(
            "pageMessage"
        );

    if (!box) {
        return;
    }

    box.textContent = message;

    box.classList.remove(
        "hidden"
    );
}


function clearMessage() {

    const box =
        document.getElementById(
            "pageMessage"
        );

    if (!box) {
        return;
    }

    box.textContent = "";

    box.classList.add(
        "hidden"
    );
}


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


function formatValue(value) {

    return value === null ||
           value === undefined ||
           value === ""
        ? "-"
        : escapeHtml(value);
}


async function apiRequest(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
            {
                ...options,

                headers:
                    authHeaders(
                        options.headers || {}
                    )
            }
        );


    if (response.status === 401) {

        localStorage.removeItem(
            "token"
        );

        window.location.replace(
            "/login.html"
        );

        return null;
    }


    if (response.status === 403) {

        showMessage(
            "Access denied. An ADMIN account is required."
        );

        return null;
    }


    const text =
        await response.text();


    let data = {};


    if (text) {

        try {

            data =
                JSON.parse(text);

        } catch {

            data = text;
        }
    }


    if (!response.ok) {

        throw new Error(
            (data && data.message) ||
            (
                typeof data === "string"
                    ? data
                    : "Request failed"
            )
        );
    }


    return data;
}


/* =====================================================
   VERIFY ADMIN
===================================================== */

async function verifyAdmin() {

    if (!token) {

        window.location.replace(
            "/login.html"
        );

        return false;
    }


    try {

        const user =
            await apiRequest(
                "/user/me"
            );


        if (
            !user ||
            String(user.role)
                .toUpperCase() !== "ADMIN"
        ) {

            window.location.replace(
                "/index.html"
            );

            return false;
        }


        document.getElementById(
            "adminUserLabel"
        ).textContent =
            "ADMIN: " + user.username;


        return true;

    } catch (error) {

        console.error(
            "ADMIN CHECK ERROR:",
            error
        );

        localStorage.removeItem(
            "token"
        );

        window.location.replace(
            "/login.html"
        );

        return false;
    }
}


/* =====================================================
   SECTION NAVIGATION
===================================================== */

function showSection(section) {

    const sections = [
    "dashboard",
    "users",
    "messages",
    "calls",
    "friendRequests",
    "blocks"
];


    sections.forEach(
        function(name) {

            const element =
                document.getElementById(
                    name + "Section"
                );


            if (element) {

                element.classList.toggle(
                    "active-section",
                    name === section
                );
            }
        }
    );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            function(button) {

                button.classList.toggle(
                    "active",
                    button.dataset.section ===
                    section
                );
            }
        );


    const titles = {

    dashboard: [
        "Dashboard",
        "Application overview"
    ],

    users: [
        "User Management",
        "Users and account records"
    ],

    messages: [
        "Message Management",
        "Application message records"
    ],

    calls: [
        "Call History",
        "Voice and video call records"
    ],

    friendRequests: [
        "Friend Requests",
        "Friend request records"
    ],

    blocks: [
        "User Blocks",
        "User blocking records"
    ]
};

    document.getElementById(
        "pageTitle"
    ).textContent =
        titles[section][0];


    document.getElementById(
        "pageSubtitle"
    ).textContent =
        titles[section][1];


    clearMessage();


    if (section === "dashboard") {
        loadDashboard();
    }

    if (section === "users") {
        loadUsers();
    }

    if (section === "messages") {
        loadMessages();
    }

    if (section === "calls") {
        loadCalls();
    }
    if (section === "friendRequests") {
    loadFriendRequests();
}

if (section === "blocks") {
    loadBlocks();
}
}


/* =====================================================
   DASHBOARD
===================================================== */

async function loadDashboard() {

    try {

        clearMessage();


        const data =
            await apiRequest(
                "/admin/dashboard"
            );


        if (!data) {
            return;
        }


        document.getElementById(
            "totalUsers"
        ).textContent =
            data.totalUsers ?? 0;


        document.getElementById(
            "onlineUsers"
        ).textContent =
            data.onlineUsers ?? 0;


        document.getElementById(
            "offlineUsers"
        ).textContent =
            data.offlineUsers ?? 0;


        document.getElementById(
            "totalMessages"
        ).textContent =
            data.totalMessages ?? 0;


        document.getElementById(
            "totalFriendRequests"
        ).textContent =
            data.totalFriendRequests ?? 0;


        document.getElementById(
            "totalCalls"
        ).textContent =
            data.totalCalls ?? 0;

    } catch (error) {

        console.error(
            "DASHBOARD ERROR:",
            error
        );

        showMessage(
            error.message
        );
    }
}


/* =====================================================
   USERS
===================================================== */

async function loadUsers(
    url = "/admin/users"
) {

    try {

        clearMessage();


        const users =
            await apiRequest(url);


        if (!users) {
            return;
        }


        const tbody =
            document.getElementById(
                "usersTableBody"
            );


        tbody.innerHTML = "";


        if (!users.length) {

            tbody.innerHTML =
                `
                <tr>
                    <td
                        class="empty-row"
                        colspan="8"
                    >
                        No users found.
                    </td>
                </tr>
                `;

            return;
        }


        users.forEach(
            function(user) {

                const tr =
                    document.createElement(
                        "tr"
                    );


                tr.innerHTML =
                    `
                    <td>
                        ${formatValue(
                            user.id
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            user.username
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            user.displayName
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            user.email
                        )}
                    </td>

                   <td>
    ${formatValue(
        user.role
    )}
</td>


<td class="${
    user.accountEnabled !== false
        ? "status-online"
        : "status-offline"
}">

    ${
        user.accountEnabled !== false
            ? "ACTIVE"
            : "DEACTIVATED"
    }

</td>


<td class="${
    user.online
        ? "status-online"
        : "status-offline"
}">
                        ${
                            user.online
                                ? "ONLINE"
                                : "OFFLINE"
                        }
                    </td>

                    <td>
                        ${formatValue(
                            user.lastSeen
                        )}
                    </td>

                    <td>

    <div
        style="
            display:flex;
            gap:6px;
            flex-wrap:wrap;
        "
    >

        <button
            class="secondary-button"
            onclick="openEditUser(
                ${Number(user.id)}
            )"
        >
            Edit
        </button>


        <button
            class="primary-button"
            onclick="openChangeRole(
                ${Number(user.id)},
                '${escapeHtml(
                    user.username
                )}',
                '${escapeHtml(
                    user.role
                )}'
            )"
        >
            Role
        </button>


        ${
            user.accountEnabled !== false
                ?

                `
                <button
                    class="secondary-button"
                    onclick="deactivateUser(
                        ${Number(user.id)}
                    )"
                >
                    Deactivate
                </button>
                `

                :

                `
                <button
                    class="primary-button"
                    onclick="activateUser(
                        ${Number(user.id)}
                    )"
                >
                    Activate
                </button>
                `
        }


        <button
            class="danger-button"
            onclick="deleteUser(
                ${Number(user.id)}
            )"
        >
            Delete
        </button>

    </div>

</td>
                    `;


                tbody.appendChild(
                    tr
                );
            }
        );

    } catch (error) {

        console.error(
            "USERS ERROR:",
            error
        );

        showMessage(
            error.message
        );
    }
}
/* =====================================================
   CREATE USER FORM
===================================================== */

function toggleCreateUserForm() {

    const form =
        document.getElementById(
            "createUserForm"
        );


    if (!form) {
        return;
    }


    form.classList.toggle(
        "hidden"
    );
}


function clearCreateUserForm() {

    const username =
        document.getElementById(
            "createUsername"
        );


    const password =
        document.getElementById(
            "createPassword"
        );


    const role =
        document.getElementById(
            "createRole"
        );


    if (username) {
        username.value = "";
    }


    if (password) {
        password.value = "";
    }


    if (role) {
        role.value = "USER";
    }
}


/* =====================================================
   CREATE USER
===================================================== */

async function createUser() {

    const usernameInput =
        document.getElementById(
            "createUsername"
        );


    const passwordInput =
        document.getElementById(
            "createPassword"
        );


    const roleInput =
        document.getElementById(
            "createRole"
        );


    if (
        !usernameInput ||
        !passwordInput ||
        !roleInput
    ) {

        return;
    }


    const username =
        usernameInput.value.trim();


    const password =
        passwordInput.value;


    const role =
        roleInput.value;


    // =================================================
    // VALIDATION
    // =================================================

    if (!username) {

        showMessage(
            "Username is required."
        );

        usernameInput.focus();

        return;
    }


    if (!password) {

        showMessage(
            "Password is required."
        );

        passwordInput.focus();

        return;
    }


    if (
        password.length < 6
    ) {

        showMessage(
            "Password must contain at least 6 characters."
        );

        passwordInput.focus();

        return;
    }


    if (
        role !== "USER" &&
        role !== "ADMIN"
    ) {

        showMessage(
            "Invalid role selected."
        );

        return;
    }


    try {

        clearMessage();


        const result =
            await apiRequest(
                "/user/join",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username:
                            username,

                        password:
                            password,

                        role:
                            role
                    })
                }
            );


        if (!result) {
            return;
        }


        showMessage(
            "User created successfully: " +
            result.username
        );


        clearCreateUserForm();


        const form =
            document.getElementById(
                "createUserForm"
            );


        if (form) {

            form.classList.add(
                "hidden"
            );
        }


        await loadUsers();

        await loadDashboard();

    } catch (error) {

        console.error(
            "CREATE USER ERROR:",
            error
        );


        showMessage(
            error.message
        );
    }
}

async function searchUsers() {

    const username =
        document.getElementById(
            "userSearchInput"
        ).value.trim();


    if (!username) {

        await loadUsers();

        return;
    }


    await loadUsers(
        "/admin/users/search?username=" +
        encodeURIComponent(username)
    );
}


async function deleteUser(
    userId
) {

    if (
        !confirm(
            "Delete this user and the user's related chat data?"
        )
    ) {
        return;
    }


    try {

        const result =
            await apiRequest(
                "/admin/users/" + userId,
                {
                    method: "DELETE"
                }
            );


        if (!result) {
            return;
        }


        showMessage(
            result
        );


        await loadUsers();

        await loadDashboard();

    } catch (error) {

        console.error(
            "DELETE USER ERROR:",
            error
        );

        showMessage(
            error.message
        );
    }
}


/* =====================================================
   MESSAGES
===================================================== */

async function loadMessages(
  url = "/admin/messages") {

    try {

        clearMessage();


        const messages =
            await apiRequest(
                "/admin/messages"
            );


        if (!messages) {
            return;
        }


        const tbody =
            document.getElementById(
                "messagesTableBody"
            );


        tbody.innerHTML = "";


        if (!messages.length) {

            tbody.innerHTML =
                `
                <tr>
                    <td
                        class="empty-row"
                        colspan="8"
                    >
                        No messages found.
                    </td>
                </tr>
                `;

            return;
        }


        messages.forEach(
            function(message) {

                const tr =
                    document.createElement(
                        "tr"
                    );


                tr.innerHTML =
                    `
                    <td>
                        ${formatValue(
                            message.id
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            message.sender?.username
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            message.receiver?.username
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            message.messageType
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            message.status
                        )}
                    </td>

                    <td class="content-cell">
                        ${formatValue(
                            message.content
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            message.timestamp
                        )}
                    </td>

<td>

    <div
        style="
            display:flex;
            gap:6px;
            flex-wrap:wrap;
        "
    >

        <button
            class="secondary-button"
            onclick="openMessageDetails(
                ${Number(message.id)}
            )"
        >
            Details
        </button>


        <button
            class="danger-button"
            onclick="deleteMessageRecord(
                ${Number(message.id)}
            )"
        >
            Delete
        </button>

    </div>

</td>                    `;


                tbody.appendChild(
                    tr
                );
            }
        );

    } catch (error) {

        console.error(
            "MESSAGES ERROR:",
            error
        );

        showMessage(
            error.message
        );
    }
}


async function deleteMessageRecord(
    messageId
) {

    if (
        !confirm(
            "Delete this message record?"
        )
    ) {
        return;
    }


    try {

        const result =
            await apiRequest(
                "/admin/messages/" +
                messageId,
                {
                    method: "DELETE"
                }
            );


        if (!result) {
            return;
        }


        showMessage(
            result
        );


        await loadMessages();

        await loadDashboard();

    } catch (error) {

        console.error(
            "DELETE MESSAGE ERROR:",
            error
        );

        showMessage(
            error.message
        );
    }
}


/* =====================================================
   CALL HISTORY
===================================================== */

async function loadCalls(url = "/admin/calls") {

    try {

        clearMessage();


        const calls =
            await apiRequest(
                url
            );


        if (!calls) {
            return;
        }


        const tbody =
            document.getElementById(
                "callsTableBody"
            );


        tbody.innerHTML = "";


        if (!calls.length) {

            tbody.innerHTML =
                `
                <tr>
                    <td
                        class="empty-row"
                        colspan="9"
                    >
                        No call history found.
                    </td>
                </tr>
                `;

            return;
        }


        calls.forEach(
            function(call) {

                const duration =
                    call.callDuration == null
                        ? "-"
                        : call.callDuration +
                          " sec";


                const tr =
                    document.createElement(
                        "tr"
                    );


                tr.innerHTML =
                    `
                    <td>
                        ${formatValue(
                            call.id
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            call.sender?.username
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            call.receiver?.username
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            call.callType
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            call.callDirection
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            call.callStatus
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            duration
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            call.timestamp
                        )}
                    </td>

                    <td>

    <div
        style="
            display:flex;
            gap:6px;
            flex-wrap:wrap;
        "
    >

        <button
            class="secondary-button"
            onclick="openCallDetails(
                ${Number(call.id)}
            )"
        >
            Details
        </button>


        <button
            class="danger-button"
            onclick="deleteCall(
                ${Number(call.id)}
            )"
        >
            Delete
        </button>

    </div>

</td>
                    `;


                tbody.appendChild(
                    tr
                );
            }
        );

    } catch (error) {

        console.error(
            "CALLS ERROR:",
            error
        );

        showMessage(
            error.message
        );
    }
}


async function deleteCall(
    callId
) {

    if (
        !confirm(
            "Delete this call history record?"
        )
    ) {
        return;
    }


    try {

        const result =
            await apiRequest(
                "/admin/calls/" +
                callId,
                {
                    method: "DELETE"
                }
            );


        if (!result) {
            return;
        }


        showMessage(
            result
        );


        await loadCalls();

        await loadDashboard();

    } catch (error) {

        console.error(
            "DELETE CALL ERROR:",
            error
        );

        showMessage(
            error.message
        );
    }
}


/* =====================================================
   LOGOUT
===================================================== */

function logoutAdmin() {

    localStorage.removeItem(
        "token"
    );

    window.location.replace(
        "/login.html"
    );
}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        document
            .querySelectorAll(
                ".nav-item"
            )
            .forEach(
                function(button) {

                    button.addEventListener(
                        "click",
                        function() {

                            showSection(
                                button.dataset.section
                            );
                        }
                    );
                }
            );


        document.getElementById(
            "logoutButton"
        ).addEventListener(
            "click",
            logoutAdmin
        );


        document.getElementById(
            "userSearchInput"
        ).addEventListener(
            "keydown",
            function(event) {

                if (event.key === "Enter") {

                    searchUsers();
                }
            }
        );


        const ok =
            await verifyAdmin();


        if (!ok) {
            return;
        }


        await loadDashboard();
    }
);
/* =====================================================
   EDIT USER
===================================================== */

async function openEditUser(
    userId
) {

    try {

        clearMessage();


        const user =
            await apiRequest(
                "/admin/users/" +
                userId
            );


        if (!user) {
            return;
        }


        document.getElementById(
            "editUserId"
        ).value =
            user.id;


        document.getElementById(
            "editUsername"
        ).value =
            user.username || "";


        document.getElementById(
            "editDisplayName"
        ).value =
            user.displayName || "";


        document.getElementById(
            "editEmail"
        ).value =
            user.email || "";


        document.getElementById(
            "editBio"
        ).value =
            user.bio || "";


       const editModal =
    document.getElementById(
        "editUserModal"
    );

editModal.classList.remove(
    "hidden"
);

editModal.style.display =
    "flex";

    } catch (error) {

        console.error(
            "OPEN EDIT USER ERROR:",
            error
        );

        showMessage(
            error.message
        );
    }
}


function closeEditUserModal() {

    const modal =
        document.getElementById(
            "editUserModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );

    modal.style.display = "none";
}


/* =====================================================
   SAVE EDITED USER
===================================================== */

async function saveEditedUser() {

    const userId =
        document.getElementById(
            "editUserId"
        ).value;


    const displayName =
        document.getElementById(
            "editDisplayName"
        ).value.trim();


    const email =
        document.getElementById(
            "editEmail"
        ).value.trim();


    const bio =
        document.getElementById(
            "editBio"
        ).value.trim();


    if (!userId) {

        showMessage(
            "User ID is missing."
        );

        return;
    }


    if (
        displayName.length > 100
    ) {

        showMessage(
            "Display name must be 100 characters or fewer."
        );

        return;
    }


    if (
        email.length > 120
    ) {

        showMessage(
            "Email must be 120 characters or fewer."
        );

        return;
    }


    if (
        bio.length > 500
    ) {

        showMessage(
            "Bio must be 500 characters or fewer."
        );

        return;
    }


    try {

        const result =
            await apiRequest(
                "/admin/users/" +
                userId,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        displayName:
                            displayName,

                        email:
                            email,

                        bio:
                            bio
                    })
                }
            );


        if (!result) {
            return;
        }


        closeEditUserModal();


        showMessage(
            "User profile updated successfully."
        );


        await loadUsers();

    } catch (error) {

        console.error(
            "SAVE EDIT USER ERROR:",
            error
        );

        showMessage(
            error.message
        );
    }
}


/* =====================================================
   CHANGE ROLE
===================================================== */

function openChangeRole(
    userId,
    username,
    currentRole
) {

    document.getElementById(
        "roleUserId"
    ).value =
        userId;


    document.getElementById(
        "roleUsername"
    ).value =
        username;


    document.getElementById(
        "roleValue"
    ).value =
        currentRole || "USER";


    const roleModal =
    document.getElementById(
        "changeRoleModal"
    );

roleModal.classList.remove(
    "hidden"
);

roleModal.style.display =
    "flex";
}


function closeChangeRoleModal() {

    const modal =
        document.getElementById(
            "changeRoleModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );

    modal.style.display = "none";
}


/* =====================================================
   SAVE USER ROLE
===================================================== */

async function saveUserRole() {

    const userId =
        document.getElementById(
            "roleUserId"
        ).value;


    const role =
        document.getElementById(
            "roleValue"
        ).value;


    if (!userId) {

        showMessage(
            "User ID is missing."
        );

        return;
    }


    if (
        role !== "USER" &&
        role !== "ADMIN"
    ) {

        showMessage(
            "Invalid role."
        );

        return;
    }


    /*
     * Prevent accidental removal of the
     * currently logged-in ADMIN role.
     */

    const currentUsername =
        document.getElementById(
            "adminUserLabel"
        ).textContent
            .replace(
                "ADMIN:",
                ""
            )
            .trim();


    const selectedUsername =
        document.getElementById(
            "roleUsername"
        ).value;


    if (
        currentUsername &&
        currentUsername === selectedUsername &&
        role !== "ADMIN"
    ) {

        showMessage(
            "The currently logged-in admin cannot change their own role to USER."
        );

        return;
    }


    try {

        const result =
            await apiRequest(
                "/admin/users/" +
                userId +
                "/role",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        role: role
                    })
                }
            );


        if (!result) {
            return;
        }


        closeChangeRoleModal();


        showMessage(
            "User role updated successfully."
        );


        await loadUsers();

        await loadDashboard();

    } catch (error) {

        console.error(
            "CHANGE ROLE ERROR:",
            error
        );

        showMessage(
            error.message
        );
    }
}
/* =====================================================
   DEACTIVATE USER
===================================================== */

async function deactivateUser(
    userId
) {

    if (
        !confirm(
            "Deactivate this user? The user will not be able to login."
        )
    ) {

        return;
    }


    await updateUserAccountStatus(
        userId,
        false
    );
}


/* =====================================================
   ACTIVATE USER
===================================================== */

async function activateUser(
    userId
) {

    if (
        !confirm(
            "Activate this user?"
        )
    ) {

        return;
    }


    await updateUserAccountStatus(
        userId,
        true
    );
}


/* =====================================================
   UPDATE ACCOUNT STATUS
===================================================== */

async function updateUserAccountStatus(
    userId,
    enabled
) {

    try {

        clearMessage();


        const result =
            await apiRequest(
                "/admin/users/" +
                userId +
                "/status?enabled=" +
                enabled,
                {
                    method: "PUT"
                }
            );


        if (!result) {
            return;
        }


        showMessage(
            enabled
                ? "User activated successfully."
                : "User deactivated successfully."
        );


        await loadUsers();

        await loadDashboard();

    } catch (error) {

        console.error(
            "ACCOUNT STATUS ERROR:",
            error
        );


        showMessage(
            error.message
        );
    }
}
/* =====================================================
   MESSAGE FILTERS
===================================================== */

async function filterMessages() {

    const keyword =
        document.getElementById(
            "messageKeyword"
        ).value.trim();


    const sender =
        document.getElementById(
            "messageSender"
        ).value.trim();


    const receiver =
        document.getElementById(
            "messageReceiver"
        ).value.trim();


    const messageType =
        document.getElementById(
            "messageTypeFilter"
        ).value;


    const status =
        document.getElementById(
            "messageStatusFilter"
        ).value;


    const params =
        new URLSearchParams();


    if (keyword) {

        params.append(
            "keyword",
            keyword
        );
    }


    if (sender) {

        params.append(
            "sender",
            sender
        );
    }


    if (receiver) {

        params.append(
            "receiver",
            receiver
        );
    }


    if (messageType) {

        params.append(
            "messageType",
            messageType
        );
    }


    if (status) {

        params.append(
            "status",
            status
        );
    }


    let url =
        "/admin/messages/search";


    const query =
        params.toString();


    if (query) {

        url += "?" + query;
    }


    await loadMessages(
        url
    );
}


/* =====================================================
   CLEAR MESSAGE FILTERS
===================================================== */

async function clearMessageFilters() {

    document.getElementById(
        "messageKeyword"
    ).value = "";


    document.getElementById(
        "messageSender"
    ).value = "";


    document.getElementById(
        "messageReceiver"
    ).value = "";


    document.getElementById(
        "messageTypeFilter"
    ).value = "";


    document.getElementById(
        "messageStatusFilter"
    ).value = "";


    await loadMessages();
}
/* =====================================================
   MESSAGE DETAILS
===================================================== */

async function openMessageDetails(
    messageId
) {

    try {

        clearMessage();


        const message =
            await apiRequest(
                "/admin/messages/" +
                messageId
            );


        if (!message) {
            return;
        }


        const sender =
            message.sender?.username ||
            "-";


        const receiver =
            message.receiver?.username ||
            "-";


        document.getElementById(
            "detailMessageId"
        ).textContent =
            message.id ?? "-";


        document.getElementById(
            "detailSender"
        ).textContent =
            sender;


        document.getElementById(
            "detailReceiver"
        ).textContent =
            receiver;


        document.getElementById(
            "detailMessageType"
        ).textContent =
            message.messageType || "-";


        document.getElementById(
            "detailStatus"
        ).textContent =
            message.status || "-";


        document.getElementById(
            "detailTimestamp"
        ).textContent =
            message.timestamp || "-";


        document.getElementById(
            "detailFileName"
        ).textContent =
            message.fileName || "-";


        document.getElementById(
            "detailForwarded"
        ).textContent =
            message.forwarded
                ? "YES"
                : "NO";


        document.getElementById(
            "detailEdited"
        ).textContent =
            message.edited
                ? "YES"
                : "NO";


        document.getElementById(
            "detailCallType"
        ).textContent =
            message.callType || "-";


        document.getElementById(
            "detailCallStatus"
        ).textContent =
            message.callStatus || "-";


        document.getElementById(
            "detailCallDuration"
        ).textContent =
            message.callDuration == null
                ? "-"
                : message.callDuration +
                  " seconds";


        document.getElementById(
            "detailContent"
        ).textContent =
            message.content || "-";


        document.getElementById(
            "detailReplyContent"
        ).textContent =
            message.replyToContent || "-";


        const deleteButton =
            document.getElementById(
                "detailDeleteButton"
            );


        deleteButton.onclick =
            async function() {

                await deleteMessageRecord(
                    message.id
                );

                closeMessageDetailsModal();
            };


        document.getElementById(
            "messageDetailsModal"
        ).classList.remove(
            "hidden"
        );


        document.getElementById(
            "messageDetailsModal"
        ).style.display =
            "flex";

    } catch (error) {

        console.error(
            "MESSAGE DETAILS ERROR:",
            error
        );

        showMessage(
            error.message
        );
    }
}


function closeMessageDetailsModal() {

    const modal =
        document.getElementById(
            "messageDetailsModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );


    modal.style.display =
        "none";
}

/* =====================================================
   CALL FILTERS
===================================================== */

async function filterCalls() {

    const username =
        document.getElementById(
            "callUsernameFilter"
        ).value.trim();


    const callType =
        document.getElementById(
            "callTypeFilter"
        ).value;


    const callDirection =
        document.getElementById(
            "callDirectionFilter"
        ).value;


    const callStatus =
        document.getElementById(
            "callStatusFilter"
        ).value;


    const params =
        new URLSearchParams();


    if (username) {

        params.append(
            "username",
            username
        );
    }


    if (callType) {

        params.append(
            "callType",
            callType
        );
    }


    if (callDirection) {

        params.append(
            "callDirection",
            callDirection
        );
    }


    if (callStatus) {

        params.append(
            "callStatus",
            callStatus
        );
    }


    let url =
        "/admin/calls/search";


    const query =
        params.toString();


    if (query) {

        url += "?" + query;
    }


    await loadCalls(
        url
    );
}


/* =====================================================
   CLEAR CALL FILTERS
===================================================== */

async function clearCallFilters() {

    document.getElementById(
        "callUsernameFilter"
    ).value = "";


    document.getElementById(
        "callTypeFilter"
    ).value = "";


    document.getElementById(
        "callDirectionFilter"
    ).value = "";


    document.getElementById(
        "callStatusFilter"
    ).value = "";


    await loadCalls();
}
/* =====================================================
   CALL DETAILS
===================================================== */

async function openCallDetails(
    callId
) {

    try {

        clearMessage();


        const call =
            await apiRequest(
                "/admin/calls/" +
                callId
            );


        if (!call) {
            return;
        }


        const caller =
            call.sender?.username ||
            "-";


        const receiver =
            call.receiver?.username ||
            "-";


        document.getElementById(
            "detailCallId"
        ).textContent =
            call.id ?? "-";


        document.getElementById(
            "detailCallCaller"
        ).textContent =
            caller;


        document.getElementById(
            "detailCallReceiver"
        ).textContent =
            receiver;


        document.getElementById(
            "detailCallTypeValue"
        ).textContent =
            call.callType || "-";


        document.getElementById(
            "detailCallDirection"
        ).textContent =
            call.callDirection || "-";


        document.getElementById(
            "detailCallStatusValue"
        ).textContent =
            call.callStatus || "-";


        document.getElementById(
            "detailCallDurationValue"
        ).textContent =
            call.callDuration == null
                ? "0 seconds"
                : call.callDuration +
                  " seconds";


        document.getElementById(
            "detailCallTimestamp"
        ).textContent =
            call.timestamp || "-";


        const deleteButton =
            document.getElementById(
                "detailCallDeleteButton"
            );


        deleteButton.onclick =
            async function() {

                await deleteCall(
                    call.id
                );

                closeCallDetailsModal();
            };


        const modal =
            document.getElementById(
                "callDetailsModal"
            );


        modal.classList.remove(
            "hidden"
        );


        modal.style.display =
            "flex";

    } catch (error) {

        console.error(
            "CALL DETAILS ERROR:",
            error
        );


        showMessage(
            error.message
        );
    }
}


function closeCallDetailsModal() {

    const modal =
        document.getElementById(
            "callDetailsModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );


    modal.style.display =
        "none";
}
/* =====================================================
   FRIEND REQUEST MANAGEMENT
===================================================== */

async function loadFriendRequests(
    url = "/admin/friend-requests"
) {

    try {

        clearMessage();


        const requests =
            await apiRequest(
                url
            );


        if (!requests) {
            return;
        }


        const tbody =
            document.getElementById(
                "friendRequestsTableBody"
            );


        tbody.innerHTML = "";


        if (!requests.length) {

            tbody.innerHTML =
                `
                <tr>

                    <td
                        class="empty-row"
                        colspan="7"
                    >
                        No friend requests found.
                    </td>

                </tr>
                `;

            return;
        }


        requests.forEach(
            function(request) {

                const tr =
                    document.createElement(
                        "tr"
                    );


                tr.innerHTML =
                    `
                    <td>
                        ${formatValue(
                            request.id
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            request.sender?.username
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            request.receiver?.username
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            request.status
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            request.createdAt
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            request.updatedAt
                        )}
                    </td>

                    <td>

                        <button
                            class="danger-button"
                            onclick="deleteFriendRequest(
                                ${Number(request.id)}
                            )"
                        >
                            Delete
                        </button>

                    </td>
                    `;


                tbody.appendChild(
                    tr
                );
            }
        );

    } catch (error) {

        console.error(
            "FRIEND REQUEST ERROR:",
            error
        );


        showMessage(
            error.message
        );
    }
}


async function filterFriendRequests() {

    const username =
        document.getElementById(
            "friendRequestUsername"
        ).value.trim();


    const status =
        document.getElementById(
            "friendRequestStatus"
        ).value;


    const params =
        new URLSearchParams();


    if (username) {

        params.append(
            "username",
            username
        );
    }


    if (status) {

        params.append(
            "status",
            status
        );
    }


    let url =
        "/admin/friend-requests/search";


    const query =
        params.toString();


    if (query) {

        url += "?" + query;
    }


    await loadFriendRequests(
        url
    );
}


async function clearFriendRequestFilters() {

    document.getElementById(
        "friendRequestUsername"
    ).value = "";


    document.getElementById(
        "friendRequestStatus"
    ).value = "";


    await loadFriendRequests();
}


async function deleteFriendRequest(
    requestId
) {

    if (
        !confirm(
            "Delete this friend request?"
        )
    ) {

        return;
    }


    try {

        const result =
            await apiRequest(
                "/admin/friend-requests/" +
                requestId,
                {
                    method: "DELETE"
                }
            );


        if (!result) {
            return;
        }


        showMessage(
            result
        );


        await loadFriendRequests();

        await loadDashboard();

    } catch (error) {

        console.error(
            "DELETE FRIEND REQUEST ERROR:",
            error
        );


        showMessage(
            error.message
        );
    }
}
/* =====================================================
   USER BLOCK MANAGEMENT
===================================================== */

async function loadBlocks(
    url = "/admin/blocks"
) {

    try {

        clearMessage();


        const blocks =
            await apiRequest(
                url
            );


        if (!blocks) {
            return;
        }


        const tbody =
            document.getElementById(
                "blocksTableBody"
            );


        tbody.innerHTML = "";


        if (!blocks.length) {

            tbody.innerHTML =
                `
                <tr>

                    <td
                        class="empty-row"
                        colspan="4"
                    >
                        No blocks found.
                    </td>

                </tr>
                `;

            return;
        }


        blocks.forEach(
            function(block) {

                const tr =
                    document.createElement(
                        "tr"
                    );


                tr.innerHTML =
                    `
                    <td>
                        ${formatValue(
                            block.id
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            block.blockerUsername
                        )}
                    </td>

                    <td>
                        ${formatValue(
                            block.blockedUsername
                        )}
                    </td>

                    <td>

                        <button
                            class="danger-button"
                            onclick="deleteBlock(
                                ${Number(block.id)}
                            )"
                        >
                            Remove Block
                        </button>

                    </td>
                    `;


                tbody.appendChild(
                    tr
                );
            }
        );

    } catch (error) {

        console.error(
            "BLOCKS ERROR:",
            error
        );


        showMessage(
            error.message
        );
    }
}


async function filterBlocks() {

    const username =
        document.getElementById(
            "blockUsernameFilter"
        ).value.trim();


    if (!username) {

        await loadBlocks();

        return;
    }


    await loadBlocks(
        "/admin/blocks/search?username=" +
        encodeURIComponent(
            username
        )
    );
}


async function clearBlockFilters() {

    document.getElementById(
        "blockUsernameFilter"
    ).value = "";


    await loadBlocks();
}


async function deleteBlock(
    blockId
) {

    if (
        !confirm(
            "Remove this block relationship?"
        )
    ) {

        return;
    }


    try {

        const result =
            await apiRequest(
                "/admin/blocks/" +
                blockId,
                {
                    method: "DELETE"
                }
            );


        if (!result) {
            return;
        }


        showMessage(
            result
        );


        await loadBlocks();

    } catch (error) {

        console.error(
            "DELETE BLOCK ERROR:",
            error
        );


        showMessage(
            error.message
        );
    }
}