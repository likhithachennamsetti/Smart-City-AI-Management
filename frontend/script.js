const API_URL = "http://127.0.0.1:8000";

// =========================================================
// GLOBAL AI VARIABLES
// =========================================================

let detectedAIssue = "";
let detectedAIConfidence = 0;


// =========================================================
// REGISTER
// =========================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const phone = document.getElementById("registerPhone").value.trim();
        const password = document.getElementById("registerPassword").value;

        const message = document.getElementById("registerMessage");

        try {

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        phone: phone,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                if (message) {
                    message.textContent =
                        "Registration successful! You can now login.";
                }

                registerForm.reset();

            } else {

                if (message) {
                    message.textContent =
                        data.detail || "Registration failed.";
                }
            }

        } catch (error) {

            console.error("Registration error:", error);

            if (message) {
                message.textContent =
                    "Cannot connect to the backend server.";
            }
        }

    });

}


// =========================================================
// LOGIN
// =========================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");

        try {

            const formData = new URLSearchParams();

            formData.append("username", email);
            formData.append("password", password);

            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {

                if (message) {
                    message.textContent =
                        data.detail || "Login failed.";
                }

                return;
            }

            const token = data.access_token;

            localStorage.setItem(
                "access_token",
                token
            );

            console.log("JWT token saved.");

            const profileResponse = await fetch(
                `${API_URL}/auth/me`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

            const profile = await profileResponse.json();

            console.log("Logged-in user:", profile);

            if (!profileResponse.ok) {

                localStorage.removeItem("access_token");

                if (message) {
                    message.textContent =
                        "Unable to verify user role.";
                }

                return;
            }

            if (message) {
                message.textContent =
                    "Login successful!";
            }

            if (
                profile.role &&
                profile.role.toLowerCase() === "admin"
            ) {

                window.location.href = "admin.html";
                return;
            }

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error("Login error:", error);

            if (message) {
                message.textContent =
                    "Cannot connect to the backend server.";
            }
        }

    });

}


// =========================================================
// LOAD MY COMPLAINTS
// =========================================================

async function loadMyComplaints() {

    const token =
        localStorage.getItem("access_token");

    const complaintsList =
        document.getElementById("complaintsList");

    if (!complaintsList) {
        return;
    }

    if (!token) {

        complaintsList.innerHTML =
            "<p>Please login first.</p>";

        return;
    }

    complaintsList.innerHTML =
        "<p class='empty-message'>Loading complaints...</p>";

    try {

        const response = await fetch(
            `${API_URL}/complaints/`,
            {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            complaintsList.innerHTML =
                `<p class="empty-message">
                    ${data.detail || "Failed to load complaints."}
                </p>`;

            return;
        }

        if (!Array.isArray(data) || data.length === 0) {

            complaintsList.innerHTML =
                "<p class='empty-message'>No complaints found.</p>";

            return;
        }

        complaintsList.innerHTML = "";

        data.forEach(function (complaint) {

            const complaintDiv =
                document.createElement("div");

            complaintDiv.className =
                "complaint-item";

            const status =
                complaint.status || "pending";

            const pendingCompleted =
                status === "pending" ||
                status === "in_progress" ||
                status === "active" ||
                status === "resolved";

            const progressCompleted =
                status === "in_progress" ||
                status === "active" ||
                status === "resolved";

            const resolvedCompleted =
                status === "resolved";

            complaintDiv.innerHTML = `

                <h3>
                    Complaint #${complaint.id}
                </h3>

                <p>
                    <strong>Title:</strong>
                    ${complaint.title || "-"}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${complaint.description || "-"}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${complaint.category || "-"}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${complaint.location || "-"}
                </p>

                <p>
                    <strong>Status:</strong>
                    <span class="status-badge">
                        ${status}
                    </span>
                </p>

                <div class="status-tracker">

                    <div class="status-step ${
                        pendingCompleted ? "completed" : ""
                    }">

                        <span>1</span>
                        <small>Pending</small>

                    </div>

                    <div class="status-line"></div>

                    <div class="status-step ${
                        progressCompleted ? "completed" : ""
                    }">

                        <span>2</span>
                        <small>In Progress</small>

                    </div>

                    <div class="status-line"></div>

                    <div class="status-step ${
                        resolvedCompleted ? "completed" : ""
                    }">

                        <span>3</span>
                        <small>Resolved</small>

                    </div>

                </div>

                <p>
                    <strong>Priority:</strong>
                    ${complaint.priority || "medium"}
                </p>

                <button
                    type="button"
                    onclick="editComplaint(${complaint.id})">
                    Edit
                </button>

                <button
                    type="button"
                    onclick="deleteComplaint(${complaint.id})">
                    Delete
                </button>

            `;

            complaintsList.appendChild(complaintDiv);

        });

    } catch (error) {

        console.error(
            "Load complaints error:",
            error
        );

        complaintsList.innerHTML =
            "<p class='empty-message'>Cannot connect to backend server.</p>";
    }
}


// =========================================================
// RECENT COMPLAINTS
// =========================================================

async function loadRecentComplaints() {

    const token =
        localStorage.getItem("access_token");

    const container =
        document.getElementById("recentComplaintsList");

    if (!container || !token) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/complaints/`,
            {
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const complaints = await response.json();

        if (!response.ok || !Array.isArray(complaints)) {
            return;
        }

        const recent =
            complaints.slice(-5).reverse();

        if (recent.length === 0) {

            container.innerHTML =
                "<p class='empty-message'>No complaints yet.</p>";

            return;
        }

        container.innerHTML = "";

        recent.forEach(function (complaint) {

            const div =
                document.createElement("div");

            div.className =
                "recent-complaint-item";

            div.innerHTML = `

                <strong>
                    #${complaint.id}
                    ${complaint.title || "Complaint"}
                </strong>

                <p>
                    Status:
                    ${complaint.status || "pending"}
                </p>

            `;

            container.appendChild(div);

        });

    } catch (error) {

        console.error(
            "Recent complaints error:",
            error
        );
    }
}


// =========================================================
// CREATE MANUAL COMPLAINT
// =========================================================

const complaintForm =
    document.getElementById("complaintForm");

if (complaintForm) {

    complaintForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const token =
                localStorage.getItem("access_token");

            const message =
                document.getElementById("complaintMessage");

            if (!token) {

                if (message) {
                    message.textContent =
                        "Please login first.";
                }

                return;
            }

            const title =
                document.getElementById(
                    "complaintTitle"
                ).value.trim();

            const description =
                document.getElementById(
                    "complaintDescription"
                ).value.trim();

            const category =
                document.getElementById(
                    "complaintCategory"
                ).value.trim();

            const priority =
                document.getElementById(
                    "complaintPriority"
                ).value;

            const location =
                document.getElementById(
                    "complaintLocation"
                ).value.trim();

            try {

                const response = await fetch(
                    `${API_URL}/complaints/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            title: title,
                            description: description,
                            category: category,
                            priority: priority,
                            location: location
                        })
                    }
                );

                const data =
                    await response.json();

                if (response.ok) {

                    if (message) {

                        message.textContent =
                            `Complaint submitted successfully! Complaint ID: ${data.id}`;
                    }

                    complaintForm.reset();

                    loadMyComplaints();
                    loadRecentComplaints();
                    loadUserStatistics();

                } else {

                    if (message) {

                        message.textContent =
                            data.detail ||
                            "Failed to submit complaint.";
                    }
                }

            } catch (error) {

                console.error(
                    "Create complaint error:",
                    error
                );

                if (message) {

                    message.textContent =
                        "Cannot connect to backend server.";
                }
            }

        }
    );

}


// =========================================================
// DELETE COMPLAINT
// =========================================================

async function deleteComplaint(id) {

    const token =
        localStorage.getItem("access_token");

    if (!token) {

        alert("Please login first.");

        return;
    }

    if (
        !confirm(
            "Are you sure you want to delete this complaint?"
        )
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/complaints/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        if (response.ok) {

            alert(
                "Complaint deleted successfully."
            );

            loadMyComplaints();
            loadRecentComplaints();
            loadUserStatistics();

        } else {

            let data = {};

            try {
                data = await response.json();
            } catch (error) {
                console.log("No JSON response.");
            }

            alert(
                data.detail ||
                "Failed to delete complaint."
            );
        }

    } catch (error) {

        console.error(
            "Delete complaint error:",
            error
        );

        alert(
            "Cannot connect to backend server."
        );
    }
}


// =========================================================
// EDIT COMPLAINT
// =========================================================

async function editComplaint(id) {

    const token =
        localStorage.getItem("access_token");

    if (!token) {

        alert("Please login first.");

        return;
    }

    const title =
        prompt("Enter new complaint title:");

    if (title === null) {
        return;
    }

    const description =
        prompt("Enter new complaint description:");

    if (description === null) {
        return;
    }

    const category =
        prompt("Enter new complaint category:");

    if (category === null) {
        return;
    }

    const priority =
        prompt(
            "Enter priority: low, medium, or high"
        );

    if (priority === null) {
        return;
    }

    const cleanPriority =
        priority.toLowerCase().trim();

    if (
        !["low", "medium", "high"]
            .includes(cleanPriority)
    ) {

        alert(
            "Priority must be low, medium, or high."
        );

        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/complaints/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        title: title,
                        description: description,
                        category: category,
                        priority: cleanPriority
                    })
                }
            );

        const data =
            await response.json();

        if (response.ok) {

            alert(
                "Complaint updated successfully."
            );

            loadMyComplaints();
            loadRecentComplaints();
            loadUserStatistics();

        } else {

            alert(
                data.detail ||
                "Failed to update complaint."
            );
        }

    } catch (error) {

        console.error(
            "Edit complaint error:",
            error
        );

        alert(
            "Cannot connect to backend server."
        );
    }
}


// =========================================================
// LOGOUT
// =========================================================

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "index.html";
        }
    );
}


// =========================================================
// AI CIVIC ISSUE DETECTION
// =========================================================

async function detectCivicIssue(event) {

    console.log(
        "AI detection function started."
    );

    if (event) {

        event.preventDefault();
        event.stopPropagation();
    }

    const imageInput =
        document.getElementById("aiImage");

    const resultDiv =
        document.getElementById("aiResult");

    const aiComplaintForm =
        document.getElementById("aiComplaintForm");

    const descriptionInput =
        document.getElementById(
            "aiComplaintDescription"
        );

    if (!imageInput) {

        console.error(
            "aiImage element not found."
        );

        return;
    }

    if (!resultDiv) {

        console.error(
            "aiResult element not found."
        );

        return;
    }

    if (
        !imageInput.files ||
        imageInput.files.length === 0
    ) {

        resultDiv.innerHTML =
            "<p>⚠️ Please select an image first.</p>";

        return;
    }

    const formData =
        new FormData();

    formData.append(
        "image",
        imageInput.files[0]
    );

    resultDiv.innerHTML = `

        <h3>🤖 AI Detection Result</h3>

        <p>
            🔄 AI is analyzing the image...
        </p>

    `;

    if (aiComplaintForm) {

        aiComplaintForm.style.display =
            "none";
    }

    try {

        console.log(
            "Sending image to:",
            `${API_URL}/ai/detect`
        );

        const response =
            await fetch(
                `${API_URL}/ai/detect`,
                {
                    method: "POST",
                    body: formData
                }
            );

        console.log(
            "AI response status:",
            response.status
        );

        let data = {};

        try {

            data = await response.json();

        } catch (jsonError) {

            throw new Error(
                "Backend returned an invalid response."
            );
        }

        console.log(
            "AI response:",
            data
        );

        if (!response.ok) {

            throw new Error(
                data.detail ||
                "AI detection failed."
            );
        }

        let detection = null;

        if (
            Array.isArray(data.detected_issues) &&
            data.detected_issues.length > 0
        ) {

            detection =
                data.detected_issues[0];
        }

        if (!detection && data.issue) {

            detection = {
                issue: data.issue,
                confidence: data.confidence
            };
        }

        if (!detection) {

            detectedAIssue = "";
            detectedAIConfidence = 0;

            resultDiv.innerHTML = `

                <h3>🤖 AI Detection Result</h3>

                <p>
                    ❌ No civic issue detected.
                </p>

                <p>
                    Please upload a clearer civic issue image.
                </p>

            `;

            return;
        }

        const issue =
            data.issue ||
            detection.issue ||
            "Unknown Issue";

        let confidence =
            data.confidence;

        if (
            confidence === undefined ||
            confidence === null
        ) {

            confidence =
                detection.confidence;
        }

        confidence =
            Number(confidence);

        if (Number.isNaN(confidence)) {
            confidence = 0;
        }

        if (confidence > 1) {

            confidence =
                confidence / 100;
        }

        const confidencePercentage =
            (confidence * 100).toFixed(1);

        const source =
            data.source ||
            "AI";

        let sourceText =
            "AI Detection";

        if (
            source.toUpperCase() === "YOLO"
        ) {

            sourceText =
                "YOLO Object Detection";
        }

        if (
            source.toUpperCase() === "CLIP"
        ) {

            sourceText =
                "CLIP Image Classification";
        }

        detectedAIssue =
            issue;

        detectedAIConfidence =
            confidence;

        let recommendationHTML = "";

        if (data.recommendation) {

            const recommendation =
                data.recommendation;

            recommendationHTML = `

                <hr>

                <h3>
                    📚 AI Recommendation
                </h3>

                <p>
                    <strong>Description:</strong>
                    ${recommendation.description || "-"}
                </p>

                <p>
                    <strong>Recommended Action:</strong>
                    ${recommendation.recommended_action || "-"}
                </p>

                <p>
                    <strong>Department:</strong>
                    ${recommendation.department || "-"}
                </p>

                <p>
                    <strong>Priority:</strong>
                    ${recommendation.priority || "-"}
                </p>

            `;
        }

        resultDiv.innerHTML = `

            <h3>
                🤖 AI Detection Result
            </h3>

            <p>
                <strong>Issue:</strong>
                ${issue}
            </p>

            <p>
                <strong>Confidence:</strong>
                ${confidencePercentage}%
            </p>

            <p>
                <strong>AI Model:</strong>
                ${sourceText}
            </p>

            ${recommendationHTML}

        `;

        if (descriptionInput) {

            let description =
                `AI detected a ${issue} with ${confidencePercentage}% confidence using ${sourceText}.`;

            if (data.recommendation) {

                description +=
                    ` ${data.recommendation.recommended_action || ""}`;
            }

            descriptionInput.value =
                description;
        }

        if (aiComplaintForm) {

            aiComplaintForm.style.display =
                "block";
        }

        console.log(
            "AI detection successful."
        );

    } catch (error) {

        console.error(
            "AI DETECTION ERROR:",
            error
        );

        detectedAIssue = "";
        detectedAIConfidence = 0;

        resultDiv.innerHTML = `

            <h3>
                🤖 AI Detection Result
            </h3>

            <p style="color:red;">
                ❌ AI detection failed.
            </p>

            <p style="color:red;">
                ${error.message}
            </p>

        `;

        if (aiComplaintForm) {

            aiComplaintForm.style.display =
                "none";
        }
    }
}


// =========================================================
// SUBMIT AI COMPLAINT
// =========================================================

async function submitAIComplaint() {

    const token =
        localStorage.getItem("access_token");

    const locationInput =
        document.getElementById(
            "aiComplaintLocation"
        );

    const descriptionInput =
        document.getElementById(
            "aiComplaintDescription"
        );

    const result =
        document.getElementById(
            "aiComplaintResult"
        );

    if (
        !locationInput ||
        !descriptionInput ||
        !result
    ) {

        console.error(
            "AI complaint elements not found."
        );

        return;
    }

    if (!token) {

        result.innerHTML =
            "<p style='color:red;'>Please login first.</p>";

        return;
    }

    const location =
        locationInput.value.trim();

    const description =
        descriptionInput.value.trim();

    if (!location) {

        result.innerHTML =
            "<p style='color:red;'>Please enter the location.</p>";

        return;
    }

    if (!description) {

        result.innerHTML =
            "<p style='color:red;'>Please enter a complaint description.</p>";

        return;
    }

    if (!detectedAIssue) {

        result.innerHTML =
            "<p style='color:red;'>AI detection result is missing.</p>";

        return;
    }

    if (window.aiComplaintSubmitting) {
        return;
    }

    window.aiComplaintSubmitting = true;

    result.innerHTML =
        "<p>🔄 Submitting complaint...</p>";

    try {

        const response =
            await fetch(
                `${API_URL}/complaints/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        title:
                            `${detectedAIssue} Detected by AI`,

                        description:
                            `${description} Location: ${location}`,

                        category:
                            detectedAIssue,

                        priority:
                            "medium",

                        location:
                            location
                    })
                }
            );

        const data =
            await response.json();

        if (response.ok) {

            result.innerHTML = `

                <p style="color:green;">

                    ✅ Complaint submitted successfully!

                    <br><br>

                    Complaint ID:
                    ${data.id}

                </p>

            `;

            locationInput.value = "";
            descriptionInput.value = "";

            detectedAIssue = "";
            detectedAIConfidence = 0;

            loadMyComplaints();
            loadRecentComplaints();
            loadUserStatistics();

        } else {

            result.innerHTML = `

                <p style="color:red;">

                    ❌ ${
                        data.detail ||
                        "Failed to submit complaint."
                    }

                </p>

            `;
        }

    } catch (error) {

        console.error(
            "AI complaint error:",
            error
        );

        result.innerHTML =
            "<p style='color:red;'>Cannot connect to backend server.</p>";

    } finally {

        window.aiComplaintSubmitting =
            false;
    }
}


// =========================================================
// AI ASSISTANT
// =========================================================

async function askAIAssistant() {

    const input =
        document.getElementById(
            "aiAssistantInput"
        );

    const responseDiv =
        document.getElementById(
            "aiAssistantResponse"
        );

    const token =
        localStorage.getItem(
            "access_token"
        );

    if (!input || !responseDiv) {

        console.error(
            "AI Assistant elements not found."
        );

        return;
    }

    if (!token) {

        responseDiv.innerHTML =
            "<p>❌ Please login first.</p>";

        return;
    }

    const question =
        input.value.trim();

    if (!question) {

        responseDiv.innerHTML =
            "<p>❌ Please enter a question.</p>";

        return;
    }

    responseDiv.innerHTML =
        "<p>🤖 AI is thinking...</p>";

    try {

        const response =
            await fetch(
                `${API_URL}/ai/assistant`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        question: question
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            responseDiv.innerHTML =
                `<p>❌ ${
                    data.detail ||
                    "AI Assistant request failed."
                }</p>`;

            return;
        }

        responseDiv.innerHTML = `

            <div class="assistant-answer">

                <strong>
                    🤖 AI Assistant:
                </strong>

                <p>
                    ${
                        data.answer ||
                        data.response ||
                        data.message ||
                        "No response received."
                    }
                </p>

            </div>

        `;

    } catch (error) {

        console.error(
            "AI Assistant error:",
            error
        );

        responseDiv.innerHTML =
            "<p>❌ Cannot connect to backend server.</p>";
    }
}


// =========================================================
// AUTH SCREEN
// =========================================================

function showRegister() {

    const loginSection =
        document.getElementById(
            "loginSection"
        );

    const registerSection =
        document.getElementById(
            "registerSection"
        );

    if (loginSection) {

        loginSection.style.display =
            "none";
    }

    if (registerSection) {

        registerSection.style.display =
            "block";
    }
}


function showLogin() {

    const loginSection =
        document.getElementById(
            "loginSection"
        );

    const registerSection =
        document.getElementById(
            "registerSection"
        );

    if (registerSection) {

        registerSection.style.display =
            "none";
    }

    if (loginSection) {

        loginSection.style.display =
            "block";
    }
}


// =========================================================
// HIDE ALL USER SECTIONS
// =========================================================

function hideAllSections() {

    const sections = [

        "reportIssueSection",
        "myComplaintsSection",
        "notificationsSection",
        "profileSection",
        "settingsSection"

    ];

    sections.forEach(function (id) {

        const section =
            document.getElementById(id);

        if (section) {

            section.style.display =
                "none";
        }
    });
}


// =========================================================
// DASHBOARD
// =========================================================

function showDashboard() {

    hideAllSections();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================================================
// REPORT ISSUE
// =========================================================

function showReportIssue() {

    hideAllSections();

    const section =
        document.getElementById(
            "reportIssueSection"
        );

    if (section) {

        section.style.display =
            "block";

        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// =========================================================
// AI DETECTION
// =========================================================

function showAIDetection() {

    const aiImage =
        document.getElementById("aiImage");

    if (aiImage) {

        aiImage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        aiImage.focus();

    } else {

        console.error(
            "AI image input not found."
        );
    }
}


// =========================================================
// MY COMPLAINTS
// =========================================================

function showMyComplaints() {

    hideAllSections();

    const section =
        document.getElementById(
            "myComplaintsSection"
        );

    if (section) {

        section.style.display =
            "block";

        loadMyComplaints();

        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// =========================================================
// NOTIFICATIONS
// =========================================================

function showNotifications() {

    hideAllSections();

    const section =
        document.getElementById(
            "notificationsSection"
        );

    if (section) {

        section.style.display =
            "block";

        loadNotifications();

        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// =========================================================
// PROFILE
// =========================================================

function showProfile() {

    hideAllSections();

    const section =
        document.getElementById(
            "profileSection"
        );

    if (section) {

        section.style.display =
            "block";

        loadUserProfile();

        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// =========================================================
// SETTINGS
// =========================================================

function showSettings() {

    hideAllSections();

    const section =
        document.getElementById(
            "settingsSection"
        );

    if (section) {

        section.style.display =
            "block";

        loadSettings();

        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// =========================================================
// SELECT CIVIC SECTOR
// =========================================================

function selectSector(sector) {

    showReportIssue();

    const category =
        document.getElementById(
            "complaintCategory"
        );

    if (category) {

        category.value =
            sector;
    }
}


// =========================================================
// USER DASHBOARD
// =========================================================

function showUserDashboard() {

    const authSection =
        document.getElementById(
            "authSection"
        );

    const userDashboard =
        document.getElementById(
            "userDashboard"
        );

    if (authSection) {

        authSection.style.display =
            "none";
    }

    if (userDashboard) {

        userDashboard.style.display =
            "block";
    }

    loadUserStatistics();
    loadRecentComplaints();
}


// =========================================================
// USER STATISTICS
// =========================================================

async function loadUserStatistics() {

    const token =
        localStorage.getItem(
            "access_token"
        );

    if (!token) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/complaints/`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {
            return;
        }

        const complaints =
            await response.json();

        if (!Array.isArray(complaints)) {
            return;
        }

        const total =
            complaints.length;

        const pending =
            complaints.filter(
                complaint =>
                    complaint.status === "pending"
            ).length;

        const active =
            complaints.filter(
                complaint =>
                    complaint.status === "in_progress" ||
                    complaint.status === "active"
            ).length;

        const resolved =
            complaints.filter(
                complaint =>
                    complaint.status === "resolved"
            ).length;

        const totalElement =
            document.getElementById(
                "totalComplaints"
            );

        const pendingElement =
            document.getElementById(
                "pendingComplaints"
            );

        const activeElement =
            document.getElementById(
                "activeComplaints"
            );

        const resolvedElement =
            document.getElementById(
                "resolvedComplaints"
            );

        if (totalElement) {
            totalElement.textContent =
                total;
        }

        if (pendingElement) {
            pendingElement.textContent =
                pending;
        }

        if (activeElement) {
            activeElement.textContent =
                active;
        }

        if (resolvedElement) {
            resolvedElement.textContent =
                resolved;
        }

        console.log(
            "User statistics updated."
        );

    } catch (error) {

        console.error(
            "Statistics error:",
            error
        );
    }
}


// =========================================================
// NOTIFICATIONS
// =========================================================

async function loadNotifications() {

    const token =
        localStorage.getItem(
            "access_token"
        );

    const section =
        document.getElementById(
            "notificationsSection"
        );

    if (!section || !token) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/complaints/`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const complaints =
            await response.json();

        if (!response.ok) {
            return;
        }

        section.innerHTML =
            "<h2>🔔 Notifications</h2>";

        if (
            !Array.isArray(complaints) ||
            complaints.length === 0
        ) {

            section.innerHTML += `

                <div class="notification-item">

                    <span>🔔</span>

                    <div>

                        <strong>
                            No Notifications
                        </strong>

                        <p>
                            You don't have any complaint
                            notifications yet.
                        </p>

                    </div>

                </div>

            `;

            return;
        }

        complaints.forEach(function (complaint) {

            let icon = "📋";
            let title = "Complaint Update";

            let message =
                `Complaint #${complaint.id} is currently ${complaint.status || "pending"}.`;

            if (
                complaint.status === "resolved"
            ) {

                icon = "✅";

                title =
                    "Complaint Resolved";

                message =
                    `Your complaint #${complaint.id} has been resolved.`;

            } else if (
                complaint.status === "in_progress" ||
                complaint.status === "active"
            ) {

                icon = "🔄";

                title =
                    "Complaint In Progress";

                message =
                    `Your complaint #${complaint.id} is currently being processed.`;

            } else if (
                complaint.status === "pending"
            ) {

                icon = "🕒";

                title =
                    "Complaint Received";

                message =
                    `Your complaint #${complaint.id} is waiting for action.`;
            }

            section.innerHTML += `

                <div class="notification-item">

                    <span>${icon}</span>

                    <div>

                        <strong>
                            ${title}
                        </strong>

                        <p>
                            ${message}
                        </p>

                    </div>

                </div>

            `;

        });

        section.innerHTML += `

            <div class="notification-item">

                <span>🤖</span>

                <div>

                    <strong>
                        AI Detection
                    </strong>

                    <p>
                        AI-generated recommendations
                        are available for detected civic issues.
                    </p>

                </div>

            </div>

        `;

    } catch (error) {

        console.error(
            "Notifications error:",
            error
        );
    }
}


// =========================================================
// PROFILE
// =========================================================

async function loadUserProfile() {

    const token =
        localStorage.getItem(
            "access_token"
        );

    if (!token) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/auth/me`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            return;
        }

        const name =
            document.getElementById(
                "profileName"
            );

        const email =
            document.getElementById(
                "profileEmail"
            );

        const role =
            document.getElementById(
                "profileRole"
            );

        if (name) {
            name.textContent =
                data.name || "User";
        }

        if (email) {
            email.textContent =
                data.email || "-";
        }

        if (role) {
            role.textContent =
                data.role || "Citizen";
        }

    } catch (error) {

        console.error(
            "Profile error:",
            error
        );
    }
}


// =========================================================
// SETTINGS
// =========================================================

function loadSettings() {

    const toggle =
        document.getElementById(
            "emailNotificationsToggle"
        );

    if (!toggle) {
        return;
    }

    const saved =
        localStorage.getItem(
            "email_notifications"
        );

    if (saved === null) {

        toggle.checked = true;

    } else {

        toggle.checked =
            saved === "true";
    }
}


// =========================================================
// EMAIL SETTING
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const toggle =
            document.getElementById(
                "emailNotificationsToggle"
            );

        if (!toggle) {
            return;
        }

        toggle.addEventListener(
            "change",
            function () {

                localStorage.setItem(
                    "email_notifications",
                    toggle.checked
                );

            }
        );

    }
);


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "script.js loaded successfully."
        );

        const token =
            localStorage.getItem(
                "access_token"
            );

        if (!token) {

            if (
                document.getElementById(
                    "userDashboard"
                )
            ) {

                window.location.href =
                    "index.html";
            }

            return;
        }

        try {

            const response =
                await fetch(
                    `${API_URL}/auth/me`,
                    {
                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );

            if (!response.ok) {

                localStorage.removeItem(
                    "access_token"
                );

                window.location.href =
                    "index.html";

                return;
            }

            const profile =
                await response.json();

            console.log(
                "Current user:",
                profile
            );


            // ADMIN PAGE

            if (
                document.body.dataset.page ===
                "admin"
            ) {

                if (
                    !profile.role ||
                    profile.role.toLowerCase() !==
                    "admin"
                ) {

                    window.location.href =
                        "dashboard.html";

                    return;
                }

                return;
            }


            // USER DASHBOARD

            if (
                document.getElementById(
                    "userDashboard"
                )
            ) {

                if (
                    profile.role &&
                    profile.role.toLowerCase() ===
                    "admin"
                ) {

                    window.location.href =
                        "admin.html";

                    return;
                }

                console.log(
                    "User dashboard access confirmed."
                );

                loadUserStatistics();
                loadRecentComplaints();

                return;
            }


            // LOGIN PAGE WITH EXISTING SESSION

            if (
                document.getElementById(
                    "authSection"
                )
            ) {

                if (
                    profile.role &&
                    profile.role.toLowerCase() ===
                    "admin"
                ) {

                    window.location.href =
                        "admin.html";

                } else {

                    window.location.href =
                        "dashboard.html";
                }
            }

        } catch (error) {

            console.error(
                "Authentication check failed:",
                error
            );
        }

    }
);


// =========================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =========================================================

window.detectCivicIssue =
    detectCivicIssue;

window.submitAIComplaint =
    submitAIComplaint;

window.askAIAssistant =
    askAIAssistant;

window.showRegister =
    showRegister;

window.showLogin =
    showLogin;

window.showDashboard =
    showDashboard;

window.showReportIssue =
    showReportIssue;

window.showAIDetection =
    showAIDetection;

window.showMyComplaints =
    showMyComplaints;

window.showNotifications =
    showNotifications;

window.showProfile =
    showProfile;

window.showSettings =
    showSettings;

window.selectSector =
    selectSector;

window.showUserDashboard =
    showUserDashboard;

window.loadMyComplaints =
    loadMyComplaints;

window.deleteComplaint =
    deleteComplaint;

window.editComplaint =
    editComplaint;

console.log(
    "All dashboard functions connected successfully."
);
document.addEventListener("DOMContentLoaded", function () {

    const aiButton = document.getElementById("detectAIButton");

    if (!aiButton) {
        console.error("❌ Detect AI button not found.");
        return;
    }

    aiButton.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        console.log("🟢 Detect Civic Issue button clicked.");

        detectCivicIssue(event);

    });

    console.log("✅ AI button event connected.");

});