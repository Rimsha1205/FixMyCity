
// =====================================
// FIXMYCITY - MUNICIPAL OFFICER DASHBOARD
// =====================================


// =====================================
// CHECK MUNICIPAL OFFICER LOGIN
// =====================================

if (
    localStorage.getItem("isLoggedIn") !== "true" ||
    localStorage.getItem("currentUserRole") !== "Municipal Officer"
) {

    window.location.href = "login.html";

} else {


    // =====================================
    // DISPLAY OFFICER NAME
    // =====================================

    document.getElementById("officerName").textContent =
        localStorage.getItem("currentUserName") || "Municipal Officer";


    // =====================================
    // GET STAFF FOR COMPLAINT CATEGORY
    // =====================================

    function getStaffForComplaint(category) {

        let departmentMap = {

            "Garbage Collection": "Sanitation",

            "Road Damage": "Roads and Infrastructure",

            "Streetlight Issue": "Street Lighting",

            "Water Leakage": "Water Supply",

            "Drainage Problem": "Drainage",

            "Public Toilet Issue": "Public Health"

        };

        let requiredDepartment = departmentMap[category];

        let staff = [];

        let userCount =
            Number(localStorage.getItem("userCount")) || 0;

        if (
            !Number.isSafeInteger(userCount) ||
            userCount < 0
        ) {
            return staff;
        }


        for (let i = 0; i < userCount; i++) {

            let role =
                localStorage.getItem("user_" + i + "_role");

            let department =
                localStorage.getItem("user_" + i + "_department");

            let name =
                localStorage.getItem("user_" + i + "_name");

            let email =
                localStorage.getItem("user_" + i + "_email");


            // Other category allows any department staff
            let departmentMatches =
                category === "Other" ||
                (
                    requiredDepartment &&
                    department &&
                    department.toLowerCase() ===
                    requiredDepartment.toLowerCase()
                );


            if (
                role === "Department Staff" &&
                departmentMatches &&
                name &&
                email
            ) {

                staff.push({

                    name: name,

                    email: email,

                    department: department

                });
            }
        }

        return staff;
    }



    // =====================================
    // SAFE LOCALSTORAGE UPDATE
    // =====================================

    function saveStorageChanges(values, keysToRemove = []) {

        let previousValues = {};

        let allKeys = [
            ...Object.keys(values),
            ...keysToRemove
        ];

        // Preserve original values for rollback
        allKeys.forEach(function(key) {

            previousValues[key] = localStorage.getItem(key);

        });


        try {

            // Save new values
            Object.keys(values).forEach(function(key) {

                localStorage.setItem(key, String(values[key]));

            });


            // Remove specified values
            keysToRemove.forEach(function(key) {

                localStorage.removeItem(key);

            });

            return true;

        } catch (error) {

            console.error("LocalStorage Update Error:", error);


            // Restore previous values if saving fails
            allKeys.forEach(function(key) {

                try {

                    if (previousValues[key] === null) {

                        localStorage.removeItem(key);

                    } else {

                        localStorage.setItem(
                            key,
                            previousValues[key]
                        );
                    }

                } catch (rollbackError) {

                    console.error(
                        "Storage rollback error:",
                        rollbackError
                    );
                }
            });

            return false;
        }
    }



    // =====================================
    // GET LOCALSTORAGE COMPLAINTS
    // =====================================

    function getLocalComplaints() {

        let complaints = [];

        let complaintCount =
            Number(localStorage.getItem("complaintCount")) || 0;

        if (
            !Number.isSafeInteger(complaintCount) ||
            complaintCount < 0
        ) {
            return complaints;
        }


        for (let i = 0; i < complaintCount; i++) {

            let prefix = "complaint_" + i + "_";

            let referenceNumber =
                localStorage.getItem(prefix + "id");

            // Ignore incomplete records
            if (!referenceNumber) {
                continue;
            }


            complaints.push({

                referenceNumber: referenceNumber,

                title:
                    localStorage.getItem(prefix + "title"),

                category:
                    localStorage.getItem(prefix + "category"),

                description:
                    localStorage.getItem(prefix + "description"),

                citizenEmail:
                    localStorage.getItem(prefix + "citizenEmail"),

                location:
                    localStorage.getItem(prefix + "location"),

                latitude:
                    localStorage.getItem(prefix + "latitude"),

                longitude:
                    localStorage.getItem(prefix + "longitude"),

                submittedAt:
                    localStorage.getItem(prefix + "date"),

                status:
                    localStorage.getItem(prefix + "status") || "Pending",

                resolution:
                    localStorage.getItem(prefix + "resolution") || "",

                rejectionReason:
                    localStorage.getItem(prefix + "rejectionReason") || "",

                assignedStaffEmail:
                    localStorage.getItem(prefix + "assignedStaffEmail"),

                assignedStaffName:
                    localStorage.getItem(prefix + "assignedStaffName"),

                assignedDepartment:
                    localStorage.getItem(prefix + "assignedDepartment"),

                photo:
                    localStorage.getItem(prefix + "photo"),

                localPrefix: prefix

            });
        }

        return complaints;
    }



    // =====================================
    // SHOW COMPLAINT DETAILS
    // =====================================

    function showComplaintDetails(complaint) {

        let modal = document.createElement("div");

        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.backgroundColor = "rgba(0,0,0,0.6)";
        modal.style.zIndex = "9999";
        modal.style.display = "flex";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
        modal.style.padding = "20px";


        let content = document.createElement("div");

        content.style.backgroundColor = "white";
        content.style.padding = "25px";
        content.style.borderRadius = "12px";
        content.style.width = "100%";
        content.style.maxWidth = "650px";
        content.style.maxHeight = "85vh";
        content.style.overflowY = "auto";


        let heading = document.createElement("h2");

        heading.textContent = "Complaint Details";

        content.appendChild(heading);


        // Complaint information

        let details = [

            ["Reference Number", complaint.referenceNumber],

            ["Title", complaint.title],

            ["Category", complaint.category],

            ["Description", complaint.description],

            ["Citizen Email", complaint.citizenEmail],

            ["Location", complaint.location],

            ["Latitude", complaint.latitude],

            ["Longitude", complaint.longitude],

            ["Submitted Date",
                complaint.submittedAt || complaint.date
            ],

            ["Status", complaint.status],

            ["Assigned Staff", complaint.assignedStaffName],

            ["Department", complaint.assignedDepartment],

            ["Resolution", complaint.resolution],

            ["Rejection Reason",
                complaint.status === "Rejected"
                    ? complaint.rejectionReason
                    : ""
            ]

        ];


        details.forEach(function(item) {

            let paragraph = document.createElement("p");

            paragraph.textContent =
                item[0] + ": " + (item[1] || "-");

            content.appendChild(paragraph);

        });


        // Display original complaint photograph

        let photo = complaint.photo || complaint.attachment;

        if (photo) {

            let image = document.createElement("img");

            image.src = photo;

            image.alt = "Complaint photograph";

            image.style.maxWidth = "100%";

            image.style.maxHeight = "250px";

            image.style.objectFit = "contain";

            image.style.display = "block";

            image.style.marginTop = "15px";

            content.appendChild(image);
        }


        // Close button

        let closeButton = document.createElement("button");

        closeButton.textContent = "Close";

        closeButton.type = "button";

        closeButton.className = "btn btn-primary";

        closeButton.style.marginTop = "15px";

        closeButton.addEventListener("click", function() {

            modal.remove();

        });


        content.appendChild(closeButton);

        modal.appendChild(content);


        // Close when clicking outside the modal

        modal.addEventListener("click", function(event) {

            if (event.target === modal) {

                modal.remove();

            }
        });


        document.body.appendChild(modal);
    }



    // =====================================
    // DISPLAY ALL COMPLAINTS
    // =====================================

    async function displayOfficerComplaints() {

        let table =
            document.getElementById("officerComplaintTable");

        table.innerHTML = "";


        try {

            // =====================================
            // LOAD MOCK COMPLAINTS
            // =====================================

            let mockComplaints = [];

            if (window.mockDataService) {

                mockComplaints =
                    await window.mockDataService.getAllComplaints();

            }


            if (!Array.isArray(mockComplaints)) {

                mockComplaints = [];

            }


            // =====================================
            // LOAD LOCALSTORAGE COMPLAINTS
            // =====================================

            let localComplaints = getLocalComplaints();


            // =====================================
            // COMBINE COMPLAINTS
            // =====================================

            let complaintMap = new Map();


            mockComplaints.forEach(function(complaint) {

                if (complaint.referenceNumber) {

                    complaintMap.set(
                        complaint.referenceNumber,
                        complaint
                    );
                }
            });


            // LocalStorage records override mock records
            localComplaints.forEach(function(complaint) {

                complaintMap.set(
                    complaint.referenceNumber,
                    complaint
                );
            });


            let complaints =
                Array.from(complaintMap.values());


            // =====================================
            // INITIALIZE STATISTICS
            // =====================================

            let total = complaints.length;

            let pending = 0;

            let progress = 0;

            let resolved = 0;

            let rejected = 0;


            // =====================================
            // PROCESS EACH COMPLAINT
            // =====================================

            complaints.forEach(function(complaint) {

                let referenceNumber =
                    complaint.referenceNumber;

                let assignmentKey =
                    "officer_assignment_" +
                    referenceNumber + "_";


                // =====================================
                // GET LATEST ASSIGNMENT DETAILS
                // =====================================

                let assignedEmail =
                    localStorage.getItem(assignmentKey + "email") ||
                    complaint.assignedStaffEmail ||
                    "";

                let assignedName =
                    localStorage.getItem(assignmentKey + "name") ||
                    complaint.assignedStaffName ||
                    "";

                let assignedDepartment =
                    localStorage.getItem(assignmentKey + "department") ||
                    complaint.assignedDepartment ||
                    "";


                // =====================================
                // GET LATEST STATUS
                // =====================================

                let status =
                    localStorage.getItem(assignmentKey + "status") ||

                    (complaint.localPrefix
                        ? localStorage.getItem(
                            complaint.localPrefix + "status"
                        )
                        : null) ||

                    complaint.status ||

                    "Pending";


                // =====================================
                // GET RESOLUTION
                // =====================================

                let resolution =
                    localStorage.getItem(assignmentKey + "resolution") ||

                    (complaint.localPrefix
                        ? localStorage.getItem(
                            complaint.localPrefix + "resolution"
                        )
                        : null) ||

                    complaint.resolution ||

                    "";


                // =====================================
                // GET REJECTION REASON
                // =====================================

                let rejectionReason =
                    localStorage.getItem(
                        assignmentKey + "rejectionReason"
                    ) ||

                    (complaint.localPrefix
                        ? localStorage.getItem(
                            complaint.localPrefix + "rejectionReason"
                        )
                        : null) ||

                    complaint.rejectionReason ||

                    "";


                // =====================================
                // UPDATE COMPLAINT OBJECT
                // =====================================

                complaint.status = status;

                complaint.resolution = resolution;

                complaint.rejectionReason = rejectionReason;

                complaint.assignedStaffName = assignedName;

                complaint.assignedStaffEmail = assignedEmail;

                complaint.assignedDepartment = assignedDepartment;


                // =====================================
                // UPDATE STATISTICS
                // =====================================

                let normalizedStatus = status.toLowerCase();

                if (
                    normalizedStatus === "pending" ||
                    normalizedStatus === "submitted" ||
                    normalizedStatus === "assigned"
                ) {

                    pending++;

                } else if (normalizedStatus === "in progress") {

                    progress++;

                } else if (normalizedStatus === "resolved") {

                    resolved++;

                } else if (normalizedStatus === "rejected") {

                    rejected++;

                }


                // =====================================
                // CREATE TABLE ROW
                // =====================================

                let row = document.createElement("tr");


                // Complaint information columns

                let values = [

                    referenceNumber,

                    complaint.title,

                    complaint.category,

                    complaint.citizenEmail,

                    complaint.location,

                    complaint.latitude,

                    complaint.longitude,

                    complaint.submittedAt || complaint.date

                ];


                values.forEach(function(value) {

                    let cell = document.createElement("td");

                    cell.textContent =
                        value !== null &&
                        value !== undefined &&
                        value !== ""
                            ? value
                            : "-";

                    row.appendChild(cell);

                });


                // =====================================
                // STATUS COLUMN
                // =====================================

                let statusCell = document.createElement("td");

                let statusBadge = document.createElement("span");

                statusBadge.className =
                    "status-badge " +
                    normalizedStatus.replace(/\s+/g, "-");

                statusBadge.textContent = status;

                statusCell.appendChild(statusBadge);

                row.appendChild(statusCell);


                // =====================================
                // ASSIGNED TO COLUMN
                // =====================================

                let assignedCell = document.createElement("td");

                assignedCell.className = "assigned-staff-cell";


                if (assignedEmail && assignedName) {

                    let nameElement =
                        document.createElement("div");

                    nameElement.className = "assigned-staff-name";

                    nameElement.textContent = assignedName;


                    let departmentElement =
                        document.createElement("span");

                    departmentElement.className = "assigned-department";

                    departmentElement.textContent =
                        assignedDepartment || "Department not specified";


                    assignedCell.appendChild(nameElement);

                    assignedCell.appendChild(departmentElement);

                } else {

                    let notAssigned =
                        document.createElement("span");

                    notAssigned.className = "not-assigned";

                    notAssigned.textContent = "Not Assigned";

                    assignedCell.appendChild(notAssigned);
                }


                row.appendChild(assignedCell);


                // =====================================
                // ASSIGNMENT CONTROLS
                // =====================================

                let assignmentCell =
                    document.createElement("td");

                assignmentCell.className = "assignment-cell";


                let controls =
                    document.createElement("div");

                controls.className = "assignment-controls";


                // =====================================
                // STAFF DROPDOWN
                // =====================================

                let staffSelect =
                    document.createElement("select");

                let defaultOption =
                    document.createElement("option");

                defaultOption.value = "";

                defaultOption.textContent = "Select Staff";

                staffSelect.appendChild(defaultOption);


                let availableStaff =
                    getStaffForComplaint(complaint.category);


                availableStaff.forEach(function(staff) {

                    let option =
                        document.createElement("option");

                    option.value = staff.email;

                    option.textContent =
                        staff.name + " (" + staff.department + ")";


                    if (staff.email === assignedEmail) {

                        option.selected = true;

                    }

                    staffSelect.appendChild(option);

                });


                // =====================================
                // ASSIGN / EDIT ASSIGNMENT BUTTON
                // =====================================

                let assignButton =
                    document.createElement("button");

                assignButton.type = "button";

                assignButton.className = "assign-btn";

                assignButton.textContent =
                    assignedEmail
                        ? "Edit Assignment"
                        : "Assign Staff";


                if (availableStaff.length === 0) {

                    staffSelect.disabled = true;

                    assignButton.disabled = true;

                    defaultOption.textContent = "No staff available";

                }


                // =====================================
                // ASSIGNMENT ACTION
                // =====================================

                assignButton.addEventListener("click", function() {

                    if (assignButton.disabled) return;


                    let selectedEmail = staffSelect.value;


                    if (!selectedEmail) {

                        alert("Please select a staff member.");

                        return;
                    }


                    let selectedStaff = availableStaff.find(
                        function(staff) {

                            return staff.email === selectedEmail;

                        }
                    );


                    if (!selectedStaff) {

                        alert("Selected staff member was not found.");

                        return;
                    }


                    let confirmAssignment = confirm(

                        "Assign this complaint to " +
                        selectedStaff.name +
                        " (" + selectedStaff.department + ")?"

                    );


                    if (!confirmAssignment) return;


                    // =====================================
                    // CHECK WHETHER ASSIGNMENT CHANGED
                    // =====================================

                    let previousEmail =
                        localStorage.getItem(assignmentKey + "email") ||
                        complaint.assignedStaffEmail ||
                        "";

                    let assignmentChanged =
                        previousEmail !== selectedStaff.email;


                    // =====================================
                    // PREPARE ASSIGNMENT DATA
                    // =====================================

                    let assignmentValues = {};


                    assignmentValues[assignmentKey + "email"] =
                        selectedStaff.email;

                    assignmentValues[assignmentKey + "name"] =
                        selectedStaff.name;

                    assignmentValues[assignmentKey + "department"] =
                        selectedStaff.department;

                    assignmentValues[assignmentKey + "status"] =
                        "Assigned";


                    let assignmentKeysToRemove = [

                        assignmentKey + "rejectionReason"

                    ];


                    // Also update original LocalStorage complaint
                    if (complaint.localPrefix) {

                        assignmentValues[
                            complaint.localPrefix + "assignedStaffEmail"
                        ] = selectedStaff.email;


                        assignmentValues[
                            complaint.localPrefix + "assignedStaffName"
                        ] = selectedStaff.name;


                        assignmentValues[
                            complaint.localPrefix + "assignedDepartment"
                        ] = selectedStaff.department;


                        assignmentValues[
                            complaint.localPrefix + "status"
                        ] = "Assigned";


                        assignmentKeysToRemove.push(
                            complaint.localPrefix + "rejectionReason"
                        );
                    }


                    // =====================================
                    // SAVE ASSIGNMENT
                    // =====================================

                    assignButton.disabled = true;

                    assignButton.textContent = "Saving...";


                    let saved = saveStorageChanges(
                        assignmentValues,
                        assignmentKeysToRemove
                    );


                    if (!saved) {

                        alert(
                            "Unable to update the assignment. Please try again."
                        );

                        assignButton.disabled = false;

                        assignButton.textContent =
                            assignedEmail
                                ? "Edit Assignment"
                                : "Assign Staff";

                        return;
                    }


                    // =====================================
                    // RECORD STATUS HISTORY
                    // =====================================

                    if (
                        assignmentChanged &&
                        window.recordComplaintStatus
                    ) {

                        try {

                            recordComplaintStatus(

                                referenceNumber,

                                "Assigned",

                                "Complaint assigned to " +
                                    selectedStaff.name +
                                    " (" + selectedStaff.department + ").",

                                localStorage.getItem("currentUserName")

                            );

                        } catch (error) {

                            console.error(
                                "Unable to record assignment history:",
                                error
                            );

                        }
                    }


                    alert("Staff assignment updated successfully!");

                    displayOfficerComplaints();

                });


                // =====================================
                // REJECT / EDIT REJECTION BUTTON
                // =====================================

                let rejectButton =
                    document.createElement("button");

                rejectButton.type = "button";

                rejectButton.className = "reject-btn";

                rejectButton.textContent =
                    normalizedStatus === "rejected"
                        ? "Edit Rejection"
                        : "Reject Complaint";


                // =====================================
                // REJECTION ACTION
                // =====================================

                rejectButton.addEventListener("click", function() {

                    if (rejectButton.disabled) return;


                    let existingReason =
                        localStorage.getItem(
                            assignmentKey + "rejectionReason"
                        ) ||

                        complaint.rejectionReason ||

                        "";


                    let reason = prompt(

                        existingReason
                            ? "Edit the rejection reason:"
                            : "Enter the reason for rejecting this complaint:",

                        existingReason

                    );


                    if (reason === null) return;

                    reason = reason.trim();


                    // Validate rejection reason

                    if (reason.length < 5) {

                        alert(
                            "Please enter a rejection reason with at least 5 characters."
                        );

                        return;
                    }


                    if (reason.length > 500) {

                        alert(
                            "Rejection reason must not exceed 500 characters."
                        );

                        return;
                    }


                    let confirmReject = confirm(

                        "Are you sure you want to reject this complaint?"

                    );


                    if (!confirmReject) return;


                    // =====================================
                    // PREPARE REJECTION DATA
                    // =====================================

                    let rejectionValues = {};


                    rejectionValues[assignmentKey + "status"] =
                        "Rejected";


                    rejectionValues[assignmentKey + "rejectionReason"] =
                        reason;


                    if (complaint.localPrefix) {

                        rejectionValues[
                            complaint.localPrefix + "status"
                        ] = "Rejected";


                        rejectionValues[
                            complaint.localPrefix + "rejectionReason"
                        ] = reason;
                    }


                    // =====================================
                    // SAVE REJECTION
                    // =====================================

                    rejectButton.disabled = true;

                    rejectButton.textContent = "Saving...";


                    let saved = saveStorageChanges(
                        rejectionValues
                    );


                    if (!saved) {

                        alert(
                            "Unable to reject the complaint. Please try again."
                        );

                        rejectButton.disabled = false;

                        rejectButton.textContent =
                            normalizedStatus === "rejected"
                                ? "Edit Rejection"
                                : "Reject Complaint";

                        return;
                    }


                    // =====================================
                    // RECORD REJECTION HISTORY
                    // =====================================

                    let previousReason =
                        localStorage.getItem(
                            assignmentKey + "rejectionReason"
                        );


                    // Check whether this is a new rejection
                    let rejectionChanged =
                        normalizedStatus !== "rejected" ||
                        previousReason !== reason;


                    if (
                        rejectionChanged &&
                        window.recordComplaintStatus
                    ) {

                        try {

                            recordComplaintStatus(

                                referenceNumber,

                                "Rejected",

                                "Complaint rejected. Reason: " + reason,

                                localStorage.getItem("currentUserName")

                            );

                        } catch (error) {

                            console.error(
                                "Unable to record rejection history:",
                                error
                            );

                        }
                    }


                    alert("Complaint rejection updated successfully!");

                    displayOfficerComplaints();

                });



                // =====================================
                // RESOLVED COMPLAINT CONTROLS
                // =====================================

                if (normalizedStatus === "resolved") {

                    let completedMessage =
                        document.createElement("span");

                    completedMessage.className = "not-assigned";

                    completedMessage.textContent =
                        "Complaint Resolved";

                    controls.appendChild(completedMessage);

                } else {

                    controls.appendChild(staffSelect);

                    controls.appendChild(assignButton);

                    controls.appendChild(rejectButton);

                }


                assignmentCell.appendChild(controls);

                row.appendChild(assignmentCell);



                // =====================================
                // CLICK ROW TO VIEW COMPLAINT DETAILS
                // =====================================

                row.style.cursor = "pointer";


                row.addEventListener("click", function(event) {

                    if (
                        event.target.closest("button") ||
                        event.target.closest("select")
                    ) {
                        return;
                    }

                    showComplaintDetails(complaint);

                });


                // Add row to table

                table.appendChild(row);

            });



            // =====================================
            // NO COMPLAINTS MESSAGE
            // =====================================

            if (total === 0) {

                let emptyRow = document.createElement("tr");

                let emptyCell = document.createElement("td");

                emptyCell.colSpan = 11;

                emptyCell.textContent =
                    "No complaints have been registered yet.";

                emptyRow.appendChild(emptyCell);

                table.appendChild(emptyRow);

            }



            // =====================================
            // UPDATE COMPLAINT STATISTICS
            // =====================================

            document.getElementById("officerTotal").textContent =
                total;

            document.getElementById("officerPending").textContent =
                pending;

            document.getElementById("officerProgress").textContent =
                progress;

            document.getElementById("officerResolved").textContent =
                resolved;

            document.getElementById("officerRejected").textContent =
                rejected;


        } catch (error) {

            console.error(
                "Officer Dashboard Error:",
                error
            );


            table.innerHTML = "";

            let errorRow = document.createElement("tr");

            let errorCell = document.createElement("td");

            errorCell.colSpan = 11;

            errorCell.textContent =
                "Unable to load complaints. Please refresh the page.";

            errorRow.appendChild(errorCell);

            table.appendChild(errorRow);

        }

    }



    // =====================================
    // LOGOUT
    // =====================================

    function logout() {

        let confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (confirmLogout) {

            localStorage.removeItem("isLoggedIn");

            localStorage.removeItem("currentUserName");

            localStorage.removeItem("currentUserEmail");

            localStorage.removeItem("currentUserRole");

            localStorage.removeItem("currentUserDepartment");

            window.location.href = "login.html";

        }
    }


    // Make logout available to HTML onclick
    window.logout = logout;



    // =====================================
    // LOAD OFFICER DASHBOARD
    // =====================================

    displayOfficerComplaints();

}
