import { exec } from "child_process";

// Get new version
const revertVersion = process.env.npm_package_version;

// Push to origin
exec(`git add . && git commit -m 'Ready release ${newVersion}' && git push && git tag -a $npm_package_version -F- <<EOF && git push origin $npm_package_version && git push origin $npm_package_version
$release_notes
EOF`,(error)=>console.log(error));
