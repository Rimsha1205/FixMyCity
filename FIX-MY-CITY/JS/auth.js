
// =====================================
// FIXMYCITY - AUTHENTICATION
// =====================================


// =====================================
// COMMON MESSAGE FUNCTION
// =====================================

function displayAuthMessage(element, message, isError) {

    if (!element) return;

    element.textContent = message;

    element.style.color = isError ? "red" : "green";
}


// =====================================
// REGISTRATION
// =====================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    let roleOptions =
        document.querySelectorAll('input[name="role"]');

    let departmentField =
        document.getElementById("departmentField");

    let departmentSelect =
        document.getElementById("department");

    let departmentHelp =
        document.getElementById("departmentHelp");

    let registerMessage =
        document.getElementById("registerMessage");

    let registerButton =
        registerForm.querySelector('button[type="submit"]');

    let isRegistering = false;


    // =====================================
    // GET DEPARTMENTS
    // =====================================

    function getAvailableDepartments() {

        try {

            let departments = JSON.parse(
                localStorage.getItem("fixmycity_departments")
            ) || [];

            if (!Array.isArray(departments)) {
                return [];
            }

            return departments.filter(function(department) {

                return (
                    department &&
                    typeof department.name === "string" &&
                    department.name.trim() !== ""
                );

            });

        } catch (error) {

            console.error("Department loading error:", error);

            return [];
        }
    }


    // =====================================
    // LOAD DEPARTMENTS
    // =====================================

    function loadDepartments(selectedValue = "") {

        departmentSelect.innerHTML = "";

        let defaultOption = document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent = "-- Select Department --";

        departmentSelect.appendChild(defaultOption);

        let departments = getAvailableDepartments();


        departments.forEach(function(department) {

            let option = document.createElement("option");

            option.value = department.name;
            option.textContent = department.name;

            departmentSelect.appendChild(option);
        });


        // Preserve previously selected department
        if (selectedValue) {

            let departmentExists = departments.some(function(department) {

                return department.name === selectedValue;

            });

            if (departmentExists) {
                departmentSelect.value = selectedValue;
            }
        }


        // Handle empty department list
        if (departments.length === 0) {

            departmentSelect.disabled = true;

            departmentHelp.textContent =
                "No departments available. Please contact the administrator.";

            departmentHelp.style.color = "red";

        } else {

            departmentSelect.disabled = false;

            departmentHelp.textContent =
                "Select a department from the available list.";

            departmentHelp.style.color = "#666";
        }
    }


    // Load departments when page opens
    loadDepartments();


    // =====================================
    // SHOW DEPARTMENT FIELD BASED ON ROLE
    // =====================================

    roleOptions.forEach(function(option) {

        option.addEventListener("change", function() {

            if (this.value === "Department Staff") {

                departmentField.style.display = "block";

                departmentSelect.required = true;

                loadDepartments(departmentSelect.value);

            } else {

                departmentField.style.display = "none";

                departmentSelect.required = false;

                departmentSelect.value = "";
            }

        });

    });


    // =====================================
    // REGISTER USER
    // =====================================

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        if (isRegistering) return;


        // =====================================
        // GET FORM VALUES
        // =====================================

        let name =
            document.getElementById("name").value.trim();

        let email =
            document.getElementById("email").value.trim().toLowerCase();

        let mobile =
            document.getElementById("mobile").value.trim();

        let password =
            document.getElementById("password").value;

        let confirmPassword =
            document.getElementById("confirmPassword").value;

        let selectedRole =
            document.querySelector('input[name="role"]:checked');

        let role =
            selectedRole ? selectedRole.value : "";

        let department =
            departmentSelect ? departmentSelect.value : "";


        // =====================================
        // REQUIRED FIELD VALIDATION
        // =====================================

        if (
            !name ||
            !email ||
            !mobile ||
            !password ||
            !confirmPassword
        ) {

            displayAuthMessage(
                registerMessage,
                "Please fill in all required fields.",
                true
            );

            return;
        }


        // =====================================
        // NAME VALIDATION
        // =====================================

        if (name.length < 3 || name.length > 80) {

            displayAuthMessage(
                registerMessage,
                "Name must contain between 3 and 80 characters.",
                true
            );

            return;
        }

        if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(name)) {

            displayAuthMessage(
                registerMessage,
                "Please enter a valid full name.",
                true
            );

            return;
        }


        // =====================================
        // EMAIL VALIDATION
        // =====================================

        let emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            displayAuthMessage(
                registerMessage,
                "Please enter a valid email address.",
                true
            );

            return;
        }


        // =====================================
        // MOBILE VALIDATION
        // =====================================

        if (!/^[0-9]{10}$/.test(mobile)) {

            displayAuthMessage(
                registerMessage,
                "Please enter a valid 10-digit mobile number.",
                true
            );

            return;
        }


        // =====================================
        // ROLE VALIDATION
        // =====================================

        let allowedRoles = [
            "Citizen",
            "Municipal Officer",
            "Department Staff",
            "Administrator"
        ];

        if (!allowedRoles.includes(role)) {

            displayAuthMessage(
                registerMessage,
                "Please select a valid role.",
                true
            );

            return;
        }


        // =====================================
        // PASSWORD VALIDATION
        // =====================================

        if (password.length < 6) {

            displayAuthMessage(
                registerMessage,
                "Password must contain at least 6 characters.",
                true
            );

            return;
        }

        if (password.length > 128) {

            displayAuthMessage(
                registerMessage,
                "Password must not exceed 128 characters.",
                true
            );

            return;
        }

        if (password !== confirmPassword) {

            displayAuthMessage(
                registerMessage,
                "Passwords do not match.",
                true
            );

            return;
        }


        // =====================================
        // DEPARTMENT VALIDATION
        // =====================================

        if (role === "Department Staff") {

            // Read the latest department list without
            // rebuilding the dropdown and losing selection.
            let latestDepartments = getAvailableDepartments();

            let departmentExists = latestDepartments.some(
                function(item) {

                    return (
                        item.name.toLowerCase() ===
                        department.toLowerCase()
                    );

                }
            );

            if (!department || !departmentExists) {

                displayAuthMessage(
                    registerMessage,
                    "Please select a valid available department.",
                    true
                );

                loadDepartments();

                return;
            }
        }


        // =====================================
        // GET EXISTING USER COUNT
        // =====================================

        let userCount =
            Number(localStorage.getItem("userCount")) || 0;

        if (
            !Number.isSafeInteger(userCount) ||
            userCount < 0
        ) {

            displayAuthMessage(
                registerMessage,
                "Unable to process registration. Please contact the administrator.",
                true
            );

            return;
        }


        // =====================================
        // CHECK DUPLICATE EMAIL AND MOBILE
        // =====================================

        for (let i = 0; i < userCount; i++) {

            let savedEmail =
                localStorage.getItem("user_" + i + "_email");

            let savedMobile =
                localStorage.getItem("user_" + i + "_mobile");


            if (
                savedEmail &&
                savedEmail.toLowerCase() === email
            ) {

                displayAuthMessage(
                    registerMessage,
                    "This email address is already registered.",
                    true
                );

                return;
            }


            if (savedMobile === mobile) {

                displayAuthMessage(
                    registerMessage,
                    "This mobile number is already registered.",
                    true
                );

                return;
            }
        }


        // =====================================
        // SAVE USER DETAILS
        // =====================================

        isRegistering = true;

        registerButton.disabled = true;

        registerButton.textContent = "Registering...";


        let userPrefix = "user_" + userCount + "_";

        let userKeys = [
            "name",
            "email",
            "mobile",
            "password",
            "role",
            "department"
        ];


        try {

            localStorage.setItem(
                userPrefix + "name",
                name
            );

            localStorage.setItem(
                userPrefix + "email",
                email
            );

            localStorage.setItem(
                userPrefix + "mobile",
                mobile
            );

            localStorage.setItem(
                userPrefix + "password",
                password
            );

            localStorage.setItem(
                userPrefix + "role",
                role
            );

            localStorage.setItem(
                userPrefix + "department",
                role === "Department Staff" ? department : ""
            );


            // Update count only after user details are saved
            localStorage.setItem(
                "userCount",
                String(userCount + 1)
            );


            alert("Registration successful! Please login.");

            window.location.href = "login.html";


        } catch (error) {

            console.error("Registration Error:", error);


            // Remove partially saved user information
            userKeys.forEach(function(key) {

                localStorage.removeItem(userPrefix + key);

            });


            displayAuthMessage(
                registerMessage,
                "Registration failed. Your browser storage may be full. Please try again.",
                true
            );


            isRegistering = false;

            registerButton.disabled = false;

            registerButton.textContent = "Register";
        }

    });

}



// =====================================
// LOGIN
// =====================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    let loginMessage =
        document.getElementById("loginMessage");

    let loginButton =
        loginForm.querySelector('button[type="submit"]');

    let isLoggingIn = false;


    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        if (isLoggingIn) return;


        // =====================================
        // GET LOGIN DETAILS
        // =====================================

        let email =
            document.getElementById("loginEmail").value.trim().toLowerCase();

        let password =
            document.getElementById("loginPassword").value;

        let selectedRole =
            document.querySelector('input[name="loginRole"]:checked');


        // =====================================
        // VALIDATE INPUTS
        // =====================================

        if (!email || !password) {

            displayAuthMessage(
                loginMessage,
                "Please enter your email and password.",
                true
            );

            return;
        }


        if (!selectedRole) {

            displayAuthMessage(
                loginMessage,
                "Please select your role.",
                true
            );

            return;
        }


        let role = selectedRole.value;

        let allowedRoles = [
            "Citizen",
            "Municipal Officer",
            "Department Staff",
            "Administrator"
        ];

        if (!allowedRoles.includes(role)) {

            displayAuthMessage(
                loginMessage,
                "Please select a valid role.",
                true
            );

            return;
        }


        // =====================================
        // GET USER COUNT
        // =====================================

        let userCount =
            Number(localStorage.getItem("userCount")) || 0;

        if (
            !Number.isSafeInteger(userCount) ||
            userCount < 0
        ) {

            displayAuthMessage(
                loginMessage,
                "Unable to verify login details.",
                true
            );

            return;
        }


        let loginSuccessful = false;

        let dashboard = "";


        // =====================================
        // FIND MATCHING USER
        // =====================================

        for (let i = 0; i < userCount; i++) {

            let savedEmail =
                localStorage.getItem("user_" + i + "_email");

            let savedPassword =
                localStorage.getItem("user_" + i + "_password");

            let savedRole =
                localStorage.getItem("user_" + i + "_role");


            if (
                email === savedEmail &&
                password === savedPassword &&
                role === savedRole
            ) {

                let savedName =
                    localStorage.getItem("user_" + i + "_name");

                let savedDepartment =
                    localStorage.getItem("user_" + i + "_department");


                // =====================================
                // SELECT DASHBOARD
                // =====================================

                if (savedRole === "Citizen") {

                    dashboard = "citizen-dashboard.html";

                } else if (savedRole === "Municipal Officer") {

                    dashboard = "officer-dashboard.html";

                } else if (savedRole === "Department Staff") {

                    dashboard = "staff-dashboard.html";

                } else if (savedRole === "Administrator") {

                    dashboard = "admin-dashboard.html";
                }


                if (!savedName || !dashboard) {
                    break;
                }


                // =====================================
                // SAVE LOGIN SESSION
                // =====================================

                try {

                    localStorage.setItem(
                        "currentUserName",
                        savedName
                    );

                    localStorage.setItem(
                        "currentUserEmail",
                        email
                    );

                    localStorage.setItem(
                        "currentUserRole",
                        savedRole
                    );

                    localStorage.setItem(
                        "currentUserDepartment",
                        savedDepartment || ""
                    );

                    localStorage.setItem(
                        "isLoggedIn",
                        "true"
                    );

                    loginSuccessful = true;

                } catch (error) {

                    console.error("Login Session Error:", error);

                    localStorage.removeItem("isLoggedIn");

                    displayAuthMessage(
                        loginMessage,
                        "Unable to create your login session. Please try again.",
                        true
                    );

                    return;
                }

                break;
            }
        }


        // =====================================
        // LOGIN RESULT
        // =====================================

        if (loginSuccessful) {

            isLoggingIn = true;

            loginButton.disabled = true;

            loginButton.textContent = "Logging in...";

            displayAuthMessage(
                loginMessage,
                "Login successful!",
                false
            );

            alert("Welcome to FixMyCity!");

            window.location.href = dashboard;

        } else {

            displayAuthMessage(
                loginMessage,
                "Invalid email, password or selected role.",
                true
            );
        }

    });

}
