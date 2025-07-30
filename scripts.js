
const {exec} = require('child_process');
const path = require('path');
const fs= require('fs');
const mime = require('mime-types');
const  { S3Client, PutObjectCommand } = require ("@aws-sdk/client-s3");


const PROJECT_ID = process.env.PROJECT_ID ;
const s3Client= new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'AKIA5YG3CCLIWL5TWG3B',
        secretAccessKey: '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'
    }
});

async function init(){

    console.log("Executing bro scrpipt file");

    const filePath= path.join(__dirname,'output');

    const p= exec(`cd ${filePath} && npm install && npm run build `);

    p.stdout.on('data',function(data){
        console.log(data.toString());
    })
   
    p.stdout.on('error',function(err){
        console.error("Error:", err.toString());
    });

    p.on('close',async function(){

        console.log("Build completed successfully");

        const distfolderPath= path.join(filePath,'output','dist');

        const distDirContent = fs.readdirSync(distfolderPath,{recursive: true});

        for(const file of distDirContent){
           if(fs.lstatSync(file).isDirectory()){
continue;
           }

             const command = new PutObjectCommand({
    Bucket: "your-bucket-name",
    Key: `__outputs/${PROJECT_ID}/${file}/`,
    Body:fs.createReadStream(file),
    ContentType: mime.lookup(file)
  });

  try {
    await s3Client.send(command);
    console.log(`File uploaded successfully: ${file}`);
    
  } catch (error) {
    console.error("Error uploading file:", error);
    
  }

          
        }

        console.log("All files uploaded successfully");

    });



}

init();
