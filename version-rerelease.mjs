import { exec } from "child_process";

// Remove tag and re-push tag
exec(`git tag -d $npm_package_version && git push -d origin $npm_package_version && git tag -a $npm_package_version -F- <<EOF && git push origin $npm_package_version
Add release notes from changelog
EOF`,(error)=>console.log(error));
