#!/bin/sh
EMAIL=$(git config user.email)
if [ $EMAIL == *"alibaba-inc"* ] || [ $EMAIL == *"taobao"* ]
then
echo "email with *.alibaba-inc.com or *.taobao.com are not allowed";
exit 1;
else
echo "";
fi;
