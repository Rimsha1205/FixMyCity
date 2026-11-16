
/* =====================================
   FIXMYCITY - COMPLAINT STATUS HISTORY
===================================== */

// Save a status update in complaint history

function recordComplaintStatus(
    referenceNumber,
    status,
    description,
    actor
) {

    if (!referenceNumber || !status) {
        return;
    }

    let historyKey =
        "complaint_" + referenceNumber + "_history";

    let history = [];

    try {

        history = JSON.parse(
            localStorage.getItem(historyKey)
        ) || [];

        if (!Array.isArray(history)) {
            history = [];
        }

    } catch (error) {

        console.error("Status History Error:", error);

        history = [];
    }


    // Create a new history event

    let event = {

        status: status,

        description: description || "",

        actor: actor || "System",

        timestamp: new Date().toISOString()
    };


    history.push(event);


    // Save updated history

    localStorage.setItem(
        historyKey,
        JSON.stringify(history)
    );
}


// =====================================
// GET COMPLAINT STATUS HISTORY
// =====================================

function getComplaintStatusHistory(referenceNumber) {

    let historyKey =
        "complaint_" + referenceNumber + "_history";

    try {

        let history = JSON.parse(
            localStorage.getItem(historyKey)
        );

        return Array.isArray(history) ? history : [];

    } catch (error) {

        console.error("Unable to read status history:", error);

        return [];
    }
}


// Make functions accessible to other JavaScript files

window.recordComplaintStatus = recordComplaintStatus;

window.getComplaintStatusHistory = getComplaintStatusHistory;
