document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const mainContent = document.getElementById("main-content");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("login-button");
    const loginError = document.getElementById("login-error");

    const correctPassword = "123"; // Change this to your desired password

    loginButton.addEventListener("click", () => {
        const enteredPassword = passwordInput.value;
        if (enteredPassword === correctPassword) {
            loginForm.style.display = "none";
            mainContent.style.display = "block";
        } else {
            loginError.style.display = "block";
        }
    });

    const overtimeList = document.getElementById("overtime-list");
    const overtimeDateInput = document.getElementById("overtime-date");
    const overtimeHoursInput = document.getElementById("overtime-hours");
    const addOvertimeButton = document.getElementById("add-overtime");
    const monthlyOvertimeTable = document.getElementById("monthly-overtime-table").querySelector("tbody");
    const title = document.getElementById("title");
    const monthlyOvertimeTitle = document.getElementById("monthly-overtime-title");
    const monthHeader = document.getElementById("month-header");
    const totalHoursHeader = document.getElementById("total-hours-header");
    const langVI = document.getElementById("lang-vi");
    const langTW = document.getElementById("lang-tw");

    const overtimeDays = JSON.parse(localStorage.getItem("overtimeDays")) || [];

    let currentLanguage = "vi";

    const translations = {
        vi: {
            title: "Quản lý ngày tăng ca",
            addOvertime: "Thêm ngày tăng ca",
            monthlyOvertimeTitle: "Tổng số giờ tăng ca theo tháng",
            monthHeader: "Tháng",
            totalHoursHeader: "Tổng số giờ tăng ca",
            hours: "giờ",
            delete: "Xóa"
        },
        tw: {
            title: "加班管理",
            addOvertime: "添加加班日",
            monthlyOvertimeTitle: "每月加班總時數",
            monthHeader: "月份",
            totalHoursHeader: "加班總時數",
            hours: "小時",
            delete: "刪除"
        }
    };

    const updateLanguage = (lang) => {
        currentLanguage = lang;
        const translation = translations[lang];
        title.textContent = translation.title;
        addOvertimeButton.textContent = translation.addOvertime;
        monthlyOvertimeTitle.textContent = translation.monthlyOvertimeTitle;
        monthHeader.textContent = translation.monthHeader;
        totalHoursHeader.textContent = translation.totalHoursHeader;
        renderList();
        renderMonthlyOvertime();
    };

    const renderList = () => {
        overtimeList.innerHTML = "";
        overtimeDays.forEach(entry => {
            const date = new Date(entry.date);
            date.setDate(date.getDate() + 1); // Add one day
            const formattedDate = date.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
            const li = document.createElement("li");
            li.textContent = `${formattedDate}: ${entry.hours} ${translations[currentLanguage].hours}`;
            const removeButton = document.createElement("button");
            removeButton.textContent = translations[currentLanguage].delete;
            removeButton.onclick = () => {
                const index = overtimeDays.indexOf(entry);
                if (index !== -1) {
                    overtimeDays.splice(index, 1);
                    localStorage.setItem("overtimeDays", JSON.stringify(overtimeDays));
                    renderList();
                    renderMonthlyOvertime();
                }
            };
            li.appendChild(removeButton);
            overtimeList.appendChild(li);
        });
    };

    const renderMonthlyOvertime = () => {
        const monthlyOvertime = {};

        overtimeDays.forEach(entry => {
            const month = entry.date.slice(0, 7); // Get the YYYY-MM part of the date
            if (!monthlyOvertime[month]) {
                monthlyOvertime[month] = 0;
            }
            monthlyOvertime[month] += parseInt(entry.hours, 10);
        });

        monthlyOvertimeTable.innerHTML = "";
        Object.keys(monthlyOvertime).forEach(month => {
            const row = document.createElement("tr");
            const monthCell = document.createElement("td");
            monthCell.textContent = month;
            const hoursCell = document.createElement("td");
            hoursCell.textContent = monthlyOvertime[month];
            row.appendChild(monthCell);
            row.appendChild(hoursCell);
            monthlyOvertimeTable.appendChild(row);
        });
    };

    addOvertimeButton.addEventListener("click", () => {
        const date = new Date(overtimeDateInput.value);
        date.setHours(0, 0, 0, 0); // Ensure the date is set to midnight to avoid timezone issues
        const formattedDate = date.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
        const hours = overtimeHoursInput.value;
        if (formattedDate && hours && !overtimeDays.some(entry => entry.date === formattedDate)) {
            overtimeDays.push({ date: formattedDate, hours });
            localStorage.setItem("overtimeDays", JSON.stringify(overtimeDays));
            renderList();
            renderMonthlyOvertime();
        }
    });

    langVI.addEventListener("click", () => updateLanguage("vi"));
    langTW.addEventListener("click", () => updateLanguage("tw"));

    renderList();
    renderMonthlyOvertime();
});