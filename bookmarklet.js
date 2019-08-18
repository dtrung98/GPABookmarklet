javascript: (function() {
    console.clear();

    const currentHref = window.location.href;
    const dkhpReg = /.portal([1-9]|)\.hcmus\.edu\.vn\/SinhVien\.aspx\?(.*)pid=211/;
    if(false||!currentHref.match(dkhpReg)) {
        window.location.href = "https://portal6.hcmus.edu.vn/SinhVien.aspx?pid=211";
        return;
    }

    let tab = $("#tbDiemThiGK");
    const exceptCourses = [
        "Anh văn",
        "Giáo dục quốc phòng",
        "Thể dục"
    ];

    if (tab) {
        let mainTable = tab[0];
        let rows = tab.find("tbody tr");
        let data = [];
        let exceptData = [];
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
                whyExclude: ""
            };

            if(!row.credit) row.credit = 0;
            if(!row.score) row.score = 0;

            if (row.score < 5) {
                row.include = false;
                row.whyExclude += "Điểm nhỏ hơn 5, chưa qua môn. ";
            } else {
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
                    if(!data[j].whyExclude.includes("Đã học lại"))
                    data[j].whyExclude += "Đã học lại. ";
                }
            }

            data.push(row);

            if (!row.include)
                exceptData.push(row);
        }

        let totalCredits = 0;
        let totalScores = 0;
        let gpa = 0;
        let howICalculated = "%c Điểm tính thế nào nhở ?%c \n\n";
        let cssLog = ["font-size:16px", "font-size:normal"];

        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (item.include) {
                totalCredits += item.credit;
                totalScores += item.credit * item.score;
                howICalculated += " " + item.course + ":%c " + item.score + "%c x%c " + item.credit + "%c =%c " + item.credit * item.score + "%c \n";
                cssLog.push("font-weight:bold;");
                cssLog.push("font-weight:normal;");
                cssLog.push("font-weight:bold;");
                cssLog.push("font-weight:normal;");
                cssLog.push("font-weight:bold;");
                cssLog.push("font-weight:normal;");
            } else {
                howICalculated += "%c " + item.course + ": " + item.score + " x " + item.credit + "%c \n";
                cssLog.push("color:orange;text-decoration: line-through;");
                cssLog.push("color:black;");
            }
        }
        gpa = totalScores / totalCredits;
        console.log("%c \n Chào nhé, GPA nè:\n %c" + gpa + "\n", "color:black", "color:blue; font-size: 30px;");
        console.log("%c \n Tổng tín chỉ:\n %c" + totalCredits + "\n", "color:black", "color:blue; font-size: 30px;");
        console.log("%c \n Tổng điểm:\n %c" + totalScores + "\n", "color:black", "color:blue; font-size: 30px;");
        console.log("%c \n Tổng học phần:\n %c" + data.length + "\n", "color:black", "color:blue; font-size: 30px;");
        console.log("%c \n Tổng học phần trong GPA:\n %c" + (data.length - exceptData.length) + "\n", "color:black", "color:blue; font-size: 30px;");

        howICalculated += "-------------\n" + "GPA : %c " + totalScores + " / " + totalCredits + " = " + gpa;
        cssLog.push("font-weight:bold");


        let removedSection = "%c Không bao gồm học phần sau đây: \n\n%c";
        let removedCss = ["font-size:16px", "font-size:normal"];

        for (let i = 0; i < exceptData.length; i++) {
            removedSection += "%c  loại bỏ: %c" + exceptData[i].course + " (" + exceptData[i].semester + ")" + "\n%c lý do: %c" + exceptData[i].whyExclude + "\n\n%c";
            removedCss.push("color:black");
            removedCss.push("color:blue");
            removedCss.push("color:black");

            removedCss.push("color:red");
            removedCss.push("color:black");
        }

        removedSection += "%c  " + exceptData.length + " học phần đã loại bỏ.%c\n";
        removedCss.push("color:red");
        removedCss.push("color:black");

        console.log(removedSection, ...removedCss);
        console.log(howICalculated, ...cssLog);

        console.log("(Kéo lên để xem chi tiết)");


        let headTr = tab.find("thead tr")[0];

        if ($(headTr).find("th").length < 8) {

            let headTh = $($(headTr).find("th")[0]).clone();
            $(headTh).attr("title", "Tính hay không tính học phần này trong GPA");
            $(headTh).children().html("In GPA");

            $(headTr).prepend(headTh);

            for (let i = 0; i < rows.length; i++) {
                $(rows[i]).prepend('<td class= "center gpa-checkbox" style="width:60px;" ><input type="checkbox"' + ((data[i].include) ? " checked " : "") + ' /></td>');
               
                if(!data[i].include) {
                    if(data[i].whyExclude.includes("không tính"))
                    $(rows[i]).attr("style","color:blue;text-decoration: line-through;");
                    else
                    $(rows[i]).attr("style","color:red;text-decoration: line-through;");
                }
            }

            let parentDiv = $("#lich-thi-dkhp")[0];
            let gpaFieldSet = $('<fieldset><legend>Thống kê GPA</legend><div id="tbGPA_wrapper" class="dataTables_wrapper" rold="grid"><table id="tbGPA" class="dkhp-table dataTable"><thead></thead><tbody role="alert" aria-live="polite" aria-relevant="all"></tbody></table></div><p style="margin-top: 10px; color: blue;"><strong>(*)</strong>: Nhấn Ctr+Shift+I và chọn tab Console để xem chi tiết tính toán.</p></fieldset>');
            let gpaTableHead = $(gpaFieldSet).find("thead")[0];
            let gpaTableBody = $(gpaFieldSet).find("tbody")[0];

            const gpaHeadCol1 =  $($(headTr).find("th")[2]).clone();
            $(gpaHeadCol1).attr("title","Tên mục");
            $(gpaHeadCol1).children().html("Tên mục");

            const gpaHeadCol2 = headTh.clone();
            $(gpaHeadCol2).attr("title","Giá trị");
            $(gpaHeadCol2).children().html("Giá trị");

            $(gpaTableHead).append(gpaHeadCol1);
            $(gpaTableHead).append(gpaHeadCol2);

            $(gpaTableBody).append('<tr class="odd"><td class="left ">GPA</td><td class="center gpa">'+gpa+'</td></tr>');
            $(gpaTableBody).append('<tr class="even"><td class="left">Tổng tín chỉ đã tích luỹ</td><td class="center gpa">'+totalCredits+' tín chỉ</td></tr>');
            $(gpaTableBody).append('<tr class="odd"><td class="left">Tổng điểm đã tích lũy</td><td class="center gpa">'+totalScores+' điểm</td></tr>');
            $(gpaTableBody).append('<tr class="even"><td class="left">Sô học phần đã đăng ký</td><td class="center gpa">'+data.length+' học phần</td></tr>');
            $(gpaTableBody).append('<tr class="odd"><td class="left">Số học phần tính trong GPA</td><td class="center gpa">'+(data.length-exceptData.length)+' học phần</td></tr>');
    
            $(parentDiv).prepend(gpaFieldSet);
        } else {
            
            for(let i = 0;i <rows.length;i++) {
                if(data[i].include)
                $($(rows[i]).find("input")[0]).attr('checked', 'checked');
                else $($(rows[i]).find("input")[0]).removeAttr('checked');
            }

        }



    } else alert("Sorry, couldn't parse this website");
}

)();