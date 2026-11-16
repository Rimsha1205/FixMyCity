
// =====================================
// FIXMYCITY - DEPARTMENT STAFF DASHBOARD
// =====================================


// =====================================
// CHECK DEPARTMENT STAFF LOGIN
// =====================================

if (
    localStorage.getItem("isLoggedIn") !== "true" ||
    localStorage.getItem("currentUserRole") !== "Department Staff"
) {

    window.location.href = "login.html";

} else {

    // =====================================
    // DISPLAY STAFF INFORMATION
    // =====================================

    let currentEmail =
        localStorage.getItem("currentUserEmail");

    document.getElementById("staffName").textContent =
        localStorage.getItem("currentUserName") || "Staff Member";

    document.getElementById("staffDepartment").textContent =
        localStorage.getItem("currentUserDepartment") || "Not specified";


    // =====================================
    // READ IMAGE FILE AS DATA URL
    // =====================================

    function readImageFile(file) {

        return new Promise(function(resolve, reject) {

            let reader = new FileReader();

            reader.onload = function() {
                resolve(reader.result);
            };

            reader.onerror = function() {
                reject(new Error("Unable to read the selected image."));
            };

            reader.readAsDataURL(file);

        });
    }


    // =====================================
    // SAFE LOCALSTORAGE SAVE WITH ROLLBACK
    // =====================================

    function saveStorageChanges(values) {

        let previousValues = {};

        let keys = Object.keys(values);

        keys.forEach(function(key) {

            previousValues[key] = localStorage.getItem(key);

        });


        try {

            keys.forEach(function(key) {

                localStorage.setItem(key, values[key]);

            });

            return true;

        } catch (error) {

            console.error("LocalStorage Save Error:", error);


            // Restore previous values
            keys.forEach(function(key) {

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
                        "Storage rollback failed:",
                        rollbackError
                    );

                }

            });

            return false;
        }
    }


    // =====================================
    // CREATE IMAGE ELEMENT
    // =====================================

    function createImageElement(source, altText) {

        if (!source) {
            return null;
        }

        let image = document.createElement("img");

        image.src = source;

        image.alt = altText;

        image.style.maxWidth = "250px";

        image.style.maxHeight = "180px";

        image.style.objectFit = "contain";

        image.style.display = "block";

        image.style.margin = "10px 0";

        image.style.borderRadius = "8px";

        return image;
    }


    // =====================================
    // DISPLAY ASSIGNED COMPLAINTS
    // =====================================

    async function displayStaffComplaints() {

        let complaintList =
            document.getElementById("staffComplaintList");

        let total = 0;

        let pending = 0;

        let progress = 0;

        let resolved = 0;


        complaintList.innerHTML = "";


        try {

            // =====================================
            // CHECK STAFF EMAIL
            // =====================================

            if (!currentEmail) {

                complaintList.textContent =
                    "Unable to identify your staff account. Please login again.";

                return;
            }


            // =====================================
            // LOAD MOCK JSON COMPLAINTS
            // =====================================

            let mockComplaints = [];

            if (
                window.mockDataService &&
                typeof window.mockDataService.getAllComplaints === "function"
            ) {

                mockComplaints =
                    await window.mockDataService.getAllComplaints();

            }

            if (!Array.isArray(mockComplaints)) {

                mockComplaints = [];

            }


            // =====================================
            // LOAD LOCALSTORAGE COMPLAINTS
            // =====================================

            let localComplaints = [];

            let complaintCount =
                Number(localStorage.getItem("complaintCount")) || 0;


            if (
                !Number.isSafeInteger(complaintCount) ||
                complaintCount < 0
            ) {

                complaintCount = 0;

            }


            for (let i = 0; i < complaintCount; i++) {

                let prefix = "complaint_" + i + "_";

                let referenceNumber =
                    localStorage.getItem(prefix + "id");


                // Ignore incomplete complaint records
                if (!referenceNumber) {
                    continue;
                }


                let complaint = {

                    referenceNumber: referenceNumber,

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

                    submittedAt:
                        localStorage.getItem(prefix + "date"),

                    status:
                        localStorage.getItem(prefix + "status") || "Pending",

                    resolution:
                        localStorage.getItem(prefix + "resolution") || "",

                    photo:
                        localStorage.getItem(prefix + "photo") || "",

                    assignedStaffEmail:
                        localStorage.getItem(prefix + "assignedStaffEmail"),

                    assignedStaffName:
                        localStorage.getItem(prefix + "assignedStaffName"),

                    assignedDepartment:
                        localStorage.getItem(prefix + "assignedDepartment"),

                    localPrefix: prefix

                };


                localComplaints.push(complaint);

            }


            // =====================================
            // COMBINE MOCK AND LOCALSTORAGE DATA
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


            // LocalStorage data takes priority
            localComplaints.forEach(function(complaint) {

                complaintMap.set(
                    complaint.referenceNumber,
                    complaint
                );

            });


            let allComplaints =
                Array.from(complaintMap.values());


            // =====================================
            // DISPLAY COMPLAINTS ASSIGNED TO STAFF
            // =====================================

            allComplaints.forEach(function(complaint) {

                let referenceNumber =
                    complaint.referenceNumber;


                if (!referenceNumber) {
                    return;
                }


                let assignmentKey =
                    "officer_assignment_" +
                    referenceNumber + "_";


                // =====================================
                // GET ASSIGNMENT DETAILS
                // =====================================

                let assignedEmail =
                    localStorage.getItem(assignmentKey + "email") ||
                    complaint.assignedStaffEmail ||
                    "";


                let assignedName =
                    localStorage.getItem(assignmentKey + "name") ||
                    complaint.assignedStaffName ||
                    "";


                // Only show complaints assigned to logged-in staff
                if (assignedEmail !== currentEmail) {
                    return;
                }


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

                    "Assigned";


                let normalizedStatus =
                    String(status).toLowerCase();


                // Skip rejected complaints
                if (normalizedStatus === "rejected") {
                    return;
                }


                // =====================================
                // GET LATEST RESOLUTION
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
                // CALCULATE STATISTICS
                // =====================================

                total++;


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

                }


                // =====================================
                // CREATE COMPLAINT CARD
                // =====================================

                let card = document.createElement("div");

                card.className = "staff-complaint-card";


                // =====================================
                // COMPLAINT INFORMATION
                // =====================================

                let heading = document.createElement("h3");

                heading.textContent =
                    complaint.title || "Untitled Complaint";


                let reference = document.createElement("p");

                reference.textContent =
                    "Reference Number: " + referenceNumber;


                let categoryText = document.createElement("p");

                categoryText.textContent =
                    "Category: " +
                    (complaint.category || "Not specified");


                let descriptionText = document.createElement("p");

                descriptionText.textContent =
                    "Description: " +
                    (complaint.description || "Not provided");


                let locationText = document.createElement("p");

                locationText.textContent =
                    "Location: " +
                    (complaint.location || "Not specified");


                let latitudeText = document.createElement("p");

                latitudeText.textContent =
                    "Latitude: " +
                    (
                        complaint.latitude !== null &&
                        complaint.latitude !== undefined &&
                        complaint.latitude !== ""
                            ? complaint.latitude
                            : "-"
                    );


                let longitudeText = document.createElement("p");

                longitudeText.textContent =
                    "Longitude: " +
                    (
                        complaint.longitude !== null &&
                        complaint.longitude !== undefined &&
                        complaint.longitude !== ""
                            ? complaint.longitude
                            : "-"
                    );


                let dateText = document.createElement("p");

                dateText.textContent =
                    "Date: " +
                    (
                        complaint.submittedAt ||
                        complaint.date ||
                        "Not specified"
                    );


                let assignedStaffText = document.createElement("p");

                assignedStaffText.textContent =
                    "Assigned Staff: " +
                    (
                        assignedName ||
                        localStorage.getItem("currentUserName") ||
                        "Staff Member"
                    );


                // =====================================
                // ORIGINAL COMPLAINT PHOTOGRAPH
                // =====================================

                let originalPhoto =
                    complaint.photo || complaint.attachment || "";


                if (originalPhoto) {

                    let originalPhotoHeading =
                        document.createElement("h4");

                    originalPhotoHeading.textContent =
                        "Original Complaint Photograph";


                    card.appendChild(originalPhotoHeading);

                    let originalImage =
                        createImageElement(
                            originalPhoto,
                            "Original complaint photograph"
                        );

                    if (originalImage) {

                        card.appendChild(originalImage);

                    }

                }


                // =====================================
                // CURRENT STATUS BADGE
                // =====================================

                let statusText = document.createElement("p");

                statusText.textContent = "Current Status: ";


                let statusBadge = document.createElement("span");

                statusBadge.className =
                    "status-badge " +
                    normalizedStatus.replace(/\s+/g, "-");

                statusBadge.textContent = status;


                statusText.appendChild(statusBadge);


                // =====================================
                // STATUS UPDATE DROPDOWN
                // =====================================

                let statusLabel = document.createElement("label");

                statusLabel.textContent = "Update Status:";


                let statusSelect = document.createElement("select");

                statusSelect.className = "form-select";


                // Do not allow a resolved complaint to move backwards
                let statusOptions =
                    normalizedStatus === "resolved"
                        ? ["Resolved"]
                        : ["Assigned", "In Progress", "Resolved"];


                statusOptions.forEach(function(value) {

                    let option = document.createElement("option");

                    option.value = value;

                    option.textContent = value;


                    if (
                        normalizedStatus === value.toLowerCase()
                    ) {

                        option.selected = true;

                    } else if (
                        (
                            normalizedStatus === "pending" ||
                            normalizedStatus === "submitted"
                        ) &&
                        value === "Assigned"
                    ) {

                        option.selected = true;

                    }


                    statusSelect.appendChild(option);

                });


                if (normalizedStatus === "resolved") {

                    statusSelect.disabled = true;

                }


                // =====================================
                // INSPECTION NOTES INPUT
                // =====================================

                let inspectionLabel =
                    document.createElement("label");

                inspectionLabel.textContent =
                    "Inspection Notes:";


                let inspectionInput =
                    document.createElement("textarea");

                inspectionInput.className = "form-control";

                inspectionInput.placeholder =
                    "Enter observations from the complaint site inspection...";

                inspectionInput.value = inspectionNotes;

                inspectionInput.rows = 3;

                inspectionInput.maxLength = 2000;


                // =====================================
                // RESOLUTION INPUT
                // =====================================

                let resolutionLabel =
                    document.createElement("label");

                resolutionLabel.textContent =
                    "Resolution Details:";


                let resolutionInput =
                    document.createElement("textarea");

                resolutionInput.className = "form-control";

                resolutionInput.placeholder =
                    "Enter the action taken to resolve the complaint...";

                resolutionInput.value = resolution;

                resolutionInput.rows = 3;

                resolutionInput.maxLength = 2000;


                // =====================================
                // COMPLETION PHOTOGRAPH INPUT
                // =====================================

                let photoLabel =
                    document.createElement("label");

                photoLabel.textContent =
                    "Completion Photograph (Optional):";


                let photoInput =
                    document.createElement("input");

                photoInput.type = "file";

                photoInput.className = "form-control";

                photoInput.accept =
                    "image/jpeg,image/png,image/webp";


                // =====================================
                // COMPLETION PHOTOGRAPH PREVIEW
                // =====================================

                let photoPreviewHeading =
                    document.createElement("h4");

                photoPreviewHeading.textContent =
                    "Completion Photograph";


                let photoPreview =
                    createImageElement(
                        completionPhoto,
                        "Completion photograph"
                    );


                if (!photoPreview) {

                    photoPreview =
                        document.createElement("img");

                    photoPreview.style.maxWidth = "250px";

                    photoPreview.style.maxHeight = "180px";

                    photoPreview.style.display = "none";

                    photoPreview.style.objectFit = "contain";

                    photoPreview.style.margin = "10px 0";

                    photoPreview.style.borderRadius = "8px";

                }


                // =====================================
                // VALIDATE AND PREVIEW SELECTED IMAGE
                // =====================================

                photoInput.addEventListener("change", function() {

                    let file = photoInput.files[0];

                    if (!file) {
                        return;
                    }


                    let allowedTypes = [

                        "image/jpeg",

                        "image/png",

                        "image/webp"

                    ];


                    if (!allowedTypes.includes(file.type)) {

                        alert(
                            "Please select a JPG, PNG, or WEBP image."
                        );

                        photoInput.value = "";

                        return;
                    }


                    if (file.size > 2 * 1024 * 1024) {

                        alert(
                            "Photograph size must not exceed 2 MB."
                        );

                        photoInput.value = "";

                        return;
                    }


                    let reader = new FileReader();


                    reader.onload = function() {

                        photoPreview.src = reader.result;

                        photoPreview.alt =
                            "Selected completion photograph";

                        photoPreview.style.display = "block";

                    };


                    reader.onerror = function() {

                        alert(
                            "Unable to preview the selected photograph."
                        );

                        photoInput.value = "";

                    };


                    reader.readAsDataURL(file);

                });


                // =====================================
                // SAVE UPDATE BUTTON
                // =====================================

                let saveButton =
                    document.createElement("button");

                saveButton.textContent = "Save Update";

                saveButton.className = "btn btn-primary";

                saveButton.type = "button";


                // =====================================
                // SAVE STATUS, NOTES AND PHOTOGRAPH
                // =====================================

                saveButton.addEventListener("click", async function() {

                    if (saveButton.disabled) {
                        return;
                    }


                    let newStatus = statusSelect.value;

                    let newResolution =
                        resolutionInput.value.trim();

                    let newInspectionNotes =
                        inspectionInput.value.trim();


                    let previousStatus =
                        localStorage.getItem(assignmentKey + "status") ||

                        (complaint.localPrefix
                            ? localStorage.getItem(
                                complaint.localPrefix + "status"
                            )
                            : null) ||

                        complaint.status ||

                        "Assigned";


                    // =====================================
                    // PREVENT CHANGING RESOLVED STATUS
                    // =====================================

                    if (
                        previousStatus.toLowerCase() === "resolved" &&
                        newStatus !== "Resolved"
                    ) {

                        alert(
                            "A resolved complaint cannot be moved to an earlier status."
                        );

                        return;
                    }


                    // =====================================
                    // VALIDATE RESOLUTION DETAILS
                    // =====================================

                    if (
                        newStatus === "Resolved" &&
                        newResolution.length < 5
                    ) {

                        alert(
                            "Please enter resolution details with at least 5 characters before resolving the complaint."
                        );

                        resolutionInput.focus();

                        return;
                    }


                    // =====================================
                    // VALIDATE INSPECTION NOTES
                    // =====================================

                    if (newInspectionNotes.length > 2000) {

                        alert(
                            "Inspection notes must not exceed 2000 characters."
                        );

                        return;
                    }


                    if (newResolution.length > 2000) {

                        alert(
                            "Resolution details must not exceed 2000 characters."
                        );

                        return;
                    }


                    // =====================================
                    // VALIDATE SELECTED PHOTOGRAPH
                    // =====================================

                    let selectedPhoto = photoInput.files[0];


                    if (selectedPhoto) {

                        let allowedTypes = [

                            "image/jpeg",

                            "image/png",

                            "image/webp"

                        ];


                        if (!allowedTypes.includes(selectedPhoto.type)) {

                            alert(
                                "Please select a JPG, PNG, or WEBP image."
                            );

                            return;
                        }


                        if (selectedPhoto.size > 2 * 1024 * 1024) {

                            alert(
                                "Photograph size must not exceed 2 MB."
                            );

                            return;
                        }

                    }


                    saveButton.disabled = true;

                    saveButton.textContent = "Saving...";


                    try {

                        // =====================================
                        // READ SELECTED PHOTOGRAPH
                        // =====================================

                        let newCompletionPhoto = completionPhoto;


                        if (selectedPhoto) {

                            newCompletionPhoto =
                                await readImageFile(selectedPhoto);

                        }


                        // =====================================
                        // PREPARE DATA FOR STORAGE
                        // =====================================

                        let storageValues = {};


                        storageValues[assignmentKey + "status"] =
                            newStatus;


                        storageValues[assignmentKey + "resolution"] =
                            newResolution;


                        storageValues[assignmentKey + "inspectionNotes"] =
                            newInspectionNotes;


                        if (newCompletionPhoto) {

                            storageValues[
                                assignmentKey + "completionPhoto"
                            ] = newCompletionPhoto;

                        }


                        // Update original local complaint record
                        if (complaint.localPrefix) {

                            storageValues[
                                complaint.localPrefix + "status"
                            ] = newStatus;


                            storageValues[
                                complaint.localPrefix + "resolution"
                            ] = newResolution;

                        }


                        // =====================================
                        // SAVE ALL DATA SAFELY
                        // =====================================

                        let saved =
                            saveStorageChanges(storageValues);


                        if (!saved) {

                            throw new Error(
                                "Unable to save the complaint update. Browser storage may be full."
                            );

                        }


                        // =====================================
                        // RECORD STATUS HISTORY
                        // =====================================

                        if (
                            newStatus !== previousStatus &&
                            window.recordComplaintStatus
                        ) {

                            let historyDescription =
                                newStatus === "In Progress"

                                    ? "Department Staff started working on the complaint."

                                    : newStatus === "Resolved"

                                        ? "Complaint resolved. " + newResolution

                                        : "Complaint status updated to " +
                                            newStatus + ".";


                            try {

                                recordComplaintStatus(

                                    referenceNumber,

                                    newStatus,

                                    historyDescription,

                                    localStorage.getItem("currentUserName")

                                );

                            } catch (historyError) {

                                console.error(
                                    "Status History Error:",
                                    historyError
                                );

                            }

                        }


                        alert("Complaint updated successfully!");


                        // Refresh cards and statistics
                        displayStaffComplaints();


                    } catch (error) {

                        console.error("Update Error:", error);


                        alert(
                            error.message ||
                            "Unable to save the update. Please try again."
                        );

                    } finally {

                        saveButton.disabled = false;

                        saveButton.textContent = "Save Update";

                    }

                });


                // =====================================
                // ADD ELEMENTS TO COMPLAINT CARD
                // =====================================

                card.appendChild(heading);

                card.appendChild(reference);

                card.appendChild(categoryText);

                card.appendChild(descriptionText);

                card.appendChild(locationText);

                card.appendChild(latitudeText);

                card.appendChild(longitudeText);

                card.appendChild(dateText);

                card.appendChild(assignedStaffText);

                card.appendChild(statusText);


                card.appendChild(statusLabel);

                card.appendChild(statusSelect);


                card.appendChild(inspectionLabel);

                card.appendChild(inspectionInput);


                card.appendChild(resolutionLabel);

                card.appendChild(resolutionInput);


                card.appendChild(photoLabel);

                card.appendChild(photoInput);


                if (completionPhoto) {

                    card.appendChild(photoPreviewHeading);

                }

                card.appendChild(photoPreview);

                card.appendChild(saveButton);


                complaintList.appendChild(card);

            });


            // =====================================
            // NO ASSIGNED COMPLAINTS MESSAGE
            // =====================================

            if (total === 0) {

                let emptyMessage =
                    document.createElement("p");

                emptyMessage.textContent =
                    "No complaints have been assigned to you yet.";

                complaintList.appendChild(emptyMessage);

            }


            // =====================================
            // UPDATE DASHBOARD STATISTICS
            // =====================================

            document.getElementById("staffTotal").textContent =
                total;

            document.getElementById("staffPending").textContent =
                pending;

            document.getElementById("staffProgress").textContent =
                progress;

            document.getElementById("staffResolved").textContent =
                resolved;


        } catch (error) {

            console.error("Staff Dashboard Error:", error);


            complaintList.innerHTML = "";


            let errorMessage =
                document.createElement("p");

            errorMessage.textContent =
                "Unable to load complaints. Please refresh the page.";


            complaintList.appendChild(errorMessage);

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


    // Make logout accessible to HTML
    window.logout = logout;


    // =====================================
    // LOAD STAFF DASHBOARD
    // =====================================

    displayStaffComplaints();

}
