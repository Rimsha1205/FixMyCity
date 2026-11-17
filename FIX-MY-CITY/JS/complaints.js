if (
    localStorage.getItem("isLoggedIn") !== "true" ||
    localStorage.getItem("currentUserRole") !== "Citizen"
) {

    window.location.href = "login.html";

} else {

    const complaintForm =
        document.getElementById("complaintForm");

    const photoInput =
        document.getElementById("photo");

    const imagePreview =
        document.getElementById("imagePreview");

    const complaintMessage =
        document.getElementById("complaintMessage");

    const submitButton =
        complaintForm.querySelector('button[type="submit"]');

    let selectedPhoto = "";

    let isSubmitting = false;

    function showComplaintMessage(message, isError) {

        complaintMessage.textContent = message;

        complaintMessage.style.color =
            isError ? "red" : "green";

        complaintMessage.style.display = "block";
    }


    photoInput.addEventListener("change", function() {

        let file = photoInput.files[0];

        imagePreview.innerHTML = "";

        selectedPhoto = "";

        showComplaintMessage("", false);

        if (!file) {
            return;
        }

        let allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {

            showComplaintMessage(
                "Invalid image format. Please upload JPG, PNG or WEBP.",
                true
            );

            photoInput.value = "";

            return;
        }

        if (file.size > 2 * 1024 * 1024) {

            showComplaintMessage(
                "Image size must not exceed 2 MB.",
                true
            );

            photoInput.value = "";

            return;
        }

        let reader = new FileReader();

        reader.onload = function(event) {

            if (typeof event.target.result !== "string") {

                showComplaintMessage(
                    "Unable to preview the selected photograph.",
                    true
                );

                photoInput.value = "";

                return;
            }

            selectedPhoto = event.target.result;

            let image = document.createElement("img");

            image.src = selectedPhoto;

            image.alt = "Complaint photograph preview";

            image.className = "complaint-preview";

            imagePreview.appendChild(image);

            showComplaintMessage(
                "Photograph selected successfully.",
                false
            );
        };


        reader.onerror = function() {

            selectedPhoto = "";

            photoInput.value = "";

            imagePreview.innerHTML = "";

            showComplaintMessage(
                "Unable to read the photograph. Please try another image.",
                true
            );
        };


        reader.readAsDataURL(file);

    });

    complaintForm.addEventListener("submit", function(event) {

        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        showComplaintMessage("", false);

        let title =
            document.getElementById("complaintTitle").value.trim();

        let category =
            document.getElementById("category").value;

        let description =
            document.getElementById("description").value.trim();

        let location =
            document.getElementById("location").value.trim();


        let latitudeValue =
            document.getElementById("latitude").value.trim();

        let longitudeValue =
            document.getElementById("longitude").value.trim();

        let latitude =
            latitudeValue === "" ? "" : Number(latitudeValue);

        let longitude =
            longitudeValue === "" ? "" : Number(longitudeValue);

        if (title.length < 5) {

            showComplaintMessage(
                "Complaint title must contain at least 5 characters.",
                true
            );

            return;
        }


        let allowedCategories = [
            "Garbage Collection",
            "Road Damage",
            "Streetlight Issue",
            "Water Leakage",
            "Drainage Problem",
            "Public Toilet Issue",
            "Other"
        ];

        if (!allowedCategories.includes(category)) {

            showComplaintMessage(
                "Please select a valid complaint category.",
                true
            );

            return;
        }


        if (description.length < 10) {

            showComplaintMessage(
                "Please provide at least 10 characters in the description.",
                true
            );

            return;
        }

        if (location.length < 3) {

            showComplaintMessage(
                "Please enter a valid problem location.",
                true
            );

            return;
        }

        if (
            (latitudeValue === "" && longitudeValue !== "") ||
            (latitudeValue !== "" && longitudeValue === "")
        ) {

            showComplaintMessage(
                "Please enter both latitude and longitude, or leave both blank.",
                true
            );

            return;
        }
        if (
            latitudeValue !== "" &&
            (
                !Number.isFinite(latitude) ||
                latitude < -90 ||
                latitude > 90
            )
        ) {

            showComplaintMessage(
                "Please enter a valid latitude between -90 and 90.",
                true
            );

            return;
        }

        if (
            longitudeValue !== "" &&
            (
                !Number.isFinite(longitude) ||
                longitude < -180 ||
                longitude > 180
            )
        ) {

            showComplaintMessage(
                "Please enter a valid longitude between -180 and 180.",
                true
            );

            return;
        }

        if (photoInput.files.length > 0 && !selectedPhoto) {

            showComplaintMessage(
                "Please wait for the photograph to finish loading or select it again.",
                true
            );

            return;
        }

        let citizenName =
            localStorage.getItem("currentUserName");

        let citizenEmail =
            localStorage.getItem("currentUserEmail");

        if (!citizenName || !citizenEmail) {

            showComplaintMessage(
                "Your login session is incomplete. Please log in again.",
                true
            );

            return;
        }

        let confirmSubmission = confirm(
            "Are you sure you want to submit this complaint?"
        );

        if (!confirmSubmission) {
            return;
        }

        isSubmitting = true;

        submitButton.disabled = true;

        submitButton.textContent = "Submitting...";

        let complaintCount =
            Number(localStorage.getItem("complaintCount")) || 0;

        if (
            !Number.isSafeInteger(complaintCount) ||
            complaintCount < 0
        ) {

            isSubmitting = false;

            submitButton.disabled = false;

            submitButton.textContent = "Submit Complaint";

            showComplaintMessage(
                "Unable to generate a complaint reference. Please contact the administrator.",
                true
            );

            return;
        }


        let referenceNumber =
            "FMC" + (1001 + complaintCount);

        let prefix =
            "complaint_" + complaintCount + "_";

        let historyKey =
            "complaint_" + referenceNumber + "_history";

        try {

            
            localStorage.setItem(
                prefix + "id",
                referenceNumber
            );


            localStorage.setItem(
                prefix + "title",
                title
            );

            localStorage.setItem(
                prefix + "category",
                category
            );

            localStorage.setItem(
                prefix + "description",
                description
            );

            localStorage.setItem(
                prefix + "location",
                location
            );

            localStorage.setItem(
                prefix + "latitude",
                latitudeValue === "" ? "" : String(latitude)
            );

            localStorage.setItem(
                prefix + "longitude",
                longitudeValue === "" ? "" : String(longitude)
            );


            localStorage.setItem(
                prefix + "photo",
                selectedPhoto
            );

            localStorage.setItem(
                prefix + "citizenName",
                citizenName
            );

            localStorage.setItem(
                prefix + "citizenEmail",
                citizenEmail
            );

            localStorage.setItem(
                prefix + "status",
                "Pending"
            );

            localStorage.setItem(
                prefix + "date",
                new Date().toISOString()
            );

            if (window.recordComplaintStatus) {

                recordComplaintStatus(
                    referenceNumber,
                    "Submitted",
                    "Complaint successfully submitted by the citizen.",
                    citizenName
                );
            }

            localStorage.setItem(
                "complaintCount",
                String(complaintCount + 1)
            );

            alert(
                "Complaint submitted successfully!\n" +
                "Your Reference Number: " +
                referenceNumber
            );

            complaintForm.reset();

            imagePreview.innerHTML = "";

            selectedPhoto = "";

            window.location.href = "citizen-dashboard.html";

        } catch (error) {

            console.error(
                "Complaint Submission Error:",
                error
            );

            let complaintKeys = [
                "id",
                "title",
                "category",
                "description",
                "location",
                "latitude",
                "longitude",
                "photo",
                "citizenName",
                "citizenEmail",
                "status",
                "date"
            ];

            complaintKeys.forEach(function(key) {

                localStorage.removeItem(prefix + key);
            });

            localStorage.removeItem(historyKey);


            showComplaintMessage(
                "Unable to submit your complaint. Your browser storage may be full. Please try again with a smaller photograph.",
                true
            );

            isSubmitting = false;

            submitButton.disabled = false;

            submitButton.textContent = "Submit Complaint";
        }

    });

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

}
