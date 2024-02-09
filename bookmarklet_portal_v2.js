// Check if do we need to call other script. If yes, we need to exit as soon as posible to prevent polluting by functions in this script
let url = window.location.href;
if (url.match(/portal\d{1,2}.hcmus.edu.vn/)) {
    var script = document.createElement('script');
    script.src = 'https://dreamywanderer.github.io/GPABookmarklet_Maintanence/bookmarklet.js';
    document.body.appendChild(script);

    throw new Error("Redirecting to the new script");
}

// Declare all global variables here
let gradeTable, excludeCourses, courses, gradeTableRows, gradeTableHeadRow, gradeTableBodyRow;
const supplementaryGrade = [
    { score: 9, letter: "A+", fourRounding: 4.0},
    { score: 8, letter: "A.", fourRounding: 3.5},
    { score: 7, letter: "B+", fourRounding: 3.0},
    { score: 6, letter: "B.", fourRounding: 2.5},
    { score: 5, letter: "C.", fourRounding: 2.0},
    { score: 4, letter: "D+", fourRounding: 1.5},
    { score: 3, letter: "D.", fourRounding: 1.0},
    { score: 0, letter: "F.", fourRounding: 0.0}
];
const notInGPACourses = [
    "Anh văn",
    "Giáo dục quốc phòng",
    "Thể dục",
    "Tin học cơ sở",
    "Tin hoc co so",
    "Anh van",
    "Giao duc quoc phong",
    "The duc"
];

function addFloatingGPABlock() {
    let floatingGPABlock = document.createElement("div");
    floatingGPABlock.setAttribute("id", "floatingGPABlock");
    floatingGPABlock.setAttribute("class", "fixed bottom-0 right-0 z-10 bg-[#063768] text-[#FFFF] p-2 rounded-md");
    floatingGPABlock.innerHTML = "<p class='text-sm text-center'><span id='GPA'>0</span> (<span id='GPA4'>0</span>) / <span id='AllGPA'>0</span><br><span id='numCredit'>0</span><br><span id='numCoursesIn'>0</span>/<span id='numCoursesAll'>0</span></p>";
    document.body.appendChild(floatingGPABlock);

    let span = floatingGPABlock.querySelector("span");
    let observer = new MutationObserver(function (mutations) {
        floatingGPABlock.classList.remove("floatingGPABlockFade");
        floatingGPABlock.classList.add("floatingGPABlockInitial")
        setTimeout(() => {
            floatingGPABlock.classList.remove("floatingGPABlockInitial");
            floatingGPABlock.classList.add("floatingGPABlockFade");
        }, 4000);
    });
    observer.observe(span, { childList: true });
}

function addEdittingFeature() {
    let container = document.createElement("div");
    container.classList.add("flex", "flex-row", "justify-center", "space-x-2", "z-20", "mt-4");
    container.setAttribute("id", "edittingFeatureContainer");
    let button = document.createElement("button");
    button.classList.add("primary-button", "rounded-md", "w-[30%]", "h-[3em]", "text-[0.7em]"); 

    let editButton = button.cloneNode(true);
    editButton.textContent = "Kích hoạt sửa";
    editButton.addEventListener("click", editButtonOnClick);

    let addRowButton = button.cloneNode(true);
    addRowButton.textContent = "Thêm dòng";
    addRowButton.addEventListener("click", addRowButtonOnClick);

    let deleteAddedRowButton = button.cloneNode(true);
    deleteAddedRowButton.textContent = "Xóa mọi dòng thêm";
    deleteAddedRowButton.addEventListener("click", deleteAddedRowButtonOnClick);

    container.appendChild(editButton);
    container.appendChild(addRowButton);
    container.appendChild(deleteAddedRowButton);

    let gradeTable = document.getElementById("gradeTable");
    gradeTable.insertAdjacentElement("afterend", container);

    function editButtonOnClick() {
        if (editButton.textContent == "Kích hoạt sửa") {
            gradeTable.setAttribute("contenteditable", "true");
            editButton.textContent = "Hủy sửa";
        }
        else {
            gradeTable.removeAttribute("contenteditable");
            editButton.textContent = "Kích hoạt sửa";
        }
    }

    function addRowButtonOnClick() {
        let newRow = gradeTableBodyRow.cloneNode(true);
        newRow.classList.add("addedRow");
        let cells = newRow.querySelectorAll("td");
        for (let i = 0; i < cells.length; i++) cells[i].textContent = "";
        gradeTable.querySelector("tbody").appendChild(newRow);
    }

    function deleteAddedRowButtonOnClick() {
        let addedRows = gradeTable.querySelectorAll(".addedRow");
        for (let i = 0; i < addedRows.length; i++) addedRows[i].remove();
    }
}

function main() {
    console.clear();

    function initGlobalVariables() {
        gradeTable = null;
        gradeTableRows = null;
        excludeCourses = [];
        courses = [];
    }

    function toFixed(num, numOfDecimal) {
        return Math.round(num * Math.pow(10, numOfDecimal)) / Math.pow(10, numOfDecimal);
    }

    function basicCleanString(str) {
        return str.trim().normalize();
    }

    function convertToFourScale(grade) {
        if (grade >= 0) {
            const lowerGrade = supplementaryGrade.find(x => grade >= x.score);
            const upperGrade = supplementaryGrade.find(x => grade < x.score);

            if (lowerGrade && upperGrade) {
                const scoreDiff = upperGrade.score - lowerGrade.score;
                const ratio = (grade - lowerGrade.score) / scoreDiff;
    
                return toFixed(lowerGrade.fourRounding + ratio * (upperGrade.fourRounding - lowerGrade.fourRounding), 3);
            } else {
                // Handle edge cases where item.score is higher than the highest score
                return 4.0;
            }
        }
    }


    function setExcludeReason(course, courses) {
        if (!course.credit) {
            course.credit = 0;
            course.include = false;
            course.whyExclude += "Học phần không tín chỉ";
        }
        else if (!course.grade && course.grade != 0) {
            course.grade = 0;
            course.include = false;
            course.whyExclude += "Chưa hoặc không có điểm";
        }
        else if (course.grade < 5) {
            course.include = false;
            course.whyExclude += "Điểm nhỏ hơn 5, chưa qua môn";
        }

        for (let j = 0; j < notInGPACourses.length; j++) {
            if (course.courseName.includes(notInGPACourses[j])) {
                course.include = false;
                course.whyExclude = "Học phần không tính trong GPA";
                break;
            }
        }

        if (course.isAddedRow) return; // The added row often does not have courseCode, so checking courseCode is not meaningful

        for (let j = 0; j < courses.length; j++) {
            if (courses[j].courseCode == course.courseCode) {
                courses[j].include = false;
                courses[j].whyExclude = "Đã học lại";
            }
        }
    }

    function changeRowContent(tr, dataElementName, cellData) {
        let cells = tr.querySelectorAll(dataElementName);
    
        for (let i = 0; i < cells.length; i++) {
            cells[i].innerHTML = cellData[i];
            if (i >= cellData.length) cells[i].remove();
        }

        if (cellData.length > cells.length) {
            for (let i = cells.length; i < cellData.length; i++) {
                let newCell = document.createElement(dataElementName);
                newCell.innerHTML = cellData[i];
                tr.appendChild(newCell);
            }
        }
    }

    function addTrToTable(tb, tr, dataElementName, cellData) {
        let newTr = tr.cloneNode(true);

        tb.appendChild(newTr);
        changeRowContent(newTr, dataElementName, cellData);
    }

    function resetGradeTableFormat() {
        gradeTable.querySelector("thead").innerHTML = gradeTableHeadRow.innerHTML;
        
        // Remove all td in tbody that has attribute "data-status"
        let statusCells = gradeTable.querySelectorAll("tbody td[data-status]");
        for (let i = 0; i < statusCells.length; i++) statusCells[i].remove();
    }

    function initUserCoursesDataFromGradeTable() {
        if (gradeTable = document.getElementById("gradeTable"), gradeTable == null) 
        {
            gradeTable = document.querySelector("table");
            gradeTable.setAttribute("id", "gradeTable"); // If there is GPA Table: use this id to find gradeTable
            gradeTableHeadRow = gradeTable.querySelector("thead tr").cloneNode(true);
            gradeTableBodyRow = gradeTable.querySelector("tbody tr").cloneNode(true);
        }

        resetGradeTableFormat();

        // The order of columns of gradeTable may be changed rapidly. We get the title of columns for further use
        let titles = Array.from(gradeTableHeadRow.querySelectorAll("th")).map(th => basicCleanString(th.textContent.toLowerCase()));
        let titleToIndex = {};
        for (let i = 0; i < titles.length; i++) titleToIndex[titles[i]] = i;
        
        if ((gradeTable != null)) {
            gradeTableRows = gradeTable.querySelectorAll("tbody tr");

            for (let i = 0; i < gradeTableRows.length; i++) {
                const dataInRow = gradeTableRows[i].querySelectorAll("td");

                let course = {
                    id: i,
                    schoolYear: basicCleanString(dataInRow[titleToIndex["năm học"]].textContent),
                    semeser: basicCleanString(dataInRow[titleToIndex["học kỳ"]].textContent),
                    courseCode: basicCleanString(dataInRow[titleToIndex["mã môn học"]].textContent),
                    courseName: basicCleanString(dataInRow[titleToIndex["tên môn học"]].textContent),
                    credit: parseFloat(basicCleanString(dataInRow[titleToIndex["số tc"]].textContent)),
                    className: basicCleanString(dataInRow[titleToIndex["lớp"]].textContent),
                    typeOfGrade: basicCleanString(dataInRow[titleToIndex["loại điểm"]].textContent),
                    grade: parseFloat(basicCleanString(dataInRow[titleToIndex["điểm (hệ 10)"]].textContent)),

                    include: true,
                    whyExclude: "",
                    letterGrade: "",
                    isAddedRow: gradeTableRows[i].classList.contains("addedRow")
                }
                course.fourScaleGrade = convertToFourScale(course.grade);

                gradeTableRows[i].setAttribute("id", i);
                setExcludeReason(course, courses);
                courses.push(course);
                if (!course.include) excludeCourses.push(course);
            }
        }
    }

    class Calculation {
        constructor() {
            this.totalCredits = 0;
            this.notPassTotalCredits = 0;
            this.totalGrade = 0;
            this.notPassTotalGrade = 0;
            this.GPA = 0;
            this.notPassGPA = 0;
            this.fourGPA = 0;
            this.excludeCourseSize = 0;
        }

        calculateGPA() {
            let howICalculated = "%c Điểm tính thế nào nhở ?%c \n\n";
            let cssLog = ["font-size:16px", "font-size:normal"];
            let totalFourScores = 0;

            for (let i = 0; i < courses.length; i++) {
                let course = courses[i];
                if (course.include) {
                    this.totalCredits += course.credit;
                    this.totalGrade += course.credit * course.grade;
                    totalFourScores += course.credit * course.fourScaleGrade;

                    howICalculated += " " + course.courseName + ":%c " + course.grade + "%c x%c " + course.credit + "%c = %c " + course.credit * course.grade + "%c \n";
                    cssLog.push("font-weight:bold;");
                    cssLog.push("font-weight:normal;");
                    cssLog.push("font-weight:bold;");
                    cssLog.push("font-weight:normal;");
                    cssLog.push("font-weight:bold;");
                    cssLog.push("font-weight:normal;");
                } 
                else 
                {
                    if (course.whyExclude.includes("5")) // Used to calculate even not passed gpa
                    {
                        this.notPassTotalCredits += course.credit;
                        this.notPassTotalGrade += course.credit * course.grade;
                    }

                    howICalculated += "%c " + course.courseName + ": " + course.grade + " x " + course.credit + "%c \n";
                    cssLog.push("color:orange;text-decoration: line-through;");
                    cssLog.push("color:white;");
                }
            }

            this.GPA = this.totalGrade / this.totalCredits;
            this.notPassGPA = (this.totalGrade + this.notPassTotalGrade) / (this.totalCredits + this.notPassTotalCredits);
            this.fourGPA = totalFourScores / this.totalCredits;

            for (let i = 0; i < courses.length; i++)
                if (!courses[i].include) this.excludeCourseSize++;

            console.clear();
            console.log("%c \n Chào nhé, GPA nè:\n %c" + this.GPA + "\n", "color:red", "color:blue; font-size: 30px;");
            console.log("%c \n Tổng tín chỉ:\n %c" + this.totalCredits + "\n", "color:red", "color:blue; font-size: 30px;");
            console.log("%c \n Tổng điểm:\n %c" + this.totalGrade + "\n", "color:red", "color:blue; font-size: 30px;");
            console.log("%c \n Tổng học phần:\n %c" + courses.length + "\n", "color:red", "color:blue; font-size: 30px;");
            console.log("%c \n Tổng học phần trong GPA:\n %c" + (courses.length - this.excludeCourseSize) + "\n", "color:red", "color:blue; font-size: 30px;");

            howICalculated += "-------------\n" + "GPA : %c " + this.totalGrade + " / " + this.totalCredits + " = " + this.GPA;
            cssLog.push("font-weight:bold");


            let removedSection = "%c Không bao gồm những học phần sau đây: \n\n%c";
            let removedCss = ["font-size:16px", "font-size:normal"];

            for (let i = 0; i < excludeCourses.length; i++) {
                removedSection += "%c  loại bỏ: %c" + excludeCourses[i].courseName + " (" + `${excludeCourses[i].schoolYear}/${excludeCourses[i].semeser}` + ")" + "\n%c lý do: %c" + excludeCourses[i].whyExclude + "\n\n%c";
                removedCss.push("color:red");
                removedCss.push("color:blue");
                removedCss.push("color:red");

                removedCss.push("color:red");
                removedCss.push("color:red");
            }

            removedSection += "%c  " + this.excludeCourseSize + " học phần đã loại bỏ.%c\n";
            removedCss.push("color:red");
            removedCss.push("color:black");

            console.log(removedSection, ...removedCss);
            console.log(howICalculated, ...cssLog);

            console.log("(Kéo lên để xem chi tiết)");
        }

        formatGPATable() {
            let fieldGPATable = document.getElementById("fieldGPATable");
            if (fieldGPATable != null) fieldGPATable.remove();

            // Format the GPA Table results
            let GPATable = document.createElement("fieldset");
            GPATable.innerHTML = '<legend>Thống kê GPA</legend><div class="w-full"><div class="w-full no-scrollbar overflow-x-control"><table id="GPATable" class="w-full text-sm text-left"><thead class="w-full sm:text-[0.8em] text-[1em] text-[#FFFF] bg-[#063768]"></thead><tbody></tbody></table></div></div><p style="margin-top: 10px; color: blue;"><strong>(*)</strong>: Nhấn Ctr+Shift+I và chọn tab Console để xem chi tiết tính toán.<br>Nếu bạn thấy hữu ích, hãy tặng cho tác giả gốc một Star <a href="https://github.com/DreamyWanderer/GPABookmarklet_Maintanence">Tại Đây</a> hoặc <a href="https://github.com/dtrung98/GPABookmarklet">Tại Đây</a> nhé ^^<br>Vui lòng báo lỗi hoặc kiến nghị <a href="https://github.com/DreamyWanderer/GPABookmarklet_Maintanence/issues">Tại Đây</a></p>';
            GPATable.setAttribute("class", "w-full py-5");
            GPATable.setAttribute("id", "fieldGPATable");

            // Find suitable position to insert
            let button = Array.from(document.getElementsByTagName('button')).find(button => button.textContent === "Tổng kết");
            let typeCoursesTableButtonContainer = button.parentElement.parentElement;
            
            typeCoursesTableButtonContainer.after(GPATable);

            // Create content for GPA Table
            let GPATableHead = GPATable.querySelector("thead");
            let GPATableBody = GPATable.querySelector("tbody");

            // For Header content
            let GPATableHeadRow = gradeTableHeadRow.cloneNode(true);
            GPATableHead.appendChild(GPATableHeadRow);
            changeRowContent(GPATableHeadRow, "th", ["Tên mục", "Giá trị"]);

            // For Body content
            let GPATableBodyRow = gradeTableBodyRow.cloneNode(true);
            addTrToTable(GPATableBody, GPATableBodyRow, "td", ["Điểm trung bình tích lũy (GPA)", toFixed(this.GPA, 2)]);
            addTrToTable(GPATableBody, GPATableBodyRow, "td", ["Điểm trung bình tích lũy (4.0)", toFixed(this.fourGPA, 2)]);
            addTrToTable(GPATableBody, GPATableBodyRow, "td", ["Điểm trung bình học tập", toFixed(this.notPassGPA, 2)]);
            addTrToTable(GPATableBody, GPATableBodyRow, "td", ["Tổng tín chỉ", this.totalCredits]);
            addTrToTable(GPATableBody, GPATableBodyRow, "td", ["Tổng điểm tích lũy", this.totalGrade]);
            addTrToTable(GPATableBody, GPATableBodyRow, "td", ["Số học phần đã học", courses.length + " học phần"]);
            addTrToTable(GPATableBody, GPATableBodyRow, "td", ["Số học phần tính trong GPA", (courses.length - this.excludeCourseSize) + " học phần"]);

            // Add the floating GPA block
            let floatingGPABlock = document.getElementById("floatingGPABlock");
            floatingGPABlock.querySelector("#GPA").textContent = toFixed(this.GPA, 2);
            floatingGPABlock.querySelector("#GPA4").textContent = toFixed(this.fourGPA, 2);
            floatingGPABlock.querySelector("#AllGPA").textContent = toFixed(this.notPassGPA, 2);
            floatingGPABlock.querySelector("#numCredit").textContent = this.totalCredits;
            floatingGPABlock.querySelector("#numCoursesIn").textContent = courses.length - this.excludeCourseSize;
            floatingGPABlock.querySelector("#numCoursesAll").textContent = courses.length;
        }

        insertStatusColumn() {
            if (gradeTable.querySelector("thead tr").querySelector("th").textContent != "") {
                let statusCell = gradeTableBodyRow.querySelector("td").cloneNode(true);
                statusCell.setAttribute("data-status", "in");
                statusCell.innerHTML = '<i class="fa-sharp fa-solid fa-circle fa-xs"></i>';

                let gradeTableHeadRow = gradeTable.querySelector("thead tr");
                let newColumn = gradeTableHeadRow.querySelector("th").cloneNode(true);
                newColumn.innerHTML = "";
                gradeTableHeadRow.insertBefore(newColumn, gradeTableHeadRow.firstChild);

                for (let i = 0; i < gradeTableRows.length; i++) {
                    gradeTableRows[i].insertBefore(statusCell.cloneNode(true), gradeTableRows[i].firstChild);
                    gradeTableRows[i].firstChild.addEventListener("click", statusCellClickHandler);
                }
            }
        }

        formatGradeTable() {
            this.insertStatusColumn();
            
            for (let i = 0; i < gradeTableRows.length; i++) {
                if (!courses[i].include) {
                    if (courses[i].whyExclude.includes("không"))
                        gradeTableRows[i].setAttribute("style", "color:blue;text-decoration: line-through;");
                    else gradeTableRows[i].setAttribute("style", "color:red;text-decoration: line-through;");

                    gradeTableRows[i].firstChild.setAttribute("data-status", "out");
                }
                else {
                    if (gradeTableRows[i].hasAttribute("style")) gradeTableRows[i].removeAttribute("style");

                    gradeTableRows[i].firstChild.setAttribute("data-status", "in");
                }
            }
        }
    }

    function startNewCalculate() {
        initGlobalVariables();
        initUserCoursesDataFromGradeTable();
        let cal = new Calculation();
        cal.calculateGPA();
        cal.formatGPATable();
        cal.formatGradeTable();
    }

    function statusCellClickHandler() {
        let id = this.parentElement.getAttribute("id");
        let course = courses[id];
        let cal = new Calculation();

        course.include = !course.include;
        observer.disconnect();
        cal.calculateGPA();
        cal.formatGPATable();
        cal.formatGradeTable();
        observer.observe(gradeTable, { subtree: true, childList: true, characterData: true});
    }

    function addFontAwesome() {
        var script = document.createElement('script');
        script.src = 'https://kit.fontawesome.com/010704b55b.js';
        document.body.appendChild(script);
    }

    function addStyle() {
        var style = document.createElement('style');
        style.innerHTML = `
            .floatingGPABlockInitial {
                transition: none;
                opacity: 1;
            }
            .floatingGPABlockFade {
                transition: opacity 4s ease-in-out;
                opacity: 0.5;
            }
            .floatingGPABlockFade:hover {
                transition: none;
                opacity: 1;
            }
            [data-status] { cursor: pointer; }
            [data-status="in"] { color: #63E6BE; }
            [data-status="out"] { color: #ff0000; }
        `;
        document.head.appendChild(style);
    }

    // Things that will be executed when activate the extension
    addFontAwesome();
    addStyle();
    addFloatingGPABlock();
    startNewCalculate();
    addEdittingFeature();

    // Set the observer: When user change school year or semester: start new calculation (This only work if there is difference in the number of courses between the old and new table and some special children nodes changing)
    let config = { subtree: true, childList: true, characterData: true};
    let observer = new MutationObserver(function (mutations) {
        observer.disconnect(); // Prevent the loop caused by replacing the status cell
        startNewCalculate();
        observer.observe(gradeTable, config);
    });
    observer.observe(gradeTable, config);
}

main();