const API_KEY = "671280276686-noh1jbabhq34lkhr5gdnrcgs931ba2dh.apps.googleusercontent.com"; // Thay bằng API Key của bạn

document.addEventListener("DOMContentLoaded", () => {
    const calendar = document.getElementById("calendar");
    const monthSelector = document.getElementById("month-range");
    const langVI = document.getElementById("lang-vi");
    const langTW = document.getElementById("lang-tw");
    const title = document.getElementById("title");
    const monthLabel = document.getElementById("month-label");

    // Ngôn ngữ mặc định là Tiếng Việt
    let currentLanguage = "vi";

    const monthNames = {
        vi: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
        tw: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
    };

    // Cập nhật ngôn ngữ
    function updateLanguage(lang) {
        currentLanguage = lang;
        if (lang === "vi") {
            title.textContent = "Lịch Tăng Ca 2025";
            monthLabel.textContent = "Hiển thị tháng thứ:";
        } else if (lang === "tw") {
            title.textContent = "加班时间表 2025";
            monthLabel.textContent = "顯示第幾個月：";
        }
        renderCalendar(parseInt(monthSelector.value));
    }

    // Tạo lịch hiển thị
    function renderCalendar(startMonth) {
        calendar.innerHTML = ""; // Xóa lịch cũ
        const currentYear = 2025; // Fixed year to 2025

        for (let i = startMonth; i < startMonth + 2; i++) { // Display only 2 months
            const monthDate = new Date(currentYear, i, 1);
            calendar.appendChild(createMonth(monthDate));
        }
    }

    // Tạo từng tháng
    function createMonth(date) {
        const monthDiv = document.createElement("div");
        monthDiv.className = "month";

        const monthName = `${monthNames[currentLanguage][date.getMonth()]} ${date.getFullYear()}`;
        monthDiv.innerHTML = `<h2>${monthName}</h2>`;

        // Tạo tiêu đề ngày trong tuần
        const weekdaysDiv = document.createElement("div");
        weekdaysDiv.className = "weekdays";
        ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach(day => {
            const dayDiv = document.createElement("div");
            dayDiv.textContent = currentLanguage === "vi" ? day : translateWeekday(day);
            weekdaysDiv.appendChild(dayDiv);
        });
        monthDiv.appendChild(weekdaysDiv);

        // Tạo ngày
        const daysDiv = document.createElement("div");
        daysDiv.className = "days";

        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

        // Bù ngày trống đầu tháng
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            daysDiv.appendChild(document.createElement("div"));
        }

        // Thêm ngày trong tháng
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement("div");
            const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
            currentDate.setHours(0, 0, 0, 0); // Ensure the date is set to midnight to avoid timezone issues
            dayDiv.textContent = day;

            if (currentDate.toDateString() === new Date().toDateString()) {
                dayDiv.className = "today";
            } else if (currentDate.getDay() === 6) {
                dayDiv.className = "saturday";
            } else if (currentDate.getDay() === 0) {
                dayDiv.className = "sunday";
            }

            // Hiển thị số giờ tăng ca
            const overtimeDays = JSON.parse(localStorage.getItem("overtimeDays")) || [];
            const overtimeEntry = overtimeDays.find(entry => entry.date === currentDate.toISOString().split('T')[0]);
            if (overtimeEntry) {
                const overtimeSpan = document.createElement("span");
                overtimeSpan.className = "overtime-hours";
                overtimeSpan.textContent = `${overtimeEntry.hours}h`;
                dayDiv.appendChild(overtimeSpan);
            }

            daysDiv.appendChild(dayDiv);
        }

        monthDiv.appendChild(daysDiv);
        return monthDiv;
    }

    // Dịch thứ sang tiếng Đài Loan
    function translateWeekday(day) {
        const translation = {
            "T2": "一",
            "T3": "二",
            "T4": "三",
            "T5": "四",
            "T6": "五",
            "T7": "六",
            "CN": "日"
        };
        return translation[day] || day;
    }

    // Sự kiện thay đổi ngôn ngữ
    langVI.addEventListener("click", () => updateLanguage("vi"));
    langTW.addEventListener("click", () => updateLanguage("tw"));

    // Sự kiện thay đổi tháng
    monthSelector.addEventListener("change", (e) => {
        renderCalendar(parseInt(e.target.value));
    });

    // Hiển thị mặc định 2 tháng bắt đầu từ tháng hiện tại
    const today = new Date();
    const currentMonth = today.getMonth();
    monthSelector.value = currentMonth;
    renderCalendar(currentMonth);
});

async function createMonthElement(date) {
    const monthElement = document.createElement("div");
    monthElement.className = "month";

    const monthName = date.toLocaleString("vi-VN", { month: "long", year: "numeric" });
    monthElement.innerHTML = `<h2>Tháng ${monthName}</h2>`;

    const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const weekdaysRow = document.createElement("div");
    weekdaysRow.className = "weekdays";
    weekdays.forEach(day => {
        const dayElement = document.createElement("div");
        dayElement.textContent = day;
        weekdaysRow.appendChild(dayElement);
    });
    monthElement.appendChild(weekdaysRow);

    const daysRow = document.createElement("div");
    daysRow.className = "days";

    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const today = new Date();

    // Lấy sự kiện từ API Google Calendar
    const events = await getEvents(date);

    // Thêm các ô trống trước ngày đầu tiên
    for (let i = 1; i < (firstDay === 0 ? 7 : firstDay); i++) {
        const emptyDay = document.createElement("div");
        daysRow.appendChild(emptyDay);
    }

    // Hiển thị các ngày trong tháng
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        const dateString = new Date(date.getFullYear(), date.getMonth(), day);

        dayElement.textContent = day;

        // Khoanh tròn ngày hôm nay
        if (
            today.getDate() === day &&
            today.getMonth() === date.getMonth() &&
            today.getFullYear() === date.getFullYear()
        ) {
            dayElement.classList.add("today");
        }

        // Kiểm tra nếu ngày có sự kiện
        const event = events.find(event => isSameDay(event.start.date || event.start.dateTime, dateString));
        if (event) {
            dayElement.style.backgroundColor = "#f0e68c";
            dayElement.title = event.summary; // Hiển thị mô tả sự kiện
        }

        daysRow.appendChild(dayElement);
    }

    monthElement.appendChild(daysRow);
    return monthElement;
}

async function getEvents(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();
    const calendarId = "primary"; // Hoặc dùng ID của lịch bạn muốn

    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${startOfMonth}&timeMax=${endOfMonth}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error("Error fetching calendar events:", error);
        return [];
    }
}

function isSameDay(date1, date2) {
    const d1 = new Date(date1);
    return (
        d1.getDate() === date2.getDate() &&
        d1.getMonth() === date2.getMonth() &&
        d1.getFullYear() === date2.getFullYear()
    );
}