
/* =====================================
   FIXMYCITY - MOCK DATA SERVICE
===================================== */

// Load mock data from JSON
window.mockDataPromise = fetch("../mock-data.json")
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Unable to load mock-data.json");
        }

        return response.json();
    })
    .then(function(data) {

        if (!data.users || !data.complaints) {
            throw new Error("Invalid mock data structure.");
        }

        console.log("FixMyCity mock data loaded successfully.");

        window.mockData = data;

        return data;
    })
    .catch(function(error) {

        console.error("Mock Data Error:", error);

        window.mockData = null;

        return null;
    });


// Apply LocalStorage updates to mock complaints
window.getUpdatedMockComplaints = async function() {

    let data = await window.mockDataPromise;

    if (!data) {
        return [];
    }

    return data.complaints.map(function(originalComplaint) {

        let complaint = { ...originalComplaint };

        let key =
            "officer_assignment_" +
            complaint.referenceNumber + "_";

        // Apply officer assignment
        complaint.assignedStaffEmail =
            localStorage.getItem(key + "email") ||
            complaint.assignedStaffEmail;

        complaint.assignedStaffName =
            localStorage.getItem(key + "name") ||
            complaint.assignedStaffName ||
            null;

        complaint.assignedDepartment =
            localStorage.getItem(key + "department") ||
            complaint.assignedDepartment;

        // Apply staff status updates
        complaint.status =
            localStorage.getItem(key + "status") ||
            complaint.status;

        complaint.resolution =
            localStorage.getItem(key + "resolution") ||
            complaint.resolution;

        return complaint;
    });
};


// Mock data service
window.mockDataService = {

    getAllUsers: async function() {

        let data = await window.mockDataPromise;

        return data ? data.users : [];
    },

    getAllComplaints: async function() {

        return await window.getUpdatedMockComplaints();
    },

    getComplaintsByCitizen: async function(email) {

        let complaints =
            await window.getUpdatedMockComplaints();

        return complaints.filter(function(complaint) {
            return complaint.citizenEmail === email;
        });
    },

    getComplaintByReference: async function(referenceNumber) {

        let complaints =
            await window.getUpdatedMockComplaints();

        return complaints.find(function(complaint) {
            return complaint.referenceNumber === referenceNumber;
        }) || null;
    },

    getComplaintsByStaff: async function(email) {

        let complaints =
            await window.getUpdatedMockComplaints();

        return complaints.filter(function(complaint) {
            return complaint.assignedStaffEmail === email;
        });
    }
};
