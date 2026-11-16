
/* =====================================
   FIXMYCITY - TRACK COMPLAINT
===================================== */

// Check whether the user is logged in

if (localStorage.getItem("isLoggedIn") !== "true") {

    window.location.href = "login.html";

} else if (localStorage.getItem("currentUserRole") !== "Citizen") {

    alert("Access denied. This page is for citizens only.");

    window.location.href = "login.html";

} else {


    // =====================================
    // CREATE FALLBACK STATUS HISTORY
    // =====================================

    function createFallbackHistory(complaint, assignment) {

        let history = [];

        let status = complaint.status || "Pending";

        let submittedDate = complaint.submittedAt || "";

        // Submission event

        history.push({

            status: "Submitted",

            description: "Complaint submitted by the citizen.",

            actor: "Citizen",

            timestamp: submittedDate

        });


        // Check whether assignment information exists

        let hasAssignment =
            complaint.assignedStaffName ||
            complaint.assignedStaffEmail ||
            complaint.assignedDepartment ||
            assignment.name ||
            assignment.email ||
            assignment.department;


        if (hasAssignment) {

            let staffName =
                assignment.name ||
                complaint.assignedStaffName ||
                "";

            let department =
                assignment.department ||
                complaint.assignedDepartment ||
                "";

            let assignmentDescription =
                "Complaint assigned";

            if (staffName) {
                assignmentDescription += " to " + staffName;
            }

            if (department) {
                assignmentDescription +=
                    (staffName ? " from " : " to ") +
                    department + " department";
            }

            assignmentDescription += ".";

            history.push({

                status: "Assigned",

                description: assignmentDescription,

                actor: "System",

                timestamp: ""

            });
        }


        // Add the current status if it is not already represented

        if (
            status &&
            status.toLowerCase() !== "submitted" &&
            status.toLowerCase() !== "assigned"
        ) {

            let description = "Complaint status is currently " + status + ".";

            if (status.toLowerCase() === "in progress") {

                description =
                    "The department staff has started working on the complaint.";

            } else if (status.toLowerCase() === "resolved") {

                description =
                    complaint.resolution ||
                    "The complaint has been marked as resolved.";

            } else if (status.toLowerCase() === "rejected") {

                description =
                    complaint.rejectionReason ||
                    "The complaint has been rejected.";

            }

            history.push({

                status: status,

                description: description,

                actor: "System",

                timestamp: ""

            });
        }


        return history;
    }


    // =====================================
    // DISPLAY TIMELINE
    // =====================================

    function displayTimeline(timelineSection, history) {

        let timelineList = document.createElement("div");

        timelineList.className = "timeline-list";


        history.forEach(function(event) {

            let timelineItem = document.createElement("div");

            timelineItem.className = "timeline-item";


            let marker = document.createElement("div");

            marker.className = "timeline-marker";


            let eventContent = document.createElement("div");

            eventContent.className = "timeline-content";


            let eventHeading = document.createElement("h4");

            eventHeading.textContent =
                event.status || "Status Updated";


            let eventDescription = document.createElement("p");

            eventDescription.textContent =
                event.description || "Complaint status updated.";


            let eventDate = document.createElement("small");

            if (event.timestamp) {

                let date = new Date(event.timestamp);

                if (!isNaN(date.getTime())) {

                    eventDate.textContent = date.toLocaleString();

                } else {

                    eventDate.textContent = "Date not available";
                }

            } else {

                eventDate.textContent = "Date not available";
            }


            let eventActor = document.createElement("small");

            eventActor.textContent =
                "Updated by: " + (event.actor || "System");


            eventContent.appendChild(eventHeading);

            eventContent.appendChild(eventDescription);

            eventContent.appendChild(eventDate);

            eventContent.appendChild(eventActor);


            timelineItem.appendChild(marker);

            timelineItem.appendChild(eventContent);

            timelineList.appendChild(timelineItem);

        });


        timelineSection.appendChild(timelineList);
    }


    // =====================================
    // TRACK COMPLAINT FUNCTION
    // =====================================

    async function trackComplaint() {

        let referenceNumber = document
            .getElementById("referenceNumber")
            .value.trim().toUpperCase();

        let result = document.getElementById("trackingResult");

        result.innerHTML = "";


        if (referenceNumber === "") {

            result.textContent =
                "Please enter a complaint reference number.";

            result.className = "tracking-error";

            return;
        }


        let currentEmail =
            localStorage.getItem("currentUserEmail");

        let complaint = null;

        let localPrefix = null;


        try {

            // =====================================
            // SEARCH LOCALSTORAGE COMPLAINTS
            // =====================================

            let complaintCount =
                Number(localStorage.getItem("complaintCount")) || 0;

            for (let i = 0; i < complaintCount; i++) {

                let prefix = "complaint_" + i + "_";

                let savedId =
                    localStorage.getItem(prefix + "id");

                let citizenEmail =
                    localStorage.getItem(prefix + "citizenEmail");

                if (
                    savedId === referenceNumber &&
                    citizenEmail === currentEmail
                ) {

                    complaint = {

                        referenceNumber: savedId,

                        title: localStorage.getItem(prefix + "title"),

                        category: localStorage.getItem(prefix + "category"),

                        description: localStorage.getItem(prefix + "description"),

                        location: localStorage.getItem(prefix + "location"),

                        latitude: localStorage.getItem(prefix + "latitude"),

                        longitude: localStorage.getItem(prefix + "longitude"),

                        submittedAt: localStorage.getItem(prefix + "date"),

                        status: localStorage.getItem(prefix + "status") || "Pending",

                        resolution: localStorage.getItem(prefix + "resolution") || "",

                        rejectionReason:
                            localStorage.getItem(prefix + "rejectionReason") || "",

                        attachment: localStorage.getItem(prefix + "photo"),

                        assignedStaffName:
                            localStorage.getItem(prefix + "assignedStaffName") || "",

                        assignedStaffEmail:
                            localStorage.getItem(prefix + "assignedStaffEmail") || "",

                        assignedDepartment:
                            localStorage.getItem(prefix + "assignedDepartment") || ""

                    };

                    localPrefix = prefix;

                    break;
                }
            }


            // =====================================
            // SEARCH MOCK JSON IF NOT FOUND
            // =====================================

            if (!complaint && window.mockDataService) {

                let mockComplaint =
                    await window.mockDataService.getComplaintByReference(
                        referenceNumber
                    );

                if (
                    mockComplaint &&
                    mockComplaint.citizenEmail === currentEmail
                ) {

                    complaint = mockComplaint;
                }
            }


            // =====================================
            // COMPLAINT NOT FOUND
            // =====================================

            if (!complaint) {

                result.textContent =
                    "Complaint not found. Please check your reference number.";

                result.className = "tracking-error";

                return;
            }


            // =====================================
            // GET LATEST SAVED UPDATES
            // =====================================

            let assignmentKey =
                "officer_assignment_" + referenceNumber + "_";


            let assignment = {

                name:
                    localStorage.getItem(assignmentKey + "name") || "",

                email:
                    localStorage.getItem(assignmentKey + "email") || "",

                department:
                    localStorage.getItem(assignmentKey + "department") || ""

            };


            // Latest status

            complaint.status =
                localStorage.getItem(assignmentKey + "status") ||
                (localPrefix
                    ? localStorage.getItem(localPrefix + "status")
                    : null) ||
                complaint.status ||
                "Pending";


            // Latest resolution

            complaint.resolution =
                localStorage.getItem(assignmentKey + "resolution") ||
                (localPrefix
                    ? localStorage.getItem(localPrefix + "resolution")
                    : null) ||
                complaint.resolution ||
                "";


            // Latest rejection reason

            complaint.rejectionReason =
                localStorage.getItem(assignmentKey + "rejectionReason") ||
                (localPrefix
                    ? localStorage.getItem(localPrefix + "rejectionReason")
                    : null) ||
                complaint.rejectionReason ||
                "";


            // Latest assignment information

            complaint.assignedStaffName =
                assignment.name ||
                complaint.assignedStaffName ||
                "";

            complaint.assignedStaffEmail =
                assignment.email ||
                complaint.assignedStaffEmail ||
                "";

            complaint.assignedDepartment =
                assignment.department ||
                complaint.assignedDepartment ||
                "";


            // =====================================
            // GET INSPECTION NOTES
            // =====================================

            let inspectionNotes =
                localStorage.getItem(
                    assignmentKey + "inspectionNotes"
                ) || "";


            // =====================================
            // GET COMPLETION PHOTOGRAPH
            // =====================================

            let completionPhoto =
                localStorage.getItem(
                    assignmentKey + "completionPhoto"
                ) || "";


            // =====================================
            // CREATE RESULT CARD
            // =====================================

            let card = document.createElement("div");

            card.className = "tracking-result-card";


            let heading = document.createElement("h3");

            heading.textContent = "Complaint Details";

            card.appendChild(heading);


            // =====================================
            // DISPLAY COMPLAINT INFORMATION
            // =====================================

            let details = [

                "Reference Number: " + complaint.referenceNumber,

                "Complaint Title: " +
                    (complaint.title || "Not available"),

                "Category: " +
                    (complaint.category || "Not available"),

                "Description: " +
                    (complaint.description || "Not available"),

                "Location: " +
                    (complaint.location || "Not available"),

                "Submitted Date: " +
                    (complaint.submittedAt || "Not available")
            ];


            if (complaint.latitude) {

                details.push("Latitude: " + complaint.latitude);
            }

            if (complaint.longitude) {

                details.push("Longitude: " + complaint.longitude);
            }


            details.forEach(function(detail) {

                let paragraph = document.createElement("p");

                paragraph.textContent = detail;

                card.appendChild(paragraph);
            });


            // =====================================
            // DISPLAY CURRENT STATUS
            // =====================================

            let statusParagraph = document.createElement("p");

            statusParagraph.textContent = "Current Status: ";

            let statusBadge = document.createElement("span");

            let status = complaint.status;

            statusBadge.className =
                "status-badge " +
                status.toLowerCase().replace(/\s+/g, "-");

            statusBadge.textContent = status;

            statusParagraph.appendChild(statusBadge);

            card.appendChild(statusParagraph);


            // =====================================
            // DISPLAY ASSIGNMENT INFORMATION
            // =====================================

            if (
                complaint.assignedStaffName ||
                complaint.assignedDepartment
            ) {

                let assignmentBox = document.createElement("div");

                assignmentBox.className = "resolution-details";


                let assignmentHeading = document.createElement("h4");

                assignmentHeading.textContent = "Assignment Details";

                assignmentBox.appendChild(assignmentHeading);


                if (complaint.assignedStaffName) {

                    let staffParagraph = document.createElement("p");

                    staffParagraph.textContent =
                        "Assigned Staff: " + complaint.assignedStaffName;

                    assignmentBox.appendChild(staffParagraph);
                }


                if (complaint.assignedDepartment) {

                    let departmentParagraph = document.createElement("p");

                    departmentParagraph.textContent =
                        "Department: " + complaint.assignedDepartment;

                    assignmentBox.appendChild(departmentParagraph);
                }


                card.appendChild(assignmentBox);
            }


            // =====================================
            // DISPLAY CHRONOLOGICAL STATUS TIMELINE
            // =====================================

            let timelineSection = document.createElement("div");

            timelineSection.className = "complaint-timeline";


            let timelineHeading = document.createElement("h3");

            timelineHeading.textContent = "Complaint Status Timeline";

            timelineSection.appendChild(timelineHeading);


            let history = [];

            if (window.getComplaintStatusHistory) {

                history =
                    getComplaintStatusHistory(referenceNumber);
            }


            if (!Array.isArray(history)) {

                history = [];
            }


            // Use fallback timeline for complaints without history

            if (history.length === 0) {

                history = createFallbackHistory(
                    complaint,
                    assignment
                );

            } else {

                // Add the current status if the saved history
                // does not already contain it.

                let currentStatusExists = history.some(function(event) {

                    return event.status &&
                        event.status.toLowerCase() ===
                        complaint.status.toLowerCase();

                });


                if (!currentStatusExists) {

                    let description =
                        "Complaint status is currently " +
                        complaint.status + ".";


                    if (complaint.status.toLowerCase() === "resolved") {

                        description =
                            complaint.resolution ||
                            "The complaint has been marked as resolved.";

                    } else if (
                        complaint.status.toLowerCase() === "rejected"
                    ) {

                        description =
                            complaint.rejectionReason ||
                            "The complaint has been rejected.";
                    }


                    history.push({

                        status: complaint.status,

                        description: description,

                        actor: "System",

                        timestamp: ""

                    });
                }
            }


            // Sort timeline chronologically.
            // Events without dates appear after dated events.

            history.sort(function(a, b) {

                let dateA = a.timestamp
                    ? new Date(a.timestamp).getTime()
                    : Infinity;

                let dateB = b.timestamp
                    ? new Date(b.timestamp).getTime()
                    : Infinity;

                return dateA - dateB;

            });


            if (history.length > 0) {

                displayTimeline(timelineSection, history);

            } else {

                let noHistory = document.createElement("p");

                noHistory.textContent =
                    "No status updates are available for this complaint yet.";

                timelineSection.appendChild(noHistory);
            }


            card.appendChild(timelineSection);


            // =====================================
            // DISPLAY INSPECTION NOTES
            // =====================================

            if (inspectionNotes && inspectionNotes.trim() !== "") {

                let inspectionBox = document.createElement("div");

                inspectionBox.className = "resolution-details";


                let inspectionHeading = document.createElement("h4");

                inspectionHeading.textContent = "Inspection Notes";


                let inspectionText = document.createElement("p");

                inspectionText.textContent = inspectionNotes;


                inspectionBox.appendChild(inspectionHeading);

                inspectionBox.appendChild(inspectionText);

                card.appendChild(inspectionBox);
            }


            // =====================================
            // DISPLAY RESOLUTION DETAILS
            // =====================================

            if (complaint.resolution && complaint.resolution.trim() !== "") {

                let resolutionBox = document.createElement("div");

                resolutionBox.className = "resolution-details";


                let resolutionHeading = document.createElement("h4");

                resolutionHeading.textContent = "Resolution Details";


                let resolutionText = document.createElement("p");

                resolutionText.textContent = complaint.resolution;


                resolutionBox.appendChild(resolutionHeading);

                resolutionBox.appendChild(resolutionText);

                card.appendChild(resolutionBox);
            }


            // =====================================
            // DISPLAY REJECTION REASON
            // =====================================

            if (
                status.toLowerCase() === "rejected" &&
                complaint.rejectionReason &&
                complaint.rejectionReason.trim() !== ""
            ) {

                let rejectionBox = document.createElement("div");

                rejectionBox.className = "resolution-details";


                let rejectionHeading = document.createElement("h4");

                rejectionHeading.textContent = "Rejection Reason";


                let rejectionText = document.createElement("p");

                rejectionText.textContent = complaint.rejectionReason;


                rejectionBox.appendChild(rejectionHeading);

                rejectionBox.appendChild(rejectionText);

                card.appendChild(rejectionBox);
            }


            // =====================================
            // DISPLAY COMPLETION PHOTOGRAPH
            // =====================================

            if (completionPhoto && completionPhoto.trim() !== "") {

                let completionHeading = document.createElement("h4");

                completionHeading.textContent = "Completion Photograph";

                card.appendChild(completionHeading);


                let completionImage = document.createElement("img");

                completionImage.src = completionPhoto;

                completionImage.alt =
                    "Photograph showing completed complaint work";

                completionImage.style.width = "100%";

                completionImage.style.maxWidth = "350px";

                completionImage.style.maxHeight = "250px";

                completionImage.style.objectFit = "cover";

                completionImage.style.marginTop = "10px";

                completionImage.style.borderRadius = "8px";

                card.appendChild(completionImage);
            }


            // =====================================
            // DISPLAY ORIGINAL COMPLAINT PHOTOGRAPH
            // =====================================

            let photo = complaint.attachment || complaint.photo;

            if (photo && photo.trim() !== "") {

                let photoHeading = document.createElement("h4");

                photoHeading.textContent =
                    "Original Complaint Photograph";

                card.appendChild(photoHeading);


                let image = document.createElement("img");

                image.src = photo;

                image.alt = "Original complaint photograph";

                image.style.width = "100%";

                image.style.maxWidth = "350px";

                image.style.marginTop = "10px";

                image.style.borderRadius = "8px";

                card.appendChild(image);
            }


            // =====================================
            // DISPLAY FINAL RESULT
            // =====================================

            result.appendChild(card);

            result.className = "tracking-result";

        } catch (error) {

            console.error("Tracking Error:", error);

            result.textContent =
                "Unable to track complaint. Please try again.";

            result.className = "tracking-error";
        }
    }


    // =====================================
    // LOGOUT FUNCTION
    // =====================================

    function logout() {

        localStorage.removeItem("isLoggedIn");

        localStorage.removeItem("currentUserName");

        localStorage.removeItem("currentUserEmail");

        localStorage.removeItem("currentUserRole");

        localStorage.removeItem("currentUserDepartment");

        window.location.href = "login.html";
    }


    // =====================================
    // MAKE FUNCTIONS ACCESSIBLE TO HTML
    // =====================================

    window.trackComplaint = trackComplaint;

    window.logout = logout;

}
