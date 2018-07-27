#!/bin/sh
EMAIL=$(git config user.email)
if [[ $EMAIL == *"alibaba-inc"* ]]
then
echo "email with *.alibaba-inc.com are not allowed";
exit 1;
else
echo "";
fi;
