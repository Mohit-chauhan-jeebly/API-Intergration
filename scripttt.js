const API_URL = "https://jsonplaceholder.typicode.com/users";
const RECORDS_PER_PAGE = 10;

let users = [];
let currentPage = 1;

const loading = document.getElementById("loading");
const errorState = document.getElementById("errorState");
const emptyState = document.getElementById("emptyState");
const tableContainer = document.getElementById("tableContainer");
const userTable = document.getElementById("userTable");

const statusFilter = document.getElementById("statusFilter");
const sortBy = document.getElementById("sortBy");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageNumbers = document.getElementById("pageNumbers");
const pageInfo = document.getElementById("pageInfo");

function showState(state) {
    loading.hidden = state !== "loading";
    errorState.hidden = state !== "error";
    tableContainer.hidden = state !== "table";
    emptyState.hidden = state !== "empty";
}

// Fetch data from API
async function fetchUsers() {
    showState("loading");
    userTable.innerHTML = "";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        // API se aaye data ko required structure mein convert karo
        users = data.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.id % 2 === 0 ? "Inactive" : "Active"
        }));

        currentPage = 1;
        renderUsers();
    } catch (error) {
        console.error("Unable to load users:", error);
        showState("error");
    }
}

// Filtering and sorting
function getFilteredUsers() {
    let result = [...users];

    if (statusFilter.value !== "All") {
        result = result.filter(
            user => user.status === statusFilter.value
        );
    }

    switch (sortBy.value) {
        case "az":
            result.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            break;

        case "za":
            result.sort((a, b) =>
                b.name.localeCompare(a.name)
            );
            break;

        case "newest":
            result.sort((a, b) => b.id - a.id);
            break;

        case "oldest":
            result.sort((a, b) => a.id - b.id);
            break;
    }

    return result;
}

// Render table and pagination
function renderUsers() {
    const filteredUsers = getFilteredUsers();

    if (filteredUsers.length === 0) {
        userTable.innerHTML = "";
        pageNumbers.innerHTML = "";
        pageInfo.textContent = "";
        showState("empty");
        return;
    }

    const totalPages = Math.ceil(
        filteredUsers.length / RECORDS_PER_PAGE
    );

    // Agar filter change hone se current page invalid ho
    currentPage = Math.min(currentPage, totalPages);

    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;

    const pageUsers = filteredUsers.slice(
        startIndex,
        startIndex + RECORDS_PER_PAGE
    );

    userTable.innerHTML = "";

    pageUsers.forEach(user => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = user.id;

        const nameCell = document.createElement("td");
        nameCell.textContent = user.name;

        const emailCell = document.createElement("td");
        emailCell.textContent = user.email;

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = "status " +
            (user.status === "Active" ? "active" : "inactive");
        badge.textContent = user.status;

        statusCell.appendChild(badge);
        row.append(idCell, nameCell, emailCell, statusCell);
        userTable.appendChild(row);
    });

    showState("table");
    renderPagination(totalPages);

    pageInfo.textContent =
        `Showing ${startIndex + 1}–${Math.min(
            startIndex + pageUsers.length,
            filteredUsers.length
        )} of ${filteredUsers.length} users`;

}

// Generate pagination buttons
function renderPagination(totalPages) {
    pageNumbers.innerHTML = "";

    for (let page = 1; page <= totalPages; page++) {
        const button = document.createElement("button");
        button.textContent = page;

        if (page === currentPage) {
            button.classList.add("current");
            button.setAttribute("aria-current", "page");
        }

        button.addEventListener("click", () => {
            currentPage = page;
            renderUsers();
        });

        pageNumbers.appendChild(button);
    }

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// Filter and sort events
statusFilter.addEventListener("change", () => {
    currentPage = 1;
    renderUsers();
});

sortBy.addEventListener("change", () => {
    currentPage = 1;
    renderUsers();
});

// Previous and Next
prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderUsers();
    }
});

nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(
        getFilteredUsers().length / RECORDS_PER_PAGE
    );

    if (currentPage < totalPages) {
        currentPage++;
        renderUsers();
    }
});

// Retry API request
document.getElementById("retryBtn").addEventListener(
    "click",
    fetchUsers
);

// Start
fetchUsers();