const fs = require("fs");
const archiver = require("archiver");
const path = require("path")


const copyRecursiveSync = function (src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
        path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};


const filesArray = fs.readdirSync(__dirname)
fs.mkdirSync(`${__dirname}/archive`, err => console.log(err));
for (item of filesArray){
  if (item !== "node_modules"){
    const src = `${__dirname}/${item}`
    const dest = `${__dirname}/archive/${item}`
    copyRecursiveSync(src, dest)
  }
}



const output = fs.createWriteStream(__dirname + "/bettery-app.zip");
const archive = archiver("zip", {
  zlib: { level: 9 } 
});

output.on("close", function() {
  console.log(archive.pointer() + " total bytes");
  console.log(
    "archiver has been finalized and the output file descriptor has closed."
  );
});

archive.on("warning", function(err) {
  if (err.code === "ENOENT") {
  } else {
    throw err;
  }
});

archive.on("error", function(err) {
  throw err;
});

archive.pipe(output);

archive.directory('./archive', false);

archive.finalize();
