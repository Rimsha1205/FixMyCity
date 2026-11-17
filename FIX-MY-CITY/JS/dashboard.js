if (localStorage.getItem("isLoggedIn") !== "true") {

    window.location.href = "login.html";

} else if (localStorage.getItem("currentUserRole") !== "Citizen") {

    alert("Access denied. This dashboard is for citizens only.");

    window.location.href = "login.html";

} else {

    async function loadCitizenDashboard() {

        let citizenName =
            localStorage.getItem("currentUserName");

        let citizenEmail =
            localStorage.getItem("currentUserEmail");

        document.getElementById("citizenName").textContent =
            citizenName || "Citizen";

        let tableBody =
            document.getElementById("complaintTable");

        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        Loading complaints...
                    </td>
                </tr>
            `;
        }


        try {

            let complaints = [];

            if (window.mockDataService) {

                let mockData = await window.mockDataPromise;

                if (!mockData) {
                    throw new Error("Unable to load complaint data.");
                }

                complaints =
                    await window.mockDataService.getComplaintsByCitizen(
                        citizenEmail
                    );
            }

            let complaintCount =
                Number(localStorage.getItem("complaintCount")) || 0;

            let localComplaints = [];

            for (let i = 0; i < complaintCount; i++) {

                let prefix = "complaint_" + i + "_";

                if (
                    localStorage.getItem(prefix + "citizenEmail") ===
                    citizenEmail
                ) {

                    localComplaints.push({

                        referenceNumber:
                            localStorage.getItem(prefix + "id"),

                        title:
                            localStorage.getItem(prefix + "title"),

                        category:
                            localStorage.getItem(prefix + "category"),

                        location:
                            localStorage.getItem(prefix + "location"),

                        submittedAt:
                            localStorage.getItem(prefix + "date"),

                        status:
                            localStorage.getItem(prefix + "status") ||
                            "Pending",

                        resolution:
                            localStorage.getItem(prefix + "resolution") || "",

                        rejectionReason:
                            localStorage.getItem(prefix + "rejectionReason") || ""
                    });
                }
            }

            let complaintMap = new Map();

            complaints.forEach(function(complaint) {

                complaintMap.set(
                    complaint.referenceNumber,
                    complaint
                );
            });

            localComplaints.forEach(function(complaint) {

                complaintMap.set(
                    complaint.referenceNumber,
                    complaint
                );
            });

            complaints = Array.from(complaintMap.values());

            complaints.forEach(function(complaint) {

                let assignmentKey =
                    "officer_assignment_" +
                    complaint.referenceNumber + "_";

                let savedStatus =
                    localStorage.getItem(assignmentKey + "status");

                if (savedStatus) {
                    complaint.status = savedStatus;
                }

                let savedResolution =
                    localStorage.getItem(assignmentKey + "resolution");

                if (savedResolution) {
                    complaint.resolution = savedResolution;
                }

                let savedRejectionReason =
                    localStorage.getItem(
                        assignmentKey + "rejectionReason"
                    );

                if (savedRejectionReason) {
                    complaint.rejectionReason = savedRejectionReason;
                }

            });

            let total = complaints.length;

            let pending = 0;

            let inProgress = 0;

            let resolved = 0;

            let rejected = 0;


            if (tableBody) {
                tableBody.innerHTML = "";
            }

            complaints.forEach(function(complaint) {

                let status = complaint.status || "Submitted";

                let normalizedStatus = status.toLowerCase();

                if (
                    normalizedStatus === "pending" ||
                    normalizedStatus === "submitted" ||
                    normalizedStatus === "assigned"
                ) {

                    pending++;

                } else if (normalizedStatus === "in progress") {

                    inProgress++;

                } else if (normalizedStatus === "resolved") {

                    resolved++;

                } else if (normalizedStatus === "rejected") {

                    rejected++;
                }

                if (tableBody) {

                    let row = document.createElement("tr");

                    let values = [

                        complaint.referenceNumber,

                        complaint.title,

                        complaint.category,

                        complaint.location,

                        complaint.submittedAt || complaint.date

                    ];


                    values.forEach(function(value) {

                        let cell = document.createElement("td");

                        cell.textContent = value || "-";

                        row.appendChild(cell);
                    });

                    let statusCell =
                        document.createElement("td");

                    let badge =
                        document.createElement("span");

                    badge.className =
                        "status-badge " +
                        normalizedStatus.replace(/\s+/g, "-");

                    badge.textContent = status;

                    statusCell.appendChild(badge);

                    row.appendChild(statusCell);

                    tableBody.appendChild(row);
                }

            });

            document.getElementById("totalComplaints").textContent =
                total;

            document.getElementById("pendingComplaints").textContent =
                pending;

            document.getElementById("progressComplaints").textContent =
                inProgress;

            document.getElementById("resolvedComplaints").textContent =
                resolved;

            document.getElementById("rejectedComplaints").textContent =
                rejected;

            if (total === 0 && tableBody) {

                let row = document.createElement("tr");

                let cell = document.createElement("td");

                cell.colSpan = 6;

                cell.textContent = "No complaints found.";

                cell.style.textAlign = "center";

                row.appendChild(cell);

                tableBody.appendChild(row);
            }

        } catch (error) {

            console.error("Citizen Dashboard Error:", error);

            if (tableBody) {

                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6"
                            style="text-align:center; color:red;">
                            Unable to load complaints.
                            Please refresh the page.
                        </td>
                    </tr>
                `;
            }
        }
    }

    function logout() {

        localStorage.removeItem("isLoggedIn");

        localStorage.removeItem("currentUserName");

        localStorage.removeItem("currentUserEmail");

        localStorage.removeItem("currentUserRole");

        localStorage.removeItem("currentUserDepartment");

        window.location.href = "login.html";
    }

    window.logout = logout;

    loadCitizenDashboard();

}
