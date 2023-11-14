# HCMUS GPA Calculator Bookmarklet (v 2.0.0)

Add a feature to Hcmus Portal, calculate and show your GPA

*Thanks [Lê Trung Sơn](https://www.facebook.com/trungson.le.142) for confirming the correctness of the Bookmarklet! Thanks **[vkhuy's repository](https://github.com/vkhuy/GPABookmarklet)** for [this finding](#thcsBug).*

## What is this?

This is a [forked version](https://github.com/DreamyWanderer/GPABookmarklet_Maintanence) of GPABookmarlet utility, which is created by the execellent [dtrung98's repository](https://github.com/dtrung98/GPABookmarklet). Thank you so much for providing this repository as an open source project!

It has been 4 years since the last updated of original repository, and unfortunately I observed a bug comes from Portal itself which this bookmarklet need to deal with. Although they are not computation bugs (which will be more severe), but they can cause some confusion for user. Recently the portal is receiving frequenly updating, so I think there should be a consistent maintenance for GPABookmarklet to cope with those changings 😢.

Besides that, I also add some minor modifications to this bookmaklet for ~~my~~ user's convenience 😆.

## List of bugs fixed

- ~~Deal with a bug comes from Portal, which duplicate some graded courses (GPABookmarklet takes all of duplication for computing).~~

  - Update: This bug has been solved on my portal page, so I cannot implement this fixing anymore 😶.

  <br>

- The bookmarklet loads the page of full courses and calculate on this page. However, this page may be filled with ungraded courses (although those courses have been). Currently this is a problem for students who took part in the last summer semester.

  - Update: Just found and deleted a letter "1" in source code and done! 😀

  ![Bug 1](Figure/Fix_Bug_1.png)

  <br>

- Checkbox for selecting/unselecting a course to be included in GPA does not work.

  - Update: I am not sure whether the author just decide to remove that functionality for some mysterious reason or not. But I found that this feature is quite useful so I just reimplement it carefully such that it will not conflict with normarl grading calculation 🫣.

  ![Bug 2](Figure/Fix_Bug_2.gif)

  <br>

## List of minor modification

- Calculate "**Điểm trung bình học tập**" (includes courses that student has not passed).

  ![Feat 1](Figure/Modification_1.png)

  <br>

- Add **Letter grade** and **4.0 grade** systems.

  ![Feat 2](Figure/Modification_2.png)

  ![Feat 2](Figure/Modification_2_1.gif)

  <br>

- You want to save all courses to PC for further analysing, but do not want to type all of them manually? Just click the button "Lưu danh sách học phần đã chọn" and get them as ```csv``` file.

  ![Feat 3](Figure/Modification_3.gif)

  <br>

- Enabel sorting courses by the "```Trong GPA```" column.

  ![Feat 4](Figure/Modification_4.gif)

  <br>

- Enable searching courses in the table.

  ![Feat 5](Figure/Modification_5.gif)

  <br>

- Enalble "Tính theo học kỳ" option. If you want to calculate for each semester, check this option before go to that semester page and run the GPABookmarklet. Or else unchecking it for calculating otherwise (Bookmarklet remembers this option until you deleted cookies).

  ![Feat 6](Figure/Modification_6.png)

  <br>

- <a name="thcsBug"></a> Add "Tin học cơ sở" to list of courses that must not to be included in GPA.

## Bugs

- Sometimes enabling the letter/4 grade system causes wrong format. You should re-run the GPABookmarklet to see if that can be fixed.

## Future modification

- Let user adds courses as if they have studided them and calculate GPA (it can be useful in case you want to plan what subjects you should learn and what grade you should get for goal GPA).

- Create a version for Tampermonkey, so that the source code can be more organizable and be able to add more features.

## Guideline

- Step 1: You must be a HCMUS Student.
- Step 2: Click **[this link](https://dreamywanderer.github.io/GPABookmarklet_Maintanence/)** to know more

````
https://dreamywanderer.github.io/GPABookmarklet_Maintanence/
````

## Bugs Report and Suggestions

Please go to [issues](https://github.com/DreamyWanderer/GPABookmarklet_Maintanence/issues) pages and provide those information. It will be great if you can assign them a suitable label as well!

## Licenses and Derivative Works

You are free to fork and modify [this boormarklet](https://github.com/DreamyWanderer/GPABookmarklet_Maintanence) (as well as other source code file belong to this project) under the GNU GPL 3.0 license. Basically you can do anything, as long as you provide suitable attribution to all previous authors that create the version you are working on.

<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><span property="dct:title">Contents, site designs </span> by <span property="cc:attributionName">dtrung98, DreamyWanderer</span> is licensed under <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">CC BY-NC-SA 4.0<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1"></a></p>
