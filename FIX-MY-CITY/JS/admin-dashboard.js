
// =====================================
// FIXMYCITY - ADMINISTRATOR DASHBOARD
// =====================================


// =====================================
// CHECK ADMINISTRATOR LOGIN
// =====================================

if (
    localStorage.getItem("isLoggedIn") !== "true" ||
    localStorage.getItem("currentUserRole") !== "Administrator"
) {

    window.location.href = "login.html";

} else {

    // =====================================
    // DISPLAY ADMINISTRATOR NAME
    // =====================================

    document.getElementById("adminName").textContent =
        localStorage.getItem("currentUserName") || "Administrator";


    // Stores all complaints for report generation
    let adminReportComplaints = [];


    // =====================================
    // DISPLAY REGISTERED USERS
    // =====================================

    function displayUsers() {

        let userCount =
            Number(localStorage.getItem("userCount")) || 0;

        let userTable =
            document.getElementById("userTable");

        userTable.innerHTML = "";

        for (let i = 0; i < userCount; i++) {

            let name =
                localStorage.getItem("user_" + i + "_name");

            let email =
                localStorage.getItem("user_" + i + "_email");

            let mobile =
                localStorage.getItem("user_" + i + "_mobile");

            let role =
                localStorage.getItem("user_" + i + "_role");

            let row = document.createElement("tr");

            [name, email, mobile, role || "Not specified"].forEach(
                function(value) {

                    let cell = document.createElement("td");

                    cell.textContent = value || "-";

                    row.appendChild(cell);
                }
            );

            userTable.appendChild(row);
        }

        if (userCount === 0) {

            userTable.innerHTML =
                "<tr><td colspan='4'>No registered users found.</td></tr>";
        }
    }


    // =====================================
    // DEPARTMENT MANAGEMENT
    // =====================================

    const DEPARTMENT_KEY = "fixmycity_departments";


    // Get existing departments
    function getDepartments() {

        try {

            let departments =
                JSON.parse(localStorage.getItem(DEPARTMENT_KEY));

            return Array.isArray(departments) ? departments : [];

        } catch (error) {

            console.error("Department loading error:", error);

            return [];
        }
    }


    // Save departments
    function saveDepartments(departments) {

        localStorage.setItem(
            DEPARTMENT_KEY,
            JSON.stringify(departments)
        );
    }


    // Initialize departments
    function initializeDepartments() {

        let departments = getDepartments();

        if (departments.length > 0) {
            return;
        }

        let defaultDepartments = [

            {
                name: "Roads and Infrastructure",
                description: "Maintains roads, footpaths and public infrastructure."
            },

            {
                name: "Sanitation",
                description: "Handles garbage collection and public cleanliness."
            },

            {
                name: "Water Supply",
                description: "Manages water pipelines, leakage and water supply."
            },

            {
                name: "Street Lighting",
                description: "Maintains streetlights and public lighting facilities."
            },

            {
                name: "Public Health",
                description: "Handles public health and sanitation-related concerns."
            },

            {
                name: "Drainage",
                description: "Maintains drainage systems and resolves drainage issues."
            }
        ];


        // Include departments already used by registered staff
        let userCount =
            Number(localStorage.getItem("userCount")) || 0;

        for (let i = 0; i < userCount; i++) {

            let role =
                localStorage.getItem("user_" + i + "_role");

            let department =
                localStorage.getItem("user_" + i + "_department");

            if (
                role === "Department Staff" &&
                department &&
                !defaultDepartments.some(function(item) {

                    return item.name.toLowerCase() ===
                        department.toLowerCase();
                })
            ) {

                defaultDepartments.push({

                    name: department,

                    description:
                        "Department responsible for assigned civic complaints."
                });
            }
        }

        saveDepartments(defaultDepartments);
    }


    // Display departments
    function displayDepartments() {

        let departmentTable =
            document.getElementById("departmentTable");

        let departments = getDepartments();

        departmentTable.innerHTML = "";

        if (departments.length === 0) {

            departmentTable.innerHTML =
                "<tr><td colspan='3'>No departments available.</td></tr>";

            return;
        }

        departments.forEach(function(department) {

            let row = document.createElement("tr");

            let nameCell = document.createElement("td");

            nameCell.textContent = department.name;


            let descriptionCell = document.createElement("td");

            descriptionCell.textContent =
                department.description || "-";


            let actionCell = document.createElement("td");


            // Edit button
            let editButton = document.createElement("button");

            editButton.type = "button";

            editButton.textContent = "Edit";

            editButton.className =
                "btn btn-primary btn-sm me-2";

            editButton.addEventListener("click", function() {

                editDepartment(department.name);
            });


            // Delete button
            let deleteButton = document.createElement("button");

            deleteButton.type = "button";

            deleteButton.textContent = "Delete";

            deleteButton.className =
                "btn btn-danger btn-sm";

            deleteButton.addEventListener("click", function() {

                deleteDepartment(department.name);
            });


            actionCell.appendChild(editButton);

            actionCell.appendChild(deleteButton);

            row.appendChild(nameCell);

            row.appendChild(descriptionCell);

            row.appendChild(actionCell);

            departmentTable.appendChild(row);
        });
    }


    // Show department message
    function showDepartmentMessage(message, isError) {

        let messageElement =
            document.getElementById("departmentMessage");

        messageElement.textContent = message;

        messageElement.style.color =
            isError ? "red" : "green";
    }


    // Reset department form
    function resetDepartmentForm() {

        document.getElementById("departmentForm").reset();

        document.getElementById("originalDepartmentName").value = "";

        document.getElementById("departmentFormTitle").textContent =
            "Add New Department";

        document.getElementById("saveDepartmentBtn").textContent =
            "Add Department";

        document.getElementById("cancelDepartmentEditBtn").style.display =
            "none";
    }


    // Check whether department is currently in use
    async function isDepartmentInUse(departmentName) {

        let target =
            departmentName.trim().toLowerCase();


        // Check registered Department Staff
        let userCount =
            Number(localStorage.getItem("userCount")) || 0;

        for (let i = 0; i < userCount; i++) {

            let role =
                localStorage.getItem("user_" + i + "_role");

            let staffDepartment =
                localStorage.getItem("user_" + i + "_department");

            if (
                role === "Department Staff" &&
                staffDepartment &&
                staffDepartment.trim().toLowerCase() === target
            ) {

                return true;
            }
        }


        // Check complaints stored in LocalStorage
        let complaintCount =
            Number(localStorage.getItem("complaintCount")) || 0;

        for (let i = 0; i < complaintCount; i++) {

            let prefix = "complaint_" + i + "_";

            let referenceNumber =
                localStorage.getItem(prefix + "id");

            let assignedDepartment =
                localStorage.getItem(
                    "officer_assignment_" +
                    referenceNumber +
                    "_department"
                ) ||
                localStorage.getItem(prefix + "assignedDepartment");

            if (
                assignedDepartment &&
                assignedDepartment.trim().toLowerCase() === target
            ) {

                return true;
            }
        }


        // Check Mock JSON complaints
        if (window.mockDataService) {

            try {

                let mockComplaints =
                    await window.mockDataService.getAllComplaints();

                let localReferences = [];

                for (let i = 0; i < complaintCount; i++) {

                    localReferences.push(
                        localStorage.getItem(
                            "complaint_" + i + "_id"
                        )
                    );
                }

                let usedInMockComplaint =
                    mockComplaints.some(function(complaint) {

                        let referenceNumber =
                            complaint.referenceNumber || complaint.id;

                        if (localReferences.includes(referenceNumber)) {
                            return false;
                        }

                        let assignedDepartment =
                            localStorage.getItem(
                                "officer_assignment_" +
                                referenceNumber +
                                "_department"
                            ) ||
                            complaint.assignedDepartment ||
                            "";

                        return assignedDepartment.trim().toLowerCase() === target;
                    });

                if (usedInMockComplaint) {
                    return true;
                }

            } catch (error) {

                console.error(
                    "Unable to check mock complaint departments:",
                    error
                );
            }
        }

        return false;
    }


    // Add or update department
    document.getElementById("departmentForm").addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            let departmentName =
                document.getElementById("departmentName").value.trim();

            let description =
                document.getElementById("departmentDescription").value.trim();

            let originalName =
                document.getElementById("originalDepartmentName").value;

            if (!departmentName) {

                showDepartmentMessage(
                    "Please enter a department name.",
                    true
                );

                return;
            }

            let departments = getDepartments();


            // Check duplicate department names
            let duplicate = departments.some(function(department) {

                return (
                    department.name.toLowerCase() ===
                    departmentName.toLowerCase() &&
                    department.name !== originalName
                );
            });

            if (duplicate) {

                showDepartmentMessage(
                    "This department already exists.",
                    true
                );

                return;
            }


            // Editing existing department
            if (originalName) {

                let departmentInUse =
                    await isDepartmentInUse(originalName);

                if (
                    departmentInUse &&
                    originalName.toLowerCase() !== departmentName.toLowerCase()
                ) {

                    showDepartmentMessage(
                        "This department is assigned to staff or complaints. Reassign them before changing its name.",
                        true
                    );

                    return;
                }

                let index = departments.findIndex(function(department) {

                    return department.name === originalName;
                });

                if (index !== -1) {

                    departments[index] = {

                        name: departmentName,

                        description: description
                    };

                    saveDepartments(departments);

                    showDepartmentMessage(
                        "Department updated successfully.",
                        false
                    );
                }

            } else {

                // Add new department
                departments.push({

                    name: departmentName,

                    description: description
                });

                saveDepartments(departments);

                showDepartmentMessage(
                    "Department added successfully.",
                    false
                );
            }

            resetDepartmentForm();

            displayDepartments();
        }
    );


    // Edit department
    function editDepartment(departmentName) {

        let departments = getDepartments();

        let department = departments.find(function(item) {

            return item.name === departmentName;
        });

        if (!department) {
            return;
        }

        document.getElementById("departmentName").value =
            department.name;

        document.getElementById("departmentDescription").value =
            department.description || "";

        document.getElementById("originalDepartmentName").value =
            department.name;

        document.getElementById("departmentFormTitle").textContent =
            "Edit Department";

        document.getElementById("saveDepartmentBtn").textContent =
            "Update Department";

        document.getElementById("cancelDepartmentEditBtn").style.display =
            "inline-block";

        showDepartmentMessage(
            "Update the department details and click Update Department.",
            false
        );

        document.getElementById("departmentForm").scrollIntoView({

            behavior: "smooth",

            block: "center"
        });
    }


    // Delete department
    async function deleteDepartment(departmentName) {

        let departmentInUse =
            await isDepartmentInUse(departmentName);

        if (departmentInUse) {

            showDepartmentMessage(
                "Cannot delete this department. It is currently assigned to staff members or complaints.",
                true
            );

            return;
        }

        let confirmed = confirm(
            "Are you sure you want to delete the department '" +
            departmentName +
            "'?"
        );

        if (!confirmed) {
            return;
        }

        let departments = getDepartments();

        departments = departments.filter(function(department) {

            return department.name !== departmentName;
        });

        saveDepartments(departments);

        displayDepartments();

        showDepartmentMessage(
            "Department deleted successfully.",
            false
        );

        if (
            document.getElementById("originalDepartmentName").value ===
            departmentName
        ) {

            resetDepartmentForm();
        }
    }


    // Cancel department editing
    document.getElementById("cancelDepartmentEditBtn").addEventListener(
        "click",
        function() {

            resetDepartmentForm();

            showDepartmentMessage(
                "Department editing cancelled.",
                false
            );
        }
    );


    // =====================================
    // GET LOCALSTORAGE COMPLAINTS
    // =====================================

    function getLocalStorageComplaints() {

        let complaints = [];

        let complaintCount =
            Number(localStorage.getItem("complaintCount")) || 0;

        for (let i = 0; i < complaintCount; i++) {

            let prefix = "complaint_" + i + "_";

            complaints.push({

                referenceNumber:
                    localStorage.getItem(prefix + "id"),

                title:
                    localStorage.getItem(prefix + "title"),

                category:
                    localStorage.getItem(prefix + "category"),

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

                assignedStaffName:
                    localStorage.getItem(prefix + "assignedStaffName"),

                assignedStaffEmail:
                    localStorage.getItem(prefix + "assignedStaffEmail"),

                assignedDepartment:
                    localStorage.getItem(prefix + "assignedDepartment"),

                resolution:
                    localStorage.getItem(prefix + "resolution") || "",

                rejectionReason:
                    localStorage.getItem(prefix + "rejectionReason") || "",

                status:
                    localStorage.getItem(prefix + "status") || "Pending",

                localPrefix: prefix
            });
        }

        return complaints;
    }


    // =====================================
    // REPORT DATE FORMAT
    // =====================================

    function getReportDate(dateValue) {

        if (!dateValue) {
            return "";
        }

        let date = new Date(dateValue);

        if (isNaN(date.getTime())) {
            return "";
        }

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }


    // =====================================
    // ADMINISTRATOR REPORTS AND SUMMARIES
    // =====================================

    function displayReports(complaints) {

        let startDate =
            document.getElementById("reportStartDate").value;

        let endDate =
            document.getElementById("reportEndDate").value;

        let selectedCategory =
            document.getElementById("reportCategory").value;

        let reportMessage =
            document.getElementById("reportMessage");


        // Validate date range
        if (startDate && endDate && startDate > endDate) {

            reportMessage.textContent =
                "From Date cannot be later than To Date.";

            reportMessage.style.color = "red";

            return;
        }

        reportMessage.textContent = "";


        // Apply report filters
        let filteredComplaints = complaints.filter(function(complaint) {

            let complaintDate =
                getReportDate(complaint.submittedAt);

            if (
                startDate &&
                (!complaintDate || complaintDate < startDate)
            ) {
                return false;
            }

            if (
                endDate &&
                (!complaintDate || complaintDate > endDate)
            ) {
                return false;
            }

            if (
                selectedCategory &&
                (complaint.category || "").toLowerCase() !==
                selectedCategory.toLowerCase()
            ) {
                return false;
            }

            return true;
        });


        // Calculate complaint status totals
        let total = filteredComplaints.length;

        let pending = 0;
        let progress = 0;
        let resolved = 0;
        let rejected = 0;

        let categoryCounts = {};


        filteredComplaints.forEach(function(complaint) {

            let status =
                (complaint.status || "").toLowerCase();

            if (
                status === "pending" ||
                status === "submitted" ||
                status === "assigned"
            ) {

                pending++;

            } else if (status === "in progress") {

                progress++;

            } else if (status === "resolved") {

                resolved++;

            } else if (status === "rejected") {

                rejected++;
            }


            // Category-wise count
            let category =
                complaint.category || "Uncategorized";

            categoryCounts[category] =
                (categoryCounts[category] || 0) + 1;
        });


        // Display summary cards
        document.getElementById("reportTotal").textContent = total;

        document.getElementById("reportPending").textContent = pending;

        document.getElementById("reportProgress").textContent = progress;

        document.getElementById("reportResolved").textContent = resolved;

        document.getElementById("reportRejected").textContent = rejected;


        // Display category-wise summary
        let categoryTable =
            document.getElementById("categoryReportTable");

        categoryTable.innerHTML = "";

        let categories = Object.keys(categoryCounts).sort();

        if (categories.length === 0) {

            categoryTable.innerHTML =
                "<tr><td colspan='2'>No complaints found for the selected filters.</td></tr>";

            return;
        }

        categories.forEach(function(category) {

            let row = document.createElement("tr");

            let categoryCell = document.createElement("td");

            categoryCell.textContent = category;

            let countCell = document.createElement("td");

            countCell.textContent = categoryCounts[category];

            row.appendChild(categoryCell);

            row.appendChild(countCell);

            categoryTable.appendChild(row);
        });
    }


    // Generate report button
    document.getElementById("generateReportBtn").addEventListener(
        "click",
        function() {

            displayReports(adminReportComplaints);
        }
    );


    // Reset report filters
    document.getElementById("resetReportBtn").addEventListener(
        "click",
        function() {

            document.getElementById("reportStartDate").value = "";

            document.getElementById("reportEndDate").value = "";

            document.getElementById("reportCategory").value = "";

            displayReports(adminReportComplaints);
        }
    );


    // =====================================
    // DISPLAY ALL COMPLAINTS
    // =====================================

    async function displayComplaints() {

        let table =
            document.getElementById("adminComplaintTable");

        table.innerHTML = "";

        try {

            let mockComplaints = [];

            if (window.mockDataService) {

                mockComplaints =
                    await window.mockDataService.getAllComplaints();
            }

            let localComplaints =
                getLocalStorageComplaints();


            // Combine Mock JSON and LocalStorage complaints
            let complaintMap = new Map();

            mockComplaints.forEach(function(complaint) {

                let referenceNumber =
                    complaint.referenceNumber || complaint.id;

                if (referenceNumber) {
                    complaintMap.set(referenceNumber, complaint);
                }
            });

            localComplaints.forEach(function(complaint) {

                if (complaint.referenceNumber) {

                    complaintMap.set(
                        complaint.referenceNumber,
                        complaint
                    );
                }
            });

            let complaints =
                Array.from(complaintMap.values());


            // Status counters for Complaint Overview
            let total = complaints.length;

            let pending = 0;
            let progress = 0;
            let resolved = 0;
            let rejected = 0;


            // Data for reports
            let reportComplaints = [];


            complaints.forEach(function(complaint) {

                let referenceNumber =
                    complaint.referenceNumber || complaint.id;

                let assignmentKey =
                    "officer_assignment_" + referenceNumber + "_";


                // Assigned staff details
                let assignedStaff =
                    localStorage.getItem(assignmentKey + "name") ||
                    complaint.assignedStaffName ||
                    "";

                let assignedEmail =
                    localStorage.getItem(assignmentKey + "email") ||
                    complaint.assignedStaffEmail ||
                    "";

                let department =
                    localStorage.getItem(assignmentKey + "department") ||
                    complaint.assignedDepartment ||
                    "";


                // Latest complaint status
                let status =
                    localStorage.getItem(assignmentKey + "status") ||
                    (complaint.localPrefix
                        ? localStorage.getItem(
                            complaint.localPrefix + "status"
                        )
                        : null) ||
                    complaint.status ||
                    "Pending";


                // Resolution details
                let resolution =
                    localStorage.getItem(assignmentKey + "resolution") ||
                    (complaint.localPrefix
                        ? localStorage.getItem(
                            complaint.localPrefix + "resolution"
                        )
                        : null) ||
                    complaint.resolution ||
                    "";


                // Rejection reason
                let rejectionReason =
                    localStorage.getItem(assignmentKey + "rejectionReason") ||
                    (complaint.localPrefix
                        ? localStorage.getItem(
                            complaint.localPrefix + "rejectionReason"
                        )
                        : null) ||
                    complaint.rejectionReason ||
                    "";


                let normalizedStatus =
                    status.toLowerCase();


                // Complaint Overview counts
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


                // Prepare report data
                reportComplaints.push({

                    category:
                        complaint.category || "Uncategorized",

                    status: status,

                    submittedAt:
                        complaint.submittedAt || complaint.date || ""
                });


                // Create complaint table row
                let row = document.createElement("tr");

                let values = [

                    referenceNumber,

                    complaint.title,

                    complaint.category,

                    complaint.citizenEmail,

                    complaint.location,

                    complaint.latitude,

                    complaint.longitude,

                    complaint.submittedAt || complaint.date,

                    assignedStaff || assignedEmail,

                    department,

                    resolution,

                    rejectionReason
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


                // Status badge
                let statusCell =
                    document.createElement("td");

                let statusBadge =
                    document.createElement("span");

                statusBadge.className =
                    "status-badge " +
                    normalizedStatus.replace(/\s+/g, "-");

                statusBadge.textContent = status;

                statusCell.appendChild(statusBadge);

                row.appendChild(statusCell);

                table.appendChild(row);
            });


            // No complaints message
            if (total === 0) {

                table.innerHTML =
                    "<tr><td colspan='13'>No complaints have been registered yet.</td></tr>";
            }


            // Update Complaint Overview
            document.getElementById("adminTotal").textContent =
                total;

            document.getElementById("adminPending").textContent =
                pending;

            document.getElementById("adminProgress").textContent =
                progress;

            document.getElementById("adminResolved").textContent =
                resolved;

            document.getElementById("adminRejected").textContent =
                rejected;


            // Update report data
            adminReportComplaints = reportComplaints;

            displayReports(adminReportComplaints);

        } catch (error) {

            console.error("Admin Dashboard Error:", error);

            table.innerHTML =
                "<tr><td colspan='13'>Unable to load complaints. Please refresh the page.</td></tr>";

            adminReportComplaints = [];

            displayReports(adminReportComplaints);
        }
    }


    // =====================================
    // LOGOUT
    // =====================================

    function logout() {

        localStorage.removeItem("isLoggedIn");

        localStorage.removeItem("currentUserName");

        localStorage.removeItem("currentUserEmail");

        localStorage.removeItem("currentUserRole");

        localStorage.removeItem("currentUserDepartment");

        window.location.href = "login.html";
    }

    window.logout = logout;


    // =====================================
    // LOAD DASHBOARD INFORMATION
    // =====================================

    initializeDepartments();

    displayUsers();

    displayDepartments();

    displayComplaints();

}
