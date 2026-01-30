@echo off
echo Pushing bc91f3f... > push_log_2.txt
git push origin bc91f3f:refs/heads/main >> push_log_2.txt 2>&1
echo Done bc91f3f. >> push_log_2.txt
echo Pushing c157000... >> push_log_2.txt
git push origin c157000:refs/heads/main >> push_log_2.txt 2>&1
echo Done c157000. >> push_log_2.txt
echo Pushing main... >> push_log_2.txt
git push origin main:refs/heads/main >> push_log_2.txt 2>&1
echo All done. >> push_log_2.txt
