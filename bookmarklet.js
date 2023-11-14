javascript: (async function gpa() {
    console.clear()

    const currentHref = window.location.href;
    const dkhpReg = /.portal([1-9]|)\.hcmus\.edu\.vn\/SinhVien\.aspx\?(.*)pid=211/;
    if (!currentHref.match(dkhpReg)) {
        const portalReg = /.portal([1-9]|)\.hcmus\.edu\.vn/;
        if (currentHref.match(portalReg)) {
            alert("Vui lòng đi tới trang \"Tra cứu Kết quả học tập\" trước");
        } return;
    };
    var dataArray = $("#aspnetForm").serializeArray();
    var param = dataArray.reduce(function (a, x) { a[x.name] = x.value; return a; }, {});;

    const isAllSection = param['ctl00$ContentPlaceHolder1$ctl00$cboNamHoc_gvDKHPLichThi$ob_CbocboNamHoc_gvDKHPLichThiTB'] == '--Tất cả--';
    let semeterInput = $('input[name="ctl00$ContentPlaceHolder1$ctl00$cboHocKy_gvDKHPLichThi$ob_CbocboHocKy_gvDKHPLichThiTB"]');
    if (semeterInput) semeterInput = semeterInput[0];
    else return;

    function goToAllCoursesPage()
    {
        //const isSemeterDisabled = $(semeterInput).attr('disabled') || $(semeterInput).prop('disabled');
        //if (!isAllSection || isSemeterDisabled) {
        param['ctl00$ContentPlaceHolder1$ctl00$cboNamHoc_gvDKHPLichThi$ob_CbocboNamHoc_gvDKHPLichThiTB'] = '--Tất cả--';
        param['ctl00$ContentPlaceHolder1$ctl00$cboNamHoc_gvDKHPLichThi$ob_CbocboNamHoc_gvDKHPLichThiSIS'] = '0';
        param['ctl00$ContentPlaceHolder1$ctl00$cboNamHoc_gvDKHPLichThi'] = '0';
        param['ctl00$ContentPlaceHolder1$ctl00$cboHocKy_gvDKHPLichThi$ob_CbocboHocKy_gvDKHPLichThiTB'] = '0';
        param['ctl00$ContentPlaceHolder1$ctl00$cboHocKy_gvDKHPLichThi$ob_CbocboHocKy_gvDKHPLichThiSIS'] = '0';
        param['ctl00$ContentPlaceHolder1$ctl00$cboHocKy_gvDKHPLichThi'] = ''; // Currently this need to be empty to load "Tất cả" option properly
        param['ctl00$ContentPlaceHolder1$ctl00$btnXemDiemThi'] = 'Xem Kết Quả Học Tập';

        const parentDiv = $("#lich-thi-dkhp")[0];
        if (parentDiv && !$("#loading-text")[0])
            parentDiv.prepend($('<div id="loading-text" style="font-size:20px; color:#1B486A;text-align:center;margin:10px;">Chờ một chút...</div>')[0]);

        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: "/SinhVien.aspx?pid=211",
                data: param,
                success: function (res) {
                    let html = $.parseHTML(res);
                    let HK = $(html).find("input[name='ctl00$ContentPlaceHolder1$ctl00$cboNamHoc_gvDKHPLichThi$ob_CbocboNamHoc_gvDKHPLichThiTB']");
    
                    if (HK)
                        console.log($(HK[0]).attr("value"));

                    document.open();
                    document.write(res);
                    document.close();

                    let isLoaded = false;
                    window.onload = () => {
                        isLoaded = true;
                        resolve();
                    }

                    // In case window.onload failed!
                    setTimeout(() => {
                        if (!isLoaded) {
                            resolve();
                        }
                    }, 2000);
                }
            });
        });
    }

    let tab = null;
    let exceptData = [];
    let data = [];
    let rows = null;
    let isCalSemester = localStorage.getItem("isCalSemester");
    let isRunBookmarkAgain = false;

    function toFixed(num) {
        return Math.round(num * 1000) / 1000;
    }

    function initUserCourseData() {

        const exceptCourses = [
            "Anh văn",
            "Giáo dục quốc phòng",
            "Thể dục",
            "Anh van",
            "Giao duc quoc phong",
            "The duc"
        ];
        tab = $("#tbDiemThiGK");

        if (tab) {
            let mainTable = tab[0];
            rows = tab.find("tbody tr");
            for (let i = 0; i < rows.length; i++) {
                const tds = $(rows[i]).find("td").not(".gpa-checkbox");

                let row = {
                    id: i + 1,
                    semester: $(tds[0]).text().trim().normalize(),
                    course: $(tds[1]).text().trim().normalize(),
                    credit: parseInt($(tds[2]).text().trim().normalize()),
                    class: $(tds[3]).text().trim().normalize(),
                    ldcode: $(tds[4]).text().trim().normalize(),
                    score: parseFloat($(tds[5]).text().trim().normalize()),
                    note: $(tds[6]).text().trim().normalize(),
                    include: true,
                    whyExclude: "",
                    isAbsent: $(tds[5]).text().trim().normalize() == "Vắng",
                    letter:"",
                    fourRounding: 0
                };

                $(rows[i]).attr("id", row.id); // Get id of the course in table even if it is sorted

                if (!row.credit) {
                    row.credit = 0;
                    row.include = false;
                    row.whyExclude += "Học phần không tín chỉ";
                }
                else if (row.isAbsent) {
                    row.score = 0;
                    row.include = false;
                    row.whyExclude += "Điểm nhỏ hơn 5, chưa qua môn. ";
                }
                else if (!row.score) {
                    row.score = 0;
                    row.include = false;
                    row.whyExclude += "Chưa hoặc không có điểm";
                }
                else if (row.score < 5 || row.isAbsent) {
                    row.include = false;
                    row.whyExclude += "Điểm nhỏ hơn 5, chưa qua môn. ";
                }
                else {
                    let include = true;
                    for (let j = 0; j < exceptCourses.length; j++) {
                        if (row.course.includes(exceptCourses[j])) {
                            include = false;
                            row.whyExclude += "Học phần không tính trong GPA. ";
                            break;
                        }
                    };
                    row.include = include;
                }

                for (let j = 0; j < data.length; j++) {
                    if (data[j].course == row.course) {
                        data[j].include = false;
                        data[j].whyExclude = "Đã học lại. ";
                    }
                }

                data.push(row);

                if (!row.include)
                    exceptData.push(row);
            }
        }
    }

    function addSupplementaryGrade()
    {
        let supplementaryGrade = [
            { score: 9, letter: "A+", fourRounding: 4.0},
            { score: 8, letter: "A.", fourRounding: 3.5},
            { score: 7, letter: "B+", fourRounding: 3.0},
            { score: 6, letter: "B.", fourRounding: 2.5},
            { score: 5, letter: "C.", fourRounding: 2.0},
            { score: 4, letter: "D+", fourRounding: 1.5},
            { score: 3, letter: "D.", fourRounding: 1.0},
            { score: 0, letter: "F.", fourRounding: 0.0}
        ];

        data.forEach(item => {
            if (item.score >= 0) {
                item.letter = supplementaryGrade.find(grade => item.score >= grade.score).letter;
                item.fourRounding = supplementaryGrade.find(grade => item.score >= grade.score).fourRounding;
            }
        });

        if ($('#tbDiemThiGK thead tr th:contains("Thang chữ")').length === 0)
        {
            $('th:eq(5)', '#tbDiemThiGK thead tr').after('<th>Thang chữ</th>');
            $('#tbDiemThiGK tbody tr').each(function() {
                let letterGrade = data[$(this).attr("id") - 1].letter;
                $('td:eq(5)', this).after('<td>' + letterGrade + '</td>');
            });
        } 

        console.log( $(tab).html());

        if ($('#tbDiemThiGK thead tr th:contains("Thang 4")').length === 0)
        {
            $('th:eq(6)', '#tbDiemThiGK thead tr').after('<th>Thang 4</th>');  
            $('#tbDiemThiGK tbody tr').each(function() {
                let fourRounding = data[$(this).attr("id") - 1].fourRounding;
                $('td:eq(6)', this).after('<td>' + fourRounding + '</td>');
            });
        } 

        console.log( $(tab).html());
        
    }

    class Calculation {
        constructor() {
            this.totalCredits = 0;
            this.notPassCredits = 0;
            this.totalScores = 0;
            this.totalFourScores = 0;
            this.notPassTotalScore = 0;
            this.gpa = 0;
            this.fourGPA = 0;
            this.notPassGPA = 0;
            this.removedCoursesSize = 0;
        }

        calculateGPA () {
            //;

            let howICalculated = "%c Điểm tính thế nào nhở ?%c \n\n";
            let cssLog = ["font-size:16px", "font-size:normal"];

            for (let i = 0; i < data.length; i++) {
                let item = data[i];
                if (item.include) {
                    this.totalCredits += item.credit;
                    this.totalScores += item.credit * item.score;
                    this.totalFourScores += item.credit * item.fourRounding;
                    howICalculated += " " + item.course + ":%c " + item.score + "%c x%c " + item.credit + "%c =%c " + item.credit * item.score + "%c \n";
                    cssLog.push("font-weight:bold;");
                    cssLog.push("font-weight:normal;");
                    cssLog.push("font-weight:bold;");
                    cssLog.push("font-weight:normal;");
                    cssLog.push("font-weight:bold;");
                    cssLog.push("font-weight:normal;");
                } else {
                    if (item.whyExclude.includes("5")) // Used to calculate even not passed gpa
                    {
                        this.notPassCredits += item.credit;
                        this.notPassTotalScore += item.credit * item.score;
                    }
                    howICalculated += "%c " + item.course + ": " + item.score + " x " + item.credit + "%c \n";
                    cssLog.push("color:orange;text-decoration: line-through;");
                    cssLog.push("color:black;");
                }
            }
            this.gpa = this.totalScores / this.totalCredits;
            this.fourGPA = this.totalFourScores / this.totalCredits;
            this.notPassGPA = (this.totalScores + this.notPassTotalScore) / (this.totalCredits + this.notPassCredits);

            for (let i = 0; i < data.length; i++)
                if (!data[i].include) this.removedCoursesSize++;
            console.log("%c \n Chào nhé, GPA nè:\n %c" + this.gpa + "\n", "color:black", "color:blue; font-size: 30px;");
            console.log("%c \n Tổng tín chỉ:\n %c" + this.totalCredits + "\n", "color:black", "color:blue; font-size: 30px;");
            console.log("%c \n Tổng điểm:\n %c" + this.totalScores + "\n", "color:black", "color:blue; font-size: 30px;");
            console.log("%c \n Tổng học phần:\n %c" + data.length + "\n", "color:black", "color:blue; font-size: 30px;");
            console.log("%c \n Tổng học phần trong GPA:\n %c" + (data.length - this.removedCoursesSize) + "\n", "color:black", "color:blue; font-size: 30px;");

            howICalculated += "-------------\n" + "GPA : %c " + this.totalScores + " / " + this.totalCredits + " = " + this.gpa;
            cssLog.push("font-weight:bold");


            let removedSection = "%c Không bao gồm những học phần sau đây: \n\n%c";
            let removedCss = ["font-size:16px", "font-size:normal"];

            for (let i = 0; i < exceptData.length; i++) {
                removedSection += "%c  loại bỏ: %c" + exceptData[i].course + " (" + exceptData[i].semester + ")" + "\n%c lý do: %c" + exceptData[i].whyExclude + "\n\n%c";
                removedCss.push("color:black");
                removedCss.push("color:blue");
                removedCss.push("color:black");

                removedCss.push("color:red");
                removedCss.push("color:black");
            }

            removedSection += "%c  " + this.removedCoursesSize + " học phần đã loại bỏ.%c\n";
            removedCss.push("color:red");
            removedCss.push("color:black");

            console.log(removedSection, ...removedCss);
            console.log(howICalculated, ...cssLog);

            console.log("(Kéo lên để xem chi tiết)");
        }

        formatCoursesTableAndCreateResultTable() {

            let headTr = tab.find("thead tr")[0];
            let headTh = $($(headTr).find("th")[0]).clone();

            if (isRunBookmarkAgain == false) { // First time calculate GPA. Insert checkbox column.

                isRunBookmarkAgain = true;
                
                $(headTh).attr("title", "Tính hay không tính học phần này trong GPA");
                $(headTh).children().html("Trong GPA");
                $(headTr).prepend(headTh);

                for (let i = 0; i < rows.length; i++) {
                    $(rows[i]).prepend('<td class= "center gpa-checkbox" style="width:60px;" ><input type="checkbox"' + ((data[i].include) ? " checked " : "") + ' />' + '<div hidden>' + ((data[i].include) ? 1 : 0) + '</div></td>'); // Use hidden div to enable sorting checkbox column
                }
            }

            let parentDiv = $("#lich-thi-dkhp")[0];
            $("#tbGPA").remove();
            let gpaFieldSet = $('<fieldset id="tbGPA"><legend>Thống kê GPA</legend><div id="tbGPA_wrapper" class="dataTables_wrapper" rold="grid"><table id="tbGPA" class="dkhp-table dataTable"><thead></thead><tbody role="alert" aria-live="polite" aria-relevant="all"></tbody></table></div><p style="margin-top: 10px; color: blue;"><strong>(*)</strong>: Nhấn Ctr+Shift+I và chọn tab Console để xem chi tiết tính toán.<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Thang điểm chữ và Thang điểm 4 được quy đổi dựa theo Sổ tay sinh viên Khóa 2022.<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Nếu bạn thấy hữu ích, hãy tặng mình một Star <a href="https://github.com/dtrung98/GPABookmarklet">Tại Đây</a> nhé ^^</p></fieldset>');
            let gpaTableHead = $(gpaFieldSet).find("thead")[0];
            let gpaTableBody = $(gpaFieldSet).find("tbody")[0];

            const gpaHeadCol1 = $($(headTr).find("th")[2]).clone();
            $(gpaHeadCol1).attr("title", "Tên mục");
            $(gpaHeadCol1).children().html("Tên mục");

            const gpaHeadCol2 = headTh.clone();
            $(gpaHeadCol2).attr("title", "Giá trị");
            $(gpaHeadCol2).children().html("Giá trị");

            $(gpaTableHead).append(gpaHeadCol1);
            $(gpaTableHead).append(gpaHeadCol2);

            $(gpaTableBody).append('<tr class="odd"><td class="left ">Điểm trung bình tích lũy (GPA)</td><td class="center gpa" id="calGPA"><b>' + toFixed(this.gpa) + '</b></td></tr>');
            $(gpaTableBody).append('<tr class="odd"><td class="left ">Điểm trung bình tích lũy (GPA) hệ 4</td><td class="center gpa" id="calGPA"><b>' + toFixed( (this.gpa * 4 / 10)) + '</b></td></tr>');
            $(gpaTableBody).append('<tr class="odd"><td class="left ">Điểm trung bình tích lũy (GPA) hệ 4 (theo STSV)</td><td class="center gpa" id="calGPA"><b>' + toFixed(this.fourGPA) + '</b></td></tr>');
            $(gpaTableBody).append('<tr class="odd"><td class="left ">Điểm trung bình học tập</td><td class="center gpa" id="calGPA">' + toFixed(this.notPassGPA) + '</td></tr>');
            $(gpaTableBody).append('<tr class="even"><td class="left">Tổng tín chỉ đã tích luỹ</td><td class="center gpa" id="calSumCredit">' + this.totalCredits + ' tín chỉ</td></tr>');
            $(gpaTableBody).append('<tr class="odd"><td class="left">Tổng điểm đã tích lũy</td><td class="center gpa" id="sumScore">' + this.totalScores + '</td></tr>');
            $(gpaTableBody).append('<tr class="even"><td class="left">Sô học phần đã học</td><td class="center gpa" id="sumCourse">' + data.length + ' học phần</td></tr>');
            $(gpaTableBody).append('<tr class="odd"><td class="left">Số học phần tính trong GPA</td><td class="center gpa" id="sumCalCourse">' + (data.length - this.removedCoursesSize) + ' học phần</td></tr>');

            $(parentDiv).prepend(gpaFieldSet);

            for (let i = 0; i < rows.length; i++) {
                if (!data[i].include) {
                    if (data[i].whyExclude.includes("không tính"))
                        $(rows[i]).attr("style", "color:blue;text-decoration: line-through;");
                    else if (data[i].whyExclude == "")
                        $(rows[i]).attr("style", "color:grey;text-decoration: line-through;");

                    else
                        $(rows[i]).attr("style", "color:red;text-decoration: line-through;");
                }
                else {
                    if (data[i].whyExclude == "") $(rows[i]).removeAttr("style");
                    else $(rows[i]).attr("style", "color:yellow;text-decoration: line-through;");
                }
            }
        }
    }

    class SaveCoursesList 
    {
        constructor(data, cal) {
            this.data = data;
            this.cal = cal; 
        }

        saveToFileCSV() {
            let idxRow = -1;
            let csv = 'Tên môn học, Số tín chỉ, Điểm, Điểm chữ, Điểm 4, Học kỳ, Lớp, Ghi chú\n';
            this.data.forEach(function (row) {
                if (row.include) {
                    csv += row.course + ', ' + row.credit + ', ' + row.score + ', ' + row.letter + ', ' + row.fourRounding + ', ' + row.semester + ', ' + row.class + ', ' + row.note + '\n';
                    idxRow++;
                }
            });
            
            csv += "Điểm trung bình tích lũy (GPA): " + this.cal.gpa + "\n";
            csv += "Điểm trung bình tích lũy (GPA) hệ 4: " + (this.cal.gpa * 4 / 10) + "\n";
            csv += "Điểm trung bình tích lũy (GPA) hệ 4 (theo STSV): " + this.cal.fourGPA + "\n";
            csv += "Điểm trung bình học tập: " + this.cal.notPassGPA + "\n";
            csv += "Số tín chỉ tích lũy: " + this.cal.totalCredits + "\n";
            csv += "Tổng điểm tích lũy: " + this.cal.totalScores + "\n";
            csv += "Tổng học phần: " + this.data.length + "\n";
            csv += "Tổng học phần trong GPA: " + (this.data.length - this.cal.removedCoursesSize) + "\n";
            
            let hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent('\uFEFF' + csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'GPA.csv';
            hiddenElement.click();
        }
    }

    // Main computation session starts here

    if (isCalSemester != "true") await goToAllCoursesPage();
    initUserCourseData();
    addSupplementaryGrade();
    let cal = new Calculation();
    cal.calculateGPA();
    cal.formatCoursesTableAndCreateResultTable();
    tab.dataTable().fnDestroy();
    tab.dataTable({
        "bPaginate": false,
        "bJQueryUI": true,
        "bAutoWidth": false,
        "aaSorting": [[1, "asc"]],
        "aoColumnDefs": [
            {"sWidth": '50%', "aTargets": [2]},
        ]
    })

    // When change state of a course, recalculate GPA. Use on() instead of click() to apply on future created checkbox in DataTable
    $('#tbDiemThiGK').off('change', 'input[type="checkbox"]'); // In case user re-run this bookmarklet
    $('#tbDiemThiGK').on('change', 'input[type="checkbox"]', function () {
        let courseRow = $(this).closest("tr");
        let idCourse = $(courseRow).attr("id");
        let htmlCheckBox = $(courseRow).find("input[type='checkbox']");

        data[idCourse - 1].include = $(this).is(":checked");
        $(this).siblings().first().text( $(this).is(":checked") ? 1 : 0); // Change value of hidden div for sorting
        $(htmlCheckBox).attr("checked", $(this).is(":checked"));

        tab.fnUpdate( courseRow.children().first().html(), courseRow[0], 0, false, false ); // Update html of checkbox in DataTable

        cal = new Calculation();
        cal.calculateGPA();
        cal.formatCoursesTableAndCreateResultTable();
    });

    // Create a button to save courses list to file
    let saveButton;
    if ( !$('#saveCoursesList')[0])
    {
        let saveCoursesList = new SaveCoursesList(data, cal);
        saveButton = $('#ob_iBbtnXemDiemThiContainer').clone().attr("id", "saveCoursesList");
        $(saveButton).attr("style", "width: 25%");
        $(saveButton).css({'margin-bottom': '10px'});
        $($(saveButton).find(".ob_iBC")[0]).text("Lưu danh sách học phần đã chọn");
        $(saveButton).insertBefore('#tbDiemThiGK_wrapper');
        $(saveButton).click(function (event) {
            event.preventDefault();
            saveCoursesList.saveToFileCSV();
        });
    }

    // Create a button to toggle supplementary grade
    if ( !$('#toggleLetterGrade')[0])
    {
        let toggleButton = $(saveButton).clone().attr("id", "toggleLetterGrade");
        $(toggleButton).attr("style", "width: 25%");
        $(toggleButton).css({'margin-bottom': '10px'});
        $($(toggleButton).find(".ob_iBC")[0]).text("Hiện/Ẩn Thang Chữ/4");
        $(saveButton).after(toggleButton);

        $(toggleButton).click(function (event) {
            event.preventDefault();
            let isVisible = tab.fnSettings().aoColumns[7].bVisible;
            tab.fnSetColumnVis(7, !isVisible);
            tab.fnSetColumnVis(8, !isVisible);
        });

        $(toggleButton).click(); // Hide supplementary grade by default
    }

    // Create a button to toggle semester calculation
    if ( !$("#isCalSemester")[0]) {
        let checkbox = $('<input type="checkbox" id="isCalSemester"><label for="isCalSemester"> Tính theo học kỳ</label><br><br>');

        if (isCalSemester == "true") $(checkbox).attr("checked", true);
        $('#ctl00_ContentPlaceHolder1_pnlControls div:first').after(checkbox);

        $('#isCalSemester').change(function () {
            localStorage.setItem("isCalSemester", $(this).is(":checked"));
        });
    }

})();