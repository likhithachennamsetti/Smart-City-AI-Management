// =========================================================
// SMART CITY AI - ADMIN DASHBOARD
// CLEAN ADMIN JAVASCRIPT
// =========================================================


// =========================================================
// API CONFIGURATION
// =========================================================

const API_URL = "http://127.0.0.1:8000";

console.log("✅ admin.js loaded");


// =========================================================
// ADMIN ACCESS CHECK
// =========================================================

const token = localStorage.getItem("access_token");

if (!token) {

    alert("Please login first.");

    window.location.href = "index.html";

}


// =========================================================
// GET JWT PAYLOAD
// =========================================================

function getTokenPayload(token) {

    try {

        const payload = token.split(".")[1];

        return JSON.parse(
            atob(
                payload
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

    } catch (error) {

        console.error("Invalid token:", error);

        return null;

    }

}


// =========================================================
// CHECK ADMIN ROLE
// =========================================================

const currentUser = getTokenPayload(token);

if (!currentUser || currentUser.role !== "admin") {

    alert("Admin access required.");

    localStorage.removeItem("access_token");

    window.location.href = "index.html";

}


// =========================================================
// GLOBAL COMPLAINT STORAGE
// =========================================================

let allComplaints = [];


// =========================================================
// PAGE ELEMENTS
// =========================================================

const searchInput =
    document.getElementById("complaintSearch");

const statusFilter =
    document.getElementById("statusFilter");

const complaintsList =
    document.getElementById("adminComplaintsList");

const loadComplaintsButton =
    document.getElementById("loadAllComplaints");

const logoutButton =
    document.getElementById("adminLogoutButton");


// =========================================================
// INITIALIZE DASHBOARD
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("✅ Admin dashboard initialized");

    loadAllComplaints();

});


// =========================================================
// LOAD COMPLAINTS BUTTON
// =========================================================

if (loadComplaintsButton) {

    loadComplaintsButton.addEventListener(
        "click",
        loadAllComplaints
    );

}


// =========================================================
// SEARCH EVENT
// =========================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


// =========================================================
// STATUS FILTER EVENT
// =========================================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        applyFilters
    );

}


// =========================================================
// NORMALIZE STATUS
// =========================================================

function normalizeStatus(status) {

    return String(status || "")
        .toLowerCase()
        .trim()
        .replace(/ /g, "_");

}


// =========================================================
// NORMALIZE TEXT
// =========================================================

function normalizeText(value) {

    return String(value || "")
        .toLowerCase()
        .trim();

}


// =========================================================
// SET ELEMENT TEXT SAFELY
// =========================================================

function setElementText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent = value;

    }

}


// =========================================================
// LOAD ALL COMPLAINTS
// =========================================================

async function loadAllComplaints() {

    if (!token) {

        if (complaintsList) {

            complaintsList.innerHTML =
                "<p>Please login first.</p>";

        }

        return;

    }


    if (complaintsList) {

        complaintsList.innerHTML =
            "<p>🔄 Loading complaints...</p>";

    }


    try {

        const response =
            await fetch(
                `${API_URL}/admin/complaints`,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "Admin Complaints Response:",
            data
        );


        // =================================================
        // API ERROR
        // =================================================

        if (!response.ok) {

            console.error(
                "Admin API error:",
                data
            );


            if (response.status === 401) {

                alert(
                    "Your login session has expired. Please login again."
                );

                localStorage.removeItem(
                    "access_token"
                );

                window.location.href =
                    "index.html";

                return;

            }


            if (complaintsList) {

                complaintsList.innerHTML =
                    `<p>${escapeHTML(
                        data.detail ||
                        "Failed to load complaints."
                    )}</p>`;

            }

            return;

        }


        // =================================================
        // STORE COMPLAINTS
        // =================================================

        allComplaints =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            `✅ ${allComplaints.length} complaints loaded`
        );


        // =================================================
        // UPDATE DASHBOARD
        // =================================================

        updateStatistics(
            allComplaints
        );


        updateCivicSectorCounts(
            allComplaints
        );


        updateAIInsights(
            allComplaints
        );


        updateComplaintTrends(
            allComplaints
        );
        updateAnalyticsReports(
            allComplaints
        );
        updateIssueMap(
            allComplaints
        );
        // =================================================
        // DISPLAY
        // =================================================

        displayComplaints(
            allComplaints
        );


    } catch (error) {

        console.error(
            "Cannot load complaints:",
            error
        );


        if (complaintsList) {

            complaintsList.innerHTML =
                `
                <p>
                    ❌ Cannot connect to the backend server.
                </p>
                `;

        }

    }

}


// =========================================================
// UPDATE MAIN STATISTICS
// =========================================================

function updateStatistics(complaints) {

    const total =
        complaints.length;


    const pending =
        complaints.filter(
            complaint =>
                normalizeStatus(
                    complaint.status
                ) === "pending"
        ).length;


    const inProgress =
        complaints.filter(
            complaint =>
                normalizeStatus(
                    complaint.status
                ) === "in_progress"
        ).length;


    const resolved =
        complaints.filter(
            complaint =>
                normalizeStatus(
                    complaint.status
                ) === "resolved"
        ).length;


    setElementText(
        "totalComplaints",
        total
    );


    setElementText(
        "pendingComplaints",
        pending
    );


    setElementText(
        "inProgressComplaints",
        inProgress
    );


    setElementText(
        "resolvedComplaints",
        resolved
    );

}


// =========================================================
// CIVIC SECTOR DETECTION
// =========================================================
//
// Four project sectors:
//
// 1. Road & Pothole
// 2. Garbage Management
// 3. Water & Drainage
// 4. Damaged Streetlights
//
// =========================================================

function getCivicSector(complaint) {

    const category =
        normalizeText(
            complaint.category
        );


    const title =
        normalizeText(
            complaint.title
        );


    const description =
        normalizeText(
            complaint.description
        );


    const text =
        `${category} ${title} ${description}`;


    // =====================================================
    // GARBAGE
    // =====================================================

    if (

        text.includes("garbage") ||
        text.includes("waste") ||
        text.includes("trash") ||
        text.includes("dump") ||
        text.includes("litter") ||
        text.includes("rubbish") ||
        text.includes("waste management")

    ) {

        return "garbage";

    }


    // =====================================================
    // WATER
    // =====================================================

    if (

        text.includes("water") ||
        text.includes("leakage") ||
        text.includes("leak") ||
        text.includes("drainage") ||
        text.includes("drain") ||
        text.includes("pipeline") ||
        text.includes("pipe")

    ) {

        return "water";

    }


    // =====================================================
    // STREETLIGHT
    // =====================================================

    if (

        text.includes("streetlight") ||
        text.includes("street light") ||
        text.includes("street lamp") ||
        text.includes("lamp post") ||
        text.includes("light pole") ||
        text.includes("damaged light") ||
        text.includes("broken light") ||
        text.includes("non-functional light") ||
        text.includes("not working light")

    ) {

        return "streetlight";

    }


    // =====================================================
    // ROAD / POTHOLE
    // =====================================================

    if (

        text.includes("pothole") ||
        text.includes("road") ||
        text.includes("street") ||
        text.includes("road damage") ||
        text.includes("crack") ||
        text.includes("road crack") ||
        text.includes("damaged road")

    ) {

        return "road";

    }


    return "other";

}


// =========================================================
// UPDATE CIVIC SECTOR COUNTS
// =========================================================

function updateCivicSectorCounts(complaints) {

    let road = 0;

    let garbage = 0;

    let water = 0;

    let streetlight = 0;


    complaints.forEach(
        complaint => {

            const sector =
                getCivicSector(
                    complaint
                );


            if (sector === "road") {

                road++;

            }


            else if (sector === "garbage") {

                garbage++;

            }


            else if (sector === "water") {

                water++;

            }


            else if (sector === "streetlight") {

                streetlight++;

            }

        }
    );


    setElementText(
        "roadIssues",
        road
    );


    setElementText(
        "garbageIssues",
        garbage
    );


    setElementText(
        "waterIssues",
        water
    );


    setElementText(
        "streetlightIssues",
        streetlight
    );

}


// =========================================================
// AI INSIGHTS
// =========================================================
//
// NOTE:
// Currently rule-based.
// AI Agent has NOT been implemented yet.
// =========================================================

function updateAIInsights(complaints) {

    const highPriority =
        complaints.filter(
            complaint =>
                normalizeText(
                    complaint.priority
                ) === "high"
        ).length;


    const mediumPriority =
        complaints.filter(
            complaint =>
                normalizeText(
                    complaint.priority
                ) === "medium"
        ).length;


    const resolved =
        complaints.filter(
            complaint =>
                normalizeStatus(
                    complaint.status
                ) === "resolved"
        ).length;


    setElementText(
        "highPriorityCount",
        highPriority
    );


    setElementText(
        "mediumPriorityCount",
        mediumPriority
    );


    setElementText(
        "aiResolvedCount",
        resolved
    );


    // =====================================================
    // RECOMMENDATION
    // =====================================================

    let recommendation =
        "No complaints are currently available for analysis.";


    if (complaints.length > 0) {

        if (highPriority > 0) {

            recommendation =
                `There are ${highPriority} high-priority complaints. Admin attention is recommended.`;

        }


        else if (
            resolved === complaints.length
        ) {

            recommendation =
                "All current complaints have been resolved. Great work!";

        }


        else if (
            mediumPriority > 0
        ) {

            recommendation =
                `Monitor ${mediumPriority} medium-priority complaints and update their status regularly.`;

        }


        else {

            recommendation =
                "Continue monitoring incoming civic complaints and resolve pending issues.";

        }

    }


    setElementText(
        "aiRecommendation",
        recommendation
    );


    // =====================================================
    // PRIORITY OVERVIEW
    // =====================================================

    updatePriorityOverview(
        complaints
    );

}


// =========================================================
// COMPLAINT TRENDS
// =========================================================

function updateComplaintTrends(complaints) {

    const total =
        complaints.length;


    const pending =
        complaints.filter(
            complaint =>
                normalizeStatus(
                    complaint.status
                ) === "pending"
        ).length;


    const resolved =
        complaints.filter(
            complaint =>
                normalizeStatus(
                    complaint.status
                ) === "resolved"
        ).length;


    // =====================================================
    // NUMBERS
    // =====================================================

    setElementText(
        "trendTotal",
        total
    );


    setElementText(
        "trendPending",
        pending
    );


    setElementText(
        "trendResolved",
        resolved
    );


    // =====================================================
    // SUMMARY
    // =====================================================

    setElementText(
        "trendSummaryTotal",
        total
    );


    setElementText(
        "trendSummaryPending",
        pending
    );


    setElementText(
        "trendSummaryResolved",
        resolved
    );


    // =====================================================
    // TREND BARS
    // =====================================================

    const maxValue =
        Math.max(
            total,
            1
        );


    const totalPercent =
        (total / maxValue) * 100;


    const pendingPercent =
        (pending / maxValue) * 100;


    const resolvedPercent =
        (resolved / maxValue) * 100;


    const totalBar =
        document.getElementById(
            "totalTrendBar"
        );


    const pendingBar =
        document.getElementById(
            "pendingTrendBar"
        );


    const resolvedBar =
        document.getElementById(
            "resolvedTrendBar"
        );


    if (totalBar) {

        totalBar.style.width =
            `${totalPercent}%`;

    }


    if (pendingBar) {

        pendingBar.style.width =
            `${pendingPercent}%`;

    }


    if (resolvedBar) {

        resolvedBar.style.width =
            `${resolvedPercent}%`;

    }


    // =====================================================
    // RECENT ALERTS
    // =====================================================

    updateRecentAlerts(
        complaints
    );

}


// =========================================================
// PRIORITY OVERVIEW
// =========================================================

function updatePriorityOverview(complaints) {

    const high =
        complaints.filter(
            complaint =>
                normalizeText(
                    complaint.priority
                ) === "high"
        ).length;


    const medium =
        complaints.filter(
            complaint =>
                normalizeText(
                    complaint.priority
                ) === "medium"
        ).length;


    const low =
        complaints.filter(
            complaint =>
                normalizeText(
                    complaint.priority
                ) === "low"
        ).length;


    setElementText(
        "highPriorityTotal",
        high
    );


    setElementText(
        "mediumPriorityTotal",
        medium
    );


    setElementText(
        "lowPriorityTotal",
        low
    );


    // =====================================================
    // PRIORITY BARS
    // =====================================================

    const total =
        Math.max(
            complaints.length,
            1
        );


    const highBar =
        document.getElementById(
            "highPriorityBar"
        );


    const mediumBar =
        document.getElementById(
            "mediumPriorityBar"
        );


    const lowBar =
        document.getElementById(
            "lowPriorityBar"
        );


    if (highBar) {

        highBar.style.width =
            `${(high / total) * 100}%`;

    }


    if (mediumBar) {

        mediumBar.style.width =
            `${(medium / total) * 100}%`;

    }


    if (lowBar) {

        lowBar.style.width =
            `${(low / total) * 100}%`;

    }

}


// =========================================================
// RECENT ALERTS
// =========================================================

function updateRecentAlerts(complaints) {

    const alertsContainer =
        document.getElementById(
            "recentAlerts"
        );


    if (!alertsContainer) {

        return;

    }


    alertsContainer.innerHTML = "";


    if (complaints.length === 0) {

        alertsContainer.innerHTML =
            `
            <p class="empty-message">
                No recent alerts.
            </p>
            `;

        return;

    }


    // =====================================================
    // SORT NEWEST FIRST
    // =====================================================

    const recentComplaints =
        [...complaints]
            .sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.created_at || 0
                        );


                    const dateB =
                        new Date(
                            b.created_at || 0
                        );


                    return dateB - dateA;

                }
            )
            .slice(0, 4);


    recentComplaints.forEach(
        complaint => {

            const status =
                normalizeStatus(
                    complaint.status
                );


            let icon =
                "📋";


            if (status === "pending") {

                icon =
                    "⚠️";

            }


            else if (
                status === "in_progress"
            ) {

                icon =
                    "🔄";

            }


            else if (
                status === "resolved"
            ) {

                icon =
                    "✅";

            }


            const alertItem =
                document.createElement(
                    "div"
                );


            alertItem.className =
                "alert-item";


            alertItem.innerHTML =
                `
                <span>
                    ${icon}
                </span>

                <div>

                    <strong>
                        ${escapeHTML(
                            complaint.title ||
                            "New complaint"
                        )}
                    </strong>

                    <p>
                        ${formatStatus(
                            complaint.status
                        )}
                        •
                        ${formatDateTime(
                            complaint.created_at
                        )}
                    </p>

                </div>
                `;


            alertsContainer.appendChild(
                alertItem
            );

        }
    );

}


// =========================================================
// FORMAT DATE/TIME
// =========================================================

function formatDateTime(dateString) {

    if (!dateString) {

        return "Not available";

    }


    const date =
        new Date(dateString);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "Not available";

    }


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// =========================================================
// FORMAT STATUS
// =========================================================

function formatStatus(status) {

    const normalized =
        normalizeStatus(
            status
        );


    if (
        normalized === "pending"
    ) {

        return "⏳ Pending";

    }


    if (
        normalized === "in_progress"
    ) {

        return "🔄 In Progress";

    }


    if (
        normalized === "resolved"
    ) {

        return "✅ Resolved";

    }


    return status || "Unknown";

}


// =========================================================
// DISPLAY COMPLAINTS
// =========================================================

function displayComplaints(
    complaints
) {

    if (!complaintsList) {

        return;

    }


    complaintsList.innerHTML =
        "";


    if (
        complaints.length === 0
    ) {

        complaintsList.innerHTML =
            `
            <p class="empty-message">
                No complaints found.
            </p>
            `;

        return;

    }


    complaints.forEach(
        complaint => {

            const complaintDiv =
                document.createElement(
                    "div"
                );


            complaintDiv.className =
                "admin-complaint-card";


            const status =
                normalizeStatus(
                    complaint.status
                );


            let statusClass =
                "";


            if (
                status === "pending"
            ) {

                statusClass =
                    "status-pending";

            }


            else if (
                status === "in_progress"
            ) {

                statusClass =
                    "status-in-progress";

            }


            else if (
                status === "resolved"
            ) {

                statusClass =
                    "status-resolved";

            }


            complaintDiv.innerHTML =
                `
                <h3>
                    ${escapeHTML(
                        complaint.title ||
                        "Untitled Complaint"
                    )}
                </h3>


                <p>
                    <strong>
                        Description:
                    </strong>

                    ${escapeHTML(
                        complaint.description ||
                        "Not provided"
                    )}
                </p>


                <p>
                    <strong>
                        Category:
                    </strong>

                    ${escapeHTML(
                        complaint.category ||
                        "Not provided"
                    )}
                </p>


                <p>
                    <strong>
                        Status:
                    </strong>

                    <span
                        class="status-badge ${statusClass}"
                    >
                        ${formatStatus(
                            complaint.status
                        )}
                    </span>
                </p>


                <p>
                    <strong>
                        Priority:
                    </strong>

                    <span class="priority-badge">
                        ${escapeHTML(
                            complaint.priority ||
                            "Not specified"
                        )}
                    </span>
                </p>


                <p>
                    <strong>
                        Complaint ID:
                    </strong>

                    ${escapeHTML(
                        complaint.id
                    )}
                </p>


                <p>
                    <strong>
                        User ID:
                    </strong>

                    ${escapeHTML(
                        complaint.user_id
                    )}
                </p>


                <p>
                    <strong>
                        📍 Location:
                    </strong>

                    ${escapeHTML(
                        complaint.location ||
                        "Not provided"
                    )}
                </p>


                <p>
                    <strong>
                        🕒 Submitted:
                    </strong>

                    ${formatDateTime(
                        complaint.created_at
                    )}
                </p>


                <div class="admin-action-buttons">


                    <button
                        class="pending-button"
                        type="button"
                        onclick="updateComplaintStatus(
                            ${complaint.id},
                            'pending'
                        )"
                    >
                        Pending
                    </button>


                    <button
                        class="progress-button"
                        type="button"
                        onclick="updateComplaintStatus(
                            ${complaint.id},
                            'in_progress'
                        )"
                    >
                        In Progress
                    </button>


                    <button
                        class="resolved-button"
                        type="button"
                        onclick="updateComplaintStatus(
                            ${complaint.id},
                            'resolved'
                        )"
                    >
                        Resolved
                    </button>


                </div>
                `;


            complaintsList.appendChild(
                complaintDiv
            );

        }
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

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


// =========================================================
// SEARCH + STATUS FILTER
// =========================================================

function applyFilters() {

    if (
        !searchInput ||
        !statusFilter
    ) {

        return;

    }


    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedStatus =
        statusFilter.value;


    const filteredComplaints =
        allComplaints.filter(
            complaint => {

                const title =
                    normalizeText(
                        complaint.title
                    );


                const description =
                    normalizeText(
                        complaint.description
                    );


                const category =
                    normalizeText(
                        complaint.category
                    );


                const location =
                    normalizeText(
                        complaint.location
                    );


                const matchesSearch =
                    title.includes(
                        searchText
                    ) ||

                    description.includes(
                        searchText
                    ) ||

                    category.includes(
                        searchText
                    ) ||

                    location.includes(
                        searchText
                    );


                const matchesStatus =
                    selectedStatus === "all" ||

                    normalizeStatus(
                        complaint.status
                    ) === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    displayComplaints(
        filteredComplaints
    );

}


// =========================================================
// CIVIC SECTOR FILTER
// =========================================================

function filterByCivicSector(sector) {

    if (
        allComplaints.length === 0
    ) {

        alert(
            "Please load complaints first."
        );

        return;

    }


    const filteredComplaints =
        allComplaints.filter(
            complaint =>
                getCivicSector(
                    complaint
                ) === sector
        );


    displayComplaints(
        filteredComplaints
    );


    // Reset normal filters

    if (searchInput) {

        searchInput.value =
            "";

    }


    if (statusFilter) {

        statusFilter.value =
            "all";

    }


    scrollToComplaints();


    console.log(
        `Showing ${filteredComplaints.length} ${sector} complaints`
    );

}


// =========================================================
// CIVIC SECTOR SHORTCUTS
// =========================================================

function showRoadIssues() {

    filterByCivicSector(
        "road"
    );

}


function showGarbageIssues() {

    filterByCivicSector(
        "garbage"
    );

}


function showWaterIssues() {

    filterByCivicSector(
        "water"
    );

}


function showStreetlightIssues() {

    filterByCivicSector(
        "streetlight"
    );

}


// =========================================================
// UPDATE COMPLAINT STATUS
// =========================================================

async function updateComplaintStatus(
    complaintId,
    newStatus
) {

    if (!token) {

        alert(
            "Please login first."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/admin/complaints/${complaintId}/status`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({
                            status:
                                newStatus
                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "Status update response:",
            data
        );


        if (response.ok) {

            alert(
                `Complaint #${complaintId} status updated to ${newStatus}.`
            );


            await loadAllComplaints();

        }


        else {

            alert(
                data.detail ||
                "Failed to update complaint status."
            );

        }


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            "Cannot connect to the backend server."
        );

    }

}


// =========================================================
// SCROLL TO COMPLAINTS
// =========================================================

function scrollToComplaints() {

    const complaintsSection =
        document.getElementById(
            "complaintsSection"
        );


    if (complaintsSection) {

        complaintsSection.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// =========================================================
// SCROLL TO TOP
// =========================================================

function scrollToTop() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// =========================================================
// COMING SOON
// =========================================================
//
// These modules are intentionally not implemented yet.
// =========================================================

function showComingSoon(sectionName) {

    alert(
        `${sectionName} module will be implemented in a later stage.`
    );

}


// =========================================================
// ADMIN LOGOUT
// =========================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "access_token"
            );


            alert(
                "Logged out successfully!"
            );


            window.location.href =
                "index.html";

        }
    );

}


// =========================================================
// END OF ADMIN.JS
// =========================================================

console.log(
    "✅ Smart City Admin Dashboard JS ready"
);
// =========================================================
// QUICK ACTIONS
// =========================================================

function quickManageComplaints() {

    const section =
        document.getElementById("complaintsSection");

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    if (allComplaints.length === 0) {

        loadAllComplaints();

    }

}


function quickAIInsights() {

    const section =
        document.getElementById("aiInsightsSection");

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


function quickAnalytics() {

    const section =
        document.getElementById("analyticsSection");

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


function quickNotifications() {

    const section =
        document.getElementById("notificationsSection");

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}
// =========================================================
// QUICK ACTION - MANAGE COMPLAINTS
// =========================================================

function quickmanageComplaints() {

    // Scroll to complaint management section
    scrollToComplaints();

    // Load complaints automatically
    loadAllComplaints();

}
// =========================================================
// QUICK ACTION - AI AGENTS
// =========================================================

function quickAIAgents() {

    alert(
        "🤖 AI Agents\n\n" +
        "AI Agent module is ready for integration.\n\n" +
        "Current system capabilities:\n" +
        "• Civic issue detection\n" +
        "• Complaint classification\n" +
        "• Priority analysis\n" +
        "• AI-based recommendations"
    );

}
// =========================================================
// QUICK ACTION - VIEW ANALYTICS
// =========================================================

function quickViewAnalytics() {

    const analyticsSection =
        document.querySelector(".trend-chart");

    if (analyticsSection) {

        analyticsSection.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } else {

        alert("Analytics section is not available.");
    }

}
// =========================================================
// QUICK ACTION - NOTIFICATIONS
// =========================================================

function quickNotifications() {

    const alertsSection =
        document.getElementById("recentAlerts");

    if (alertsSection) {

        alertsSection.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } else {

        alert("Notifications section is not available.");
    }

}
// =========================================================
// ISSUE MAP
// =========================================================

function updateIssueMap(complaints) {

    const locationList =
        document.getElementById("issueLocationList");

    if (!locationList) {
        return;
    }

    locationList.innerHTML = "";

    const complaintsWithLocation =
        complaints.filter(
            complaint =>
                complaint.location &&
                String(complaint.location).trim() !== ""
        );

    if (complaintsWithLocation.length === 0) {

        locationList.innerHTML = `
            <p class="empty-message">
                No complaint locations available.
            </p>
        `;

        return;
    }

    complaintsWithLocation
        .slice(0, 10)
        .forEach(complaint => {

            const item =
                document.createElement("div");

            item.className =
                "issue-location-item";

            item.innerHTML = `

                <strong>
                    📍 Complaint #${escapeHTML(complaint.id)}
                </strong>

                <span>
                    ${escapeHTML(complaint.location)}
                </span>

            `;

            locationList.appendChild(item);
        });
}
// =========================================================
// SIDEBAR - ISSUE MAP
// =========================================================

function showIssueMap() {

    const mapSection =
        document.getElementById("issueMapSection");

    if (mapSection) {

        mapSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } else {

        alert("Issue Map section is not available.");
    }

}
// =========================================================
// ANALYTICS & REPORTS
// =========================================================

function updateAnalyticsReports(complaints) {

    const total = complaints.length;

    const pending =
        complaints.filter(
            complaint =>
                normalizeStatus(complaint.status) === "pending"
        ).length;

    const inProgress =
        complaints.filter(
            complaint =>
                normalizeStatus(complaint.status) === "in_progress"
        ).length;

    const resolved =
        complaints.filter(
            complaint =>
                normalizeStatus(complaint.status) === "resolved"
        ).length;


    // =====================================================
    // MAIN COUNTS
    // =====================================================

    setElementText(
        "reportTotalComplaints",
        total
    );

    setElementText(
        "reportPendingComplaints",
        pending
    );

    setElementText(
        "reportInProgressComplaints",
        inProgress
    );

    setElementText(
        "reportResolvedComplaints",
        resolved
    );


    // =====================================================
    // CIVIC SECTOR COUNTS
    // =====================================================

    let road = 0;
    let garbage = 0;
    let water = 0;
    let streetlight = 0;


    complaints.forEach(
        complaint => {

            const sector =
                getCivicSector(complaint);

            if (sector === "road") {

                road++;

            } else if (sector === "garbage") {

                garbage++;

            } else if (sector === "water") {

                water++;

            } else if (sector === "streetlight") {

                streetlight++;
            }
        }
    );


    setElementText(
        "reportRoadIssues",
        road
    );

    setElementText(
        "reportGarbageIssues",
        garbage
    );

    setElementText(
        "reportWaterIssues",
        water
    );

    setElementText(
        "reportStreetlightIssues",
        streetlight
    );


    // =====================================================
    // BAR PERCENTAGES
    // =====================================================

    const maxSector =
        Math.max(
            road,
            garbage,
            water,
            streetlight,
            1
        );


    const roadBar =
        document.getElementById(
            "reportRoadBar"
        );

    const garbageBar =
        document.getElementById(
            "reportGarbageBar"
        );

    const waterBar =
        document.getElementById(
            "reportWaterBar"
        );

    const streetlightBar =
        document.getElementById(
            "reportStreetlightBar"
        );


    if (roadBar) {

        roadBar.style.width =
            `${(road / maxSector) * 100}%`;
    }

    if (garbageBar) {

        garbageBar.style.width =
            `${(garbage / maxSector) * 100}%`;
    }

    if (waterBar) {

        waterBar.style.width =
            `${(water / maxSector) * 100}%`;
    }

    if (streetlightBar) {

        streetlightBar.style.width =
            `${(streetlight / maxSector) * 100}%`;
    }


    // =====================================================
    // PERFORMANCE SUMMARY
    // =====================================================

    const summary =
        document.getElementById(
            "analyticsSummary"
        );

    if (summary) {

        if (total === 0) {

            summary.textContent =
                "No complaints are currently available for analysis.";

        } else {

            const resolutionRate =
                ((resolved / total) * 100).toFixed(1);

            summary.textContent =
                `The system currently has ${total} complaint(s). ` +
                `${resolved} have been resolved, ` +
                `${pending} are pending, and ` +
                `${inProgress} are in progress. ` +
                `The current resolution rate is ${resolutionRate}%.`;
        }
    }

}
// =========================================================
// SIDEBAR - ANALYTICS & REPORTS
// =========================================================

function showAnalyticsReports() {

    const section =
        document.getElementById(
            "analyticsReportsSection"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } else {

        alert(
            "Analytics & Reports section is not available."
        );
    }

}
// =========================================================
// USER MANAGEMENT
// =========================================================

function quickUserManagement() {

    const section =
        document.getElementById("userManagementSection");

    if (!section) {
        console.warn("User Management section not found.");
        return;
    }

    // Show section
    section.style.display = "block";

    // Scroll to section
    section.scrollIntoView({
        behavior: "smooth"
    });

    loadAdminUsers();
}


// =========================================================
// LOAD ADMIN USERS
// =========================================================

async function loadAdminUsers() {

    const container =
        document.getElementById("adminUsersContainer");

    if (!container) {
        console.warn("adminUsersContainer not found.");
        return;
    }

    container.innerHTML =
        "<p>🔄 Loading users...</p>";

    try {

        const response = await fetch(
            `${API_URL}/admin/users`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log(
            "Admin Users Response:",
            data
        );

        if (!response.ok) {

            container.innerHTML =
                `<p>❌ ${data.detail || "Failed to load users."}</p>`;

            return;
        }

        if (!Array.isArray(data) || data.length === 0) {

            container.innerHTML =
                "<p>No users found.</p>";

            return;
        }

        displayAdminUsers(data);

    } catch (error) {

        console.error(
            "User Management Error:",
            error
        );

        container.innerHTML =
            "<p>❌ Cannot connect to the backend server.</p>";
    }
}


// =========================================================
// DISPLAY USERS
// =========================================================

function displayAdminUsers(users) {

    const container =
        document.getElementById("adminUsersContainer");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    users.forEach(user => {

        const userCard =
            document.createElement("div");

        userCard.className =
            "admin-user-card";

        userCard.innerHTML = `

            <div class="user-card-header">

                <div class="user-avatar">
                    👤
                </div>

                <div>

                    <h3>
                        ${escapeHTML(user.name || "Unknown User")}
                    </h3>

                    <span class="user-role">
                        ${escapeHTML(user.role || "citizen")}
                    </span>

                </div>

            </div>

            <div class="user-details">

                <p>
                    <strong>ID:</strong>
                    ${escapeHTML(user.id)}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(user.email)}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${escapeHTML(user.phone || "Not provided")}
                </p>

                <p>
                    <strong>Joined:</strong>
                    ${formatDateTime(user.created_at)}
                </p>

            </div>
        `;

        container.appendChild(userCard);

    });
}
// =========================================================
// ADMIN SETTINGS
// =========================================================

function openAdminSettings() {

    const settingsSection =
        document.getElementById("settingsSection");

    if (settingsSection) {

        settingsSection.scrollIntoView({
            behavior: "smooth"
        });

    } else {

        console.warn(
            "Settings section not found."
        );
    }
}


// =========================================================
// ADMIN PROFILE
// =========================================================

function showAdminProfile() {

    const message =
        document.getElementById("settingsMessage");

    const currentUser =
        getTokenPayload(token);

    if (!message) {
        return;
    }

    if (!currentUser) {

        message.innerHTML =
            "❌ Unable to read admin profile.";

        return;
    }

    message.innerHTML = `
        <div class="settings-result">

            <h3>👤 Admin Profile</h3>

            <p>
                <strong>Role:</strong>
                ${escapeHTML(currentUser.role || "Admin")}
            </p>

            <p>
                <strong>User ID:</strong>
                ${escapeHTML(currentUser.sub || "Not available")}
            </p>

        </div>
    `;
}


// =========================================================
// NOTIFICATION PREFERENCE
// =========================================================

function toggleAdminNotifications() {

    const message =
        document.getElementById("settingsMessage");

    const currentState =
        localStorage.getItem(
            "admin_notifications"
        );

    const newState =
        currentState === "enabled"
            ? "disabled"
            : "enabled";

    localStorage.setItem(
        "admin_notifications",
        newState
    );

    if (message) {

        message.innerHTML = `
            <div class="settings-result">

                🔔 Admin notifications are now
                <strong>
                    ${newState}
                </strong>.

            </div>
        `;
    }
}


// =========================================================
// SYSTEM STATUS
// =========================================================

async function checkSystemStatus() {

    const message =
        document.getElementById("settingsMessage");

    if (!message) {
        return;
    }

    message.innerHTML =
        "🔄 Checking backend connection...";

    try {

        const response =
            await fetch(
                `${API_URL}/health`
            );

        const data =
            await response.json();

        if (response.ok) {

            message.innerHTML = `
                <div class="settings-result success">

                    🟢 <strong>System Online</strong>

                    <p>
                        Backend API is connected successfully.
                    </p>

                    <p>
                        Status:
                        ${escapeHTML(
                            data.status || "healthy"
                        )}
                    </p>

                </div>
            `;

        } else {

            message.innerHTML = `
                <div class="settings-result error">

                    🔴 Backend returned an error.

                </div>
            `;
        }

    } catch (error) {

        console.error(
            "System status error:",
            error
        );

        message.innerHTML = `
            <div class="settings-result error">

                🔴 <strong>System Offline</strong>

                <p>
                    Cannot connect to the backend server.
                </p>

            </div>
        `;
    }
}


// =========================================================
// SETTINGS LOGOUT
// =========================================================

function adminSettingsLogout() {

    const confirmLogout =
        confirm(
            "Are you sure you want to logout?"
        );

    if (!confirmLogout) {
        return;
    }

    localStorage.removeItem(
        "access_token"
    );

    alert(
        "Logged out successfully!"
    );

    window.location.href =
        "index.html";
}