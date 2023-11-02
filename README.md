# HCMUS GPA Calculator Bookmarklet

Maintenance and add features to Hcmus Portal, calculate and show your GPA.

## What is this?

This is a forked version of GPABookmarlet utility, which is created by [dtrung98's repository](https://github.com/dtrung98/GPABookmarklet).

It has been 4 years since the last updated of original repository, and unfortunately I observed a bug comes from Portal itself which this bookmarklet need to deal with. Although they are not computation bugs (which will be more severe), but they can cause some confusion for user. Recently the portal is receiving frequenly updating, so I think there should be a consistent maintenance for GPABookmarklet to deal with current situation 😢.

Besides that, I also add some minor modifications to this bookmaklet for ~~my~~ user's convenience.

## List of bugs

- Deal with a bug comes from Portal, which duplicate some graded courses (GPABookmarklet takes all of duplication for computing).

  - Update: This bug has been solved on my portal page, so I cannot implement this fixing anymore.

- The bookmarklet loads the page of full courses and calculate on this page. However, this page may be filled with ungraded courses (although those courses have been). Currently this is a problem for students who took part in the last summer semester.

  - I choose the most simple solution: do not transfer user to that page anymore. As a result, we also have a new feature: calculate GPA for each semester! 😀

- Checkbox for select/unselect a course to include in GPA does not work.

## List of minor modification

- Calculate "Điểm trung bình học tập" (includes courses that student has not passed).

- Sort courses by the "Trong GPA" column.

- Enable searching course in the table.

- Add letter grade and 4.0 grade systems.

## Guideline

- Step 1: You must be a HCMUS Student.
- Step 2: Click **[this link](https://dtrung98.github.io/GPABookmarklet)** to know more

````
https://dtrung98.github.io/GPABookmarklet
````
