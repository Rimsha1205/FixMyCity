if (localStorage.getItem("isLoggedIn") !== "true") {

    window.location.href = "login.html";

} else if (localStorage.getItem("currentUserRole") !== "Citizen") {

    alert("Access denied. This page is for citizens only.");

    window.location.href = "login.html";

} else {

    let allCitizenComplaints = [];
    async function displayMyComplaints() {

        let complaintList =
            document.getElementById("complaintList");

        let currentEmail =
            localStorage.getItem("currentUserEmail");

        complaintList.innerHTML = "";

        try {
            let mockComplaints = [];

            if (window.mockDataService) {

                mockComplaints =
                    await window.mockDataService.getComplaintsByCitizen(
                        currentEmail
                    );
            }
            let localComplaints = [];

            let complaintCount =
                Number(localStorage.getItem("complaintCount")) || 0;

            for (let i = 0; i < complaintCount; i++) {

                let prefix = "complaint_" + i + "_";

                let citizenEmail =
                    localStorage.getItem(prefix + "citizenEmail");

                if (citizenEmail === currentEmail) {

                    localComplaints.push({

                        referenceNumber:
                            localStorage.getItem(prefix + "id"),

                        title:
                            localStorage.getItem(prefix + "title"),

                        category:
                            localStorage.getItem(prefix + "category"),

                        description:
                            localStorage.getItem(prefix + "description"),

                        location:
                            localStorage.getItem(prefix + "location"),

                        latitude:
                            localStorage.getItem(prefix + "latitude"),

                        longitude:
                            localStorage.getItem(prefix + "longitude"),

                        photo:
                            localStorage.getItem(prefix + "photo"),

                        submittedAt:
                            localStorage.getItem(prefix + "date"),

                        status:
                            localStorage.getItem(prefix + "status") || "Pending",

                        resolution:
                            localStorage.getItem(prefix + "resolution") || "",

                        rejectionReason:
                            localStorage.getItem(prefix + "rejectionReason") || ""
                    });
                }
            }

            let complaintMap = new Map();

            mockComplaints.forEach(function(complaint) {

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

            allCitizenComplaints =
                Array.from(complaintMap.values());

            allCitizenComplaints.forEach(function(complaint) {

                let referenceNumber =
                    complaint.referenceNumber;

                let assignmentKey =
                    "officer_assignment_" + referenceNumber + "_";

                complaint.currentStatus =
                    localStorage.getItem(assignmentKey + "status") ||
                    complaint.status ||
                    "Pending";

                complaint.currentResolution =
                    localStorage.getItem(assignmentKey + "resolution") ||
                    complaint.resolution ||
                    "";

                complaint.currentRejectionReason =
                    localStorage.getItem(
                        assignmentKey + "rejectionReason"
                    ) ||
                    complaint.rejectionReason ||
                    "";

            });
            applyComplaintFilters();


        } catch (error) {

            console.error("My Complaints Error:", error);

            complaintList.innerHTML =
                "<p>Unable to load complaints. Please refresh the page.</p>";
        }
    }


    function applyComplaintFilters() {

        let statusFilter =
            document.getElementById("statusFilter");

        let categoryFilter =
            document.getElementById("categoryFilter");

        let selectedStatus =
            statusFilter ? statusFilter.value : "all";

        let selectedCategory =
            categoryFilter ? categoryFilter.value : "all";


        let filteredComplaints =
            allCitizenComplaints.filter(function(complaint) {

                let matchesStatus =
                    selectedStatus === "all" ||
                    complaint.currentStatus === selectedStatus;

                let matchesCategory =
                    selectedCategory === "all" ||
                    complaint.category === selectedCategory;

                return matchesStatus && matchesCategory;

            });


        displayComplaintCards(filteredComplaints);
    }


    function displayComplaintCards(complaints) {

        let complaintList =
            document.getElementById("complaintList");

        complaintList.innerHTML = "";

        if (allCitizenComplaints.length === 0) {

            let message = document.createElement("div");

            message.className = "no-complaints";

            let heading = document.createElement("h3");

            heading.textContent = "No Complaints Found";

            let paragraph = document.createElement("p");

            paragraph.textContent =
                "You have not submitted any complaints yet.";

            message.appendChild(heading);

            message.appendChild(paragraph);

            complaintList.appendChild(message);

            return;
        }

        if (complaints.length === 0) {

            let message = document.createElement("div");

            message.className = "no-complaints";

            let heading = document.createElement("h3");

            heading.textContent = "No Matching Complaints";

            let paragraph = document.createElement("p");

            paragraph.textContent =
                "No complaints match the selected status and category.";

            message.appendChild(heading);

            message.appendChild(paragraph);

            complaintList.appendChild(message);

            return;
        }

        complaints.forEach(function(complaint) {

            let referenceNumber =
                complaint.referenceNumber;

            let status =
                complaint.currentStatus;

            let resolution =
                complaint.currentResolution || "";

            let rejectionReason =
                complaint.currentRejectionReason || "";

            let card = document.createElement("div");

            card.className = "my-complaint-card";

            let heading = document.createElement("h3");

            heading.textContent =
                complaint.title || "Untitled Complaint";

            card.appendChild(heading);

            let details = [

                "Reference Number: " + referenceNumber,

                "Category: " +
                    (complaint.category || "Not specified"),

                "Location: " +
                    (complaint.location || "Not specified"),

                "Submitted Date: " +
                    (complaint.submittedAt ||
                     complaint.date ||
                     complaint.submittedAt ||
                     "Not specified")
            ];

            if (
                complaint.latitude !== null &&
                complaint.latitude !== undefined &&
                complaint.latitude !== ""
            ) {

                details.push(
                    "Latitude: " + complaint.latitude
                );
            }

            if (
                complaint.longitude !== null &&
                complaint.longitude !== undefined &&
                complaint.longitude !== ""
            ) {

                details.push(
                    "Longitude: " + complaint.longitude
                );
            }

            details.forEach(function(detail) {

                let paragraph = document.createElement("p");

                paragraph.textContent = detail;

                card.appendChild(paragraph);
            });

            let statusParagraph =
                document.createElement("p");

            statusParagraph.textContent = "Current Status: ";

            let statusBadge =
                document.createElement("span");

            statusBadge.className =
                "status-badge " +
                status.toLowerCase().replace(/\s+/g, "-");

            statusBadge.textContent = status;

            statusParagraph.appendChild(statusBadge);

            card.appendChild(statusParagraph);

            if (resolution.trim() !== "") {

                let resolutionBox =
                    document.createElement("div");

                resolutionBox.className = "resolution-details";

                let resolutionHeading =
                    document.createElement("h4");

                resolutionHeading.textContent =
                    "Resolution Details";

                let resolutionText =
                    document.createElement("p");

                resolutionText.textContent = resolution;

                resolutionBox.appendChild(resolutionHeading);

                resolutionBox.appendChild(resolutionText);

                card.appendChild(resolutionBox);
            }

            if (
                status === "Rejected" &&
                rejectionReason.trim() !== ""
            ) {

                let rejectionBox =
                    document.createElement("div");

                rejectionBox.className = "resolution-details";

                let rejectionHeading =
                    document.createElement("h4");

                rejectionHeading.textContent =
                    "Rejection Reason";

                let rejectionText =
                    document.createElement("p");

                rejectionText.textContent = rejectionReason;

                rejectionBox.appendChild(rejectionHeading);

                rejectionBox.appendChild(rejectionText);

                card.appendChild(rejectionBox);
            }


            // Add card to complaint list
            complaintList.appendChild(card);

        });

    }

    let statusFilter =
        document.getElementById("statusFilter");

    let categoryFilter =
        document.getElementById("categoryFilter");

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyComplaintFilters
        );
    }

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            applyComplaintFilters
        );
    }

    function logout() {

        localStorage.removeItem("isLoggedIn");

        localStorage.removeItem("currentUserName");

        localStorage.removeItem("currentUserEmail");

        localStorage.removeItem("currentUserRole");

        localStorage.removeItem("currentUserDepartment");

        window.location.href = "login.html";
    }

    displayMyComplaints();

}
