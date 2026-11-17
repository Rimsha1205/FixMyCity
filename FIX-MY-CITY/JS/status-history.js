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

    let event = {

        status: status,

        description: description || "",

        actor: actor || "System",

        timestamp: new Date().toISOString()
    };


    history.push(event);

    localStorage.setItem(
        historyKey,
        JSON.stringify(history)
    );
}
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

window.recordComplaintStatus = recordComplaintStatus;

window.getComplaintStatusHistory = getComplaintStatusHistory;
